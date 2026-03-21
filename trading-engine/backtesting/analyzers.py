import pandas as pd
import numpy as np

class Analyzer:
    """
    Base class for Analyzers that plug into a strategy and analyze its performance.
    """
    def __init__(self, strategy, *args, **kwargs):
        self.strategy = strategy
        self.rets = {}

    def start(self):
        pass

    def next(self):
        pass

    def stop(self):
        pass

    def get_analysis(self):
        return self.rets


class TimeReturn(Analyzer):
    """
    Tracks portfolio value at each bar and calculates returns.
    """
    def __init__(self, strategy, *args, **kwargs):
        super().__init__(strategy, *args, **kwargs)
        self.values = []
        self.dates = []
        self.returns = []

    def next(self):
        if not self.strategy.datas:
            return
            
        data = self.strategy.datas[0]
        # Current datetime
        dt = data.datetime[0]
        val = self.strategy.broker.getvalue(self.strategy.datas)
        
        self.dates.append(dt)
        self.values.append(val)

    def stop(self):
        if len(self.values) < 2:
            return

        df = pd.DataFrame({'value': self.values}, index=self.dates)
        df['returns'] = df['value'].pct_change()
        
        self.rets['df'] = df
        self.rets['total_return'] = (self.values[-1] / self.values[0]) - 1.0


class SharpeRatio(Analyzer):
    """
    Calculates the Annualized Sharpe Ratio.
    """
    def __init__(self, strategy, riskfreerate=0.01, annualize=252):
        super().__init__(strategy)
        self.riskfreerate = riskfreerate
        self.annualize = annualize
        
    def stop(self):
        # We need the TimeReturn analyzer if it exists
        df = None
        for a in self.strategy.analyzers:
            if isinstance(a, TimeReturn):
                df = a.get_analysis().get('df')
                break
                
        if df is None or len(df) < 2:
            self.rets['sharperatio'] = 0.0
            return
            
        returns = df['returns'].dropna()
        if len(returns) == 0 or returns.std() == 0:
             self.rets['sharperatio'] = 0.0
             return

        daily_rf = self.riskfreerate / self.annualize
        excess_returns = returns - daily_rf
        
        sharpe = np.sqrt(self.annualize) * (excess_returns.mean() / excess_returns.std())
        self.rets['sharperatio'] = sharpe


class DrawDown(Analyzer):
    """
    Calculates Maximum Drawdown statistics.
    """
    def __init__(self, strategy, *args, **kwargs):
        super().__init__(strategy, *args, **kwargs)

    def stop(self):
        df = None
        for a in self.strategy.analyzers:
            if isinstance(a, TimeReturn):
                df = a.get_analysis().get('df')
                break
                
        if df is None or len(df) < 2:
            self.rets['max'] = {'drawdown': 0.0}
            return

        cum_ret = df['value'] / df['value'].iloc[0]
        high_water_marks = cum_ret.cummax()
        drawdowns = (cum_ret - high_water_marks) / high_water_marks
        
        max_drawdown = drawdowns.min() * 100.0 # Percentage
        
        self.rets['max'] = {'drawdown': max_drawdown}
