import pandas as pd
from trading_system.services.trading.base_strategy import BaseStrategy

class SwingTrader(BaseStrategy):
    """
    Trend-following swing trading strategy using Bollinger Bands.
    """
    def __init__(self, config=None):
        super().__init__(name="SwingTrendFollower", config=config)

    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        df = data.copy()
        if 'Close' not in df.columns: return df
        
        # Bollinger Bands
        df['MA20'] = df['Close'].rolling(window=20).mean()
        df['STD20'] = df['Close'].rolling(window=20).std()
        df['Upper'] = df['MA20'] + (df['STD20'] * 2)
        df['Lower'] = df['MA20'] - (df['STD20'] * 2)
        
        # Signal logic
        df['signal'] = 0
        df.loc[df['Close'] > df['Upper'], 'signal'] = -1 # Mean reversion (Sell)
        df.loc[df['Close'] < df['Lower'], 'signal'] = 1  # Mean reversion (Buy)
        
        return df
