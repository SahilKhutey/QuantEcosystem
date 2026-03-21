import pandas as pd
import numpy as np
from datetime import datetime

class DatasetZoo:
    """
    Simulates the Qlib data fetcher and feature engineering pipeline.
    Usually connects to Arctic DB or massive CSV archives.
    """
    def __init__(self, start_date='2020-01-01', periods=1000, n_stocks=50):
        self.start_date = start_date
        self.periods = periods
        self.n_stocks = n_stocks
        self.data = None
        self.features = None
        self.labels = None

    def _generate_synthetic_prices(self):
        np.random.seed(42)
        dates = pd.date_range(start=self.start_date, periods=self.periods, freq='D')
        
        # Generate 50 distinct random walk assets
        assets = {}
        for i in range(self.n_stocks):
            drift = np.random.normal(0.0001, 0.0005)
            vol = np.random.normal(0.015, 0.005)
            assets[f'STOCK_{(i):03d}'] = np.cumprod(1 + np.random.normal(drift, vol, self.periods)) * 100
            
        self.data = pd.DataFrame(assets, index=dates)

    def init_data(self):
        """Fetches raw universe pricing."""
        self._generate_synthetic_prices()
        return self.data

    def create_features(self):
        """
        Creates standard cross-sectional predictive ML features 
        (e.g. Rolling Momenta, Volatility, Price/MA offsets).
        """
        if self.data is None:
            raise ValueError("Must execute init_data() first.")
            
        # Normally this is mathematically intensive across thousands of columns.
        # We mock typical feature outputs (standardized z-scores)
        
        # Calculate daily momentum across all stocks
        momentum_10d = self.data.pct_change(10)
        momentum_30d = self.data.pct_change(30)
        
        # Target Label: Future 5-day return (What the AI tries to predict)
        forward_return_5d = self.data.pct_change(5).shift(-5)
        
        # Store for the model
        self.features = {'mom_10': momentum_10d, 'mom_30': momentum_30d}
        self.labels = forward_return_5d
        
        return self.features, self.labels
