import pandas as pd
from typing import Dict, Any

class IStrategy:
    """
    Freqtrade standard Strategy Interface.
    Relies entirely on pandas DataFrames populated with TA indicators.
    """
    
    # Optional parameters usually defined in subclasses
    timeframe = '1h'
    minimal_roi = {"0": 0.05} # Default 5% ROI
    stoploss = -0.10 # Default 10% stoploss
    
    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        """
        Populate indicators that will be used in the evaluation.
        """
        return dataframe

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        """
        Populate the 'enter_long' column matching the entry conditions.
        """
        dataframe.loc[:, 'enter_long'] = 0
        dataframe.loc[:, 'enter_tag'] = ''
        return dataframe

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        """
        Populate the 'exit_long' column matching the exit conditions.
        """
        dataframe.loc[:, 'exit_long'] = 0
        dataframe.loc[:, 'exit_tag'] = ''
        return dataframe

class SampleMACDStrategy(IStrategy):
    """
    Sample strategy mimicking a standard MACD cross.
    """
    timeframe = '1d'
    minimal_roi = {"0": 0.15, "10": 0.05} # 15% immediate, 5% after 10 periods
    stoploss = -0.05

    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        # Mocking technical indicator generation natively. 
        # Usually requires TA-Lib or Pandas-TA. We will simulate simplistic moving averages here.
        dataframe['ema_short'] = dataframe['close'].ewm(span=12, adjust=False).mean()
        dataframe['ema_long'] = dataframe['close'].ewm(span=26, adjust=False).mean()
        dataframe['macd'] = dataframe['ema_short'] - dataframe['ema_long']
        dataframe['macd_signal'] = dataframe['macd'].ewm(span=9, adjust=False).mean()
        return dataframe

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        # MACD crosses above signal
        dataframe.loc[
            (
                (dataframe['macd'] > dataframe['macd_signal']) &
                (dataframe['macd'].shift(1) <= dataframe['macd_signal'].shift(1)) &
                (dataframe['volume'] > 0)
            ),
            'enter_long'] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        # MACD crosses below signal
        dataframe.loc[
            (
                (dataframe['macd'] < dataframe['macd_signal']) &
                (dataframe['macd'].shift(1) >= dataframe['macd_signal'].shift(1)) &
                (dataframe['volume'] > 0)
            ),
            'exit_long'] = 1
        return dataframe
