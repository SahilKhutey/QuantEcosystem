from flask import Blueprint, jsonify, request
import numpy as np
import time
from datetime import datetime, timedelta

trading_engine_bp = Blueprint('trading_engine', __name__)

@trading_engine_bp.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "success",
        "data": {
            "engineStatus": "Operational",
            "uptime": "14d 6h 22m",
            "lastCheck": datetime.now().isoformat(),
            "activeStrategies": 12,
            "connectedExchanges": 4
        }
    })

@trading_engine_bp.route('/latency', methods=['GET'])
def get_latency():
    # Simulated high-frequency latency data (in ms)
    return jsonify({
        "status": "success",
        "data": {
            "internalLatency": 0.45,
            "exchangeLatency": 12.8,
            "networkJitter": 0.12,
            "latencyBreakdown": [
                {"component": "Signal Generation", "latency": 0.15},
                {"component": "Risk Shield", "latency": 0.10},
                {"component": "Order Routing", "latency": 0.20}
            ]
        }
    })

@trading_engine_bp.route('/health', methods=['GET'])
def get_health():
    return jsonify({
        "status": "success",
        "data": {
            "cpuUsage": 24.5,
            "memoryUsage": 1.2,  # GB
            "threadCount": 128,
            "queueDepth": 12
        }
    })

@trading_engine_bp.route('/orders', methods=['GET'])
def get_orders():
    return jsonify({
        "status": "success",
        "data": {
            "totalOrders": 1450,
            "filledOrders": 1422,
            "rejectedOrders": 8,
            "cancelledOrders": 20,
            "fillRate": 98.1
        }
    })

@trading_engine_bp.route('/latency-trends', methods=['GET'])
def get_latency_trends():
    # Generate 50 points of simulated latency trend
    now = datetime.now()
    data = []
    for i in range(50):
        data.append({
            "timestamp": (now - timedelta(minutes=i*5)).isoformat(),
            "latency": float(np.random.normal(12.5, 0.5))
        })
    return jsonify({"status": "success", "data": data[::-1]})

@trading_engine_bp.route('/alerts', methods=['GET'])
def get_alerts():
    return jsonify({
        "status": "success",
        "data": [
            {"id": 1, "severity": "info", "message": "Backend engine re-synchronized with NYSE cold storage", "time": "2m ago"},
            {"id": 2, "severity": "warning", "message": "Internal latency spike detected in BATS routing layer", "time": "15m ago"}
        ]
    })
