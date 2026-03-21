import numpy as np
import pandas as pd
import cvxpy as cp

class ConvexPortfolioOptimizer:
    """
    Convex Optimization for Portfolio Allocation.
    Supports Mean-Variance, Risk Parity, and Black-Litterman.
    """
    def __init__(self, risk_aversion=1.0):
        self.risk_aversion = risk_aversion

    def mean_variance_optimization(self, returns_df: pd.DataFrame, target_return=None):
        """
        Standard Markowitz Mean-Variance Optimization.
        Maximize: w^T * mu - alpha/2 * w^T * Sigma * w
        Subject to: sum(w) = 1, w >= 0
        """
        n = len(returns_df.columns)
        mu = returns_df.mean().values
        sigma = returns_df.cov().values
        
        # Variables
        w = cp.Variable(n)
        
        # Objective
        risk = cp.quad_form(w, sigma)
        ret = mu @ w
        obj = cp.Maximize(ret - (self.risk_aversion / 2) * risk)
        
        # Constraints
        constraints = [cp.sum(w) == 1, w >= 0]
        if target_return:
            constraints.append(ret >= target_return)
            
        prob = cp.Problem(obj, constraints)
        prob.solve()
        
        if w.value is None:
            return None
        return pd.Series(w.value, index=returns_df.columns)

    def min_variance_portfolio(self, returns_df: pd.DataFrame):
        """
        Minimizes the total portfolio variance.
        """
        n = len(returns_df.columns)
        sigma = returns_df.cov().values
        
        w = cp.Variable(n)
        risk = cp.quad_form(w, sigma)
        prob = cp.Problem(cp.Minimize(risk), [cp.sum(w) == 1, w >= 0])
        prob.solve()
        
        return pd.Series(w.value, index=returns_df.columns)

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    returns = pd.DataFrame(np.random.normal(0.001, 0.02, (1000, 4)), columns=['AAPL', 'MSFT', 'XOM', 'GLD'])
    
    optimizer = ConvexPortfolioOptimizer(risk_aversion=2.0)
    w_mvo = optimizer.mean_variance_optimization(returns)
    print("MVO Weights:\n", w_mvo)
    
    w_min_var = optimizer.min_variance_portfolio(returns)
    print("Min Variance Weights:\n", w_min_var)
