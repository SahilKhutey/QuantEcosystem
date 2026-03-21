from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from quantstats_clone.metrics import calculate_quant_metrics, generate_monthly_heatmap

quantstats_bp = Blueprint('quantstats_framework', __name__)

@quantstats_bp.route('/run', methods=['POST'])
def run_quantstats():
    """Generates a QuantStats performance tear sheet over an arbitrary equity curve."""
    try:
        # 1. Simulate an Equity Curve
        # A curve that runs up, crashes, then recovers (perfect for Drawdown tests)
        periods = 1000 # 3+ Years
        dates = pd.date_range(end=pd.Timestamp.today(), periods=periods, freq='D')
        
        # Build deterministic price curve
        np.random.seed(10)
        daily_drift = np.random.normal(0.0008, 0.015, periods)
        # Induce a massive localized flash crash around period 400
        daily_drift[400:450] = np.random.normal(-0.015, 0.02, 50)
        
        equity = 100000.0 * np.exp(np.cumsum(daily_drift))
        equity_series = pd.Series(equity, index=dates)
        
        # 2. Run QuantStats Metrics & Underwater Math
        metrics_dict, drawdowns_series = calculate_quant_metrics(equity_series)
        heatmap_data = generate_monthly_heatmap(equity_series)
        
        # 3. Format Data for UI
        underwater = []
        for index, value in drawdowns_series.items():
            underwater.append({
                'date': index.strftime('%Y-%m-%d'),
                'drawdown': float(value) * 100 # Parse to Percentage points string
            })
            
        return jsonify({
            "status": "success",
            "message": "QuantStats reporting suite executed successfully.",
            "metrics": metrics_dict,
            "heatmap": heatmap_data,
            "underwater": underwater
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
