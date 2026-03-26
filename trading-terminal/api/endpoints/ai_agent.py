from flask import Blueprint, jsonify, request
import numpy as np
from datetime import datetime, timedelta

ai_agent_bp = Blueprint('ai_agent', __name__)

@ai_agent_bp.route('/configs', methods=['GET'])
def get_configs():
    return jsonify({
        "status": "success",
        "data": [
            {
                "id": "alpha_falcon_1",
                "name": "Alpha Falcon",
                "model": "GPT-4 Vision / LSTM Hybrid",
                "status": "running",
                "strategy": "High-Frequency Volatility Capture",
                "riskLevel": "high",
                "drawdownLimit": -5.0
            },
            {
                "id": "beta_owl_2",
                "name": "Beta Owl",
                "model": "Reinforcement Learning (PPO)",
                "status": "stopped",
                "strategy": "Statistical Arbitrage (Pairs)",
                "riskLevel": "medium",
                "drawdownLimit": -10.0
            }
        ]
    })

@ai_agent_bp.route('/status/<agent_id>', methods=['GET'])
def get_status(agent_id):
    return jsonify({
        "status": "success",
        "data": {
            "id": agent_id,
            "state": "running",
            "uptime": "14h 23m",
            "activePositions": 3,
            "lastDecision": "BUY SPY @ 512.45",
            "lastTradeTimestamp": datetime.now().isoformat()
        }
    })

@ai_agent_bp.route('/logs/<agent_id>', methods=['GET'])
def get_logs(agent_id):
    logs = [
        {"timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(), "level": "INFO", "message": "Signal generated: Long SPY", "module": "StrategyCore"},
        {"timestamp": (datetime.now() - timedelta(minutes=4)).isoformat(), "level": "DEBUG", "message": "Executing order via Alpaca API", "module": "ExecutionEngine"},
        {"timestamp": (datetime.now() - timedelta(minutes=3)).isoformat(), "level": "INFO", "message": "Order filled: 100 shares SPY", "module": "ExecutionEngine"},
        {"timestamp": (datetime.now() - timedelta(minutes=1)).isoformat(), "level": "WARNING", "message": "Volatility threshold reached", "module": "RiskManager"}
    ]
    return jsonify({"status": "success", "data": logs})

@ai_agent_bp.route('/performance/<agent_id>', methods=['GET'])
def get_performance(agent_id):
    dates = [(datetime.now() - timedelta(hours=i)).strftime('%H:%00') for i in range(24, 0, -1)]
    returns = np.cumsum(np.random.normal(0.0005, 0.01, 24)).tolist()
    data = [{"time": t, "value": float(v)} for t, v in zip(dates, returns)]
    return jsonify({"status": "success", "data": data})

@ai_agent_bp.route('/statistics/<agent_id>', methods=['GET'])
def get_statistics(agent_id):
    return jsonify({
        "status": "success",
        "data": {
            "winRate": 64.5,
            "profitFactor": 1.82,
            "sharpeRatio": 2.15,
            "totalTrades": 450,
            "avgProfit": 124.50,
            "avgLoss": -85.20
        }
    })
