from arch import arch_model
import pandas as pd

class GarchVolatility:
    """
    Generalized Autoregressive Conditional Heteroskedasticity (GARCH) model.
    """
    def __init__(self, p=1, q=1):
        self.p = p
        self.q = q
        self.model = None
        self.results = None

    def fit(self, returns):
        """Fits a GARCH(p, q) model to asset returns."""
        self.model = arch_model(returns, p=self.p, q=self.q)
        self.results = self.model.fit(disp='off')
        return self.results

    def forecast(self, horizon=5):
        """Forecasts future volatility."""
        if self.results is None:
            raise ValueError("Model must be fitted.")
        forecasts = self.results.forecast(horizon=horizon)
        return forecasts.variance.values[-1]
