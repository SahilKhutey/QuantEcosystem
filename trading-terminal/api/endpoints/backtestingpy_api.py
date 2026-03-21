from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from backtesting_py.backtest import Backtest
from backtesting_py.strategy import Strategy, crossover

backtestingpy_bp = Blueprint('backtestingpy', __name__)

# Very simple technical indicators for the I() wrapper
def SMA(arr, n):
    return pd.Series(arr).rolling(n).mean().values

class SmaCross(Strategy):
    n1 = 10
    n2 = 20

    def init(self):
        # The magical I() wrapper
        self.sma1 = self.I(SMA, self.data.Close, self.n1)
        self.sma2 = self.I(SMA, self.data.Close, self.n2)

    def next(self):
        if crossover(self.sma1, self.sma2):
            self.buy()
        elif crossover(self.sma2, self.sma1):
            self.sell()

@backtestingpy_bp.route('/run', methods=['POST'])
def run_backtestingpy():
    """Runs a backtesting.py simulated evaluation."""
    
    # Generate mock daily data
    periods = 500
    dates = pd.date_range(end=datetime.today(), periods=periods, freq='D')
    closes = np.cumprod(1 + np.random.normal(0.0005, 0.02, periods)) * 100
    
    df = pd.DataFrame({
        'Open': closes * (1 + np.random.normal(0, 0.005, periods)),
        'High': closes * 1.015,
        'Low': closes * 0.985,
        'Close': closes,
        'Volume': np.random.uniform(1000, 10000, periods)
    }, index=dates)

    bt = Backtest(df, SmaCross, cash=10000, commission=.002)
    stats = bt.run()
    
    # Format the stats series for JSON
    stats_dict = {}
    for k, v in stats.items():
         if isinstance(v, (pd.Timestamp, datetime)):
              stats_dict[k] = v.strftime('%Y-%m-%d')
         elif isinstance(v, pd.Timedelta):
              stats_dict[k] = str(v)
         elif isinstance(v, float):
              stats_dict[k] = round(v, 2)
         else:
              stats_dict[k] = v
              
    return jsonify({
        "status": "success",
        "message": "Backtesting.py simulation completed.",
        "stats": stats_dict
    })
