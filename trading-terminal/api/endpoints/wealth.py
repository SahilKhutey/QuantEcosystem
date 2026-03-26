from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random

wealth_bp = Blueprint('wealth', __name__)

@wealth_bp.route('/overview', methods=['GET'])
def get_wealth_overview():
    # Mock wealth overview
    return jsonify({
        "status": "success",
        "data": {
            "total_wealth": 15450000.0,
            "net_worth_change": 2.45,
            "liquid_assets": 8500000.0,
            "invested_assets": 6950000.0,
            "active_sip_count": 12,
            "active_swp_count": 2,
            "client_name": "Sahil Khutey",
            "risk_profile": "Aggressive Growth"
        }
    })

@wealth_bp.route('/allocation/<client_id>', methods=['GET'])
def get_allocation(client_id):
    # Mock asset allocation
    return jsonify({
        "status": "success",
        "data": [
            {"asset_class": "Equities", "value": 8500000.0, "percentage": 55.0},
            {"asset_class": "Fixed Income", "value": 3000000.0, "percentage": 19.4},
            {"asset_class": "Real Estate", "value": 2500000.0, "percentage": 16.2},
            {"asset_class": "Cash & Equivalents", "value": 1000000.0, "percentage": 6.5},
            {"asset_class": "Alternatives", "value": 450000.0, "percentage": 2.9}
        ]
    })

@wealth_bp.route('/sip-swp/<client_id>', methods=['GET'])
def get_sip_swp(client_id):
    # Mock SIP/SWP schedules
    return jsonify({
        "status": "success",
        "data": {
            "sip": [
                {"id": "SIP001", "name": "Nifty 50 Index Fund", "amount": 50000, "frequency": "Monthly", "next_date": "2024-04-05", "status": "Active"},
                {"id": "SIP002", "name": "Nasdaq 100 ETF", "amount": 25000, "frequency": "Monthly", "next_date": "2024-04-10", "status": "Active"},
                {"id": "SIP003", "name": "Bluechip Growth Fund", "amount": 100000, "frequency": "Monthly", "next_date": "2024-04-15", "status": "Active"}
            ],
            "swp": [
                {"id": "SWP001", "name": "Retirement Corpus Withdrawal", "amount": 150000, "frequency": "Monthly", "next_date": "2024-04-01", "status": "Active"}
            ]
        }
    })

@wealth_bp.route('/performance/<client_id>', methods=['GET'])
def get_performance(client_id):
    # Mock performance analytics
    timeframe = request.args.get('timeframe', 'ytd')
    dates = [(datetime.now() - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(30)][::-1]
    values = [15000000 + random.randint(-50000, 100000) for _ in range(30)]
    
    return jsonify({
        "status": "success",
        "data": {
            "curve": [{"date": d, "value": v} for d, v in zip(dates, values)],
            "cagr": 18.5,
            "sharpe_ratio": 1.45,
            "max_drawdown": -8.2
        }
    })

@wealth_bp.route('/tax-optimization/<client_id>', methods=['GET'])
def get_tax_optimization(client_id):
    # Mock tax optimization
    return jsonify({
        "status": "success",
        "data": {
            "potential_savings": 45000.0,
            "recommendations": [
                {"type": "HSA Contribution", "impact": "High", "description": "Maximize HSA to save $3k in taxes."},
                {"type": "Tax Loss Harvesting", "impact": "Medium", "description": "Offset $10k gains with current losers."}
            ]
        }
    })

@wealth_bp.route('/goal-planning/<client_id>', methods=['GET'])
def get_goal_planning(client_id):
    # Mock goal-based planning
    return jsonify({
        "status": "success",
        "data": [
            {"goal": "Retirement Fund", "target": 50000000, "current": 12000000, "deadline": "2040-01-01", "probability": 85},
            {"goal": "Children's Education", "target": 5000000, "current": 1500000, "deadline": "2032-06-01", "probability": 92}
        ]
    })

@wealth_bp.route('/cash-flow/<client_id>', methods=['GET'])
def get_cash_flow(client_id):
    # Mock cash flow
    return jsonify({
        "status": "success",
        "data": {
            "inflow": 850000,
            "outflow": 320000,
            "surplus": 530000,
            "projected_savings_rate": 62.3
        }
    })
