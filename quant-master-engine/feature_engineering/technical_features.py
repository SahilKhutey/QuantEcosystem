import pandas as pd
from ta import add_all_ta_features
from ta.utils import dropna

class TechnicalFeatures:
    """
    Generates technical analysis indicators for model features.
    """
    @staticmethod
    def generate_all(df):
        """Adds over 40+ technical indicators to the dataframe."""
        df = dropna(df)
        return add_all_ta_features(
            df, open="Open", high="High", low="Low", close="Close", volume="Volume", fillna=True
        )

    @staticmethod
    def moving_average_crossover(df, short_window=20, long_window=50):
        """Calculates short and long-term moving average signals."""
        df['SMA20'] = df['Close'].rolling(window=short_window).mean()
        df['SMA50'] = df['Close'].rolling(window=long_window).mean()
        df['Signal'] = 0.0
        df['Signal'] = np.where(df['SMA20'] > df['SMA50'], 1.0, 0.0)
        return df
