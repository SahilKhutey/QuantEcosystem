import pandas as pd
import numpy as np

class Pipeline:
    """
    Represents a computation graph for cross-sectional factor execution.
    """
    def __init__(self, columns=None, screen=None):
        self.columns = columns or {}
        self.screen = screen

    def add(self, column, name):
        self.columns[name] = column


class Factor:
    """
    Computes a numerical value over a trailing window of data for multiple assets.
    """
    def __init__(self, window_length=1):
        self.window_length = window_length

    def compute(self, history_df):
        """
        Subclasses should implement vectorized computation.
        history_df: DataFrame with date index and asset columns.
        Returns: Series of latest factor values indexed by asset.
        """
        raise NotImplementedError


class SimpleMovingAverage(Factor):
    def compute(self, history_df):
        # We expect history_df to have at least `window_length` rows.
        # history_df columns are assets (e.g. AAPL, MSFT)
        return history_df.tail(self.window_length).mean()


class DailyReturns(Factor):
    def compute(self, history_df):
        if len(history_df) < 2:
            return pd.Series(0, index=history_df.columns)
        return history_df.iloc[-1] / history_df.iloc[-2] - 1.0


class Filter:
    """Computes a boolean array for masking universes."""
    pass

class TopN(Filter):
    def __init__(self, factor, n):
        self.factor = factor
        self.n = n
        
    def compute(self, history_df):
        factor_vals = self.factor.compute(history_df)
        # return boolean series where True if in top N
        return factor_vals >= factor_vals.nlargest(self.n).min()


class PipelineEngine:
    """
    Executes a Pipeline on historical data mimicking zipline's `run_pipeline`.
    """
    def __init__(self, history_data_multiindex):
        # We assume history_data is a dictionary mapping assets to dataframes, or 
        # a MultiIndex dataframe. We'll simplify: dict mapping asset to 'close' series
        self.history_data = history_data_multiindex
        
    def run_pipeline(self, pipeline, current_dt):
        """
        Computes the pipeline for the given datetime.
        Returns a DataFrame indexed by Asset, with columns from the pipeline.
        """
        out_data = {}
        
        # Build history slice ending at current_dt
        # We assume self.history_data is a DataFrame where columns are Assets and index is Datetime
        past_data = self.history_data.loc[:current_dt]
        
        for name, factor in pipeline.columns.items():
            # Slice the data to the window length required by the factor
            window_slice = past_data.tail(factor.window_length + 1) # +1 sometimes needed for returns
            
            # compute returns a series indexed by asset
            factor_vals = factor.compute(window_slice)
            out_data[name] = factor_vals
            
        result_df = pd.DataFrame(out_data)
        
        if pipeline.screen:
             # Apply screen boolean mask
             mask = pipeline.screen.compute(past_data.tail(pipeline.screen.factor.window_length + 1))
             result_df = result_df[mask]
             
        return result_df
