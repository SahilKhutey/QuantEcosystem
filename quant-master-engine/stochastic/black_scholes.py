import numpy as np
from scipy import stats
from typing import Dict, Tuple, Optional, List
import warnings
warnings.filterwarnings('ignore')

class BlackScholesPricer:
    def __init__(self):
        self.greeks = {}
    
    def black_scholes_call(self, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate Black-Scholes call option price"""
        if T <= 0:
            return max(S - K, 0)
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        call_price = S * stats.norm.cdf(d1) - K * np.exp(-r * T) * stats.norm.cdf(d2)
        return call_price
    
    def black_scholes_put(self, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate Black-Scholes put option price"""
        if T <= 0:
            return max(K - S, 0)
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        put_price = K * np.exp(-r * T) * stats.norm.cdf(-d2) - S * stats.norm.cdf(-d1)
        return put_price
    
    def calculate_greeks(self, S: float, K: float, T: float, r: float, sigma: float) -> Dict:
        """Calculate option Greeks"""
        if T <= 0:
            # At expiration
            return {
                'delta': 1.0 if S > K else 0.0,  # For call option
                'gamma': 0.0,
                'theta': 0.0,
                'vega': 0.0,
                'rho': 0.0
            }
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        # Delta
        delta_call = stats.norm.cdf(d1)
        delta_put = delta_call - 1
        
        # Gamma (same for call and put)
        gamma = stats.norm.pdf(d1) / (S * sigma * np.sqrt(T))
        
        # Theta
        theta_call = (-S * stats.norm.pdf(d1) * sigma / (2 * np.sqrt(T)) - 
                     r * K * np.exp(-r * T) * stats.norm.cdf(d2))
        theta_put = theta_call + r * K * np.exp(-r * T)
        
        # Vega (same for call and put)
        vega = S * stats.norm.pdf(d1) * np.sqrt(T)
        
        # Rho
        rho_call = K * T * np.exp(-r * T) * stats.norm.cdf(d2)
        rho_put = -K * T * np.exp(-r * T) * stats.norm.cdf(-d2)
        
        self.greeks = {
            'delta_call': delta_call,
            'delta_put': delta_put,
            'gamma': gamma,
            'theta_call': theta_call,
            'theta_put': theta_put,
            'vega': vega,
            'rho_call': rho_call,
            'rho_put': rho_put
        }
        
        return self.greeks
    
    def implied_volatility(self, market_price: float, S: float, K: float, 
                          T: float, r: float, option_type: str = 'call', 
                          precision: float = 1e-6, max_iterations: int = 100) -> float:
        """Calculate implied volatility using Newton-Raphson method"""
        if T <= 0:
            return 0.0
        
        # Initial guess
        sigma = 0.3  # 30% initial guess
        
        for i in range(max_iterations):
            if option_type == 'call':
                price = self.black_scholes_call(S, K, T, r, sigma)
                d1 = self._calculate_d1(S, K, T, r, sigma)
                vega = S * stats.norm.pdf(d1) * np.sqrt(T)
            else:
                price = self.black_scholes_put(S, K, T, r, sigma)
                d1 = self._calculate_d1(S, K, T, r, sigma)
                vega = S * stats.norm.pdf(d1) * np.sqrt(T)
            
            # Newton-Raphson update
            price_diff = price - market_price
            
            if abs(price_diff) < precision:
                return sigma
            
            # Avoid division by zero
            if abs(vega) < 1e-10:
                sigma += 0.01  # Small adjustment
            else:
                sigma -= price_diff / vega
            
            # Keep volatility reasonable
            sigma = max(0.01, min(sigma, 5.0))
        
        return sigma  # Return best estimate
    
    def _calculate_d1(self, S: float, K: float, T: float, r: float, sigma: float) -> float:
        """Calculate d1 for Black-Scholes formula"""
        return (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    
    def option_strategy_analysis(self, S: float, options: List[Dict], r: float) -> Dict:
        """Analyze complex option strategies"""
        strategy_value = 0
        strategy_delta = 0
        strategy_gamma = 0
        strategy_theta = 0
        strategy_vega = 0
        
        for option in options:
            option_type = option['type']  # 'call' or 'put'
            position = option['position']  # 1 for long, -1 for short
            K = option['strike']
            T = option['time_to_expiry']
            sigma = option.get('volatility', 0.3)
            
            # Calculate option price and Greeks
            if option_type == 'call':
                price = self.black_scholes_call(S, K, T, r, sigma)
                greeks = self.calculate_greeks(S, K, T, r, sigma)
                delta = greeks['delta_call']
            else:
                price = self.black_scholes_put(S, K, T, r, sigma)
                greeks = self.calculate_greeks(S, K, T, r, sigma)
                delta = greeks['delta_put']
            
            # Add to strategy totals
            strategy_value += position * price
            strategy_delta += position * delta
            strategy_gamma += position * greeks['gamma']
            strategy_theta += position * greeks['theta_call' if option_type == 'call' else 'theta_put']
            strategy_vega += position * greeks['vega']
        
        return {
            'strategy_value': strategy_value,
            'strategy_delta': strategy_delta,
            'strategy_gamma': strategy_gamma,
            'strategy_theta': strategy_theta,
            'strategy_vega': strategy_vega,
            'breakeven_analysis': self._calculate_breakeven(options, S, r)
        }
    
    def _calculate_breakeven(self, options: List[Dict], S: float, r: float) -> Dict:
        """Calculate breakeven points for option strategy"""
        # Simplified breakeven calculation
        # In practice, this would involve finding roots of the profit function
        return {
            'upper_breakeven': S * 1.1,  # Example
            'lower_breakeven': S * 0.9,   # Example
            'max_profit': 'N/A',          # Strategy-dependent
            'max_loss': 'N/A'             # Strategy-dependent
        }
