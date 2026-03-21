import itertools
import copy

class Broker:
    """
    A simple Broker simulator mirroring Backtrader's internal broker.
    Executes trades at the NEXT open price.
    """
    def __init__(self):
        self.startingcash = 10000.0
        self.cash = self.startingcash
        self.commission_pct = 0.0
        self.positions = {}
        self.active_orders = []

    def setcash(self, cash):
        self.startingcash = cash
        self.cash = cash

    def setcommission(self, commission):
        self.commission_pct = commission

    def getcash(self):
        return self.cash

    def getvalue(self, datas):
        """Value = cash + value of all open positions based on CURRENT close price"""
        value = self.cash
        for data in datas:
            symbol = data.p.dataname 
            if symbol in self.positions:
                pos = self.positions[symbol]
                # Check bounds since at start there might not be data
                if pos != 0 and len(data.array) > 0 and data.idx >= 0:
                     value += pos * data.close[0]
        return value

    def submit(self, order):
        self.active_orders.append(order)

    def next(self, datas):
        """Process active orders at the open price of the NEW current bar."""
        executed = []
        for order in self.active_orders:
            data = order.data
            if data.idx < 0: 
                continue # Edge case for first tick
            exec_price = data.open[0]
            
            cost = exec_price * order.size
            comm = abs(cost) * self.commission_pct
            
            self.cash -= (cost + comm)
            symbol = data.p.dataname
            if symbol not in self.positions:
                self.positions[symbol] = 0
            self.positions[symbol] += order.size
            
            order.executed = {
                'price': exec_price,
                'size': order.size,
                'comm': comm,
                'value': cost
            }
            order.status = 'COMPLETED'
            executed.append(order)

        self.active_orders = []
        return executed


class Cerebro:
    """
    The orchestrator simulating Backtrader's Cerebro engine.
    Added Strategy Optimization (`optstrategy`) capabilities.
    """
    def __init__(self):
        self._datas_templates = []
        self.strats = []
        self.opt_strats = []
        self._broker_template = Broker()
        self.analyzers = []
        self.sizer = None
        
    def adddata(self, data):
        self._datas_templates.append(data)
        
    @property
    def broker(self):
        return self._broker_template

    def addstrategy(self, strategy_cls, *args, **kwargs):
        self.strats.append((strategy_cls, args, kwargs))

    def optstrategy(self, strategy_cls, *args, **kwargs):
        """Register a strategy for multiple parameter permutations."""
        self.opt_strats.append((strategy_cls, args, kwargs))

    def addanalyzer(self, analyzer_cls, *args, **kwargs):
        self.analyzers.append((analyzer_cls, args, kwargs))

    def addsizer(self, sizer_cls, *args, **kwargs):
        self.sizer = sizer_cls(*args, **kwargs)

    def _clone_data(self):
        """Re-initializes fresh PandasData iterators for multiple loops."""
        from backtesting.lines import PandasData
        cloned = []
        for d in self._datas_templates:
            if isinstance(d, PandasData):
                cloned.append(PandasData(d.dataframe))
        return cloned

    def _run_once(self, strategy_cls, s_args, s_kwargs):
        """Core loop for a single executing strategy."""
        datas = self._clone_data()
        broker = copy.deepcopy(self._broker_template)
        
        # Instantiate strategy
        strat = strategy_cls(self, *s_args, **s_kwargs)
        strat.params = s_kwargs # Store kwargs as params dict

        running_analyzers = [cls(strat, *a_args, **a_kwargs) for cls, a_args, a_kwargs in self.analyzers]

        strat.datas = datas
        strat.broker = broker
        strat.analyzers = running_analyzers
        
        if self.sizer is None:
            from backtesting.sizers import FixedSize
            self.addsizer(FixedSize, stake=1)
            
        strat.sizer = copy.deepcopy(self.sizer)
        if hasattr(strat.sizer, 'set_strategy'):
             strat.sizer.set_strategy(strat)
             
        strat.start()
        for a in running_analyzers:
            a.start()

        while True:
            pumped = [data.next() for data in datas]
            if not any(pumped):
                break 

            executed_orders = broker.next(datas)
            for order in executed_orders:
                strat.notify_order(order)

            strat.next()
            for a in running_analyzers:
                 a.next()

        strat.stop()
        for a in running_analyzers:
            a.stop()

        return strat

    def run(self):
        """Run standard or optimization batches."""
        if self.opt_strats:
            return self._run_opt()
        
        results = []
        for cls, args, kwargs in self.strats:
            strat = self._run_once(cls, args, kwargs)
            results.append([strat]) # mimicking Backtrader format
            print("Final Portfolio Value: %.2f" % strat.broker.getvalue(strat.datas))
        return results

    def _run_opt(self):
        """Iterate over defined optstrategy permutations."""
        opt_results = []
        for cls, args, kwargs in self.opt_strats:
            keys = list(kwargs.keys())
            values = []
            for k in keys:
                v = kwargs[k]
                if not isinstance(v, (list, tuple, range)):
                    v = [v]
                values.append(v)
                
            perms = list(itertools.product(*values))
            print(f"Executing {len(perms)} Strategy Permutations...")
            
            for perm in perms:
                perm_kwargs = dict(zip(keys, perm))
                strat = self._run_once(cls, args, perm_kwargs)
                opt_results.append([strat])
                
        return opt_results
