import numpy as np
from typing import Dict, Optional
import talib

class StopLossManager:
    """
    Generates dynamic institutional stop loss levels based on multi-dimensional volatility tracking.
    """
    @staticmethod
    def calculate_atr_stop(df, entry_price: float, side: str, multiplier: float = 2.0) -> float:
        """Calculate stop loss based on Average True Range"""
        if len(df) < 20:
            return entry_price * (0.98 if side == 'BUY' else 1.02)
            
        atr = talib.ATR(df['high'].values, df['low'].values, df['close'].values, timeperiod=14)[-1]
        
        if side == 'BUY':
            return entry_price - (atr * multiplier)
        else:
            return entry_price + (atr * multiplier)
            
    @staticmethod
    def calculate_trailing_stop(current_price: float, max_reached: float, 
                               side: str, trail_pct: float = 0.05) -> float:
        """Calculate a basic fractional trailing stop loss"""
        if side == 'BUY':
            return max_reached * (1 - trail_pct)
        else:
            return max_reached * (1 + trail_pct)

    @staticmethod
    def get_structure_stop(df, side: str, lookback: int = 5) -> float:
        """Set stop at recent swing high/low"""
        if side == 'BUY':
            return float(df['low'].iloc[-lookback:].min() * 0.995)
        else:
            return float(df['high'].iloc[-lookback:].max() * 1.005)

    @staticmethod
    def get_chandelier_exit(df, side: str, atr_period: int = 22, atr_multiplier: float = 3.0) -> float:
        """
        Advanced Volatility Trailing Exits (Chandelier Exit).
        Instead of trailing an arbitrary percent, this mathematically suspends the stop loss 
        exactly 'X' ATRs below the extreme highest-high achieved during the duration of the trade.
        """
        if len(df) < atr_period:
            return df['close'].iloc[-1] * (0.95 if side == 'BUY' else 1.05)
            
        atr = talib.ATR(df['high'].values, df['low'].values, df['close'].values, timeperiod=atr_period)[-1]
        
        if side == 'BUY':
            # Highest High over the lookback period minus the ATR multiple
            highest_high = df['high'].iloc[-atr_period:].max()
            chandelier_stop = highest_high - (atr * atr_multiplier)
            return float(chandelier_stop)
        else:
            # Lowest Low over the lookback period plus the ATR multiple
            lowest_low = df['low'].iloc[-atr_period:].min()
            chandelier_stop = lowest_low + (atr * atr_multiplier)
            return float(chandelier_stop)

    @staticmethod
    def evaluate_time_stop(bars_held: int, max_bars_allowed: int = 24) -> bool:
        """
        Opportunity Cost Preservator: Time-Based Stop.
        If a trade stalls and loses momentum, holding capital in it represents mathematically 
        dangerous opportunity cost. Exits automatically after N unresolved intervals.
        """
        return bars_held >= max_bars_allowed
