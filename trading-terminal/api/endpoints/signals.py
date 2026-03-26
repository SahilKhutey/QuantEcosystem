from flask import Blueprint, request, jsonify
from datetime import datetime
import numpy as np

signals_bp = Blueprint('signals', __name__)

# Mock data for demonstration purposes
MOCK_SIGNALS = [
    {
        "id": "sig_1",
        "symbol": "BTC/USD",
        "type": "BUY",
        "strength": 0.85,
        "model": "LSTM",
        "timestamp": datetime.now().isoformat(),
        "status": "active",
        "price": 65000.0,
        "target": 68000.0,
        "stop_loss": 64000.0
    },
    {
        "id": "sig_2",
        "symbol": "ETH/USD",
        "type": "SELL",
        "strength": 0.92,
        "model": "Transformer",
        "timestamp": datetime.now().isoformat(),
        "status": "pending",
        "price": 3500.0,
        "target": 3200.0,
        "stop_loss": 3650.0
    }
]

@signals_bp.route('/', methods=['GET'])
def get_signals():
    # In a real app, this would query a database or signal generator
    return jsonify({
        "status": "success",
        "data": MOCK_SIGNALS
    })

@signals_bp.route('/<signal_id>', methods=['GET'])
def get_signal_details(signal_id):
    signal = next((s for s in MOCK_SIGNALS if s['id'] == signal_id), None)
    if not signal:
        return jsonify({"status": "error", "message": "Signal not found"}), 404
    return jsonify({
        "status": "success",
        "data": signal
    })

@signals_bp.route('/performance', methods=['GET'])
def get_performance():
    model = request.args.get('model', 'lstm')
    # Mock performance metrics
    return jsonify({
        "status": "success",
        "data": {
            "model": model,
            "accuracy": 0.68,
            "sharpe_ratio": 2.1,
            "win_rate": 0.62,
            "cumulative_return": 15.4
        }
    })

@signals_bp.route('/<signal_id>/features', methods=['GET'])
def get_feature_importance(signal_id):
    # Mock feature importance
    return jsonify({
        "status": "success",
        "data": [
            {"feature": "RSI", "importance": 0.35},
            {"feature": "MACD", "importance": 0.25},
            {"feature": "Volume", "importance": 0.20},
            {"feature": "SMA_50", "importance": 0.15},
            {"feature": "Sentiment", "importance": 0.05}
        ]
    })

@signals_bp.route('/backtesting', methods=['GET'])
def get_backtesting():
    # Mock backtesting results
    return jsonify({
        "status": "success",
        "data": {
            "pnl": 125000.0,
            "max_drawdown": 8.5,
            "trades": 450,
            "equity_curve": [
                {"date": "2024-01-01", "value": 100000},
                {"date": "2024-02-01", "value": 105000},
                {"date": "2024-03-01", "value": 112000}
            ]
        }
    })

@signals_bp.route('/indicators/<symbol>', methods=['GET'])
def get_indicators(symbol):
    # Mock technical indicators
    return jsonify({
        "status": "success",
        "data": {
            "symbol": symbol,
            "rsi": 62.5,
            "macd": {"line": 120.5, "signal": 115.2, "hist": 5.3},
            "bb": {"upper": 65500, "middle": 64000, "lower": 62500}
        }
    })

@signals_bp.route('/ensemble/<symbol>', methods=['GET'])
def get_ensemble_predictions(symbol):
    # Mock ensemble predictions
    return jsonify({
        "status": "success",
        "data": {
            "symbol": symbol,
            "consensus": "BUY",
            "confidence": 0.88,
            "model_weights": {
                "LSTM": 0.4,
                "Transformer": 0.4,
                "RandomForest": 0.2
            }
        }
    })
