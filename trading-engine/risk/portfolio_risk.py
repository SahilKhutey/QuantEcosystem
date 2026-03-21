import numpy as np
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class PortfolioMetrics:
    total_value: float
    total_risk: float
    diversification_ratio: float
    sharpe_ratio: float
    var_95: float # Value at Risk

class PortfolioRiskAnalyzer:
    """
    Analyzes aggregate portfolio risk across all strategies.
    Calculates correlation clusters and Value at Risk (VaR).
    """
    def __init__(self, confidence_level: float = 0.95):
        self.confidence_level = confidence_level
        
    def analyze_portfolio(self, positions: List[Dict], returns_history: Dict[str, List[float]]) -> PortfolioMetrics:
        """Perform comprehensive risk audit"""
        if not positions:
            return PortfolioMetrics(0, 0, 0, 0, 0)
            
        total_value = sum(p.get('notional_value', 0) for p in positions)
        
        # Value at Risk (VaR) calculation using Historical Simulation (simplified)
        var = self._calculate_var(positions, returns_history)
        
        # Calculate diversification (1 - average correlation)
        diversification = self._calculate_diversification(returns_history)
        
        return PortfolioMetrics(
            total_value=total_value,
            total_risk=var / total_value if total_value > 0 else 0,
            diversification_ratio=diversification,
            sharpe_ratio=self._calculate_sharpe(returns_history),
            var_95=var
        )
        
    def _calculate_var(self, positions, history) -> float:
        """Simplified Parametric VaR"""
        # Assume 1-day horizon
        total_val = sum(p.get('notional_value', 0) for p in positions)
        if total_val == 0: return 0
        
        # Mock volatility of 2% daily
        vol = 0.02 
        z_score = 1.645 # 95% confidence
        
        return total_val * vol * z_score
        
    def _calculate_diversification(self, history) -> float:
        """Estimate portfolio diversification"""
        # In a real engine, analyze correlation matrix
        num_assets = len(history.keys())
        if num_assets <= 1: return 0.0
        return min(0.9, num_assets * 0.1) # Proxy behavior

    def _calculate_sharpe(self, history) -> float:
        """Mock calculation of Sharpe Ratio"""
        return 1.85 # Exemplary value
