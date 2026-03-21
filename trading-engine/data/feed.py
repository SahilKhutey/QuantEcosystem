import os
import pandas as pd
from typing import List, Tuple, Generator, Optional
from abc import ABC, abstractmethod
from core.events import MarketEvent

class DataHandler(ABC):
    """
    DataHandler is an abstract base class providing an interface for
    all subsequent (inherited) data handlers (both live and historic).
    
    The goal of a (derived) DataHandler object is to output a generated
    set of bars (OHLCVI) for each symbol requested.
    
    This will replicate how a live strategy would function as current
    market data would be sent "down the pipe". Thus a historic and live
    system will be treated identically by the rest of the suite.
    """
    
    @abstractmethod
    def get_latest_bar(self, symbol: str):
        """Returns the last bar updated."""
        raise NotImplementedError("Should implement get_latest_bar()")

    @abstractmethod
    def get_latest_bars(self, symbol: str, N: int=1):
        """Returns the last N bars updated."""
        raise NotImplementedError("Should implement get_latest_bars()")

    @abstractmethod
    def get_latest_bar_datetime(self, symbol: str):
        """Returns a Python datetime object for the last bar."""
        raise NotImplementedError("Should implement get_latest_bar_datetime()")
    
    @abstractmethod
    def get_latest_bar_value(self, symbol: str, val_type: str):
        """Returns one of the Open, High, Low, Close, Volume or OI values from the pandas Bar series object."""
        raise NotImplementedError("Should implement get_latest_bar_value()")

    @abstractmethod
    def update_bars(self):
        """Pushes the latest bars to the latest_symbol_data structure for all symbols in the symbol list."""
        raise NotImplementedError("Should implement update_bars()")


class HistoricalCSVDataFeed(DataHandler):
    """
    HistoricalCSVDataFeed is designed to read CSV files for
    each requested symbol from disk and provide an interface
    to obtain the "latest" bar in a manner identical to a live
    trading interface. 
    """

    def __init__(self, events_queue, csv_dir: str, symbol_list: List[str]):
        self.events = events_queue
        self.csv_dir = csv_dir
        self.symbol_list = symbol_list
        
        self.symbol_data = {}
        self.latest_symbol_data = {}
        self.continue_backtest = True       
        
        self._open_convert_csv_files()

    def _open_convert_csv_files(self):
        """
        Opens the CSV files from the data directory, converts
        them into pandas DataFrames within a symbol dictionary.
        
        For this wrapper, it expects standard Yahoo Finance CSV format:
        Date, Open, High, Low, Close, Adj Close, Volume
        """
        comb_index = None
        for s in self.symbol_list:
            # Load the CSV file with no header information, indexed on date
            self.symbol_data[s] = pd.read_csv(
                os.path.join(self.csv_dir, f'{s}.csv'),
                header=0, index_col=0, parse_dates=True,
                names=['datetime', 'open', 'high', 'low', 'close', 'adj_close', 'volume']
            ).sort_index()
            
            # Combine the index to pad forward values
            if comb_index is None:
                comb_index = self.symbol_data[s].index
            else:
                comb_index.union(self.symbol_data[s].index)

            # Set the latest symbol_data to None
            self.latest_symbol_data[s] = []

        # Convert dictionary to generator
        for s in self.symbol_list:
            # Reindex dataframe and pad out missing values using forward fill
            self.symbol_data[s] = self.symbol_data[s].reindex(index=comb_index, method='pad')
            # Create a generator out of iterrows()
            self.symbol_data[s] = self.symbol_data[s].iterrows()

    def _get_new_bar(self, symbol: str):
        """Returns the latest bar from the data feed as a tuple."""
        for b in self.symbol_data[symbol]:
            yield b

    def get_latest_bar(self, symbol: str):
        try:
            bars_list = self.latest_symbol_data[symbol]
            return bars_list[-1]
        except KeyError:
            print("That symbol is not available in the historical data set.")
            raise
        
    def get_latest_bars(self, symbol: str, N: int=1):
        try:
            bars_list = self.latest_symbol_data[symbol]
            return bars_list[-N:]
        except KeyError:
            print("That symbol is not available in the historical data set.")
            raise

    def get_latest_bar_datetime(self, symbol: str):
        try:
            bars_list = self.latest_symbol_data[symbol]
            return bars_list[-1][0]
        except KeyError:
            print("That symbol is not available in the historical data set.")
            raise

    def get_latest_bar_value(self, symbol: str, val_type: str):
        try:
            bars_list = self.latest_symbol_data[symbol]
            return getattr(bars_list[-1][1], val_type)
        except KeyError:
            print("That symbol is not available in the historical data set.")
            raise

    def update_bars(self):
        """Pushes the latest bar to the parameters."""
        for s in self.symbol_list:
            try:
                bar = next(self._get_new_bar(s))
                self.latest_symbol_data[s].append(bar)
            except StopIteration:
                self.continue_backtest = False
                break
            except Exception as e:
                print(f"Error reading bar for symbol {s}: {e}")
                self.continue_backtest = False
                break
                
        if self.continue_backtest:
            self.events.put(MarketEvent())


class LiveStreamDataFeed(DataHandler):
    """
    LiveStreamDataFeed is a skeleton class for live data ingestion.
    It expects asynchronous messages from WebSockets/REST APIs and pushes them.
    """
    
    def __init__(self, events_queue, symbol_list: List[str]):
        self.events = events_queue
        self.symbol_list = symbol_list
        self.latest_symbol_data = {s: [] for s in symbol_list}
        
    def get_latest_bar(self, symbol: str):
        return self.latest_symbol_data[symbol][-1] if self.latest_symbol_data[symbol] else None

    def get_latest_bars(self, symbol: str, N: int=1):
        return self.latest_symbol_data[symbol][-N:]

    def get_latest_bar_datetime(self, symbol: str):
        return self.latest_symbol_data[symbol][-1]['datetime']

    def get_latest_bar_value(self, symbol: str, val_type: str):
        return self.latest_symbol_data[symbol][-1][val_type]

    def update_bars(self):
        """
        Usually overridden or replaced by a push-based mechanism in live systems 
        (e.g., WebSocket on_message triggers).
        """
        pass
    
    def on_tick_received(self, symbol: str, data: dict):
        """
        Called when a live tick/bar arrives.
        Parses the tick and pushes a MarketEvent.
        """
        if symbol in self.symbol_list:
            self.latest_symbol_data[symbol].append(data)
            # You might want to cap the list size to avoid infinite memory growth
            if len(self.latest_symbol_data[symbol]) > 1000:
                self.latest_symbol_data[symbol].pop(0)
            self.events.put(MarketEvent())
