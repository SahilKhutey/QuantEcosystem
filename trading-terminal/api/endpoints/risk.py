from flask import Blueprint, request, jsonify
from services.broker.broker_api import BrokerAPI
from config.settings import API_KEYS
import logging
import asyncio
import numpy as np
from datetime import datetime, timedelta
from functools import wraps
import jwt

logger = logging.getLogger('RiskAPI')
risk_bp = Blueprint('risk', __name__)

# Initialize Broker Service
broker_api = BrokerAPI(
    API_KEYS.get('alpaca_key'), 
    API_KEYS.get('alpaca_secret')
)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            secret = API_KEYS.get('secret_key', 'your-secret-key')
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = data['user_id']
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@risk_bp.route('/exposure', methods=['GET'])
@token_required
def get_risk_exposure(current_user):
    """GET /api/risk/exposure"""
    try:
        positions = asyncio.run(broker_api.get_positions())
        total_value = sum(float(p['market_value']) for p in positions)
        
        exposure = []
        for p in positions:
            val = float(p['market_value'])
            exposure.append({
                'symbol': p['symbol'],
                'market_value': val,
                'weight': (val / total_value) * 100 if total_value > 0 else 0,
                'beta': 1.1, # Placeholder
                'sector': 'Technology' # Placeholder
            })
            
        return jsonify({'status': 'success', 'data': exposure})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/greeks/<symbol>', methods=['GET'])
@token_required
def get_greeks(current_user, symbol):
    """GET /api/risk/greeks/<symbol>"""
    try:
        # Placeholder for Greeks calculation (Delta, Gamma, Theta, Vega)
        # In production, this would use a library like py_finances or custom models
        greeks = {
            'symbol': symbol,
            'delta': 0.65,
            'gamma': 0.02,
            'theta': -0.15,
            'vega': 0.12,
            'rho': 0.05,
            'implied_vol': 0.28
        }
        return jsonify({'status': 'success', 'data': greeks})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/var', methods=['GET'])
@token_required
def get_var(current_user):
    """GET /api/risk/var?method=historical&confidence=95&timeframe=1d"""
    try:
        method = request.args.get('method', 'historical')
        confidence = int(request.args.get('confidence', 95))
        
        # Placeholder for VaR calculation
        var_data = {
            'value': 2450.50,
            'percentage': 2.4,
            'confidence': confidence,
            'method': method,
            'components': [
                {'asset': 'BTC', 'contribution': 1200},
                {'asset': 'AAPL', 'contribution': 800}
            ]
        }
        return jsonify({'status': 'success', 'data': var_data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/stress-tests', methods=['GET'])
@token_required
def get_stress_tests(current_user):
    """GET /api/risk/stress-tests"""
    try:
        scenarios = [
            {'name': '2008 Financial Crisis', 'impact': -15.4, 'description': 'S&P 500 -20%, VIX +50%'},
            {'name': 'COVID-19 Crash', 'impact': -12.2, 'description': 'Market-wide liquidity squeeze'},
            {'name': 'Interest Rate Spike', 'impact': -5.1, 'description': '10Y Treasury +1%'}
        ]
        return jsonify({'status': 'success', 'data': scenarios})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/correlation', methods=['POST'])
@token_required
def get_correlation(current_user):
    """POST /api/risk/correlation"""
    try:
        assets = request.json.get('assets', [])
        # Placeholder correlation matrix
        size = len(assets) if assets else 2
        matrix = np.eye(size).tolist()
        return jsonify({'status': 'success', 'data': matrix})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/limits', methods=['GET'])
@token_required
def get_risk_limits(current_user):
    """GET /api/risk/limits"""
    try:
        limits = {
            'max_position_size': 15000.0,
            'max_drawdown_limit': 12.0,
            'current_drawdown': 4.2,
            'alert_threshold': 80, # 80% of limit
            'status': 'safe'
        }
        return jsonify({'status': 'success', 'data': limits})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@risk_bp.route('/compliance', methods=['GET'])
@token_required
def get_compliance(current_user):
    """GET /api/risk/compliance"""
    return jsonify({'status': 'success', 'data': {'status': 'compliant', 'violations': 0}})
