import numpy as np
import scipy.optimize as optimize
import logging
from datetime import datetime

logger = logging.getLogger('RobustOptimization')

class RobustPortfolioOptimizer:
    """
    Advanced portfolio optimizer that handles regime switching and estimation error.
    """
    
    def __init__(self, risk_aversion: float = 3.0, alpha: float = 0.05):
        self.risk_aversion = risk_aversion
        self.alpha = alpha  # Confidence level for robustness
        self.regime_model = {
            'current_regime': 0,
            'regime_probs': [0.5, 0.3, 0.2],
            'regime_params': [
                {'mu': np.array([0.1, 0.08, 0.06]), 'sigma': np.array([[1.0, 0.2, 0.1], [0.2, 1.0, 0.3], [0.1, 0.3, 1.0]])},
                {'mu': np.array([0.05, 0.03, 0.01]), 'sigma': np.array([[1.0, 0.5, 0.4], [0.5, 1.0, 0.2], [0.4, 0.2, 1.0]])},
                {'mu': np.array([-0.02, -0.05, -0.08]), 'sigma': np.array([[1.0, 0.1, 0.05], [0.1, 1.0, 0.8], [0.05, 0.8, 1.0]])}
            ]
        }
        self.last_update = datetime.now()
        self.optimization_history = []
        self.current_weights = None
    
    def update_regime_model(self, regime_probs, regime_params):
        """Update regime model with new parameters"""
        self.regime_model['regime_probs'] = regime_probs
        self.regime_model['regime_params'] = regime_params
        self.last_update = datetime.now()
        logger.info("Regime model updated")
    
    def _robust_objective(self, weights, params):
        """Robust objective function that accounts for estimation error"""
        mu = params['mu']
        sigma = params['sigma']
        
        # Calculate portfolio return
        portfolio_return = np.dot(weights, mu)
        
        # Calculate portfolio variance
        portfolio_variance = np.dot(weights.T, np.dot(sigma, weights))
        
        # Add robustness term (worst-case scenario)
        worst_case_return = portfolio_return - self.alpha * np.sqrt(portfolio_variance + 1e-9)
        
        # Objective: maximize worst-case return minus risk penalty
        return -(worst_case_return - 0.5 * self.risk_aversion * portfolio_variance)
    
    def _regime_switching_objective(self, weights):
        """Objective function that accounts for regime switching"""
        total_objective = 0.0
        for i, prob in enumerate(self.regime_model['regime_probs']):
            params = self.regime_model['regime_params'][i]
            total_objective += prob * self._robust_objective(weights, params)
        
        return total_objective
    
    def optimize(self, mu: np.array, sigma: np.array, constraints=None):
        """
        Optimize portfolio weights with robustness and regime switching.
        """
        n = len(mu)
        
        # Ensure regime params match dimensions
        # In a real system, these would be trained on historical data per ticker
        # Here we adapt them for the given ticker space
        for i in range(3):
            self.regime_model['regime_params'][i]['mu'] = mu * (1.2 if i==0 else 0.7 if i==1 else 0.3)
            # Create a synthetic covariance for different regimes based on sigma
            if i == 0: # Bull
                self.regime_model['regime_params'][i]['sigma'] = sigma * 0.8
            elif i == 1: # Normal
                self.regime_model['regime_params'][i]['sigma'] = sigma
            else: # Bear
                self.regime_model['regime_params'][i]['sigma'] = sigma * 1.5
        
        # Set up constraints
        if constraints is None:
            constraints = {
                'type': 'eq',
                'fun': lambda x: np.sum(x) - 1.0  # Weights sum to 1
            }
        
        # Initial guess (equal weights)
        x0 = np.ones(n) / n
        
        # Bounds (long-only, max 100% in one asset)
        bounds = [(0, 1) for _ in range(n)]
        
        # Optimize
        result = optimize.minimize(
            self._regime_switching_objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000, 'ftol': 1e-6}
        )
        
        # Check for success
        if not result.success:
            logger.error(f"Optimization failed: {result.message}")
            return None
        
        # Store in history
        self.optimization_history.append({
            'timestamp': datetime.now(),
            'weights': result.x,
            'objective_value': result.fun
        })
        
        # Update current weights
        self.current_weights = result.x
        self.last_update = datetime.now()
        
        return result.x
    
    def update_market_data(self, returns: np.array, window_size: int = 252):
        """Update market statistics and regime model"""
        if len(returns) < window_size:
            window = returns
        else:
            window = returns[-window_size:]
        
        # Calculate rolling volatility
        volatility = np.std(window)
        
        # Advanced regime detection
        if volatility < 0.02:  # Low volatility regime
            self.regime_model['regime_probs'] = [0.7, 0.2, 0.1]
        elif volatility < 0.05:  # Medium volatility regime
            self.regime_model['regime_probs'] = [0.4, 0.4, 0.2]
        else:  # High volatility regime
            self.regime_model['regime_probs'] = [0.2, 0.3, 0.5]
        
        self.last_update = datetime.now()
        logger.info(f"Regime probabilities updated: {self.regime_model['regime_probs']}")
    
    def get_performance_metrics(self):
        """Get current portfolio optimization metrics"""
        last_opt = self.optimization_history[-1] if self.optimization_history else {}
        return {
            'weights': self.current_weights.tolist() if self.current_weights is not None else None,
            'last_optimization': last_opt.get('timestamp'),
            'regime_probs': self.regime_model['regime_probs'],
            'last_update': self.last_update
        }
    
    def backtest(self, returns: np.array, lookback=252, rebalance_freq=21):
        """
        Backtest the robust optimization strategy.
        """
        T, N = returns.shape
        portfolio_values = [1.0]
        weights = None
        
        for t in range(lookback, T):
            if (t - lookback) % rebalance_freq == 0:
                # Estimate parameters
                window = returns[t-lookback:t]
                mu = np.mean(window, axis=0)
                sigma = np.cov(window.T)
                
                # Optimize
                weights = self.optimize(mu, sigma)
                if weights is None:
                    weights = self.current_weights or np.ones(N) / N
                
                # Update regime model
                self.update_market_data(window.mean(axis=1)) # Use portfolio-proxy returns
            
            # Calculate portfolio return
            if weights is not None:
                portfolio_return = np.dot(returns[t], weights)
                portfolio_values.append(portfolio_values[-1] * (1 + portfolio_return))
        
        portfolio_values = np.array(portfolio_values)
        cumulative_return = (portfolio_values[-1] / portfolio_values[0]) - 1
        
        return {
            'cumulative_return': cumulative_return,
            'max_drawdown': self._calculate_max_drawdown(portfolio_values),
            'sharpe_ratio': self._calculate_sharpe(portfolio_values)
        }
    
    def _calculate_max_drawdown(self, values):
        peak = values[0]
        max_dd = 0
        for v in values:
            if v > peak: peak = v
            dd = (peak - v) / peak
            if dd > max_dd: max_dd = dd
        return max_dd

    def _calculate_sharpe(self, values):
        returns = values[1:] / values[:-1] - 1
        return np.mean(returns) / (np.std(returns) + 1e-9) * np.sqrt(252)
