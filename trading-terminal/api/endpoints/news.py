from flask import Blueprint, request, jsonify
import random
from datetime import datetime, timedelta

news_bp = Blueprint('news', __name__)

@news_bp.route('/news/feed', methods=['GET'])
def get_news_feed():
    # Simulated News Feed Data
    news_items = [
        {
            'id': '1',
            'title': 'Federal Reserve Signals Potential Rate Hold Amid Economic Tailwinds',
            'source': 'Financial Times',
            'timestamp': (datetime.now() - timedelta(minutes=15)).isoformat(),
            'sentiment': 'Neutral',
            'sentiment_score': 0.15,
            'impact': 'High',
            'summary': 'The FOMC minutes suggest a balanced approach to monetary policy...',
            'category': 'Macro'
        },
        {
            'id': '2',
            'title': 'Tech Giants Rally as AI Demand Surges Post-Earnings Bloom',
            'source': 'Reuters',
            'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
            'sentiment': 'Bullish',
            'sentiment_score': 0.85,
            'impact': 'High',
            'summary': 'Market capitalization of leading AI players reaches new heights...',
            'category': 'Technology'
        },
        {
            'id': '3',
            'title': 'Crude Oil Prices Stabilize Following Supply Chain Optimization Reports',
            'source': 'Bloomberg',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'sentiment': 'Neutral',
            'sentiment_score': 0.05,
            'impact': 'Medium',
            'summary': 'Inventory levels remain within estimated thresholds despite geopolitical shifts...',
            'category': 'Energy'
        }
    ]
    return jsonify({'status': 'success', 'data': news_items})

@news_bp.route('/news/social-trends', methods=['GET'])
def get_social_trends():
    trends = [
        {'topic': '#BitcoinETF', 'mentions': 125400, 'sentiment': 0.65, 'trend': 'Up'},
        {'topic': '#InflationRate', 'mentions': 85200, 'sentiment': -0.45, 'trend': 'Down'},
        {'topic': '#AIBubble', 'mentions': 54100, 'sentiment': 0.12, 'trend': 'Up'},
        {'topic': '#MarketCrash', 'mentions': 12300, 'sentiment': -0.85, 'trend': 'Level'}
    ]
    return jsonify({'status': 'success', 'data': trends})

@news_bp.route('/news/asset-sentiment', methods=['POST'])
def get_asset_sentiment():
    symbols = request.json.get('symbols', [])
    sentiment_map = {
        symbol: {
            'score': round(random.uniform(-1, 1), 2),
            'trend': random.choice(['Improving', 'Deteriorating', 'Stable']),
            'mentions_24h': random.randint(100, 10000)
        } for symbol in symbols
    }
    return jsonify({'status': 'success', 'data': sentiment_map})

@news_bp.route('/news/market-moving', methods=['GET'])
def get_market_moving():
    news = [
        {'id': 'MM1', 'title': 'Surprise Earnings Beat for Leading Semiconductor Manufacturer', 'impact_score': 92, 'predicted_volatility': '+4.5%'},
        {'id': 'MM2', 'title': 'New Regulatory Framework Proposed for Digital Asset Custody', 'impact_score': 85, 'predicted_volatility': '+/-3.2%'}
    ]
    return jsonify({'status': 'success', 'data': news})

@news_bp.route('/news/sentiment-timeline/<symbol>', methods=['GET'])
def get_sentiment_timeline(symbol):
    days = 7
    timeline = [
        {
            'date': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
            'sentiment': round(random.uniform(-0.5, 0.8), 2)
        } for i in range(days)
    ][::-1]
    return jsonify({'status': 'success', 'data': timeline})
