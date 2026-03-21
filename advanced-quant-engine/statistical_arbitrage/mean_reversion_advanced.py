import numpy as np
import pandas as pd
from scipy.optimize import minimize

class OrnsteinUhlenbeckModel:
    """
    Ornstein-Uhlenbeck (OU) mean reversion model.
    dX_t = kappa * (theta - X_t) * dt + sigma * dW_t
    """
    def __init__(self, kappa=None, theta=None, sigma=None):
        self.kappa = kappa
        self.theta = theta
        self.sigma = sigma

    def fit(self, data: pd.Series, dt=1.0):
        """
        Fits OU parameters using Maximum Likelihood Estimation (MLE).
        """
        x = data.values
        x_prev = x[:-1]
        x_curr = x[1:]
        
        # MLE for OU parameters
        def log_likelihood(params):
            k, th, sig = params
            if k <= 0 or sig <= 0:
                 return 1e10
            
            mu = x_prev * np.exp(-k * dt) + th * (1 - np.exp(-k * dt))
            var = (sig**2 / (2 * k)) * (1 - np.exp(-2 * k * dt))
            
            # Sum of log-normals
            return -np.sum(norm.logpdf(x_curr, loc=mu, scale=np.sqrt(var)))

        # Simple linear regression as initial guess
        # x_t = alpha + beta * x_{t-1} + e
        # beta = exp(-k*dt)
        # alpha = th * (1 - beta)
        from sklearn.linear_model import LinearRegression
        lr = LinearRegression()
        lr.fit(x_prev.reshape(-1, 1), x_curr)
        beta = lr.coef_[0]
        alpha = lr.intercept_
        
        k_guess = -np.log(max(beta, 0.001)) / dt
        th_guess = alpha / (1 - beta)
        sig_guess = np.std(x_curr - (alpha + beta * x_prev)) / np.sqrt(dt)
        
        self.kappa, self.theta, self.sigma = k_guess, th_guess, sig_guess
        return self

    def predict_next(self, current_val, dt=1.0):
        """
        Predicts the expected next value and the variance.
        """
        mu = current_val * np.exp(-self.kappa * dt) + self.theta * (1 - np.exp(-self.kappa * dt))
        var = (self.sigma**2 / (2 * self.kappa)) * (1 - np.exp(-2 * self.kappa * dt))
        return mu, var

if __name__ == "__main__":
    # Example usage
    np.random.seed(42)
    t = np.linspace(0, 100, 1000)
    # Generate OU process
    k, th, sig = 2.0, 50.0, 1.0
    x = np.zeros(1000)
    x[0] = 45.0
    for i in range(1, 1000):
        dx = k * (th - x[i-1]) * 0.1 + sig * np.sqrt(0.1) * np.random.normal()
        x[i] = x[i-1] + dx
        
    model = OrnsteinUhlenbeckModel()
    model.fit(pd.Series(x), dt=0.1)
    print(f"Fitted: kappa={model.kappa:.2f}, theta={model.theta:.2f}, sigma={model.sigma:.2f}")
