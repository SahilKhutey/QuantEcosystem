class Order:
    def __init__(self, data, size, ordertype="MARKET"):
        self.data = data
        self.size = size
        self.ordertype = ordertype
        self.executed = None
        self.status = 'CREATED'


class BTStrategy:
    """
    Simulates the Backtrader Strategy base class.
    Provides standard hooks: __init__, start, next, notify_order, stop.
    """
    def __init__(self, cerebro, *args, **kwargs):
        self.cerebro = cerebro
        self.broker = None # injected
        self.datas = []    # injected
        self.analyzers = []
        self.params = kwargs

        # Convenience for the first data feed
        self.data = None
        self.data0 = None

    def start(self):
        """Called before the backtest starts."""
        if self.datas:
            self.data = self.datas[0]
            self.data0 = self.datas[0]

    def next(self):
        """Called on every bar of the data feed."""
        pass

    def stop(self):
        """Called when backtest is complete."""
        pass

    def notify_order(self, order):
        """Called when an order status changes (e.g., gets filled)."""
        pass

    def getposition(self, data=None):
        """Returns the current position size for a given feed."""
        if data is None:
            data = self.data
        if not self.broker:
             return 0
        symbol = data.p.dataname
        return self.broker.positions.get(symbol, 0)
        
    def buy(self, data=None, size=None):
        """Generate a buy order."""
        if data is None:
            data = self.data
        if size is None and self.sizer is not None:
             size = self.sizer.getsizing(data, isbuy=True)
        size = size or 1
        
        order = Order(data, size)
        self.broker.submit(order)
        return order
        
    def sell(self, data=None, size=None):
        """Generate a sell order (negative size)."""
        if data is None:
            data = self.data
        if size is None and self.sizer is not None:
             size = self.sizer.getsizing(data, isbuy=False)
        size = size or 1
        
        order = Order(data, -size)
        self.broker.submit(order)
        return order

    def close(self, data=None):
        """Closes an existing position for the given data."""
        if data is None:
            data = self.data
        pos = self.getposition(data)
        if pos > 0:
            return self.sell(data, size=pos)
        elif pos < 0:
            return self.buy(data, size=abs(pos))
