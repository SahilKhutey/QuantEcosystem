import collections

class LineBuffer:
    """
    Simulates Backtrader's Line architecture.
    Provides array-like access where index 0 is the current item,
    -1 is the previous, -2 is two periods ago, etc.
    """
    def __init__(self, name="Line"):
        self.name = name
        self.array = []
        # Current index points to the latest element conceptually
        self.idx = -1

    def append(self, value):
        self.array.append(value)
        self.idx += 1

    def __getitem__(self, offset):
        """
        Backtrader indexing logic: 
        0 is the current appended element.
        -1 is the previous element.
        """
        if isinstance(offset, int):
            target_idx = self.idx + offset
            if target_idx < 0 or target_idx > self.idx:
                raise IndexError(f"LineBuffer index out of range: {offset}")
            return self.array[target_idx]
        elif isinstance(offset, slice):
            # Complex but for simplicity not fully supported like BT yet
            raise NotImplementedError("Slicing a LineBuffer is not supported natively.")

    def __len__(self):
        return len(self.array)
        
    def get(self, size=1, ago=0):
        """Returns a list of the last 'size' items, optionally offset by 'ago'"""
        end = self.idx + ago + 1
        start = end - size
        if start < 0 or end > self.idx + 1:
             raise IndexError("Requested size/ago combination is out of range.")
        return self.array[start:end]

class LineIterator:
    """
    Represents a group of lines, like Open, High, Low, Close, Volume.
    """
    lines = ()
    
    def __init__(self):
        self.lines_dict = {}
        for line_name in self.lines:
            self.lines_dict[line_name] = LineBuffer(line_name)
            # Create a property attribute dynamically so we can do data.close[0]
            setattr(self, line_name, self.lines_dict[line_name])
            
    def __len__(self):
        if not self.lines:
            return 0
        return len(self.lines_dict[self.lines[0]])

    def forward(self):
        """Moves internal pointers if necessary. In simple arrays, implied by append."""
        pass
        
class PandasData(LineIterator):
    """
    Parses a Pandas DataFrame into LineBuffers.
    """
    lines = ('datetime', 'open', 'high', 'low', 'close', 'volume', 'openinterest')

    def __init__(self, dataname):
        super().__init__()
        self.p = collections.namedtuple('Params', ['dataname'])(dataname)
        self.dataframe = dataname
        
        # Ensure we have common columns
        cols = [c.lower() for c in self.dataframe.columns]
        self.col_map = {
            'open': 'open',
            'high': 'high',
            'low': 'low',
            'close': 'close',
            'volume': 'volume',
        }
        
        # Attempt to map standard names
        for k in self.col_map.keys():
            matching_col = next((c for c in cols if k in c), None)
            if matching_col:
                 # Find actual column name in original case
                 orig_col = next(c for c in self.dataframe.columns if c.lower() == matching_col)
                 self.col_map[k] = orig_col

        self._data_iterator = self.dataframe.iterrows()
        self._length = len(self.dataframe)
        self.buflen = 0
        
    def next(self):
        """Pumps the next row into the lines."""
        try:
            timestamp, row = next(self._data_iterator)
        except StopIteration:
            return False

        # Add to lines
        self.lines_dict['datetime'].append(timestamp)
        self.lines_dict['open'].append(row[self.col_map['open']])
        self.lines_dict['high'].append(row[self.col_map['high']])
        self.lines_dict['low'].append(row[self.col_map['low']])
        self.lines_dict['close'].append(row[self.col_map['close']])
        
        if 'volume' in self.col_map and self.col_map['volume'] in row:
            self.lines_dict['volume'].append(row[self.col_map['volume']])
        else:
            self.lines_dict['volume'].append(0)
            
        self.lines_dict['openinterest'].append(0)
        
        self.buflen += 1
        return True
