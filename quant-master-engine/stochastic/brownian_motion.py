import numpy as np

class BrownianMotion:
    """
    Simulates Geometric Brownian Motion (GBM) for asset pricing.
    """
    def generate_path(self, S0, mu, sigma, T, n_steps):
        """Generates a single realization of a GBM path."""
        dt = T / n_steps
        t = np.linspace(0, T, n_steps + 1)
        W = np.random.standard_normal(size=n_steps + 1)
        W = np.cumsum(W) * np.sqrt(dt)
        W[0] = 0
        
        S = S0 * np.exp((mu - 0.5 * sigma**2) * t + sigma * W)
        return t, S
