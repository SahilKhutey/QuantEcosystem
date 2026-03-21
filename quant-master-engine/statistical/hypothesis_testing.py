import numpy as np
import scipy.stats as stats
from statsmodels.tsa.stattools import adfuller

class HypothesisTesting:
    """
    Statistical engine for quantitative hypothesis testing.
    """
    @staticmethod
    def adf_test(series):
        """Augmented Dickey-Fuller test for stationarity."""
        result = adfuller(series)
        return {
            'Test Statistic': result[0],
            'p-value': result[1],
            'Stationary': result[1] < 0.05
        }

    @staticmethod
    def t_test(sample_a, sample_b):
        """Independent two-sample t-test."""
        statistic, pvalue = stats.ttest_ind(sample_a, sample_b)
        return {
            'statistic': statistic,
            'p-value': pvalue
        }

    @staticmethod
    def normality_test(series):
        """Shapiro-Wilk test for normality."""
        statistic, pvalue = stats.shapiro(series)
        return {
            'statistic': statistic,
            'p-value': pvalue
        }
