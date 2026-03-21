from flask import Blueprint, jsonify, request
import sys
import os
from datetime import datetime
import asyncio

# Map to the core Stock Analyzer engines
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'stock-analyzer-pro', 'backend')))
try:
    from services.alert_service import AlertEngine
except ImportError:
    # Fallback mock if directory structure blocks import
    class AlertEngine:
        def __init__(self):
            self.active_alerts = {}
        def create_alert(self, config):
            self.active_alerts['MOCK_1'] = config
            return 'MOCK_1'

alerts_bp = Blueprint('alerts_framework', __name__)
engine = AlertEngine()

# Pre-populate some active thresholds mirroring the strategy limits
engine.create_alert({
    "symbol": "BTC/USDT", "type": "price", "condition": "below", "threshold": 50000.00
})
engine.create_alert({
    "type": "portfolio", "condition": "drawdown", "threshold": 0.05
})
engine.create_alert({
    "symbol": "AAPL", "type": "technical", "indicator": "rsi", "condition": "oversold"
})

# Mocking initial active triggered anomalies for Dashboard layout tests
_mock_triggered_alerts = [
    {
        "alert_id": "ALRT-100293", "symbol": "ETH/USDT", "type": "LATENCY_SPIKE", 
        "severity": "HIGH", "reason": "Execution latency reached 145ms crossing 100ms threshold",
        "timestamp": datetime.utcnow().isoformat()
    },
    {
        "alert_id": "ALRT-100295", "type": "DRAWDOWN_ALERT",
        "severity": "CRITICAL", "reason": "Daily P&L breached threshold: -$5,420",
        "timestamp": datetime.utcnow().isoformat()
    }
]

@alerts_bp.route('/active', methods=['GET'])
def get_active_alerts():
    """Retrieve all triggered and active alerts."""
    return jsonify({
        "status": "success",
        "triggered_alerts": _mock_triggered_alerts,
        "configured_rules": len(engine.active_alerts)
    }), 200

@alerts_bp.route('/create', methods=['POST'])
def create_alert():
    """Dynamically register a new performance constraint."""
    payload = request.json or {}
    try:
        if not payload.get('type'):
            return jsonify({"status": "error", "message": "Missing alert type"}), 400
            
        aid = engine.create_alert(payload)
        return jsonify({"status": "success", "alert_id": aid, "message": "Alert rule established"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@alerts_bp.route('/clear', methods=['POST'])
def clear_alerts():
    """Dismiss triggered alerts from the dashboard"""
    global _mock_triggered_alerts
    _mock_triggered_alerts = []
    return jsonify({"status": "success", "message": "Dashboard cleared"}), 200
