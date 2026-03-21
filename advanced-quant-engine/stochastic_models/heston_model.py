import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class HestonStochasticVolatility:
    def __init__(self):
        self.parameters = {}
        self.simulated_paths = []
        
    def calibrate_heston(self, price_data: pd.Series, 
                         initial_guess: Dict = None) -> Dict:
        """Calibrate Heston model parameters to market data"""
        if initial_guess is None:
            initial_guess = {
                'kappa': 2.0,    # Mean reversion speed
                'theta': 0.04,   # Long-term variance
                'sigma': 0.3,    # Vol of vol
                'rho': -0.7,     # Correlation
                'v0': 0.04       # Initial variance
            }
        
        returns = price_data.pct_change().dropna()
        
        # Simplified calibration (in practice, use MLE or SDE)
        empirical_variance = returns.var()
        empirical_volatility = returns.std()
        
        # Adjust parameters based on empirical moments
        calibrated_params = initial_guess.copy()
        calibrated_params['theta'] = empirical_variance
        calibrated_params['v0'] = empirical_variance
        
        # Estimate mean reversion from autocorrelation
        autocorr = returns.autocorr()
        if not np.isnan(autocorr):
            calibrated_params['kappa'] = -np.log(max(autocorr, 0.1))
        
        self.parameters = calibrated_params
        return calibrated_params
    
    def simulate_heston_path(self, S0: float, T: float, dt: float, 
                            n_paths: int = 1000) -> Dict:
        """Simulate price paths using Heston model"""
        if not self.parameters:
            raise ValueError("Model parameters must be calibrated first")
        
        kappa = self.parameters['kappa']
        theta = self.parameters['theta']
        sigma = self.parameters['sigma']
        rho = self.parameters['rho']
        v0 = self.parameters['v0']
        
        n_steps = int(T / dt)
        prices = np.zeros((n_paths, n_steps + 1))
        variances = np.zeros((n_paths, n_steps + 1))
        
        prices[:, 0] = S0
        variances[:, 0] = v0
        
        # Risk-free rate (simplified)
        r = 0.02
        
        for i in range(n_paths):
            for t in range(1, n_steps + 1):
                # Generate correlated random shocks
                z1 = np.random.normal(0, 1)
                z2 = rho * z1 + np.sqrt(1 - rho**2) * np.random.normal(0, 1)
                
                # Variance process
                variances[i, t] = max(variances[i, t-1] + 
                                    kappa * (theta - max(variances[i, t-1], 0)) * dt +
                                    sigma * np.sqrt(max(variances[i, t-1], 0)) * np.sqrt(dt) * z2, 0)
                
                # Price process
                prices[i, t] = prices[i, t-1] * np.exp(
                    (r - 0.5 * variances[i, t]) * dt +
                    np.sqrt(variances[i, t]) * np.sqrt(dt) * z1
                )
        
        self.simulated_paths = prices
        return {
            'price_paths': prices,
            'variance_paths': variances,
            'parameters': self.parameters
        }
    
    def calculate_volatility_forecast(self, current_volatility: float, 
                                    horizon: float = 21) -> Dict:
        """Forecast future volatility using Heston model"""
        kappa = self.parameters['kappa']
        theta = self.parameters['theta']
        sigma = self.parameters['sigma']
        
        # Expected variance at horizon
        expected_variance = theta + (current_volatility**2 - theta) * np.exp(-kappa * horizon)
        expected_volatility = np.sqrt(max(expected_variance, 0))
        
        # Variance of future variance
        if kappa > 0:
            variance_of_variance = (sigma**2 * current_volatility**2 / kappa * 
                                  (1 - np.exp(-kappa * horizon)) +
                                  sigma**2 * theta / (2 * kappa) * 
                                  (1 - np.exp(-kappa * horizon))**2)
        else:
            variance_of_variance = sigma**2 * current_volatility**2 * horizon
        
        vol_of_vol = np.sqrt(max(variance_of_variance, 0))
        
        # Confidence intervals
        vol_ci_lower = max(expected_volatility - 1.96 * vol_of_vol, 0)
        vol_ci_upper = expected_volatility + 1.96 * vol_of_vol
        
        return {
            'expected_volatility': expected_volatility,
            'volatility_confidence_interval': (vol_ci_lower, vol_ci_upper),
            'vol_of_vol': vol_of_vol,
            'mean_reversion_speed': kappa,
            'long_term_volatility': np.sqrt(theta)
        }
    
    def generate_volatility_signals(self, price_data: pd.Series) -> Dict:
        """Generate trading signals based on volatility forecasts"""
        returns = price_data.pct_change().dropna()
        current_volatility = returns.rolling(window=20).std().iloc[-1]
        
        if np.isnan(current_volatility):
            current_volatility = returns.std()
        
        # Calibrate model if needed
        if not self.parameters:
            self.calibrate_heston(price_data)
        
        # Short-term and long-term volatility forecasts
        short_term_forecast = self.calculate_volatility_forecast(current_volatility, horizon=5)
        long_term_forecast = self.calculate_volatility_forecast(current_volatility, horizon=21)
        
        # Volatility regime detection
        is_high_volatility = current_volatility > long_term_forecast['long_term_volatility']
        is_rising_volatility = (short_term_forecast['expected_volatility'] > 
                               long_term_forecast['expected_volatility'])
        
        # Generate signals based on volatility regime
        if is_high_volatility and is_rising_volatility:
            signal = "REDUCE_RISK"
            confidence = 0.8
            risk_multiplier = 0.5
        elif not is_high_volatility and not is_rising_volatility:
            signal = "INCREASE_RISK"
            confidence = 0.7
            risk_multiplier = 1.5
        else:
            signal = "MAINTAIN_RISK"
            confidence = 0.5
            risk_multiplier = 1.0
        
        return {
            'signal': signal,
            'confidence': confidence,
            'risk_multiplier': risk_multiplier,
            'current_volatility': current_volatility,
            'short_term_forecast': short_term_forecast['expected_volatility'],
            'long_term_forecast': long_term_forecast['expected_volatility'],
            'volatility_regime': 'HIGH' if is_high_volatility else 'LOW',
            'trend': 'RISING' if is_rising_volatility else 'FALLING',
            'model_type': 'heston_volatility'
        }

# Compatibility layer
class HestonModel(HestonStochasticVolatility):
    def __init__(self, mu=0.05, kappa=2.0, theta=0.04, sigma=0.3, rho=-0.7, v0=0.04):
        super().__init__()
        self.parameters = {
            'mu': mu,
            'kappa': kappa,
            'theta': theta,
            'sigma': sigma,
            'rho': rho,
            'v0': v0
        }

    def simulate_path(self, S0=100.0, T=1.0, steps=252):
        dt = T / steps
        # Simulation logic is in simulate_heston_path
        results = self.simulate_heston_path(S0=S0, T=T, dt=dt, n_paths=1)
        # Convert output to compatible DataFrame format
        price_path = results['price_paths'][0]
        variance_path = results['variance_paths'][0]
        return pd.DataFrame({'price': price_path, 'variance': variance_path})
