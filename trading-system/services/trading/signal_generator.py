import numpy as np
import pandas as pd
import talib
import logging
from typing import Dict, List, Optional

logger = logging.getLogger('SignalGenerator')

class SignalGenerator:
    """
    Advanced Signal Generator using TA-Lib
    """
    def __init__(self):
        self.logger = logger

    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate a comprehensive suite of technical indicators"""
        if len(df) < 30:
            return df
            
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        
        # Trend Indicators
        df['sma_20'] = talib.SMA(close, timeperiod=20)
        df['ema_9'] = talib.EMA(close, timeperiod=9)
        df['ema_21'] = talib.EMA(close, timeperiod=21)
        
        # Momentum Indicators
        df['rsi'] = talib.RSI(close, timeperiod=14)
        macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
        df['macd'] = macd
        df['macd_signal'] = macdsignal
        df['macd_hist'] = macdhist
        
        # Volatility Indicators
        upper, middle, lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)
        df['bb_upper'] = upper
        df['bb_middle'] = middle
        df['bb_lower'] = lower
        df['atr'] = talib.ATR(high, low, close, timeperiod=14)
        
        return df

    def get_rsi_signal(self, rsi: float) -> str:
        """Simple RSI threshold signals"""
        if rsi < 30:
            return "BUY"
        elif rsi > 70:
            return "SELL"
        return "HOLD"

    def get_macd_crossover(self, macd: float, signal: float, prev_macd: float, prev_signal: float) -> str:
        """MACD crossover signals"""
        if prev_macd <= prev_signal and macd > signal:
            return "BUY"
        elif prev_macd >= prev_signal and macd < signal:
            return "SELL"
        return "HOLD"
