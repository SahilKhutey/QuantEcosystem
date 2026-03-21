import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class MonteCarloSimulator:
    def __init__(self, num_simulations: int = 10000):
        self.num_simulations = num_simulations
        self.simulation_results = {}
        
    def geometric_brownian_motion(self, initial_price: float, mu: float, sigma: float, 
                                days: int = 252) -> np.ndarray:
        """Simulate price path using Geometric Brownian Motion"""
        dt = 1/days  # Daily time step
        prices = np.zeros((self.num_simulations, days))
        prices[:, 0] = initial_price
        
        for t in range(1, days):
            # Generate random shocks
            shocks = np.random.normal(0, 1, self.num_simulations)
            # GBM formula: dS = μS dt + σS dW
            prices[:, t] = prices[:, t-1] * np.exp((mu - 0.5 * sigma**2) * dt + 
                                                 sigma * np.sqrt(dt) * shocks)
        
        return prices
    
    def simulate_portfolio_returns(self, initial_value: float, expected_return: float,
                                 volatility: float, time_horizon: int = 252) -> Dict:
        """Simulate portfolio returns using Monte Carlo"""
        
        # Simulate price paths
        simulated_prices = self.geometric_brownian_motion(
            initial_value, expected_return, volatility, time_horizon
        )
        
        # Calculate final values and returns
        final_values = simulated_prices[:, -1]
        total_returns = (final_values - initial_value) / initial_value
        
        # Calculate risk metrics
        mean_return = np.mean(total_returns)
        std_return = np.std(total_returns)
        var_95 = np.percentile(total_returns, 5)  # 95% VaR
        cvar_95 = total_returns[total_returns <= var_95].mean()  # Conditional VaR
        
        # Probability of positive return
        prob_positive = np.mean(total_returns > 0)
        
        # Best and worst case scenarios
        best_case = np.max(total_returns)
        worst_case = np.min(total_returns)
        
        return {
            'simulated_prices': simulated_prices,
            'final_values': final_values,
            'total_returns': total_returns,
            'expected_return': mean_return,
            'volatility': std_return,
            'var_95': var_95,
            'cvar_95': cvar_95,
            'prob_positive_return': prob_positive,
            'best_case_return': best_case,
            'worst_case_return': worst_case,
            'sharpe_ratio': mean_return / std_return if std_return > 0 else 0,
            'confidence_interval': np.percentile(total_returns, [2.5, 97.5])
        }
    
    def value_at_risk_monte_carlo(self, portfolio_returns: np.ndarray, 
                                confidence_level: float = 0.95) -> Dict:
        """Calculate Value at Risk using Monte Carlo simulation"""
        
        # Sort returns to find VaR
        sorted_returns = np.sort(portfolio_returns)
        var_index = int((1 - confidence_level) * len(sorted_returns))
        var = sorted_returns[var_index]
        
        # Expected Shortfall (CVaR)
        losses_beyond_var = sorted_returns[sorted_returns <= var]
        expected_shortfall = np.mean(losses_beyond_var) if len(losses_beyond_var) > 0 else var
        
        return {
            'var': var,
            'expected_shortfall': expected_shortfall,
            'confidence_level': confidence_level,
            'max_loss': np.min(portfolio_returns),
            'probability_of_loss': np.mean(portfolio_returns < 0)
        }
    
    def monte_carlo_option_pricing(self, spot_price: float, strike_price: float, 
                                  risk_free_rate: float, volatility: float, 
                                  time_to_expiry: float, option_type: str = 'call') -> Dict:
        """Price options using Monte Carlo simulation"""
        
        # Simulate stock prices at expiry
        z = np.random.normal(0, 1, self.num_simulations)
        future_prices = spot_price * np.exp(
            (risk_free_rate - 0.5 * volatility**2) * time_to_expiry +
            volatility * np.sqrt(time_to_expiry) * z
        )
        
        # Calculate option payoffs
        if option_type == 'call':
            payoffs = np.maximum(future_prices - strike_price, 0)
        else:  # put
            payoffs = np.maximum(strike_price - future_prices, 0)
        
        # Discount to present value
        option_price = np.exp(-risk_free_rate * time_to_expiry) * np.mean(payoffs)
        option_std = np.exp(-risk_free_rate * time_to_expiry) * np.std(payoffs)
        
        # Greeks approximation (using finite differences)
        delta = self._calculate_delta(spot_price, strike_price, risk_free_rate, 
                                     volatility, time_to_expiry, option_type)
        
        return {
            'option_price': option_price,
            'price_std': option_std,
            'delta': delta,
            'simulated_payoffs': payoffs,
            'probability_in_the_money': np.mean(payoffs > 0),
            'expected_payoff': np.mean(payoffs)
        }
    
    def _calculate_delta(self, spot_price: float, strike_price: float,
                        risk_free_rate: float, volatility: float,
                        time_to_expiry: float, option_type: str) -> float:
        """Calculate option delta using finite differences"""
        price_up = self.monte_carlo_option_pricing(
            spot_price * 1.01, strike_price, risk_free_rate, volatility, time_to_expiry, option_type
        )['option_price']
        
        price_down = self.monte_carlo_option_pricing(
            spot_price * 0.99, strike_price, risk_free_rate, volatility, time_to_expiry, option_type
        )['option_price']
        
        delta = (price_up - price_down) / (0.02 * spot_price)
        return delta
    
    def stress_testing(self, portfolio_value: float, base_return: float, 
                      base_volatility: float, stress_scenarios: List[Dict]) -> Dict:
        """Perform stress testing using Monte Carlo"""
        
        results = {}
        
        for scenario in stress_scenarios:
            scenario_name = scenario['name']
            scenario_return = scenario.get('return', base_return)
            scenario_volatility = scenario.get('volatility', base_volatility)
            
            # Simulate under stress scenario
            scenario_results = self.simulate_portfolio_returns(
                portfolio_value, scenario_return, scenario_volatility
            )
            
            results[scenario_name] = {
                'expected_return': scenario_results['expected_return'],
                'var_95': scenario_results['var_95'],
                'prob_negative_return': 1 - scenario_results['prob_positive_return'],
                'worst_case': scenario_results['worst_case_return'],
                'stress_impact': scenario_results['expected_return'] - base_return
            }
        
        return results
