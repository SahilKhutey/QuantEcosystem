import numpy as np

class StochasticCalculus:
    """
    Utilities for stochastic differential equations and financial calculus.
    """
    @staticmethod
    def ito_integral(func, BrownianMotion_path, dt):
        """Approximates the Ito integral of a function with respect to Brownian Motion."""
        dW = np.diff(BrownianMotion_path)
        vals = func(BrownianMotion_path[:-1])
        return np.sum(vals * dW)

    @staticmethod
    def vasicek_model(r0, a, b, sigma, T, n_steps):
        """Simulates the Vasicek interest rate model."""
        dt = T / n_steps
        rates = np.zeros(n_steps + 1)
        rates[0] = r0
        for i in range(1, n_steps + 1):
            dr = a * (b - rates[i-1]) * dt + sigma * np.sqrt(dt) * np.random.normal()
            rates[i] = rates[i-1] + dr
        return rates
