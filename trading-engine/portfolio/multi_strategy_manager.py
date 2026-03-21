import asyncio
from typing import Dict, List, Optional
from datetime import datetime

# Importing implemented strategies
from trading_engine.strategies.scalping import ScalpingStrategy, ScalpingConfig
from trading_engine.strategies.swing import SwingStrategy, SwingConfig
from trading_engine.strategies.momentum import MomentumStrategy, MomentumConfig
from trading_engine.strategies.mean_reversion import MeanReversionStrategy, MeanReversionConfig
from trading_engine.strategies.algorithmic import AlgorithmicStrategy, AlgorithmicConfig

class RiskWeightedAllocator:
    """Allocates capital across strategies based on risk-to-reward and confidence"""
    def allocate_capital(self, signals: Dict, portfolio_value: float, risk_parameters: Dict) -> Dict:
        # Simplified risk-weighted allocation logic
        # In a real system, this would use Kelly Criterion or Mean-Variance Optimization
        num_signals = len([s for s in signals.values() if s and s.get('signal') != 'HOLD'])
        if num_signals == 0:
            return {}
            
        base_allocation = (portfolio_value * 0.9) / num_signals # Keep 10% cash
        allocations = {}
        
        for name, result in signals.items():
            if result and result.get('signal') != 'HOLD':
                confidence = result.get('confidence', 0.5)
                # Adjust allocation based on confidence
                allocations[name] = base_allocation * (confidence + 0.5)
                
        return allocations

class MultiStrategyPortfolio:
    def __init__(self, portfolio_value: float = 100000.0):
        self.portfolio_value = portfolio_value
        self.risk_parameters = {
            'max_drawdown': 0.15,
            'max_leverage': 1.0
        }
        
        # Initializing strategies with default configs for individual symbols or groups
        # In production, these would be configured via a config file or database
        self.strategies = {
            'scalping': ScalpingStrategy(ScalpingConfig(symbol="BTC/USD")),
            'swing': SwingStrategy(SwingConfig(symbol="BTC/USD")),
            'momentum': MomentumStrategy(MomentumConfig(symbol="BTC/USD")),
            'mean_reversion': MeanReversionStrategy(MeanReversionConfig(symbol="BTC/USD")),
            'algorithmic': AlgorithmicStrategy(AlgorithmicConfig(symbol="BTC/USD"))
        }
        self.allocator = RiskWeightedAllocator()
    
    async def run_portfolio(self, market_data: Dict) -> Dict:
        """Run all strategies and allocate capital"""
        signals = {}
        
        # Run all strategies in parallel
        # Note: Some strategies might be sync or async
        tasks = []
        for name, strategy in self.strategies.items():
            # Checking if the strategy's analyze method is a coroutine
            if hasattr(strategy, 'analyze') and asyncio.iscoroutinefunction(strategy.analyze):
                task = strategy.analyze(market_data.get(name, {}))
            else:
                # Wrap sync methods in a task
                task = self._run_sync_analysis(name, strategy, market_data.get(name, {}))
            tasks.append((name, task))
        
        # Collect signals
        for name, task in tasks:
            try:
                signals[name] = await task
            except Exception as e:
                print(f"Strategy {name} failed: {e}")
        
        # Allocate capital based on risk and performance
        allocation = self.allocator.allocate_capital(
            signals, 
            self.portfolio_value,
            self.risk_parameters
        )
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'signals': signals,
            'allocation': allocation,
            'portfolio_value': self.portfolio_value
        }

    async def _run_sync_analysis(self, name: str, strategy, data: Dict):
        """Helper to run synchronous analysis in an async context"""
        # In scalping, it might be process_tick (async), in others it's analyze (sync)
        if hasattr(strategy, 'process_tick') and asyncio.iscoroutinefunction(strategy.process_tick):
            return await strategy.process_tick(data)
        elif hasattr(strategy, 'analyze'):
            return strategy.analyze(data)
        elif hasattr(strategy, 'analyze_intraday'): # for intraday
            return strategy.analyze_intraday(data)
        return None
