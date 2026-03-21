from typing import Dict, List
import pandas as pd
from loguru import logger

class PerformanceTracker:
    def __init__(self):
        self.trade_history = []
        self.initial_balance = 10000.0
        self.current_balance = 10000.0

    def add_trade(self, symbol: str, side: str, price: float, amount: float):
        """Record a trade."""
        self.trade_history.append({
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'timestamp': pd.Timestamp.now()
        })
        logger.info(f"Recorded {side} trade for {symbol} at {price}")

    def get_metrics(self) -> Dict:
        """Calculate performance metrics."""
        return {
            "pnl": self.current_balance - self.initial_balance,
            "return_pct": (self.current_balance / self.initial_balance - 1) * 100,
            "trade_count": len(self.trade_history)
        }
