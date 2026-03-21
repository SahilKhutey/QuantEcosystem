import scipy.stats as stats
import numpy as np

class ProbabilityCalculus:
    """
    Core probability metrics and distribution analysis for quant modeling.
    """
    @staticmethod
    def normal_pdf(x, mu=0, sigma=1):
        return stats.norm.pdf(x, mu, sigma)

    @staticmethod
    def normal_cdf(x, mu=0, sigma=1):
        return stats.norm.cdf(x, mu, sigma)

    @staticmethod
    def lognormal_pdf(x, mu=0, sigma=1):
        return stats.lognorm.pdf(x, sigma, scale=np.exp(mu))

    @staticmethod
    def calculate_skewness(data):
        return stats.skew(data)

    @staticmethod
    def calculate_kurtosis(data):
        return stats.kurtosis(data)
