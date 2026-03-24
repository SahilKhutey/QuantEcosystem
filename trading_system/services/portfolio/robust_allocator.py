import logging
import numpy as np
from datetime import datetime

class RobustAllocator:
    """
    Implements Black-Litterman portfolio optimization to robustly 
    allocate capital across multiple strategy sleeves.
    """
    def __init__(self, risk_aversion: float = 2.5):
        self.logger = logging.getLogger("Portfolio.RobustAllocator")
        self.risk_aversion = risk_aversion # Delta

    def optimize_allocation(self, market_priors: dict, strategy_views: dict, covariance: np.ndarray) -> dict:
        """
        Combines Market Equilibrium (Priors) with Strategy Signals (Views).
        market_priors: {strategy_name: benchmark_weight}
        strategy_views: {strategy_name: {expected_return: float, confidence: float}}
        covariance: matrix of strategy returns
        """
        self.logger.info("Running Black-Litterman Robust Optimization...")
        
        names = list(market_priors.keys())
        n = len(names)
        
        # 1. Implied Equilibrium Returns (Pi)
        # Pi = delta * Sigma * w_marker
        w_mkt = np.array([market_priors[name] for name in names])
        pi = self.risk_aversion * covariance @ w_mkt
        
        # 2. Integrate Investor Views (P, Q, Omega)
        # For simplicity, we assume views are direct (P = Identity)
        Q = np.array([strategy_views[name]['expected_return'] for name in names])
        
        # Omega (Uncertainty of views)
        # Higher confidence = lower uncertainty (Omega)
        tau = 0.05 # scalar
        omega = np.diag([ (1 - strategy_views[name]['confidence']) * 0.01 for name in names])
        
        # 3. Compute Posterior Combined Return (Er)
        # Er = [(tau*Sigma)^-1 + P^T*Omega^-1*P]^-1 * [(tau*Sigma)^-1*Pi + P^T*Omega^-1*Q]
        inv_sig = np.linalg.inv(tau * covariance)
        inv_omg = np.linalg.inv(omega)
        
        posterior_cov = np.linalg.inv(inv_sig + inv_omg)
        er = posterior_cov @ (inv_sig @ pi + inv_omg @ Q)
        
        # 4. Final Optimized Weights (Unconstrained)
        # w = (1/delta) * Sigma^-1 * Er
        w_opt = (1 / self.risk_aversion) * np.linalg.inv(covariance) @ er
        
        # Normalize weights (ensure sum to 1 and non-negative)
        w_opt = np.maximum(0, w_opt)
        w_opt = w_opt / np.sum(w_opt)
        
        allocations = {names[i]: float(w_opt[i]) for i in range(n)}
        
        return {
            "allocations": allocations,
            "expected_excess_returns": {names[i]: float(er[i]) for i in range(n)},
            "timestamp": datetime.utcnow().isoformat()
        }
