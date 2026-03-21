class _ArrayWrapper:
    """Wraps an array and an index to provide the `[-1]` lookback feeling of Backtesting.py"""
    def __init__(self, arr):
        self._arr = arr
        self._idx = 0
        
    def _update_index(self, idx):
        self._idx = idx

    def __getitem__(self, item):
         if isinstance(item, int):
              if item > 0:
                  raise IndexError("Positive lookahead not allowed in Backtesting.py")
              pos = self._idx + item
              if pos < 0:
                  return float('nan') # or appropriate fallback
              return self._arr[pos]
         elif isinstance(item, slice):
              # E.g. [-10:]
              start = item.start
              if start is not None and start < 0:
                  start = self._idx + start + 1
              if start < 0: start = 0
              end = self._idx + 1
              return self._arr[start:end]
         return self._arr

class _Data:
    """Provides self.data dot-access syntax."""
    def __init__(self, df):
        self.__df = df
        self.__arrays = {}
        for col in df.columns:
            self.__arrays[col] = _ArrayWrapper(df[col].values)
            setattr(self, col, self.__arrays[col])
            
    def _update_index(self, idx):
        for wrapper in self.__arrays.values():
            wrapper._update_index(idx)


class Position:
    def __init__(self):
        self.size = 0
        self.pl = 0.0
        self.pl_pct = 0.0

    @property
    def is_long(self):
        return self.size > 0

    @property
    def is_short(self):
         return self.size < 0

class Strategy:
    """
    Backtesting.py Base Strategy Class.
    """
    def __init__(self, broker, data):
        self._broker = broker
        self._data = data
        self.data = _Data(data)
        
        # Injected properties
        self.position = Position()
        self.closed_trades = []
        
        # Indicator tracking
        self._indicators = []

    def I(self, func, *args, **kwargs):
        """
        The magical self.I() indicator wrapper.
        Executes `func` against all historical data exactly once during init.
        """
        from inspect import signature
        # Try to resolve input arguments if they are _ArrayWrappers back to base arrays
        resolved_args = [arg._arr if isinstance(arg, _ArrayWrapper) else arg for arg in args]
        
        # Call the function vectorize-style
        res = func(*resolved_args, **kwargs)
        
        # Wrap result for iterative simulation
        wrapper = _ArrayWrapper(res)
        self._indicators.append(wrapper)
        return wrapper

    def init(self):
        """Called exactly once before the backtest loop begins."""
        pass

    def next(self):
        """Called iteratively row-by-row on the dataframe index."""
        pass

    # Basic trade execution methods
    def buy(self, size=1.0):
        self._broker.submit_order(size=size, is_buy=True)

    def sell(self, size=1.0):
        self._broker.submit_order(size=size, is_buy=False)

    def _update_index(self, idx):
        self.data._update_index(idx)
        for ind in self._indicators:
            ind._update_index(idx)

# Utilities
def crossover(series1, series2):
    """
    Helper mimicking backtesting.lib.crossover
    Returns True if series1 just crossed over series2.
    """
    if len(series1) < 2 or len(series2) < 2:
        return False
    return series1[-2] < series2[-2] and series1[-1] > series2[-1]
