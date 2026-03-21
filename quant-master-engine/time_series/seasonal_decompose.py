import pandas as pd
from statsmodels.tsa.seasonal import STL
import matplotlib.pyplot as plt

class SeasonalDecomposer:
    """
    Decomposes a time series into seasonal, trend, and remainder components using STL.
    """
    def __init__(self, period=None):
        self.period = period

    def decompose(self, data):
        """Performs STL decomposition on the data."""
        stl = STL(data, period=self.period)
        res = stl.fit()
        return res

    def plot_decomposition(self, res):
        """Visualizes the decomposed components."""
        res.plot()
        plt.show()

if __name__ == "__main__":
    # Example usage with dummy data
    import numpy as np
    t = np.linspace(0, 100, 1000)
    data = 10 + 0.5 * t + 5 * np.sin(2 * np.pi * t / 50) + np.random.normal(size=1000)
    series = pd.Series(data)
    decomposer = SeasonalDecomposer(period=50)
    result = decomposer.decompose(series)
    decomposer.plot_decomposition(result)
