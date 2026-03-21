import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller
from arch import arch_model

class GARCHAdvanced:
    """
    Advanced GARCH (Generalized Autoregressive Conditional Heteroskedasticity) modeling.
    Supports GARCH(1,1), EGARCH, and GJR-GARCH.
    """
    def __init__(self, model_type='GARCH', p=1, q=1):
        self.model_type = model_type
        self.p = p
        self.q = q
        self.res = None

    def fit(self, data: pd.Series):
        """
        Fits a GARCH model to returns.
        """
        # Calculate log returns if needed
        if (data > 0).all() and (data.diff().dropna() != 0).any():
             returns = 100 * np.log(data / data.shift(1)).dropna()
        else:
             returns = data

        am = arch_model(returns, vol=self.model_type, p=self.p, q=self.q, dist='studentst')
        self.res = am.fit(disp='off')
        return self

    def forecast_volatility(self, horizon=5):
        """
        Forecasts future volatility.
        """
        if self.res is None:
            raise ValueError("Model must be fitted before forecasting.")
        
        forecasts = self.res.forecast(horizon=horizon)
        return np.sqrt(forecasts.variance.values[-1, :])

    def get_conditional_volatility(self):
        """
        Returns the historical conditional volatility series.
        """
        if self.res is None:
            raise ValueError("Model must be fitted first.")
        return self.res.conditional_volatility

    def summary(self):
        if self.res:
            return self.res.summary()
        return "Model not fitted."

if __name__ == "__main__":
    # Example usage with synthetic volatility clustering data
    np.random.seed(42)
    n = 1000
    v = np.zeros(n)
    r = np.zeros(n)
    v[0] = 0.01
    for i in range(1, n):
        v[i] = 0.0001 + 0.1 * r[i-1]**2 + 0.8 * v[i-1]
        r[i] = np.sqrt(v[i]) * np.random.normal()
        
    prices = 100 * np.exp(np.cumsum(r))
    
    garch = GARCHAdvanced(model_type='GJR-GARCH')
    garch.fit(pd.Series(prices))
    print(garch.summary())
    print(f"Next 5 days volatility forecast: {garch.forecast_volatility()}")
