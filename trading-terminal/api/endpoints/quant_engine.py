from flask import Blueprint, jsonify, request
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

quant_engine_bp = Blueprint('quant_engine', __name__)

@quant_engine_bp.route('/templates', methods=['GET'])
def get_templates():
    return jsonify({
        "status": "success",
        "data": [
            {"id": "mean_reversion", "name": "Mean Reversion", "description": "High-frequency mean reversion strategy using Bollinger Bands and RSI."},
            {"id": "trend_following", "name": "Trend Following", "description": "Momentum strategy following cross-over signals in EMA/SMA."},
            {"id": "arbitrage", "name": "Statistical Arbitrage", "description": "Pair trading strategy focused on cointegration between correlated assets."},
            {"id": "breakout", "name": "Breakout Strategy", "description": "Volatile breakout capture using ATR and volume velocity."}
        ]
    })

@quant_engine_bp.route('/backtesting/run', methods=['POST'])
def run_backtest():
    config = request.json
    strategy_id = config.get('strategyId')
    
    # Return a simulated backtest ID
    return jsonify({
        "status": "success",
        "data": {
            "backtestId": f"bt_{strategy_id}_{int(datetime.now().timestamp())}",
            "estimatedTime": "12s",
            "message": "Backtest job submitted to the quant cluster."
        }
    })

@quant_engine_bp.route('/backtesting/<strategy_id>', methods=['GET'])
def get_backtest_results(strategy_id):
    # Simulated performance equity curve
    dates = pd.date_range(end=datetime.now(), periods=100, freq='D')
    equity = np.cumprod(1 + np.random.normal(0.001, 0.02, 100)) * 100000
    benchmark = np.cumprod(1 + np.random.normal(0.0005, 0.015, 100)) * 100000
    
    equity_curve = []
    for d, e, b in zip(dates, equity, benchmark):
        equity_curve.append({
            "date": d.strftime('%Y-%m-%d'),
            "equity": float(e),
            "benchmark": float(b)
        })

    return jsonify({
        "status": "success",
        "data": {
            "equityCurve": equity_curve,
            "metrics": {
                "sharpeRatio": 2.45,
                "maxDrawdown": -12.4,
                "annualizedReturn": 18.5,
                "winRate": 58.2,
                "profitFactor": 1.75,
                "totalTrades": 450
            }
        }
    })

@quant_engine_bp.route('/optimization/<strategy_id>/run', methods=['POST'])
def run_optimization(strategy_id):
    return jsonify({
        "status": "success",
        "data": {
            "jobId": f"opt_{strategy_id}_{int(datetime.now().timestamp())}",
            "message": "Grid search optimization job started."
        }
    })

@quant_engine_bp.route('/optimization/<strategy_id>', methods=['GET'])
def get_optimization_results(strategy_id):
    # Simulated parameter heatmap data
    data = []
    for x in range(5, 25, 5):
        for y in range(40, 90, 10):
            data.append({
                "window": x,
                "threshold": y,
                "sharpe": float(np.random.uniform(1.5, 3.0))
            })
    return jsonify({"status": "success", "data": data})
