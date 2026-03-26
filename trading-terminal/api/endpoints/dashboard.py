from flask import Blueprint, request, jsonify, current_app
from services.broker.broker_api import BrokerAPI
from services.market_integration import MarketIntegrationService
from services.data.market_data_service import MarketDataService
from config.settings import API_KEYS
import logging
import asyncio
from datetime import datetime, timedelta
from functools import wraps
import jwt

logger = logging.getLogger('DashboardAPI')
dashboard_bp = Blueprint('dashboard', __name__)

# Initialize services (Following market.py pattern)
market_data_service = MarketDataService(API_KEYS)
market_integration_service = MarketIntegrationService(market_data_service)
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
            # Assuming secret_key exists in config
            secret = API_KEYS.get('secret_key', 'your-secret-key')
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = data['user_id']
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@dashboard_bp.route('/portfolio', methods=['GET'])
@token_required
def get_portfolio_overview(current_user):
    """
    GET /api/dashboard/portfolio
    Returns overall portfolio summary.
    """
    try:
        account = asyncio.run(broker_api.get_account())
        positions = asyncio.run(broker_api.get_positions())
        
        if not account:
            return jsonify({'status': 'error', 'message': 'Failed to fetch account data'}), 500
            
        summary = {
            'equity': float(account.get('equity', 0)),
            'balance': float(account.get('cash', 0)),
            'pnl': float(account.get('equity', 0)) - float(account.get('last_equity', 0)),
            'pnl_pct': (float(account.get('equity', 0)) / float(account.get('last_equity', 0)) - 1) * 100 if float(account.get('last_equity', 0)) > 0 else 0,
            'position_count': len(positions)
        }
        
        return jsonify({'status': 'success', 'data': summary, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_portfolio_overview: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@dashboard_bp.route('/performance', methods=['GET'])
@token_required
def get_asset_performance(current_user):
    """
    GET /api/dashboard/performance?timeframe=24h
    Returns asset performance metrics.
    """
    try:
        timeframe = request.args.get('timeframe', '24h')
        # Placeholder for actual performance logic
        # In production, this would query historical equity or trade logs
        performance = {
            'timeframe': timeframe,
            'labels': ['09:00', '11:00', '13:00', '15:00'],
            'values': [1000, 1050, 1020, 1100]
        }
        return jsonify({'status': 'success', 'data': performance, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_asset_performance: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@dashboard_bp.route('/market-overview', methods=['GET'])
@token_required
def get_market_overview(current_user):
    """
    GET /api/dashboard/market-overview
    Returns high-level global market status.
    """
    try:
        global_view = asyncio.run(market_integration_service.get_global_market_view())
        return jsonify({'status': 'success', 'data': global_view, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_market_overview: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@dashboard_bp.route('/recent-trades', methods=['GET'])
@token_required
def get_recent_trades(current_user):
    """
    GET /api/dashboard/recent-trades?limit=10
    Returns recent trade executions.
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        # Assuming broker_api has a method or using generic orders
        # For demo, returning empty or placeholder if method missing
        return jsonify({'status': 'success', 'data': [], 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_recent_trades: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
