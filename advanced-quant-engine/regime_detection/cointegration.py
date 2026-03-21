import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller, coint
from statsmodels.regression.linear_model import OLS

class CointegrationDetector:
    """
    Tools for detecting and analyzing cointegration between asset pairs.
    Uses Engle-Granger Two-Step approach and ADF tests for stationarity.
    """
    def __init__(self, significance_level=0.05):
        self.significance_level = significance_level

    def test_cointegration(self, y: pd.Series, x: pd.Series):
        """
        Tests for cointegration between y and x.
        Returns the t-statistic and p-value.
        """
        # Engle-Granger test
        t_stat, p_value, critical_values = coint(y, x)
        
        is_cointegrated = p_value < self.significance_level
        return {
            't_stat': t_stat,
            'p_value': p_value,
            'is_cointegrated': is_cointegrated,
            'critical_values': critical_values
        }

    def get_hedge_ratio(self, y: pd.Series, x: pd.Series):
        """
        Calculates the hedge ratio using OLS.
        """
        model = OLS(y, x).fit()
        return model.params[0]

    def get_spread(self, y: pd.Series, x: pd.Series):
        """
        Calculates the residual spread between two cointegrated assets.
        """
        hedge_ratio = self.get_hedge_ratio(y, x)
        spread = y - hedge_ratio * x
        return spread

    def is_stationary(self, series: pd.Series):
        """
        Augmented Dickey-Fuller test for stationarity.
        """
        result = adfuller(series)
        p_value = result[1]
        return p_value < self.significance_level

if __name__ == "__main__":
    # Example usage with synthetic cointegrated data
    np.random.seed(42)
    x = np.cumsum(np.random.normal(0, 1, 1000)) + 100
    y = 0.8 * x + np.random.normal(0, 1, 1000) + 50
    
    detector = CointegrationDetector()
    results = detector.test_cointegration(pd.Series(y), pd.Series(x))
    print(f"Cointegration results: {results}")
    
    spread = detector.get_spread(pd.Series(y), pd.Series(x))
    print(f"Spread stationarity: {detector.is_stationary(spread)}")
