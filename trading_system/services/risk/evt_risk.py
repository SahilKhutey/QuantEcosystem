import numpy as np
import scipy.stats as stats
import logging
from scipy.optimize import minimize
from datetime import datetime

logger = logging.getLogger('EVTRisk')

class EVTRiskManager:
    """
    Advanced risk manager using Extreme Value Theory to better model tail risks.
    """
    
    def __init__(self, confidence_level: float = 0.99, block_size: int = 21):
        self.confidence_level = confidence_level
        self.block_size = block_size  # 1 month of trading days
        self.returns = []
        self.evt_params = {
            'xi': 0.1,  # Shape parameter
            'sigma': 0.02,  # Scale parameter
            'mu': 0.0,  # Location parameter
            'threshold': 0.05  # Threshold for extreme events
        }
        self.last_update = datetime.now()
        self.max_drawdown = 0.0
    
    def update_returns(self, new_returns: list):
        """Update with new returns and recalculate EVT parameters"""
        self.returns.extend(new_returns)
        
        # Keep only last 500 days for calculation
        if len(self.returns) > 500:
            self.returns = self.returns[-500:]
        
        # Recalculate EVT parameters if we have enough data
        if len(self.returns) > self.block_size:
            self._fit_evt_model()
            self._update_max_drawdown()
            self.last_update = datetime.now()
    
    def _fit_evt_model(self):
        """Fit EVT model using Peak Over Threshold method"""
        # Sort returns (negative for losses)
        sorted_returns = sorted([r for r in self.returns if r < 0])
        
        # Determine threshold (top 10% of losses)
        if len(sorted_returns) > 10:
            threshold_idx = int(0.1 * len(sorted_returns))
            self.evt_params['threshold'] = abs(sorted_returns[threshold_idx])
        
        # Get extreme losses (below threshold)
        extreme_losses = [-r for r in sorted_returns if -r > self.evt_params['threshold']]
        
        if not extreme_losses:
            return
        
        # Fit Generalized Pareto Distribution
        def neg_log_likelihood(params):
            xi, sigma = params
            if sigma <= 0:
                return 1e10
            
            n = len(extreme_losses)
            if xi == 0:
                log_pdf = -n * np.log(sigma) - sum(extreme_losses) / sigma
            else:
                # Ensure 1 + xi * x / sigma > 0
                val = 1 + xi * np.array(extreme_losses) / sigma
                if np.any(val <= 0):
                    return 1e10
                log_pdf = -n * np.log(sigma) - (1/xi + 1) * sum(np.log(val))
            
            return -log_pdf
        
        # Initial parameter guesses
        initial_guess = [0.1, 0.02]
        
        # Optimize parameters
        result = minimize(neg_log_likelihood, initial_guess, 
                         bounds=[(1e-10, 0.5), (1e-10, 1.0)])
        
        if result.success:
            self.evt_params['xi'] = result.x[0]
            self.evt_params['sigma'] = result.x[1]
            logger.info(f"EVT model updated: xi={self.evt_params['xi']:.4f}, "
                       f"sigma={self.evt_params['sigma']:.4f}, "
                       f"threshold={self.evt_params['threshold']:.4f}")
    
    def calculate_var(self, confidence: float = None) -> float:
        """
        Calculate Value at Risk using EVT model.
        
        Args:
            confidence (float): Confidence level (e.g., 0.99 for 99% VaR)
        
        Returns:
            float: Value at Risk as a percentage
        """
        if confidence is None:
            confidence = self.confidence_level
            
        # Check if we have valid parameters
        if self.evt_params['sigma'] <= 0 or self.evt_params['xi'] == 0:
            # Fall back to historical VaR if EVT parameters are invalid
            if len(self.returns) > 100:
                return -np.percentile(self.returns, 100 * (1 - confidence))
            return 0.05  # Default 5% VaR if no data
        
        # Calculate VaR using EVT formula
        u = self.evt_params['threshold']
        n = len(self.returns)
        nu = len([r for r in self.returns if r < -u])
        if nu == 0:
            # Historical fallback
            if len(self.returns) > 0:
                return -np.percentile(self.returns, 100 * (1 - confidence))
            return 0.05  # Default 5% VaR
        
        # EVT VaR formula
        if self.evt_params['xi'] > 0:
            var = u + (self.evt_params['sigma'] / self.evt_params['xi']) * (
                (n * (1 - confidence) / nu) ** (-self.evt_params['xi']) - 1
            )
        else:
            var = u - (self.evt_params['sigma'] / self.evt_params['xi']) * np.log(1 - confidence)
        
        return var
    
    def calculate_cvar(self, confidence: float = None) -> float:
        """
        Calculate Conditional Value at Risk (Expected Shortfall) using EVT.
        
        Args:
            confidence (float): Confidence level (e.g., 0.99 for 99% CVaR)
        
        Returns:
            float: Conditional Value at Risk as a percentage
        """
        if confidence is None:
            confidence = self.confidence_level
        
        var = self.calculate_var(confidence)
        
        # EVaR formula (simplified)
        if self.evt_params['xi'] < 1:
            # GPD property: E[X - u | X > u] = sigma / (1 - xi)
            # Shortfall = Var + (sigma + xi * (Var - u)) / (1 - xi)
            u = self.evt_params['threshold']
            cvar = (var / (1 - self.evt_params['xi'])) + ((self.evt_params['sigma'] - self.evt_params['xi'] * u) / (1 - self.evt_params['xi']))
            return cvar
        return var * 1.2  # Conservative estimate if xi >= 1
    
    def _update_max_drawdown(self):
        """Track maximum drawdown for circuit breaker purposes"""
        if not self.returns:
            return
        
        # Calculate running maximum
        cumulative = np.cumsum(self.returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = running_max - cumulative
        
        self.max_drawdown = max(self.max_drawdown, np.max(drawdown))
    
    def get_risk_metrics(self) -> dict:
        """Get comprehensive risk metrics including EVT metrics"""
        return {
            'var_95': self.calculate_var(0.95),
            'var_99': self.calculate_var(0.99),
            'cvar_99': self.calculate_cvar(0.99),
            'max_drawdown': self.max_drawdown,
            'xi': self.evt_params['xi'],
            'threshold': self.evt_params['threshold'],
            'last_update': self.last_update.isoformat()
        }
