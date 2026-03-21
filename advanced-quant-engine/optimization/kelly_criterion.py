import numpy as np
import pandas as pd

class KellyCriterion:
    """
    Kelly Criterion for optimal position sizing.
    f* = (p/a) - (q/b) = p*(b+a) - a / (a*b)
    Simplified for even money bets: f* = 2p - 1
    For continuous returns: f* = mu / sigma^2
    """
    def __init__(self, risk_fraction=1.0):
        self.risk_fraction = risk_fraction # fractional Kelly

    def calculate_discrete(self, win_prob, win_loss_ratio):
        """
        f* = p - (1-p)/b where b is Win/Loss ratio.
        """
        p = win_prob
        q = 1 - p
        b = win_loss_ratio
        
        kelly_f = p - (q / b)
        return max(kelly_f * self.risk_fraction, 0)

    def calculate_continuous(self, mu, sigma):
        """
        f* = mu / sigma^2
        """
        kelly_f = mu / (sigma**2)
        return max(kelly_f * self.risk_fraction, 0)

    def multi_asset_kelly(self, returns_df: pd.DataFrame):
        """
        f* = C^-1 * mu where C is covariance matrix and mu is mean returns.
        """
        mu = returns_df.mean().values
        cov = returns_df.cov().values
        
        # Solving the linear system: cov * f = mu
        kelly_f = np.linalg.solve(cov, mu)
        
        return pd.Series(kelly_f * self.risk_fraction, index=returns_df.columns)

if __name__ == "__main__":
    # Example
    kelly = KellyCriterion(risk_fraction=0.5) # Half-Kelly
    f = kelly.calculate_discrete(win_prob=0.55, win_loss_ratio=1.1)
    print(f"Optimal Kelly fraction: {f:.2%}")
    
    # Multi-asset example
    np.random.seed(42)
    returns = pd.DataFrame(np.random.normal(0.001, 0.02, (1000, 3)), columns=['A', 'B', 'C'])
    multi_f = kelly.multi_asset_kelly(returns)
    print("Multi-asset Kelly allocation:\n", multi_f)
