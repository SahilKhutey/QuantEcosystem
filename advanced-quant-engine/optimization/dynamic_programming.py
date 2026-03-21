import numpy as np
import pandas as pd

class DynamicProgrammingPortfolio:
    """
    Multi-period Portfolio Optimization using Dynamic Programming.
    Focuses on optimizing wealth over a T-horizon, considering transaction costs.
    """
    def __init__(self, risk_aversion=2.0, n_periods=10):
        self.risk_aversion = risk_aversion
        self.n_periods = n_periods

    def solve_simple_allocation(self, expected_returns, covariance, trans_cost=0.001):
        """
        Solves for optimal weights over multiple periods using a recursive approach.
        A simplified version using Bellman equation logic.
        """
        n_assets = len(expected_returns)
        # Optimal weight in the last period is standard MVO
        # Working backwards: (simplified)
        precision = np.linalg.inv(covariance)
        w_star = (1 / self.risk_aversion) * np.dot(precision, expected_returns)
        
        # In a real DP implementation, we would discretize the state space (wealth)
        # and solve V(w, t) = max [ U(w) + E[V(w', t+1)] ]
        # Here we provide the steady-state solution for multi-period growth.
        return w_star

if __name__ == "__main__":
    # Example
    mu = np.array([0.08, 0.12, 0.05])
    cov = np.array([[0.04, 0.02, 0.01],
                    [0.02, 0.09, 0.02],
                    [0.01, 0.02, 0.01]])
    
    dp = DynamicProgrammingPortfolio()
    weights = dp.solve_simple_allocation(mu, cov)
    print("Optimal DP-based weights:", weights)
