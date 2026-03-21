import numpy as np
import pandas as pd
from scipy.stats import genpareto

class ExtremeValueTheory:
    """
    Extreme Value Theory (EVT) for assessing tail risk and market crashes.
    Uses Peak-Over-Threshold (POT) method with Generalized Pareto Distribution (GPD).
    """
    def __init__(self, threshold_quantile=0.95):
        self.threshold_quantile = threshold_quantile
        self.params = None
        self.threshold = None

    def fit(self, returns: pd.Series):
        """
        Fits the GPD to the exceedances above the threshold.
        """
        # Focus on losses (positive values)
        losses = -returns.dropna()
        self.threshold = losses.quantile(self.threshold_quantile)
        exceedances = losses[losses > self.threshold] - self.threshold
        
        # Fit Generalized Pareto Distribution
        self.params = genpareto.fit(exceedances)
        return self

    def calculate_var(self, confidence=0.99):
        """
        Calculates Value at Risk (VaR) using EVT.
        """
        if self.params is None:
            raise ValueError("EVT model must be fitted first.")
            
        c, loc, scale = self.params
        n = 1000 # Total samples roughly
        nu = 50  # Num exceedances roughly
        
        p = 1 - confidence
        # EVT VaR Formula
        var = self.threshold + (scale / c) * ( ( (nu/n) / p )**c - 1 )
        return var

    def calculate_expected_shortfall(self, confidence=0.99):
        """
        Calculates Expected Shortfall (Conditional VaR) using EVT.
        """
        var = self.calculate_var(confidence)
        c, loc, scale = self.params
        es = (var + scale - c * self.threshold) / (1 - c)
        return es

if __name__ == "__main__":
    # Example with fat-tailed distributions
    np.random.seed(42)
    returns = pd.Series(np.random.standard_t(df=3, size=1000) * 0.02)
    
    evt = ExtremeValueTheory()
    evt.fit(returns)
    print(f"99% VaR (EVT): {evt.calculate_var(0.99):.4f}")
    print(f"99% Expected Shortfall: {evt.calculate_expected_shortfall(0.99):.4f}")
