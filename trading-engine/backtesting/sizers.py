class SizerBase:
    """
    Base class for position sizing algorithms.
    """
    def __init__(self, strategy=None):
        self.strategy = strategy
        self.broker = None

    def set_strategy(self, strategy):
        self.strategy = strategy
        self.broker = strategy.broker

    def getsizing(self, data, isbuy):
        """
        Calculate the size of an order.
        Must be overridden by subclasses.
        """
        raise NotImplementedError("getsizing must be implemented by subclass")

class FixedSize(SizerBase):
    """
    Returns a constant size for every trade.
    """
    def __init__(self, stake=1):
        super().__init__()
        self.stake = stake

    def getsizing(self, data, isbuy):
        return self.stake

class PercentSizer(SizerBase):
    """
    Sizes trades based on a percentage of the total portfolio value.
    """
    def __init__(self, percents=10):
        super().__init__()
        self.percents = percents / 100.0

    def getsizing(self, data, isbuy):
        # Calculate size based on portfolio value
        val = self.broker.getvalue(self.strategy.datas)
        alloc = val * self.percents
        
        # Determine current price
        price = data.close[0]
        if price <= 0:
             return 0
             
        # Calculate how many units we can buy/sell
        size = int(alloc / price)
        return size
