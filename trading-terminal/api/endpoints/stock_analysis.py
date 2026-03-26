from flask import Blueprint, request, jsonify
import random
from datetime import datetime, timedelta

stock_analysis_bp = Blueprint('stock_analysis', __name__)

@stock_analysis_bp.route('/stocks/<symbol>/info', methods=['GET'])
def get_stock_info(symbol):
    info = {
        'symbol': symbol,
        'companyName': f'{symbol} Inc.',
        'price': round(random.uniform(100, 500), 2),
        'change': round(random.uniform(-10, 10), 2),
        'percentChange': round(random.uniform(-5, 5), 2),
        'volume': random.randint(1000000, 10000000),
        'marketCap': random.randint(1000000000, 2000000000000),
        'peRatio': round(random.uniform(10, 50), 2),
        'dividendYield': round(random.uniform(0, 5), 2),
        'week52High': 520.45,
        'week52Low': 310.12
    }
    return jsonify({'status': 'success', 'data': info})

@stock_analysis_bp.route('/stocks/<symbol>/fundamentals', methods=['GET'])
def get_fundamentals(symbol):
    fundamentals = {
        'revenue': 383.93e9,
        'grossProfit': 170.78e9,
        'netIncome': 97.0e9,
        'eps': 6.42,
        'operatingMargin': 0.30,
        'roe': 1.54,
        'debtToEquity': 1.45,
        'currentRatio': 0.98,
        'ebitda': 125.82e9
    }
    return jsonify({'status': 'success', 'data': fundamentals})

@stock_analysis_bp.route('/stocks/<symbol>/technical', methods=['POST'])
def get_technical(symbol):
    indicators = [
        {'name': 'RSI (14)', 'value': 62.14, 'signal': 'Neutral'},
        {'name': 'MACD (12, 26, 9)', 'value': 1.45, 'signal': 'Buy'},
        {'name': 'MA (50)', 'value': 185.32, 'signal': 'Neutral'},
        {'name': 'MA (200)', 'value': 172.15, 'signal': 'Bullish'},
        {'name': 'Bollinger Upper', 'value': 195.42, 'signal': 'Overbought'}
    ]
    return jsonify({'status': 'success', 'data': indicators})

@stock_analysis_bp.route('/stocks/<symbol>/analyst-ratings', methods=['GET'])
def get_analyst_ratings(symbol):
    ratings = {
        'summary': 'Strong Buy',
        'buy': 32,
        'hold': 8,
        'sell': 2,
        'targetPrice': 225.00,
        'currentPrice': 192.42,
        'upside': 16.9
    }
    return jsonify({'status': 'success', 'data': ratings})

@stock_analysis_bp.route('/stocks/<symbol>/peers', methods=['GET'])
def get_peers(symbol):
    peers = [
        {'symbol': 'MSFT', 'price': 420.12, 'change': 1.25},
        {'symbol': 'GOOGL', 'price': 152.34, 'change': -0.45},
        {'symbol': 'AMZN', 'price': 178.65, 'change': 1.12},
        {'symbol': 'META', 'price': 485.42, 'change': 2.34}
    ]
    return jsonify({'status': 'success', 'data': peers})
