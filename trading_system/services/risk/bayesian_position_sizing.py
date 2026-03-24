import numpy as np
import scipy.stats as stats
import logging
from datetime import datetime

logger = logging.getLogger('BayesianPositionSizing')

class BayesianPositionSizer:
    """
    Advanced position sizing using Bayesian methods that adapt to changing market conditions.
    """
    
    def __init__(self, risk_per_trade: float = 0.02, confidence_level: float = 0.95):
        self.risk_per_trade = risk_per_trade  # 2% risk per trade
        self.confidence_level = confidence_level
        self.trade_history = []
        self.market_regimes = {
            'bull': {'mu': 0.01, 'sigma': 0.02, 'priors': [0.01, 0.005], 'weight': 0.6},
            'bear': {'mu': -0.005, 'sigma': 0.03, 'priors': [-0.005, 0.007], 'weight': 0.2},
            'volatile': {'mu': 0.001, 'sigma': 0.05, 'priors': [0.001, 0.01], 'weight': 0.2}
        }
        self.current_regime = 'bull'
        self.last_update = datetime.now()
    
    def update_market_regime(self, returns: list):
        """
        Update market regime based on recent returns using Bayesian inference.
        
        Args:
            returns (list): Recent daily returns
        """
        if not returns:
            return
        
        # Calculate recent volatility
        recent_vol = np.std(returns)
        
        # Bayesian update of regime probabilities
        likelihoods = {}
        for regime, params in self.market_regimes.items():
            # Normal likelihood of data given the regime
            likelihood = stats.norm.pdf(returns[-1], params['mu'], params['sigma'])
            likelihoods[regime] = likelihood * params['weight']
        
        # Update weights (posterior probabilities)
        total = sum(likelihoods.values())
        if total > 0:
            for regime in self.market_regimes:
                self.market_regimes[regime]['weight'] = likelihoods[regime] / total
        
        # Identify current regime (highest posterior)
        self.current_regime = max(self.market_regimes.items(), key=lambda x: x[1]['weight'])[0]
        self.last_update = datetime.now()
        
        logger.info(f"Market regime updated to {self.current_regime} (bull={self.market_regimes['bull']['weight']:.2f}, "
                   f"bear={self.market_regimes['bear']['weight']:.2f}, volatile={self.market_regimes['volatile']['weight']:.2f})")
    
    def calculate_position_size(self, entry_price: float, stop_loss: float, account_value: float) -> int:
        """
        Calculate position size with Bayesian adjustment based on current market regime.
        
        Args:
            entry_price (float): Entry price of the trade
            stop_loss (float): Stop loss price
            account_value (float): Current account value
        
        Returns:
            int: Number of shares to trade
        """
        # Basic position size (2% risk)
        risk_per_share = abs(entry_price - stop_loss)
        if risk_per_share == 0:
            return 0
            
        base_position = int((account_value * self.risk_per_trade) / risk_per_share)
        
        # Bayesian adjustment based on market regime
        regime = self.market_regimes[self.current_regime]
        
        # Adjust position size based on regime volatility
        regime_vol = regime['sigma']
        baseline_vol = 0.02  # Baseline volatility (2% daily)
        vol_adjustment = baseline_vol / max(regime_vol, 0.01)  # Cap volatility at 1%
        
        # Adjust position size based on regime probability
        position_size = int(base_position * vol_adjustment)
        
        # Apply limits (min 1 share)
        return max(1, position_size)
    
    def add_trade(self, profit_loss: float, confidence: float):
        """Add trade to history for Bayesian learning"""
        self.trade_history.append({
            'profit_loss': profit_loss,
            'confidence': confidence,
            'timestamp': datetime.now()
        })
        
        # Keep only last 200 trades
        if len(self.trade_history) > 200:
            self.trade_history = self.trade_history[-200:]
    
    def update_regime_from_trades(self):
        """Update market regime based on trade performance history"""
        if not self.trade_history:
            return
        
        # Calculate recent win rate
        recent_trades = self.trade_history[-50:]
        win_rate = sum(1 for trade in recent_trades if trade['profit_loss'] > 0) / len(recent_trades)
        
        # Update regime probabilities based on trade performance
        for regime in self.market_regimes:
            # Higher win rate in bull market
            self.market_regimes[regime]['weight'] *= (
                1.2 if (regime == 'bull' and win_rate > 0.6) else
                0.8 if (regime == 'bull' and win_rate < 0.5) else
                1.1 if (regime == 'bear' and win_rate < 0.5) else
                0.9 if (regime == 'bear' and win_rate > 0.6) else
                1.0
            )
        
        # Normalize weights
        total = sum(r['weight'] for r in self.market_regimes.values())
        if total > 0:
            for regime in self.market_regimes:
                self.market_regimes[regime]['weight'] /= total
    
    def get_current_regime(self) -> dict:
        """Get current market regime with probabilities"""
        return {
            'current_regime': self.current_regime,
            'regime_probabilities': {k: v['weight'] for k, v in self.market_regimes.items()},
            'last_update': self.last_update
        }
