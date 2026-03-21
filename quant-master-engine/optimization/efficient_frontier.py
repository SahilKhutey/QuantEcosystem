from pypfopt import plotting
import matplotlib.pyplot as plt
from pypfopt.efficient_frontier import EfficientFrontier

class EfficientFrontierVisualizer:
    """
    Handles Efficient Frontier calculation and plotting.
    """
    def __init__(self, mu, S):
        self.mu = mu
        self.S = S

    def plot_frontier(self):
        """Plots the efficient frontier for the provided risk/return parameters."""
        ef = EfficientFrontier(self.mu, self.S)
        fig, ax = plt.subplots()
        plotting.plot_efficient_frontier(ef, ax=ax, show_assets=True)
        plt.show()

    def get_frontier_points(self):
        """Returns target returns and volatilities on the frontier."""
        ef = EfficientFrontier(self.mu, self.S)
        return ef.target_return, ef.target_volatility
