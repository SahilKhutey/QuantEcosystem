import numpy as np
from typing import Dict, Optional

class PositionSizer:
    """
    Calculates precise trade sizes based on risk management rules.
    Supports: Fixed Fractional, Volatility-Adjusted, and Confidence-Based sizing.
    """
    def __init__(self, risk_per_trade: float = 0.02, max_leverage: float = 1.0):
        self.risk_per_trade = risk_per_trade
        self.max_leverage = max_leverage
        
    def calculate_size(self, capital: float, entry: float, stop: float, 
                      volatility: Optional[float] = None, 
                      confidence: float = 0.5) -> Dict:
        """
        Calculate units to trade
        :param volatility: Annualized volatility (optional)
        :param confidence: Signal confidence (0.0 to 1.0)
        """
        if entry == stop:
            return {'units': 0, 'value': 0, 'reason': 'Entry equals Stop Loss'}
            
        # 1. Fixed Fractional Risk (2% rule)
        risk_amount = capital * self.risk_per_trade
        stop_dist = abs(entry - stop)
        
        base_units = risk_amount / stop_dist
        
        # 2. Confidence multiplier (Scales risk from 50% to 150% of base)
        # Confidence 0 -> 0.5x risk, Confidence 1.0 -> 1.5x risk
        conf_multiplier = 0.5 + confidence
        adjusted_units = base_units * conf_multiplier
        
        # 3. Volatility Adjustment (Inverse volatility weighting)
        if volatility and volatility > 0:
            # Target volatility (e.g., 20%)
            target_vol = 0.20
            vol_multiplier = target_vol / volatility
            adjusted_units *= min(vol_multiplier, 1.5) # Cap vol adjustment
            
        # 4. Leverage Constraint
        max_value = capital * self.max_leverage
        current_value = adjusted_units * entry
        
        if current_value > max_value:
            adjusted_units = max_value / entry
            
        return {
            'units': float(np.floor(adjusted_units)),
            'notional_value': float(adjusted_units * entry),
            'risk_amount': float(adjusted_units * stop_dist),
            'risk_pct': float((adjusted_units * stop_dist) / capital),
            'leverage': float((adjusted_units * entry) / capital)
        }
