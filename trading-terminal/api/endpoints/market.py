from flask import Blueprint, request, jsonify, current_app
from services.market_integration import MarketIntegrationService
from services.data.market_data_service import MarketDataService
from services.broker.broker_api import BrokerAPI
from config.settings import API_KEYS
import logging
import traceback
from functools import wraps
import jwt
import asyncio
from datetime import datetime, timedelta
import yfinance as yf

# Configure logging
logger = logging.getLogger('MarketAPI')
logger.setLevel(logging.INFO)

market_bp = Blueprint('market', __name__)

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
            data = jwt.decode(token, API_KEYS['secret_key'], algorithms=["HS256"])
            current_user = data['user_id']
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@market_bp.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"API Error: {str(e)}\n{traceback.format_exc()}")
    return jsonify({'error': 'An internal server error occurred', 'message': str(e)}), 500

@market_bp.route('/market/global', methods=['GET'])
@token_required
def get_global_market_view(current_user):
    try:
        global_data = asyncio.run(market_integration_service.get_global_market_view())
        # Ensure data is serializable
        return jsonify({'status': 'success', 'data': global_data, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_global_market_view: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to get global market view', 'error': str(e)}), 500

@market_bp.route('/market/region/<region_id>', methods=['GET'])
@token_required
def get_region_market_data(current_user, region_id):
    try:
        region_data = asyncio.run(market_integration_service.get_regional_market_data(region_id))
        return jsonify({'status': 'success', 'data': region_data, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_region_market_data: {str(e)}")
        return jsonify({'status': 'error', 'message': f'Failed to get market data for {region_id}', 'error': str(e)}), 500

# @token_required
@market_bp.route('/data/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    try:
        asset_type = request.args.get('asset_type', 'stocks')
        timeframe = request.args.get('timeframe', '1D')
        data = asyncio.run(market_data_service.get_historical_data(symbol=symbol, asset_type=asset_type, timeframe=timeframe))
        if hasattr(data, 'empty') and not data.empty:
            return jsonify({'status': 'success', 'data': data.reset_index().to_dict(orient='records'), 'timestamp': datetime.utcnow().isoformat()})
        return jsonify({'status': 'success', 'data': [], 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_historical_data: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to get historical data', 'error': str(e)}), 500

@market_bp.route('/data/realtime/<symbol>', methods=['GET'])
def get_real_time_data(symbol):
    try:
        asset_type = request.args.get('asset_type', 'stocks')
        data = asyncio.run(market_data_service.get_real_time_data(symbol=symbol, asset_type=asset_type))
        return jsonify({'status': 'success', 'data': data, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_real_time_data: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to get real-time data', 'error': str(e)}), 500

@market_bp.route('/broker/account', methods=['GET'])
# @token_required
def get_account():
    try:
        account = broker_api.get_account()
        return jsonify({'status': 'success', 'data': account, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_account: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to get account information', 'error': str(e)}), 500

@market_bp.route('/market/indices', methods=['GET'])
def get_global_indices():
    try:
        def fetch_index(ticker, req_id, name, region, currency):
            t = yf.Ticker(ticker)
            info = t.info
            hist = t.history(period="1y", interval="1mo")
            
            history_data = []
            if not hist.empty:
                for date, row in hist.iterrows():
                    history_data.append({
                        'date': date.strftime('%b %y'),
                        'value': round(row['Close'], 2)
                    })
            
            # yfinance index info is sparse, fallback to approximate logic if missing
            return {
                'id': req_id,
                'name': name,
                'region': region,
                'currency': currency,
                'marketCap': info.get('marketCap', 'N/A') if info.get('marketCap') else 'N/A', # Indices often lack explicit market cap in free YF
                'peRatio': round(info.get('trailingPE', 0), 2) if info.get('trailingPE') else 'N/A',
                'dividendYield': round(info.get('dividendYield', 0) * 100, 2) if info.get('dividendYield') else 'N/A',
                'ytdReturn': round(info.get('ytdReturn', 0) * 100, 2) if info.get('ytdReturn') else (
                    round(((hist['Close'].iloc[-1] - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100, 2) if len(hist) > 1 else 0
                ),
                'history': history_data
            }
            
        indices_map = [
            ('^GSPC', 'SPX', 'S&P 500', 'North America', '$'),
            ('^NDX', 'NDX', 'Nasdaq 100', 'North America', '$'),
            ('^NSEI', 'NIFTY', 'NIFTY 50', 'Asia Pacific', '₹'),
            ('^STOXX50E', 'STOXX', 'Euro Stoxx 50', 'Europe', '€'),
            ('^N225', 'NIKKEI', 'Nikkei 225', 'Asia Pacific', '¥')
        ]
        
        # We can execute synchronously since there are only 5, or use threads. Synchronous is fine for now.
        data = []
        for symbol, req_id, name, region, currency in indices_map:
            data.append(fetch_index(symbol, req_id, name, region, currency))
            
        return jsonify({'status': 'success', 'data': data, 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        logger.error(f"Error in get_global_indices: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch actual live indices data', 'error': str(e)}), 500

