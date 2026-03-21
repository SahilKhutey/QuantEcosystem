from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from bt_clone.core import Strategy, Backtest, run
from bt_clone.algos import RunMonthly, SelectAll, WeighEqually, Rebalance

bt_bp = Blueprint('bt_framework', __name__)

@bt_bp.route('/run', methods=['POST'])
def run_bt():
    """Simulates a complex portfolio rebalancing procedure across dynamic mock assets."""
    
    # 1. Generate multi-asset hypothetical price data showing mean-reverting qualities
    # This highlights the power of monthly equal-weight rebalancing.
    np.random.seed(42)
    periods = 700
    dates = pd.date_range(end=datetime.today(), periods=periods, freq='D')
    
    def generate_random_walk(drift, vol):
        return np.cumprod(1 + np.random.normal(drift, vol, periods)) * 100
        
    df = pd.DataFrame({
        'TECH_ALPHA': generate_random_walk(0.0006, 0.025),  # High Beta
        'BLUE_CHIP': generate_random_walk(0.0003, 0.010),   # Value
        'BONDS_ETF': generate_random_walk(0.0001, 0.004),     # Stable
        'GOLD_TRUST': generate_random_walk(0.0002, 0.012)    # Non-correlated
    }, index=dates)
    
    # 2. Define the exact pmorissette/bt methodology chain
    s_eq_weight = Strategy('Equal Weight Portfolio', [
        RunMonthly(),    # Halt daily operations; proceed only on month boundary
        SelectAll(),     # Include all 4 assets
        WeighEqually(),  # Dictate 25% target weights each
        Rebalance()      # Execute market trades to achieve the 25% targets
    ])
    
    # 3. Inject and Run
    bt_engine = Backtest(s_eq_weight, df)
    results = run(bt_engine)
    
    # 4. Extract metrics
    eq_curve = results['Equal Weight Portfolio']
    
    total_return = (eq_curve['equity'].iloc[-1] / eq_curve['equity'].iloc[0]) - 1.0
    
    # Format graph output - decimate to weekly to save JSON payload size
    graph_data = eq_curve.resample('W').last().dropna()
    
    timeseries = []
    for dt, row in graph_data.iterrows():
         point = {
             'date': dt.strftime('%Y-%m-%d'),
             'equity': round(row['equity'], 2),
         }
         # Also expose the actual mathematical allocations so we can chart the rebalance lines!
         for col in df.columns:
              point[f"{col}_weight"] = round(row[f"{col}_weight"] * 100, 2)
         timeseries.append(point)

    return jsonify({
        "status": "success",
        "message": "bt Portfolio Rebalancing Completed.",
        "metrics": {
            "Total Return [%]": round(total_return * 100, 2),
            "Final Equity [$]": round(eq_curve['equity'].iloc[-1], 2)
        },
        "timeseries": timeseries
    })
