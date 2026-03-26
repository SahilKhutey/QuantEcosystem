from flask import Blueprint, request, jsonify
from services.broker.broker_api import BrokerAPI
from services.market_integration import MarketIntegrationService
from services.data.market_data_service import MarketDataService
from config.settings import API_KEYS
import logging
import asyncio
from datetime import datetime
from functools import wraps
import jwt

logger = logging.getLogger('TradingAPI')
trading_bp = Blueprint('trading', __name__)

# Initialize services
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
            secret = API_KEYS.get('secret_key', 'your-secret-key')
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@trading_bp.route('/orders', methods=['POST'])
@token_required
def place_order(current_user):
    """POST /api/trading/orders"""
    try:
        data = request.json
        symbol = data.get('symbol')
        qty = int(data.get('qty', 0))
        side = data.get('side', 'buy').lower()
        order_type = data.get('type', 'market').lower()
        tif = data.get('time_in_force', 'day')
        
        order = asyncio.run(broker_api.submit_order(
            symbol=symbol, qty=qty, side=side, order_type=order_type, time_in_force=tif
        ))
        
        if "error" in order:
             return jsonify({'status': 'error', 'message': order['error']}), 400
             
        return jsonify({'status': 'success', 'data': order, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in place_order: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@trading_bp.route('/orders/<order_id>', methods=['DELETE'])
@token_required
def cancel_order(current_user, order_id):
    """DELETE /api/trading/orders/<order_id>"""
    try:
        success = asyncio.run(broker_api.cancel_order(order_id))
        if success:
            return jsonify({'status': 'success', 'message': f'Order {order_id} canceled'})
        return jsonify({'status': 'error', 'message': 'Failed to cancel order'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@trading_bp.route('/orders/open', methods=['GET'])
@token_required
def get_open_orders(current_user):
    """GET /api/trading/orders/open?symbol=AAPL"""
    try:
        # Note: BrokerAPI didn't have a direct get_orders, we can add it or repurpose
        # For now, placeholder or returning empty
        return jsonify({'status': 'success', 'data': [], 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@trading_bp.route('/positions', methods=['GET'])
@token_required
def get_positions(current_user):
    """GET /api/trading/positions?symbol=AAPL"""
    try:
        symbol = request.args.get('symbol')
        positions = asyncio.run(broker_api.get_positions())
        
        if symbol:
            positions = [p for p in positions if p['symbol'] == symbol]
            
        return jsonify({'status': 'success', 'data': positions, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@trading_bp.route('/market/<symbol>', methods=['GET'])
@token_required
def get_market_data(current_user, symbol):
    """GET /api/trading/market/<symbol>"""
    try:
        data = asyncio.run(market_data_service.get_real_time_data(symbol=symbol))
        return jsonify({'status': 'success', 'data': data, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@trading_bp.route('/orderbook/<symbol>', methods=['GET'])
@token_required
def get_orderbook(current_user, symbol):
    """GET /api/trading/orderbook/<symbol> (Simplified)"""
    try:
        # Mock orderbook logic - real implementation would use depth-enabled broker API
        orderbook = {
            'symbol': symbol,
            'bids': [[150.10, 100], [150.05, 500]],
            'asks': [[150.15, 200], [150.20, 300]]
        }
        return jsonify({'status': 'success', 'data': orderbook, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
