import numpy as np
import pandas as pd
from scipy.optimize import minimize

class EfficientFrontier:
    """
    Simulates PyPortfolioOpt's core EfficientFrontier class.
    Executes Markowitz Mean-Variance Optimization finding Optimal Asset Allocations.
    """
    def __init__(self, expected_returns, cov_matrix):
        self.expected_returns = np.array(expected_returns)
        self.cov_matrix = np.array(cov_matrix)
        self.num_assets = len(expected_returns)
        self.weights = np.array([1.0/self.num_assets] * self.num_assets)
        self.risk_free_rate = 0.02
        
    def _portfolio_performance(self, weights):
        """Returns annualized (Return, Volatility, Sharpe Ratio)."""
        ret = np.sum(self.expected_returns * weights)
        std = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
        sharpe = (ret - self.risk_free_rate) / std
        return ret, std, sharpe

    def _neg_sharpe(self, weights):
        """Objective function to minimize (Negative Sharpe)"""
        return -1.0 * self._portfolio_performance(weights)[2]

    def max_sharpe(self):
        """
        Calculates optimal weights balancing highest return for lowest risk.
        Solves matching PyPortfolioOpt Scipy engine methods.
        """
        # Constraints: Weights sum to 1. 
        # Bounds: No shorting (0 <= weight <= 1)
        constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.0, 1.0) for _ in range(self.num_assets))
        initial_guess = np.array([1.0/self.num_assets] * self.num_assets)
        
        # Scipy Minimize execution
        result = minimize(
            self._neg_sharpe, 
            initial_guess, 
            method='SLSQP', 
            bounds=bounds, 
            constraints=constraints
        )
        
        self.weights = result.x
        return dict(zip(range(self.num_assets), self.weights))
        
    def portfolio_performance(self):
        """Return the calculated metrics for the solved weights."""
        ret, std, sharpe = self._portfolio_performance(self.weights)
        return {"expected_return": ret, "volatility": std, "sharpe_ratio": sharpe}
        
    def generate_efficient_frontier_curve(self, points=50):
        """
        Generates simulated random portfolios to trace out the 'Bullet' parabola of the efficient frontier.
        Mock logic to generate visually representative dot clouds.
        """
        assets = self.num_assets
        ret_arr = []
        vol_arr = []
        
        for _ in range(points):
            w = np.random.random(assets)
            w /= np.sum(w)
            ret, std, _ = self._portfolio_performance(w)
            ret_arr.append(ret)
            vol_arr.append(std)
            
        return pd.DataFrame({'Volatility': vol_arr, 'Return': ret_arr})
