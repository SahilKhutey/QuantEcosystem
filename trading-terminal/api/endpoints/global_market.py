from flask import Blueprint, request, jsonify
from datetime import datetime
import numpy as np

global_market_bp = Blueprint('global_market', __name__)

@global_market_bp.route('/overview', methods=['GET'])
def get_global_overview():
    # Mock global market overview
    return jsonify({
        "status": "success",
        "data": {
            "indices": [
                {"name": "S&P 500", "price": 5200.50, "change": 0.85},
                {"name": "Nasdaq", "price": 16400.20, "change": 1.20},
                {"name": "FTSE 100", "price": 7950.40, "change": -0.15},
                {"name": "Nikkei 225", "price": 40800.00, "change": 2.10}
            ],
            "sentiment": "Bullish",
            "vix": 14.50,
            "fear_greed_index": 72
        }
    })

@global_market_bp.route('/correlations', methods=['GET'])
def get_correlations():
    assets = request.args.get('assets', 'SPY,BTC,GLD,TLT').split(',')
    # Mock correlation matrix
    matrix = []
    for a1 in assets:
        for a2 in assets:
            score = 1.0 if a1 == a2 else np.random.uniform(-0.5, 0.9)
            matrix.append({"asset1": a1, "asset2": a2, "correlation": score})
    return jsonify({
        "status": "success",
        "data": matrix
    })

@global_market_bp.route('/macroeconomic', methods=['GET'])
def get_macro_data():
    # Mock macro data
    return jsonify({
        "status": "success",
        "data": {
            "US": {"gdp": "3.2%", "inflation": "3.1%", "unemployment": "3.8%", "interest_rate": "5.5%"},
            "EU": {"gdp": "0.5%", "inflation": "2.4%", "unemployment": "6.5%", "interest_rate": "4.5%"},
            "CN": {"gdp": "5.2%", "inflation": "0.7%", "unemployment": "5.1%", "interest_rate": "3.45%"}
        }
    })

@global_market_bp.route('/sentiment', methods=['GET'])
def get_sentiment():
    # Mock market sentiment
    return jsonify({
        "status": "success",
        "data": [
            {"asset": "BTC/USD", "sentiment": 0.75, "volume_24h": "$35B", "social_score": 85},
            {"asset": "SPY", "sentiment": 0.62, "volume_24h": "$80B", "social_score": 72},
            {"asset": "GLD", "sentiment": 0.45, "volume_24h": "$12B", "social_score": 45}
        ]
    })

@global_market_bp.route('/economic-calendar', methods=['GET'])
def get_calendar():
    # Mock economic calendar
    return jsonify({
        "status": "success",
        "data": [
            {"date": "2024-03-25", "event": "Fed Interest Rate Decision", "impact": "High", "forecast": "5.5%", "actual": None},
            {"date": "2024-03-26", "event": "US Consumer Confidence", "impact": "Medium", "forecast": "106.5", "actual": None},
            {"date": "2024-03-28", "event": "GDP Q4 Final", "impact": "High", "forecast": "3.2%", "actual": None}
        ]
    })

@global_market_bp.route('/sectors', methods=['GET'])
def get_sectors():
    # Mock sector performance
    return jsonify({
        "status": "success",
        "data": [
            {"sector": "Technology", "change": 1.45, "weight": 0.28},
            {"sector": "Financials", "change": 0.72, "weight": 0.13},
            {"sector": "Energy", "change": -1.20, "weight": 0.04},
            {"sector": "Healthcare", "change": 0.35, "weight": 0.12}
        ]
    })

@global_market_bp.route('/commodities', methods=['GET'])
def get_commodities():
    # Mock commodity prices
    return jsonify({
        "status": "success",
        "data": [
            {"name": "Gold", "price": 2170.50, "change": 0.45},
            {"name": "Crude Oil", "price": 81.20, "change": -0.80},
            {"name": "Silver", "price": 24.80, "change": 1.20},
            {"name": "Natural Gas", "price": 1.75, "change": -2.10}
        ]
    })

@global_market_bp.route('/currencies', methods=['GET'])
def get_currencies():
    # Mock currency data
    return jsonify({
        "status": "success",
        "data": [
            {"pair": "EUR/USD", "price": 1.0850, "change": 0.15},
            {"pair": "USD/JPY", "price": 151.20, "change": -0.25},
            {"pair": "GBP/USD", "price": 1.2640, "change": 0.05},
            {"pair": "USD/CHF", "price": 0.8950, "change": 0.12}
        ]
    })

@global_market_bp.route('/bonds', methods=['GET'])
def get_bonds():
    # Mock bond yields
    return jsonify({
        "status": "success",
        "data": [
            {"country": "US", "10Y": "4.25%", "2Y": "4.60%", "spread": "-0.35%"},
            {"country": "DE", "10Y": "2.40%", "2Y": "2.85%", "spread": "-0.45%"},
            {"country": "JP", "10Y": "0.75%", "2Y": "0.18%", "spread": "0.57%"}
        ]
    })

@global_market_bp.route('/volatility/<asset>', methods=['GET'])
def get_vol_surface(asset):
    # Mock volatility surface data
    return jsonify({
        "status": "success",
        "data": {
            "asset": asset,
            "iv_data": [
                {"strike": 5000, "expiry": "1M", "iv": 0.18},
                {"strike": 5200, "expiry": "1M", "iv": 0.15},
                {"strike": 5400, "expiry": "1M", "iv": 0.19}
            ]
        }
    })

@global_market_bp.route('/central-banks', methods=['GET'])
def get_central_banks():
    # Mock central bank policies
    return jsonify({
        "status": "success",
        "data": [
            {"bank": "Federal Reserve", "stance": "Hawkish Hold", "next_meeting": "2024-05-01"},
            {"bank": "ECB", "stance": "Dovish Lean", "next_meeting": "2024-04-11"},
            {"bank": "BOJ", "stance": "Normalization", "next_meeting": "2024-04-26"}
        ]
    })
