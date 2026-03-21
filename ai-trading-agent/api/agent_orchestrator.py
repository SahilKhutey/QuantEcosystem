import asyncio
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import json
from concurrent.futures import ThreadPoolExecutor
import time
from loguru import logger

from agents.market_analyst import MarketAnalystAgent
from agents.news_intelligence import NewsIntelligenceAgent
from agents.macro_analyst import MacroAnalystAgent
from agents.quant_analyst import QuantAnalyst
from agents.signal_fusion import SignalFusionAgent
from agents.reasoning_engine import ReasoningEngine
from risk.production_risk_manager import ProductionRiskManager, RiskAssessment

@dataclass
class OrchestrationResult:
    timestamp: pd.Timestamp
    agent_results: Dict
    fused_signals: Dict
    final_recommendation: Dict
    risk_assessment: Optional[RiskAssessment]
    system_confidence: float
    processing_time: float
    errors: List[str]

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_count = 0
        self.last_failure_time = None
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def allow_request(self) -> bool:
        """Check if requests are allowed"""
        if self.state == "OPEN":
            if (time.time() - self.last_failure_time) > self.reset_timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        return True
    
    def record_failure(self):
        """Record a failure"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.error(f"Circuit Breaker TRIPPED: State set to {self.state}")
    
    def record_success(self):
        """Record a success"""
        self.failure_count = 0
        self.state = "CLOSED"

class PerformanceTracker:
    def __init__(self):
        self.execution_history = []
        self.performance_metrics = {}
    
    def record_execution(self, agent_results: Dict, system_confidence: float, processing_time: float):
        """Record execution performance"""
        entry = {
            'timestamp': pd.Timestamp.now(),
            'successful_agents': len([r for r in agent_results.values() if isinstance(r, dict) and 'error' not in r]),
            'total_agents': len(agent_results),
            'system_confidence': system_confidence,
            'processing_time': processing_time
        }
        self.execution_history.append(entry)
        
        # Keep only last 1000 executions
        if len(self.execution_history) > 1000:
            self.execution_history.pop(0)

class AgentOrchestrator:
    def __init__(self, openai_api_key: Optional[str] = None):
        self.agents = self._initialize_agents(openai_api_key)
        self.performance_tracker = PerformanceTracker()
        self.risk_manager = ProductionRiskManager()
        self.circuit_breaker = CircuitBreaker()
        self.executor = ThreadPoolExecutor(max_workers=8)
        logger.info("AgentOrchestrator Initialized with Risk Management.")
        
    def _initialize_agents(self, api_key: Optional[str]) -> Dict:
        """Initialize all trading agents"""
        return {
            'market_analyst': MarketAnalystAgent(),
            'news_intelligence': NewsIntelligenceAgent(),
            'macro_analyst': MacroAnalystAgent(),
            'quant_analyst': QuantAnalyst(),
            'signal_fusion': SignalFusionAgent(),
            'reasoning_engine': ReasoningEngine(openai_api_key=api_key or "sk-dummy")
        }
    
    async def orchestrate_analysis(self, market_data: Dict, portfolio: Dict) -> OrchestrationResult:
        """Orchestrate parallel agent execution with risk validation"""
        start_time = time.time()
        
        # Check circuit breaker
        if not self.circuit_breaker.allow_request():
            return self._get_fallback_result("Circuit breaker active")
        
        try:
            # 1. Parallel Analyst Execution
            analyst_names = ['market_analyst', 'news_intelligence', 'macro_analyst', 'quant_analyst']
            tasks = {
                name: asyncio.create_task(
                    self._run_agent_safely(self.agents[name], market_data)
                ) for name in analyst_names
            }
            
            agent_results = {}
            for name, task in tasks.items():
                try:
                    result = await asyncio.wait_for(task, timeout=30.0)
                    agent_results[name] = result
                    self.circuit_breaker.record_success()
                except Exception as e:
                    agent_results[name] = {'error': str(e)}
                    self.circuit_breaker.record_failure()
            
            # 2. Signal Fusion
            fused_signals = await self.agents['signal_fusion'].analyze({'agent_outputs': agent_results})
            
            # 3. LLM Reasoning
            final_recommendation = await self.agents['reasoning_engine'].analyze({
                'fused_signals': fused_signals.analysis if hasattr(fused_signals, 'analysis') else fused_signals,
                'market_context': market_data,
                'agent_analysis': {k: (getattr(v, 'reason', str(v))) for k, v in agent_results.items()}
            })
            
            # 4. Critical Risk Validation
            proposed_trade = {
                'symbol': market_data.get('symbol', 'ASSET'),
                'recommendation': final_recommendation.analysis.get('recommendation', 'HOLD') if hasattr(final_recommendation, 'analysis') else final_recommendation.get('recommendation', 'HOLD'),
                'notional_value': portfolio.get('total_value', 100000) * 0.1, # Example 10% sizing
                'sector': market_data.get('sector', 'TECH')
            }
            risk_assessment = self.risk_manager.validate_trade(proposed_trade, portfolio, market_data)
            
            # 5. Result Package
            system_confidence = self._calculate_system_confidence(agent_results)
            processing_time = time.time() - start_time
            self.performance_tracker.record_execution(agent_results, system_confidence, processing_time)
            
            return OrchestrationResult(
                timestamp=pd.Timestamp.now(),
                agent_results=agent_results,
                fused_signals=fused_signals.analysis if hasattr(fused_signals, 'analysis') else fused_signals,
                final_recommendation=final_recommendation.analysis if hasattr(final_recommendation, 'analysis') else final_recommendation,
                risk_assessment=risk_assessment,
                system_confidence=system_confidence,
                processing_time=processing_time,
                errors=[r.get('error') for r in agent_results.values() if isinstance(r, dict) and 'error' in r]
            )
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            return self._get_fallback_result(f"Orchestration failed: {str(e)}")
    
    async def _run_agent_safely(self, agent, data: Dict) -> Any:
        try: return await agent.analyze(data)
        except Exception as e: return {'error': str(e)}
    
    def _calculate_system_confidence(self, agent_results: Dict) -> float:
        confs = [getattr(r, 'confidence', 0.5) for r in agent_results.values() if not (isinstance(r, dict) and 'error' in r)]
        return float(np.mean(confs)) if confs else 0.1
    
    def _get_fallback_result(self, error_msg: str) -> OrchestrationResult:
        return OrchestrationResult(
            timestamp=pd.Timestamp.now(), agent_results={}, fused_signals={'error': error_msg},
            final_recommendation={'recommendation': 'HOLD', 'reasoning': f'Fallback: {error_msg}'},
            risk_assessment=None, system_confidence=0.1, processing_time=0, errors=[error_msg]
        )
