import logging
import json
from datetime import datetime

class MobileBridge:
    """
    Bridge service for mobile clients. Provides optimized, 
    low-bandwidth data streams and high-priority push notifications.
    """
    def __init__(self, alert_manager, lstm_signal):
        self.logger = logging.getLogger("Mobile.Bridge")
        self.alert_manager = alert_manager
        self.lstm_signal = lstm_signal
        self.active_sessions = 0

    def get_mobile_summary(self, portfolio_stats: dict) -> dict:
        """
        Returns a compressed, mobile-optimized summary of 
        the global system state.
        """
        self.logger.info("Generating mobile-optimized summary...")
        
        summary = {
            "p": round(portfolio_stats.get('total_pnl', 0), 2), # p = pnl
            "d": round(portfolio_stats.get('max_drawdown', 0), 4), # d = drawdown
            "s": portfolio_stats.get('status', 'OK'), # s = status
            "signals": self._get_top_signals(),
            "t": datetime.utcnow().isoformat()
        }
        return summary

    def _get_top_signals(self):
        """Fetch strongest AI signals for mobile display"""
        # Mocking top signals for APP.JS consumption
        return [
            {"sym": "BTC/USD", "dir": "BUY", "conf": 0.89},
            {"sym": "EUR/USD", "dir": "SELL", "conf": 0.72}
        ]

    def register_device(self, device_token: str):
        self.logger.info(f"Mobile device registered for push: {device_token[:10]}...")
        return {"status": "SUCCESS", "session_id": "mob_44921"}
