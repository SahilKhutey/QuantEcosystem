import openai
import json
import pandas as pd
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from .base_agent import BaseTradingAgent, AgentType, AgentOutput
import asyncio
from loguru import logger

@dataclass
class ReasoningOutput:
    recommendation: str  # BUY/SELL/HOLD
    confidence: float
    reasoning: str
    key_factors: List[str]
    risk_assessment: str
    time_horizon: str
    expected_return: Optional[float]

class ReasoningEngine(BaseTradingAgent):
    def __init__(self, openai_api_key: str):
        super().__init__(AgentType.REASONING_ENGINE, confidence_threshold=0.7)
        self.client = openai.AsyncOpenAI(api_key=openai_api_key)
        self.prompt_templates = self._load_templates()
        self.reasoning_cache = {}
        
    def _load_templates(self) -> Dict:
        """Load prompt templates for different analysis types"""
        return {
            'trading_recommendation': """
You are a senior financial analyst at Goldman Sachs. Analyze the following trading situation and provide a professional recommendation.

MARKET CONTEXT:
{market_context}

AGENT ANALYSIS:
{agent_analysis}

TRADING SIGNALS:
{signals}

Please provide your analysis in this JSON format:
{{
    "recommendation": "BUY/SELL/HOLD",
    "confidence": 0.85,
    "reasoning": "Clear, concise reasoning based on the data",
    "key_factors": ["factor1", "factor2", "factor3"],
    "risk_assessment": "LOW/MEDIUM/HIGH",
    "time_horizon": "SHORT/MEDIUM/LONG_TERM",
    "expected_return": 0.05
}}

Focus on:
- Technical patterns and momentum
- Fundamental drivers
- Market sentiment and news impact
- Risk-reward assessment
- Portfolio fit considerations
""",
            'portfolio_advice': """
You are a portfolio manager. Analyze this portfolio situation:
{portfolio_data}

Provide allocation advice considering:
- Diversification benefits
- Risk management
- Market conditions
- Investment horizon
"""
        }
    
    async def analyze(self, data: Dict) -> AgentOutput:
        """Generate human-like trading reasoning using LLM"""
        try:
            fused_signals = data.get('fused_signals', {})
            market_context = data.get('market_context', {})
            agent_analysis = data.get('agent_analysis', {})
            
            # Build the prompt
            prompt = self.prompt_templates['trading_recommendation'].format(
                market_context=json.dumps(market_context, indent=2),
                agent_analysis=json.dumps(agent_analysis, indent=2),
                signals=json.dumps(fused_signals, indent=2)
            )
            
            # Call OpenAI API
            response = await self._call_llm(prompt)
            reasoning_output = self._parse_llm_response(response)
            
            # Validate and enhance the response
            enhanced_output = self._enhance_with_quantitative_analysis(
                reasoning_output, fused_signals
            )
            
            return AgentOutput(
                agent_type=self.agent_type,
                confidence=enhanced_output.confidence,
                signal=1 if enhanced_output.recommendation == "BUY" else -1 if enhanced_output.recommendation == "SELL" else 0,
                reason=enhanced_output.reasoning,
                analysis=enhanced_output.__dict__,
                timestamp=pd.Timestamp.now(),
                raw_data={'llm_response': response, 'fused_signals': fused_signals}
            )
            
        except Exception as e:
            logger.error(f"ReasoningEngine failed: {e}")
            # Fallback to rule-based reasoning
            return self._fallback_reasoning(data, str(e))
    
    async def _call_llm(self, prompt: str) -> str:
        """Call OpenAI API with error handling and retries"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[
                        {"role": "system", "content": "You are a professional financial analyst."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content
                
            except openai.RateLimitError:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise
            except Exception as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(1)
                    continue
                raise
    
    def _parse_llm_response(self, response: str) -> ReasoningOutput:
        """Parse LLM response into structured format"""
        try:
            data = json.loads(response)
            
            return ReasoningOutput(
                recommendation=data.get('recommendation', 'HOLD'),
                confidence=min(max(data.get('confidence', 0.5), 0), 1),
                reasoning=data.get('reasoning', 'Analysis unavailable'),
                key_factors=data.get('key_factors', []),
                risk_assessment=data.get('risk_assessment', 'MEDIUM'),
                time_horizon=data.get('time_horizon', 'MEDIUM'),
                expected_return=data.get('expected_return')
            )
        except json.JSONDecodeError:
            return ReasoningOutput(
                recommendation="HOLD", confidence=0.0, reasoning="Invalid JSON response", 
                key_factors=[], risk_assessment="HIGH", time_horizon="SHORT", expected_return=0
            )
    
    def _enhance_with_quantitative_analysis(self, reasoning: ReasoningOutput, 
                                          signals: Dict) -> ReasoningOutput:
        """Enhance LLM reasoning with quantitative validation"""
        # Add quantitative confidence scoring if available
        composite_score = signals.get('composite_score')
        if composite_score is not None:
            quant_confidence = composite_score
            reasoning.confidence = (reasoning.confidence * 0.4 + quant_confidence * 0.6)
            
        return reasoning
    
    def _fallback_reasoning(self, data: Dict, error: str) -> AgentOutput:
        """Fallback reasoning when LLM fails"""
        fused_signals = data.get('fused_signals', {})
        overall_score = fused_signals.get('composite_score', 0.5)
        
        if overall_score > 0.6:
            recommendation = "BUY"
            confidence = overall_score
        elif overall_score < 0.4:
            recommendation = "SELL"
            confidence = 1 - overall_score
        else:
            recommendation = "HOLD"
            confidence = 0.5
            
        return AgentOutput(
            agent_type=self.agent_type,
            confidence=confidence,
            signal=1 if recommendation == "BUY" else -1 if recommendation == "SELL" else 0,
            reason=f"Rule-based analysis (LLM failed: {error})",
            analysis={
                'recommendation': recommendation,
                'reasoning': f"Rule-based analysis (LLM failed: {error})",
                'key_factors': ['technical', 'sentiment', 'quantitative'],
                'risk_assessment': 'MEDIUM',
                'time_horizon': 'SHORT_TERM',
                'fallback_used': True
            },
            timestamp=pd.Timestamp.now()
        )
