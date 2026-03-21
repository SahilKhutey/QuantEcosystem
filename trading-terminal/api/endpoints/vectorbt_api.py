from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
import itertools
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from vectorbt_clone.vbt_portfolio import Portfolio

vectorbt_bp = Blueprint('vectorbt', __name__)

@vectorbt_bp.route('/run', methods=['POST'])
def run_vectorbt():
    """Simulates a massive parameter sweep in milliseconds using Numba/Array techniques."""
    
    # 1. Generate massive matrix of baseline data
    periods = 1000
    dates = pd.date_range(end=datetime.today(), periods=periods, freq='D')
    
    # Simulating standard stochastic asset
    base_asset = np.cumprod(1 + np.random.normal(0.0002, 0.015, periods)) * 100
    
    # Define sweep grid (e.g. 10 to 50 fast, 50 to 200 slow)
    fast_windows = [10, 15, 20, 25, 30]
    slow_windows = [50, 75, 100, 150, 200]
    
    combinations = list(itertools.product(fast_windows, slow_windows))
    
    # 2. Build multi-dimensional DataFrames
    close_df = pd.DataFrame(index=dates)
    entries_df = pd.DataFrame(index=dates)
    exits_df = pd.DataFrame(index=dates)
    
    base_series = pd.Series(base_asset, index=dates)
    
    # VectorBT typically evaluates this completely implicitly via indicator sweeping.
    # We natively generate the combination grid manually here to demonstrate the fast array join capability.
    for fast_w, slow_w in combinations:
         col_name = f"SMA_{fast_w}_vs_{slow_w}"
         
         close_df[col_name] = base_series
         
         fast_ma = base_series.rolling(fast_w).mean()
         slow_ma = base_series.rolling(slow_w).mean()
         
         # Shift to avoid lookahead bias perfectly matching close
         entries = (fast_ma > slow_ma) & (fast_ma.shift(1) <= slow_ma.shift(1))
         exits = (fast_ma < slow_ma) & (fast_ma.shift(1) >= slow_ma.shift(1))
         
         entries_df[col_name] = entries
         exits_df[col_name] = exits
         
    # 3. The 10 millisecond magic VectorBT Portfolio resolution function!
    pf = Portfolio.from_signals(close_df, entries_df, exits_df, init_cash=10000.0, fees=0.001)
    
    # 4. Extract statistics and reshape for Dashboard Consumption
    stats_df = pf.get_stats()
    
    # Sort by absolute best Return
    stats_df = stats_df.sort_values(by='Total Return [%]', ascending=False).round(2)
    
    results_list = stats_df.to_dict('records')
    
    return jsonify({
        "status": "success",
        "message": "VectorBT hyperparameter sweep completed instantly.",
        "combinations_evaluated": len(combinations),
        "results": results_list
    })
