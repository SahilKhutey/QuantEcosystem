import numpy as np
import pandas as pd

class AdaptiveWeighting:
    """
    Dynamically adjusts model weights based on recent performance.
    Uses Inverse Variance or Sharpe-based weighting.
    """
    def __init__(self, window=60):
        self.window = window
        self.weights = None

    def fuse(self, predictions_df: pd.DataFrame, actual_returns: pd.Series = None):
        """
        Calculates weights based on the Inverse Variance of model errors.
        """
        if actual_returns is not None:
             # Calculate rolling errors
             errors = (predictions_df.sub(actual_returns, axis=0))**2
             mse = errors.rolling(window=self.window).mean().iloc[-1]
             
             # Weights are proportional to 1/MSE
             inv_mse = 1.0 / (mse + 1e-8)
             self.weights = inv_mse / inv_mse.sum()
             
        if self.weights is None:
             n = predictions_df.shape[1]
             self.weights = np.ones(n) / n
             
        return (predictions_df * self.weights).sum(axis=1)

if __name__ == "__main__":
    # Example
    preds = pd.DataFrame({
        'm1': np.random.normal(0, 0.01, 100),
        'm2': np.random.normal(0, 0.01, 100)
    })
    actuals = pd.Series(np.random.normal(0, 0.01, 100))
    
    aw = AdaptiveWeighting()
    result = aw.fuse(preds, actuals)
    print("Adaptive weights result preview:\n", result.head())
