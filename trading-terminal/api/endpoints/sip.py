from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import random

sip_bp = Blueprint('sip', __name__)

# Mock database
sip_accounts = [
    {
        "id": "sip_1",
        "name": "Retirement Fund",
        "description": "Long-term compounding for age 60+.",
        "amount": 500.0,
        "frequency": "monthly",
        "riskTolerance": "medium",
        "startDate": "2023-01-01T00:00:00Z",
        "status": "active"
    },
    {
        "id": "sip_2",
        "name": "Child Education",
        "description": "University fund for 2035.",
        "amount": 1000.0,
        "frequency": "monthly",
        "riskTolerance": "low",
        "startDate": "2024-06-01T00:00:00Z",
        "status": "active"
    }
]

contributions = {
    "sip_1": [
        {"id": "c1", "date": "2024-01-01", "amount": 500},
        {"id": "c2", "date": "2024-02-01", "amount": 500},
        {"id": "c3", "date": "2024-03-01", "amount": 500}
    ],
    "sip_2": [
        {"id": "c4", "date": "2024-06-01", "amount": 1000},
        {"id": "c5", "date": "2024-07-01", "amount": 1000}
    ]
}

@sip_bp.route('/accounts', methods=['GET'])
def get_accounts():
    return jsonify({"status": "success", "data": sip_accounts})

@sip_bp.route('/account/<account_id>/performance', methods=['GET'])
def get_performance(account_id):
    # Simulated equity curve
    curve = []
    base = 10000
    for i in range(30):
        date = (datetime.now() - timedelta(days=30-i)).strftime("%Y-%m-%d")
        base += random.uniform(-100, 200)
        curve.append({"date": date, "value": base, "type": "equity"})
        curve.append({"date": date, "value": 10000 + (i * 50), "type": "invested"})
    return jsonify({"status": "success", "data": {"equityCurve": curve}})

@sip_bp.route('/account/<account_id>/contributions', methods=['GET'])
def get_contribution_history(account_id):
    return jsonify({"status": "success", "data": contributions.get(account_id, [])})

@sip_bp.route('/account/<account_id>/allocation', methods=['GET'])
def get_allocation(account_id):
    return jsonify({"status": "success", "data": {"NIFTY50": 40, "NASDAQ": 30, "GOLD": 20, "CASH": 10}})

@sip_bp.route('/account/<account_id>/metrics', methods=['GET'])
def get_metrics(account_id):
    return jsonify({"status": "success", "data": {
        "totalInvestment": 15000,
        "currentValue": 17540.25,
        "returns": 2540.25,
        "roi": 16.9,
        "cagr": 8.4,
        "profitFactor": 1.45,
        "startDate": "2023-01-01T00:00:00Z"
    }})

@sip_bp.route('/account/<account_id>/projections', methods=['GET'])
def get_projections(account_id):
    proj = []
    base = 17540
    for i in range(12):
        date = (datetime.now() + timedelta(days=30*i)).strftime("%Y-%m-%d")
        base *= 1.01  # 1% monthly
        proj.append({"date": date, "value": base})
    return jsonify({"status": "success", "data": {"projections": proj}})

@sip_bp.route('/accounts', methods=['POST'])
def create_account():
    data = request.json
    new_acc = {
        "id": f"sip_{len(sip_accounts)+1}",
        "name": data.get('name'),
        "description": data.get('description', ''),
        "amount": data.get('amount', 100),
        "frequency": data.get('frequency', 'monthly'),
        "riskTolerance": data.get('riskTolerance', 'medium'),
        "startDate": datetime.utcnow().isoformat() + "Z",
        "status": "active"
    }
    sip_accounts.append(new_acc)
    return jsonify({"status": "success", "data": new_acc})
