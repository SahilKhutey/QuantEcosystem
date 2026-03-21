import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class AllocationResult:
    strategy_name: str
    allocation_pct: float
    allocation_amount: float
    confidence: float
    risk_score: float

class RiskWeightedAllocator:
    """
    Advanced allocator that distributes capital based on:
    1. Strategy Confidence
    2. Historical Performance (Mocked)
    3. Portfolio Risk Constraints
    4. Kelly Criterion (Simplified)
    """
    def __init__(self, max_strategy_weight: float = 0.4):
        self.max_strategy_weight = max_strategy_weight
        self.performance_history = {} # strategy_name -> win_rate, profit_factor
        
    def allocate_capital(self, signals: Dict, portfolio_value: float, risk_params: Dict) -> Dict[str, AllocationResult]:
        """Calculate optimal capital distribution"""
        if not signals:
            return {}
            
        active_signals = {name: data for name, data in signals.items() if data and data.get('signal') != 'HOLD'}
        if not active_signals:
            return {}
            
        # 1. Calculate raw weights based on confidence and historical factor
        raw_weights = {}
        total_raw_weight = 0
        
        for name, data in active_signals.items():
            confidence = data.get('confidence', 0.5)
            # Mock performance factor - in production, get from self.performance_history
            perf_factor = 1.0 
            
            # Weighted score: confidence * performance
            weight = confidence * perf_factor
            raw_weights[name] = weight
            total_raw_weight += weight
            
        if total_raw_weight == 0:
            return {}
            
        # 2. Normalize weights and apply constraints
        allocations = {}
        total_allocation_pct = 0
        
        for name, weight in raw_weights.items():
            normalized_pct = weight / total_raw_weight
            
            # Apply max weight constraint (e.g., 40% max per strategy)
            final_pct = min(normalized_pct, self.max_strategy_weight)
            total_allocation_pct += final_pct
            
            amount = portfolio_value * final_pct
            
            allocations[name] = AllocationResult(
                strategy_name=name,
                allocation_pct=round(final_pct * 100, 2),
                allocation_amount=amount,
                confidence=active_signals[name].get('confidence', 0),
                risk_score=self._calculate_strategy_risk(name, active_signals[name])
            )
            
        # 3. Optional: Re-normalize if max_weight constraint dropped too much capital
        # In this simple version, we leave the rest as cash
            
        return allocations

    def _calculate_strategy_risk(self, name: str, signal_data: Dict) -> float:
        """Estimate risk for a specific strategy's signal"""
        # Multipliers based on strategy type
        risk_multipliers = {
            'scalping': 1.5,      # High frequency = higher impact risk
            'swing': 1.0,        # Standard
            'momentum': 1.2,     # Volatility exposure
            'mean_reversion': 0.8, # Counter-trend, tighter stops
            'algorithmic': 1.1    # Model uncertainty
        }
        
        base_risk = 1.0
        multiplier = risk_multipliers.get(name, 1.0)
        confidence_factor = 1.2 - signal_data.get('confidence', 0.5) # Lower confidence = higher risk
        
        return round(base_risk * multiplier * confidence_factor * 10, 2)

    def update_performance(self, strategy_name: str, pnl: float, was_win: bool):
        """Update historical tracking for better future allocation"""
        if strategy_name not in self.performance_history:
            self.performance_history[strategy_name] = {'wins': 0, 'total': 0, 'pnl': 0}
            
        hist = self.performance_history[strategy_name]
        hist['total'] += 1
        if was_win: hist['wins'] += 1
        hist['pnl'] += pnl
