import logging
import numpy as np
from datetime import datetime

class PositionSizer:
    """
    Advanced Position Sizing using Fractional Kelly Criterion and Volatility Scaling.
    """
    def __init__(self, max_risk_per_trade: float = 0.02, total_equity: float = 1000000.0, kelly_fraction: float = 0.5):
        self.logger = logging.getLogger("Risk.PositionSizer")
        self.max_risk = max_risk_per_trade
        self.total_equity = total_equity
        self.kelly_fraction = kelly_fraction # e.g., 0.5 for Half-Kelly
        self.avg_win = 0.012 # 1.2% Default
        self.avg_loss = 0.008 # 0.8% Default
        self.win_rate = 0.55 # 55% Default

    def calculate_size(self, price: float, volatility: float, confidence: float = 0.5) -> dict:
        """
        Calculates the optimal position size using the Fractional Kelly Criterion.
        f* = p - (q / b)
        where p = win probability, q = 1 - p, b = payout ratio (win/loss)
        """
        # 1. Payout Ratio (b)
        payout_ratio = self.avg_win / max(0.0001, self.avg_loss)
        
        # 2. Win Probability (p) adjusted by confidence
        p = self.win_rate + (confidence * 0.1) # Boost win prob with confidence
        p = min(0.9, max(0.1, p))
        q = 1 - p
        
        # 3. Full Kelly Fraction
        full_kelly = max(0, p - (q / payout_ratio))
        
        # 4. Apply Fractional Kelly for safety
        applied_kelly = full_kelly * self.kelly_fraction
        
        # 5. Volatility Scaling (GARCH-like risk cap)
        # If vol is 2% (0.02), scale is 0.5. If vol is 1%, scale is 1.0
        vol_scale = min(1.0, 0.01 / max(0.001, volatility))
        
        # 6. Final Risk Fraction
        # Never exceed max_risk_per_trade from the base equity
        risk_fraction = min(self.max_risk, applied_kelly * vol_scale)
        
        cash_risk = self.total_equity * risk_fraction
        quantity = cash_risk / price if price > 0 else 0
        
        return {
            'quantity': round(quantity, 4),
            'cash_at_risk': round(cash_risk, 2),
            'risk_percent': round(risk_fraction * 100, 4),
            'payout_ratio': round(payout_ratio, 2),
            'kelly_applied': round(applied_kelly, 4),
            'vol_scale': round(vol_scale, 4),
            'timestamp': datetime.utcnow().isoformat()
        }

    def update_performance_metrics(self, win_rate: float, avg_win: float, avg_loss: float):
        """Update the metrics used for Kelly calculation based on live data"""
        self.win_rate = win_rate
        self.avg_win = avg_win
        self.avg_loss = avg_loss
        self.logger.info(f"Kelly metrics updated: WR={win_rate:.2%}, Payout={avg_win/avg_loss:.2f}")

    def update_equity(self, new_equity: float):
        self.total_equity = new_equity
        self.logger.info(f"Position Sizer equity updated to: ${new_equity:,.2f}")

    def get_risk_limits(self) -> dict:
        """Return the current risk limits for the Refiner"""
        return {
            "max_drawdown": 0.10, # 10%
            "daily_loss_limit": 0.02, # 2%
            "max_position_risk": self.max_risk
        }
