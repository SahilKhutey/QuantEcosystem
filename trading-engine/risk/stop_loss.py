import numpy as np
from typing import Dict, Optional
import talib

class StopLossManager:
    """
    Generates dynamic stop loss levels based on different methodologies.
    """
    @staticmethod
    def calculate_atr_stop(df, entry_price: float, side: str, multiplier: float = 2.0) -> float:
        """Calculate stop loss based on Average True Range"""
        if len(df) < 20:
            # Fallback to 2% if not enough data
            return entry_price * (0.98 if side == 'BUY' else 1.02)
            
        atr = talib.ATR(df['high'].values, df['low'].values, df['close'].values, timeperiod=14)[-1]
        
        if side == 'BUY':
            return entry_price - (atr * multiplier)
        else:
            return entry_price + (atr * multiplier)
            
    @staticmethod
    def calculate_trailing_stop(current_price: float, max_reached: float, 
                              side: str, trail_pct: float = 0.05) -> float:
        """Calculate a trailing stop loss"""
        if side == 'BUY':
            return max_reached * (1 - trail_pct)
        else:
            # For short positions, max_reached would actually be min_reached
            return max_reached * (1 + trail_pct)

    @staticmethod
    def get_structure_stop(df, side: str, lookback: int = 5) -> float:
        """Set stop at recent swing high/low"""
        if side == 'BUY':
            # Stop below recent low
            return float(df['low'].iloc[-lookback:].min() * 0.995) # 0.5% buffer
        else:
            # Stop above recent high
            return float(df['high'].iloc[-lookback:].max() * 1.005)
