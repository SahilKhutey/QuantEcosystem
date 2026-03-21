from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add trading-engine to path so we can import our components
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from backtesting.cerebro import Cerebro
from backtesting.lines import PandasData
from strategies.bt_strategy import BTStrategy
from backtesting.analyzers import TimeReturn, SharpeRatio, DrawDown
from backtesting.plotter import CerebroPlotter

backtrader_bp = Blueprint('backtrader', __name__)

class SimpleCrossStrategy(BTStrategy):
    """A very basic crossover logic for testing."""
    def __init__(self, cerebro):
        super().__init__(cerebro)
        self.bars_in = 0

    def next(self):
        self.bars_in += 1
        pos = self.getposition()
        price = self.data.close[0]
        
        # Simple random logic to generate trades for the plot
        if pos == 0 and np.random.rand() > 0.8:
            self.buy(size=10)
        elif pos > 0 and np.random.rand() > 0.7:
            self.sell(size=10)


@backtrader_bp.route('/run', methods=['POST'])
def run_backtrader():
    """Run a backtrader style backtest and return plots & stats."""
    
    # Generate some dummy data representing a stock
    dates = pd.date_range(end=datetime.today(), periods=100)
    closes = np.cumprod(1 + np.random.randn(100) * 0.02) * 100
    df = pd.DataFrame({
        'Datetime': dates,
        'Open': closes * (1 + np.random.randn(100) * 0.005),
        'High': closes * 1.01,
        'Low': closes * 0.99,
        'Close': closes,
        'Volume': np.random.randint(1000, 10000, 100)
    })
    
    # Initialize Engine
    cerebro = Cerebro()
    cerebro.broker.setcash(10000.0)
    cerebro.broker.setcommission(0.001)

    # Add Data
    datafeed = PandasData(df)
    cerebro.adddata(datafeed)

    # Add Strategy
    cerebro.addstrategy(SimpleCrossStrategy)

    # Add Analyzers
    cerebro.addanalyzer(TimeReturn)
    cerebro.addanalyzer(SharpeRatio, riskfreerate=0.01)
    cerebro.addanalyzer(DrawDown)

    # Run
    results = cerebro.run()
    strat = results[0]

    # Extract Stats
    stats = {}
    for a in strat.analyzers:
        if isinstance(a, TimeReturn):
             stats['Total Return'] = f"{a.rets.get('total_return', 0.0) * 100:.2f}%"
        elif isinstance(a, SharpeRatio):
             stats['Sharpe Ratio'] = f"{a.rets.get('sharperatio', 0.0):.2f}"
        elif isinstance(a, DrawDown):
             stats['Max Drawdown'] = f"{a.rets.get('max', {}).get('drawdown', 0.0):.2f}%"

    # Generate Plot
    plotter = CerebroPlotter(cerebro)
    image_b64 = plotter.plot_strategy(strat)

    return jsonify({
        "status": "success",
        "message": "Backtrader simulation completed.",
        "stats": stats,
        "plot_image": f"data:image/png;base64,{image_b64}"
    })


@backtrader_bp.route('/optimize', methods=['POST'])
def optimize_backtrader():
    """Run a multi-parameter optimization using optstrategy."""
    req = request.json or {}
    
    # Simple grid limits
    param_min = req.get('param_min', 1)
    param_max = req.get('param_max', 3)
    
    # Generate dummy data
    dates = pd.date_range(end=datetime.today(), periods=100)
    closes = np.cumprod(1 + np.random.randn(100) * 0.02) * 100
    df = pd.DataFrame({
        'Datetime': dates,
        'Open': closes * (1 + np.random.randn(100) * 0.005),
        'High': closes * 1.01,
        'Low': closes * 0.99,
        'Close': closes,
        'Volume': np.random.randint(1000, 10000, 100)
    })
    
    cerebro = Cerebro()
    cerebro.broker.setcash(10000.0)
    cerebro.broker.setcommission(0.001)

    # Use PercentSizer
    from backtesting.sizers import PercentSizer
    cerebro.addsizer(PercentSizer, percents=10)

    datafeed = PandasData(df)
    cerebro.adddata(datafeed)

    # Add Strategy for optimization
    # E.g., simulating testing different 'Moving Average' periods
    cerebro.optstrategy(SimpleCrossStrategy, period1=range(param_min, param_max + 1), multiplier=[1, 2])

    cerebro.addanalyzer(TimeReturn)
    cerebro.addanalyzer(SharpeRatio, riskfreerate=0.01)

    # Run
    opt_runs = cerebro.run()

    # Extract Stats for each permutation
    results_grid = []
    
    # opt_runs is a list of lists of strats: [[strat1], [strat2], ...]
    for run in opt_runs:
        strat = run[0]
        params = strat.params
        
        row = {
            "period1": params.get('period1'),
            "multiplier": params.get('multiplier'),
        }
        
        for a in strat.analyzers:
            if isinstance(a, TimeReturn):
                 row['Total Return'] = f"{a.rets.get('total_return', 0.0) * 100:.2f}%"
            elif isinstance(a, SharpeRatio):
                 row['Sharpe Ratio'] = round(a.rets.get('sharperatio', 0.0), 3)
                 
        results_grid.append(row)

    # Sort by Sharpe Ratio descending
    results_grid.sort(key=lambda x: x.get('Sharpe Ratio', 0), reverse=True)

    return jsonify({
        "status": "success",
        "message": f"Optimization finished for {len(results_grid)} permutations.",
        "grid": results_grid
    })

