from flask import Blueprint, request, jsonify, send_file
from services.broker.broker_api import BrokerAPI
from config.settings import API_KEYS
import logging
import asyncio
import io
import csv
from datetime import datetime, timedelta
from functools import wraps
import jwt

logger = logging.getLogger('PortfolioAPI')
portfolio_bp = Blueprint('portfolio', __name__)

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
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@portfolio_bp.route('/summary', methods=['GET'])
@token_required
def get_portfolio_summary(current_user):
    """GET /api/portfolio/summary"""
    try:
        account = asyncio.run(broker_api.get_account())
        positions = asyncio.run(broker_api.get_positions())
        
        if not account:
            return jsonify({'status': 'error', 'message': 'Failed to fetch account'}), 500
            
        summary = {
            'total_value': float(account.get('equity', 0)),
            'cash_balance': float(account.get('cash', 0)),
            'unrealized_pnl': float(account.get('unrealized_plpc', 0)) * 100, # as %
            'realized_pnl_ytd': 5240.50, # Placeholder
            'buying_power': float(account.get('buying_power', 0)),
            'position_count': len(positions)
        }
        return jsonify({'status': 'success', 'data': summary})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@portfolio_bp.route('/allocation', methods=['GET'])
@token_required
def get_asset_allocation(current_user):
    """GET /api/portfolio/allocation?groupBy=asset"""
    try:
        group_by = request.args.get('groupBy', 'asset')
        positions = asyncio.run(broker_api.get_positions())
        
        allocation = []
        total_value = sum(float(p['market_value']) for p in positions)
        
        if total_value > 0:
            for p in positions:
                allocation.append({
                    'name': p['symbol'],
                    'value': float(p['market_value']),
                    'percentage': (float(p['market_value']) / total_value) * 100,
                    'type': p.get('asset_class', 'stock')
                })
        
        return jsonify({'status': 'success', 'data': allocation})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@portfolio_bp.route('/pnl', methods=['GET'])
@token_required
def get_pnl_analysis(current_user):
    """GET /api/portfolio/pnl?timeframe=30d"""
    try:
        timeframe = request.args.get('timeframe', '30d')
        # Placeholder for historical P&L retrieval
        # In production, this would query a time-series DB or logs
        pnl_data = {
            'timeframe': timeframe,
            'history': [
                {'date': '2024-03-01', 'pnl': 120},
                {'date': '2024-03-02', 'pnl': -50},
                {'date': '2024-03-03', 'pnl': 200}
            ],
            'total_abs': 270.0,
            'total_pct': 2.4
        }
        return jsonify({'status': 'success', 'data': pnl_data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@portfolio_bp.route('/positions', methods=['GET'])
@token_required
def get_positions(current_user):
    """GET /api/portfolio/positions"""
    try:
        positions = asyncio.run(broker_api.get_positions())
        formatted = []
        for p in positions:
            formatted.append({
                'symbol': p['symbol'],
                'qty': float(p['qty']),
                'market_value': float(p['market_value']),
                'cost_basis': float(p['cost_basis']),
                'avg_entry_price': float(p['avg_entry_price']),
                'current_price': float(p['current_price']),
                'pnl_unrealized': float(p['unrealized_intraday_pl']),
                'pnl_pct': float(p['unrealized_intraday_plpc']) * 100
            })
        return jsonify({'status': 'success', 'data': formatted})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@portfolio_bp.route('/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    """GET /api/portfolio/transactions"""
    return jsonify({'status': 'success', 'data': []})

@portfolio_bp.route('/risk-metrics', methods=['GET'])
@token_required
def get_risk_metrics(current_user):
    """GET /api/portfolio/risk-metrics"""
    try:
        # Complex risk calculation logic would go here
        metrics = {
            'sharpe_ratio': 1.85,
            'sortino_ratio': 2.10,
            'max_drawdown': 12.4,
            'beta': 1.15,
            'var_95': 2500.0,
            'volatility': 15.2
        }
        return jsonify({'status': 'success', 'data': metrics})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@portfolio_bp.route('/export', methods=['GET'])
@token_required
def export_portfolio_data(current_user):
    """GET /api/portfolio/export?format=csv"""
    try:
        format_type = request.args.get('format', 'csv')
        positions = asyncio.run(broker_api.get_positions())
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Symbol', 'Qty', 'Market Value', 'Avg Entry', 'P&L (%)'])
        
        for p in positions:
            writer.writerow([
                p['symbol'], p['qty'], p['market_value'], 
                p['avg_entry_price'], float(p['unrealized_plpc']) * 100
            ])
            
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            attachment_filename=f'portfolio_export_{datetime.now().strftime("%Y%m%d")}.csv'
        )
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
