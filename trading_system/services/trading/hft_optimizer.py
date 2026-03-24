import logging
import pandas as pd
import numpy as np
from datetime import datetime

class HFTOptimizer:
    """
    High-Frequency Trading optimizer for Order Book Imbalance (OBI) and micro-scalp signals.
    """
    def __init__(self, threshold: float = 0.6):
        self.logger = logging.getLogger("Trading.HFTOptimizer")
        self.obi_threshold = threshold
        self.history = []

    def calculate_obi(self, bids: list, asks: list) -> float:
        """
        Calculates Order Book Imbalance: (Total Bid Vol - Total Ask Vol) / (Total Bid Vol + Total Ask Vol)
        Returns a value between -1 (extreme ask pressure) and 1 (extreme bid pressure).
        """
        if not bids or not asks: return 0.0
        
        total_bid_vol = sum(b[1] for b in bids[:5]) # Top 5 levels
        total_ask_vol = sum(a[1] for a in asks[:5])
        
        if (total_bid_vol + total_ask_vol) == 0: return 0.0
        
        obi = (total_bid_vol - total_ask_vol) / (total_bid_vol + total_ask_vol)
        return round(obi, 4)

    def generate_hft_signal(self, symbol: str, bids: list, asks: list) -> dict:
        """
        Generates a high-frequency scalp signal based on OBI pressure.
        """
        obi = self.calculate_obi(bids, asks)
        action = "NEUTRAL"
        confidence = abs(obi)
        
        if obi >= self.obi_threshold:
            action = "SCALP_BUY"
        elif obi <= -self.obi_threshold:
            action = "SCALP_SELL"
            
        signal = {
            'symbol': symbol,
            'action': action,
            'obi': obi,
            'confidence': confidence,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.history.append(signal)
        if len(self.history) > 200: self.history.pop(0)
        
        return signal

    def get_hft_metrics(self) -> dict:
        if not self.history: return {"avg_obi": 0.0, "signal_count": 0}
        
        obis = [s['obi'] for s in self.history]
        return {
            "avg_obi": round(np.mean(obis), 4),
            "signal_count": len(self.history),
            "last_obi": obis[-1]
        }
