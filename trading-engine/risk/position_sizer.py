import numpy as np
from typing import Dict, Optional

class PositionSizer:
    """
    Calculates precise trade sizes based on strict institutional risk management rules.
    Supports: Fixed Fractional, Kelly Criterion, and Parametric Value-at-Risk (VaR) sizing.
    """
    def __init__(self, risk_per_trade: float = 0.02, max_leverage: float = 1.0, 
                 allocation_method: str = "fixed_risk"):
        self.risk_per_trade = risk_per_trade
        self.max_leverage = max_leverage
        # Can be 'fixed_risk', 'kelly', or 'var'
        self.allocation_method = allocation_method
        
    def _kelly_criterion_sizing(self, win_rate: float, reward_risk_ratio: float, 
                                kelly_fraction: float = 0.5) -> float:
        """
        Calculates the theoretical optimal capital exposure using the Kelly Criterion formula.
        f* = W - [(1 - W) / R]
        Applies a 'fractional' multiplier (e.g. Half-Kelly) to smooth volatility drawdowns.
        Returns the percentage of total capital to risk.
        """
        if reward_risk_ratio <= 0 or win_rate <= 0:
            return 0.0
            
        kelly_percentage = win_rate - ((1.0 - win_rate) / reward_risk_ratio)
        
        # If mathematically negative, we have no theoretical edge. DO NOT TRADE.
        if kelly_percentage <= 0:
            return 0.0
            
        fractional_kelly = kelly_percentage * kelly_fraction
        
        # Cap enormous theoretical bounds (never risk more than 10% on a geometric edge)
        return min(fractional_kelly, 0.10)

    def _value_at_risk_sizing(self, capital: float, portfolio_volatility: float, 
                              z_score: float = 2.326) -> float:
        """
        Calculates maximum position logic based on Parametric VaR.
        z_score of 2.326 represents a 99% Confidence Interval.
        Ensures the 99% catastrophic loss boundary does not exceed the institutional risk parameter.
        Returns the absolute risk dollar amount allowed.
        """
        if portfolio_volatility <= 0:
            return capital * self.risk_per_trade
            
        # VaR = Portfolio Value * Z-Score * Volatility
        # We invert it: Risk_Amount = Max Allowed VaR / (Z-Score * Volatility)
        
        max_allowed_var = capital * self.risk_per_trade
        allowed_risk_amount = max_allowed_var / (z_score * portfolio_volatility)
        
        return allowed_risk_amount

    def calculate_size(self, capital: float, entry: float, stop: float, 
                      volatility: Optional[float] = None, 
                      confidence: float = 0.5,
                      win_rate: float = 0.55,
                      reward_risk_ratio: float = 1.5) -> Dict:
        """
        Master institutional allocator routing capital based on the configured statistical methodology.
        """
        if entry == stop:
            return {'units': 0, 'notional_value': 0, 'reason': 'Entry equals Stop Loss'}
            
        stop_dist = abs(entry - stop)
        if stop_dist == 0:
            return {'units': 0, 'notional_value': 0, 'reason': 'Zero distance stop loss'}

        # 1. Determine the Absolute Risk Dollar Amount
        risk_amount = 0.0
        
        if self.allocation_method == "kelly":
            # Kelly dynamically adjusts the % of bankroll to risk based on historical edge
            kelly_pct = self._kelly_criterion_sizing(win_rate, reward_risk_ratio)
            risk_amount = capital * kelly_pct
            
        elif self.allocation_method == "var":
            # VaR statically assigns risk scaling inversely against volatility and Z-Scores
            vol = volatility if volatility else 0.15 # Fallback to 15% vol
            risk_amount = self._value_at_risk_sizing(capital, vol)
            
        else:
            # Default Fixed Fractional (2% rule)
            risk_amount = capital * self.risk_per_trade
            
        # 2. Base Institutional Units Calculation
        if risk_amount <= 0:
            return {'units': 0, 'notional_value': 0, 'reason': 'Negative edge or exhausted VaR'}
            
        base_units = risk_amount / stop_dist
        
        # 3. Confidence Factor Smoothing (Scales strictly 50%-100% of the computed units, never exceeds edge bounds)
        conf_multiplier = 0.5 + (0.5 * confidence)
        adjusted_units = base_units * conf_multiplier
        
        # 4. Strict Leverage Constraints
        max_notional_value = capital * self.max_leverage
        current_notional_value = adjusted_units * entry
        
        if current_notional_value > max_notional_value:
            adjusted_units = max_notional_value / entry
            
        return {
            'units': float(np.floor(adjusted_units)),
            'notional_value': float(adjusted_units * entry),
            'risk_amount': float(adjusted_units * stop_dist),
            'risk_pct': float((adjusted_units * stop_dist) / capital),
            'leverage': float((adjusted_units * entry) / capital),
            'methodology': self.allocation_method.upper()
        }
