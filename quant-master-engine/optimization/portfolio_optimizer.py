from pypfopt.efficient_frontier import EfficientFrontier
from pypfopt import risk_models, expected_returns
import pandas as pd

class PortfolioOptimizer:
    """
    Portfolio construction and optimization engine.
    """
    def __init__(self, price_data):
        self.price_data = price_data
        self.mu = expected_returns.mean_historical_return(price_data)
        self.S = risk_models.sample_cov(price_data)

    def optimize_sharpe(self):
        """Calculates weights for the maximum Sharpe ratio portfolio."""
        ef = EfficientFrontier(self.mu, self.S)
        weights = ef.max_sharpe()
        return ef.clean_weights()

    def min_volatility(self):
        """Calculates weights for the minimum volatility portfolio."""
        ef = EfficientFrontier(self.mu, self.S)
        weights = ef.min_volatility()
        return ef.clean_weights()
