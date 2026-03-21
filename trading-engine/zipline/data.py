import pandas as pd

class BarData:
    """
    Provides the standard `data.current()` and `data.history()` interface.
    """
    def __init__(self, current_raw, history_raw):
        # current_raw: dict mapping asset -> {'open': X, 'high': Y, 'low': Z, 'close': W, 'volume': V}
        # history_raw: DataFrame with MultiIndex or similar allowing historical lookbacks
        self.current_raw = current_raw
        self._history_raw = history_raw

    def current(self, asset, field):
        """
        Returns the current value of 'field' for 'asset'.
        """
        if isinstance(asset, list):
            return {a: self.current_raw.get(a, {}).get(field, float('nan')) for a in asset}
            
        return self.current_raw.get(asset, {}).get(field, float('nan'))

    def history(self, assets, fields, bar_count, frequency):
        """
        Returns a rolling window of historical data.
        Returns a pandas DataFrame (if single field) or Panel/MultiIndex (if multi field).
        For simplicity in this mock, returns a DataFrame for a single field or a dict of DataFrames.
        """
        if isinstance(assets, str):
            assets = [assets]
            
        # Mock logic: We extract from the _history_raw dataframe which we assume is formatted 
        # specifically for our mock engine (e.g. index is Datetime, columns are (Asset, Field) tuples)
        
        # Here we do a crude mock since history slice requires tracking current chronological position
        # which depends on how the loop was driven.
        if self._history_raw is None:
            raise ValueError("History raw data not provided to portal.")
            
        # In a real zipline, this looks backward `bar_count` periods from the current execution time.
        # We will assume _history_raw is already sliced exactly to the last `bar_count` bars!
        
        # Simplistic return for our specific single-asset mock
        if 'Close' in self._history_raw.columns and isinstance(fields, str) and fields.lower() == 'close':
            df = self._history_raw['Close'].tail(bar_count)
            # If assets were multiple, we return columns. Let's assume single asset column mode for the mock
            return df

        return pd.DataFrame()


class DataPortal:
    """
    Distributes BarData instances chronologically to the algorithm.
    """
    def __init__(self, historical_df):
        # We expect a simple single-asset dataframe for the demo:
        # Index: Datetime, Columns: Open, High, Low, Close, Volume
        self.df = historical_df.sort_index()

    def iterrows(self):
        """
        Yields (timestamp, BarData) iterating over history representing real-time execution.
        """
        import trading_engine.zipline.api as zipline_api
        
        # We start yielding at index 10 to allow looking back 10 periods for small history calls.
        if len(self.df) < 10:
             return
             
        for i in range(10, len(self.df)):
            current_dt = self.df.index[i]
            row = self.df.iloc[i]
            
            # Pack current_raw for the single asset 'AAPL' mock
            current_raw = {
                'AAPL': {
                    'open': row.get('Open', 0),
                    'high': row.get('High', 0),
                    'low': row.get('Low', 0),
                    'close': row.get('Close', 0),
                    'volume': row.get('Volume', 0)
                }
            }
            
            # History up to the current bar
            history_slice = self.df.iloc[:i+1]
            
            bar_data = BarData(current_raw=current_raw, history_raw=history_slice)
            
            # Crucial: Update our global algo reference to know current prices for `order()` execution.
            if zipline_api._algo:
                 zipline_api._algo._current_prices = {asset: data['close'] for asset, data in current_raw.items()}
            
            yield current_dt, bar_data
