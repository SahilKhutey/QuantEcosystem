import logging
import numpy as np

class PositionSizer:
    """
    Advanced Position Sizing using Kelly Criterion and Volatility Scaling.
    """
    def __init__(self, max_risk_per_trade: float = 0.02, total_equity: float = 1000000.0):
        self.logger = logging.getLogger("Risk.PositionSizer")
        self.max_risk = max_risk_per_trade
        self.total_equity = total_equity

    def calculate_size(self, price: float, volatility: float, confidence: float = 0.5) -> dict:
        """
        Calculates the optimal position size based on volatility and signal confidence.
        Uses a simplified Kelly fraction: (WinProb - LossProb) / 1
        """
        # Win probability based on confidence
        win_prob = 0.5 + (confidence * 0.4) # Range 0.5 to 0.9
        loss_prob = 1 - win_prob
        
        # Kelly Fraction (fraction of equity to risk)
        kelly_fraction = max(0, (win_prob - loss_prob))
        
        # Volatility Scaling: Inversely proportional to vol
        # If vol is 1% (0.01), scale is 1. If vol is 5%, scale is 0.2
        vol_scale = min(1.0, 0.01 / max(0.001, volatility))
        
        # Final combined risk fraction
        risk_fraction = kelly_fraction * vol_scale * self.max_risk
        
        cash_risk = self.total_equity * risk_fraction
        quantity = cash_risk / price if price > 0 else 0
        
        return {
            'quantity': round(quantity, 4),
            'cash_at_risk': round(cash_risk, 2),
            'risk_fraction': round(risk_fraction, 6),
            'kelly_fraction': round(kelly_fraction, 4),
            'vol_scale': round(vol_scale, 4)
        }

    def update_equity(self, new_equity: float):
        self.total_equity = new_equity
        self.logger.info(f"Position Sizer equity updated to: ${new_equity:,.2f}")
