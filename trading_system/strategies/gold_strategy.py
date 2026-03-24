import pandas as pd
import numpy as np
from trading_system.services.trading.base_strategy import BaseStrategy

class GoldStrategy(BaseStrategy):
    """
    Specialized Gold (XAUUSD) Strategy.
    Integrates Macro indicators and Relative Strength.
    """
    def __init__(self, config=None):
        super().__init__(name="GoldMacroAlpha", config=config)
        self.lookback = self.config.get('lookback', 20)

    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Simple Moving Average Crossover + RSI for XAUUSD.
        (Macro integration placeholder).
        """
        df = data.copy()
        if 'Close' not in df.columns: return df
        
        # Calculate Indicators
        df['SMA_Fast'] = df['Close'].rolling(window=self.lookback).mean()
        df['SMA_Slow'] = df['Close'].rolling(window=self.lookback * 3).mean()
        
        # Signal Logic
        df['signal'] = 0
        df.loc[df['SMA_Fast'] > df['SMA_Slow'], 'signal'] = 1  # Buy
        df.loc[df['SMA_Fast'] < df['SMA_Slow'], 'signal'] = -1 # Sell
        
        return df
