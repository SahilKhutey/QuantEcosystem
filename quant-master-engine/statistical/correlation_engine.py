import pandas as pd
import numpy as np

class CorrelationEngine:
    """
    Analyzes asset correlations and interdependencies.
    """
    def __init__(self, window=30):
        self.window = window

    def rolling_correlation(self, series_a, series_b):
        """Calculates the rolling Pearson correlation between two series."""
        return series_a.rolling(window=self.window).corr(series_b)

    def correlation_matrix(self, df):
        """Calculates the correlation matrix for a dataframe of asset returns."""
        return df.corr()

    def rank_correlation(self, df):
        """Calculates Spearman rank correlation to capture non-linear dependencies."""
        return df.corr(method='spearman')
