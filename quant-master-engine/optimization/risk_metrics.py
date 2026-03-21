import numpy as np
import pandas as pd

class RiskMetrics:
    """
    Engine for calculating standard financial risk and performance metrics.
    """
    @staticmethod
    def sharpe_ratio(returns, risk_free_rate=0.0):
        """Calculates the annualized Sharpe ratio."""
        excess_returns = returns - risk_free_rate / 252
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

    @staticmethod
    def sortino_ratio(returns, risk_free_rate=0.0):
        """Calculates the Sortino ratio (downside risk only)."""
        excess_returns = returns - risk_free_rate / 252
        downside_returns = excess_returns[excess_returns < 0]
        return np.sqrt(252) * excess_returns.mean() / downside_returns.std()

    @staticmethod
    def value_at_risk(returns, confidence=0.05):
        """Historical Value at Risk (VaR)."""
        return returns.quantile(confidence)
