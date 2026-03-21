from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add trading-engine to path so we can import our zipline components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from zipline.algorithm import TradingAlgorithm
from zipline.data import DataPortal
from zipline.api import order_target_percent, record, symbol
from zipline.pipeline import Pipeline, SimpleMovingAverage

zipline_bp = Blueprint('zipline', __name__)

# Mock Strategy logic mimicking Quantopian algorithms
def initialize(context):
    context.asset = symbol('AAPL')
    # Set up pipeline
    pipe = Pipeline()
    pipe.add(SimpleMovingAverage(window_length=10), 'sma_10')
    pipe.add(SimpleMovingAverage(window_length=30), 'sma_30')
    
    # Needs a global algo reference to attach. Zipline natively does magic namespacing.
    import trading_engine.zipline.api as zapi
    if getattr(zapi, '_algo', None):
         zapi._algo.attach_pipeline(pipe, 'my_pipeline')

def handle_data(context, data):
    import trading_engine.zipline.api as zapi
    algo = getattr(zapi, '_algo', None)
    
    if algo is None:
         return
         
    # Fetch pipeline output
    factors = algo.pipeline_output('my_pipeline')
    if factors is None or factors.empty:
         return
         
    current_price = data.current(context.asset, 'close')
    
    if context.asset in factors.index:
         row = factors.loc[context.asset]
         sma_10 = row.get('sma_10', 0)
         sma_30 = row.get('sma_30', 0)
         
         # Logic
         if sma_10 > sma_30:
              # Golden cross
              order_target_percent(context.asset, 1.0)
         elif sma_10 < sma_30:
              # Death cross
              order_target_percent(context.asset, 0.0)
              
         record(AAPL=current_price, SMA10=sma_10, SMA30=sma_30)


@zipline_bp.route('/run', methods=['POST'])
def run_zipline():
    """Run a Zipline backtest simulating a simple dual SMA."""
    
    # Generate mock history for AAPL
    dates = pd.date_range(end=datetime.today(), periods=252)
    closes = np.cumprod(1 + np.random.randn(252) * 0.01) * 150
    df = pd.DataFrame({
        'Datetime': dates,
        'Open': closes * (1 + np.random.randn(252) * 0.005),
        'High': closes * 1.01,
        'Low': closes * 0.99,
        'Close': closes,
        'Volume': np.random.randint(1000000, 10000000, 252)
    })
    df.set_index('Datetime', inplace=True)
    
    portal = DataPortal(df)
    
    # Run Algorithm
    algo = TradingAlgorithm(initialize=initialize, handle_data=handle_data, capital_base=100000.0)
    algo._history_portal_df = df # Needed for our mock pipeline
    
    returns_df, recorded_vars = algo.run(portal)
    
    # Calculate PyFolio style stats
    returns = returns_df['returns']
    total_return = (returns_df['value'].iloc[-1] / returns_df['value'].iloc[0]) - 1.0
    
    volatility = returns.std() * np.sqrt(252)
    sharpe = (returns.mean() * 252 - 0.01) / volatility if volatility > 0 else 0
    sortino = (returns.mean() * 252 - 0.01) / (returns[returns < 0].std() * np.sqrt(252)) if returns[returns < 0].std() > 0 else 0
    
    cum_rets = (1 + returns).cumprod()
    peaks = cum_rets.cummax()
    drawdowns = (cum_rets - peaks) / peaks
    max_drawdown = drawdowns.min()
    
    # Extract timeseries data for charting
    timeseries = []
    for dt, val in zip(returns_df.index, returns_df['value']):
        timeseries.append({
            'date': dt.strftime('%Y-%m-%d'),
            'value': round(val, 2)
        })

    stats = {
        'Total Return': f"{total_return * 100:.2f}%",
        'Annual Volatility': f"{volatility * 100:.2f}%",
        'Sharpe Ratio': f"{sharpe:.2f}",
        'Sortino Ratio': f"{sortino:.2f}",
        'Max Drawdown': f"{max_drawdown * 100:.2f}%",
        'Ending Value': f"${returns_df['value'].iloc[-1]:.2f}"
    }

    return jsonify({
        "status": "success",
        "message": "Zipline simulation completed.",
        "stats": stats,
        "equity_curve": timeseries
    })
