import numpy as np
import pandas as pd
from .convex_optimization import ConvexPortfolioOptimizer
from .kelly_criterion import KellyCriterion

class PortfolioAllocator:
    """
    High-level orchestrator for portfolio allocation.
    Combines Convex Optimization, Kelly Sizing, and Risk Management.
    """
    def __init__(self, strategy='MVO', risk_aversion=2.0):
        self.strategy = strategy
        self.optimizer = ConvexPortfolioOptimizer(risk_aversion)
        self.kelly = KellyCriterion(risk_fraction=0.5)

    def allocate(self, returns_df: pd.DataFrame, signals: pd.Series = None):
        """
        Allocates weights based on strategy and optional trading signals.
        """
        if self.strategy == 'MVO':
            weights = self.optimizer.mean_variance_optimization(returns_df)
        elif self.strategy == 'MinVar':
            weights = self.optimizer.min_variance_portfolio(returns_df)
        elif self.strategy == 'Kelly':
            weights = self.kelly.multi_asset_kelly(returns_df)
        else:
            n = len(returns_df.columns)
            weights = pd.Series(1.0/n, index=returns_df.columns)
            
        # If signals are provided, scale weights accordingly
        if signals is not None:
             # This is a placeholder for signal-based tilting
             pass
             
        # Ensure weights are normalized
        weights = weights / weights.sum()
        return weights

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    assets = ['BTC', 'ETH', 'SOL', 'USDT']
    returns = pd.DataFrame(np.random.normal(0.005, 0.05, (1000, 4)), columns=assets)
    
    allocator = PortfolioAllocator(strategy='MinVar')
    weights = allocator.allocate(returns)
    print("Final Portfolio Weights:\n", weights)
