import numpy as np
import pandas as pd
from typing import Dict, List
from scipy import stats

class RiskManager:
    @staticmethod
    def calculate_var(returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Value at Risk"""
        if returns.empty:
            return 0.0
        return float(np.percentile(returns, (1 - confidence_level) * 100))
    
    @staticmethod
    def calculate_cvar(returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        var = RiskManager.calculate_var(returns, confidence_level)
        tail_returns = returns[returns <= var]
        return float(tail_returns.mean()) if not tail_returns.empty else 0.0
    
    @staticmethod
    def calculate_max_drawdown(prices: pd.Series) -> Dict:
        """Calculate maximum drawdown"""
        if prices.empty:
            return {"max_drawdown": 0.0, "max_drawdown_pct": 0.0, "duration": 0}
            
        cumulative_returns = (1 + prices.pct_change().dropna()).cumprod()
        running_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - running_max) / running_max
        max_dd = float(drawdown.min())
        max_dd_duration = int((drawdown == max_dd).sum())
        
        return {
            "max_drawdown": max_dd,
            "max_drawdown_pct": max_dd * 100,
            "duration": max_dd_duration
        }
    
    @staticmethod
    def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio"""
        if returns.empty or returns.std() == 0:
            return 0.0
        excess_returns = returns - risk_free_rate / 252  # Daily risk-free rate approximation
        return float(excess_returns.mean() / excess_returns.std() * np.sqrt(252))
    
    @staticmethod
    def assess_portfolio_risk(positions: Dict[str, float], correlations: pd.DataFrame) -> Dict:
        """Assess portfolio-level risk"""
        if not positions:
            return {"portfolio_variance": 0.0, "portfolio_volatility": 0.0, "diversification_score": 1.0}
            
        total_value = sum(positions.values())
        weights = {symbol: value/total_value for symbol, value in positions.items()}
        
        # Calculate portfolio variance (Matrix form: wT * Cov * w)
        # For simplicity, if we don't have Cov, we use correlations as a proxy in this snippet
        portfolio_variance = 0.0
        symbols = list(weights.keys())
        
        for i, sym1 in enumerate(symbols):
            for j, sym2 in enumerate(symbols):
                weight_product = weights[sym1] * weights[sym2]
                correlation = float(correlations.loc[sym1, sym2]) if sym1 in correlations.index and sym2 in correlations.columns else 0.0
                portfolio_variance += weight_product * correlation
        
        return {
            "portfolio_variance": portfolio_variance,
            "portfolio_volatility": float(np.sqrt(portfolio_variance)),
            "diversification_score": float(1.0 - portfolio_variance)  # Higher is better
        }
