import logging
import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from api.endpoints.market import market_bp
from api.endpoints.dashboard import dashboard_bp
from api.endpoints.trading import trading_bp
from api.endpoints.portfolio import portfolio_bp
from api.endpoints.risk import risk_bp
from api.endpoints.signals import signals_bp
from api.endpoints.global_market import global_market_bp
from api.endpoints.wealth import wealth_bp
from api.endpoints.backtest import backtest_bp
from api.endpoints.backtrader import backtrader_bp
from api.endpoints.zipline_api import zipline_bp
from api.endpoints.freqtrade_api import freqtrade_bp
from api.endpoints.backtestingpy_api import backtestingpy_bp
from api.endpoints.vectorbt_api import vectorbt_bp
from api.endpoints.bt_api import bt_bp
from api.endpoints.finrl_api import finrl_bp
from api.endpoints.tensortrade_api import tensortrade_bp
from api.endpoints.qlib_api import qlib_bp
from api.endpoints.prophet_api import prophet_bp
from api.endpoints.ccxt_api import ccxt_bp
from api.endpoints.yfinance_api import yfinance_bp
from api.endpoints.pypfopt_api import pypfopt_bp
from api.endpoints.alphalens_api import alphalens_bp
from api.endpoints.quantstats_api import quantstats_bp
from api.endpoints.openbb_api import openbb_bp
from api.endpoints.hummingbot_api import hummingbot_bp
from api.endpoints.marketplace_api import marketplace_bp

# The Brand New Explicit Broker API Mappings
from api.endpoints.tradingview_api import tradingview_bp
from api.endpoints.indian_brokers_api import indian_brokers_bp
from api.endpoints.alerts_api import alerts_bp
from api.endpoints.copilot_api import copilot_bp
from api.endpoints.autonomous import autonomous_bp
from api.endpoints.analytics import analytics_bp
from api.endpoints.news import news_bp
from api.endpoints.stock_analysis import stock_analysis_bp
from api.endpoints.trading_engine import trading_engine_bp
from api.endpoints.quant_engine import quant_engine_bp
from api.endpoints.ai_agent import ai_agent_bp
from api.endpoints.settings import settings_bp
from api.endpoints.sip import sip_bp
from api.endpoints.ai_research import ai_research_bp

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'quantum_dev_insecure_default_8829')
CORS(app)

# Register Blueprints
app.register_blueprint(market_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(trading_bp, url_prefix='/api/trading')
app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
app.register_blueprint(risk_bp, url_prefix='/api/risk')
app.register_blueprint(stock_analysis_bp, url_prefix='/api/stocks')
app.register_blueprint(trading_engine_bp, url_prefix='/api/trading-engine')
app.register_blueprint(quant_engine_bp, url_prefix='/api/quant-engine')
app.register_blueprint(ai_agent_bp, url_prefix='/api/ai-agent')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(sip_bp, url_prefix='/api/sip')
app.register_blueprint(signals_bp, url_prefix='/api/signals')
app.register_blueprint(ai_research_bp, url_prefix='/api/research')
app.register_blueprint(global_market_bp, url_prefix='/api/global-market')
app.register_blueprint(wealth_bp, url_prefix='/api/wealth')
app.register_blueprint(autonomous_bp, url_prefix='/api/autonomous')
app.register_blueprint(backtest_bp, url_prefix='/api/backtest')
app.register_blueprint(backtrader_bp, url_prefix='/api/backtrader')
app.register_blueprint(zipline_bp, url_prefix='/api/zipline')
app.register_blueprint(freqtrade_bp, url_prefix='/api/freqtrade')
app.register_blueprint(backtestingpy_bp, url_prefix='/api/backtestingpy')
app.register_blueprint(vectorbt_bp, url_prefix='/api/vectorbt')
app.register_blueprint(bt_bp, url_prefix='/api/bt')
app.register_blueprint(finrl_bp, url_prefix='/api/finrl')
app.register_blueprint(tensortrade_bp, url_prefix='/api/tensortrade')
app.register_blueprint(qlib_bp, url_prefix='/api/qlib')
app.register_blueprint(prophet_bp, url_prefix='/api/prophet')
app.register_blueprint(ccxt_bp, url_prefix='/api/ccxt')
app.register_blueprint(yfinance_bp, url_prefix='/api/yfinance')
app.register_blueprint(pypfopt_bp, url_prefix='/api/pypfopt')
app.register_blueprint(alphalens_bp, url_prefix='/api/alphalens')
app.register_blueprint(quantstats_bp, url_prefix='/api/quantstats')
app.register_blueprint(openbb_bp, url_prefix='/api/openbb')
app.register_blueprint(hummingbot_bp, url_prefix='/api/hummingbot')
app.register_blueprint(marketplace_bp, url_prefix='/api/marketplace')

# Registering External Webhook and Regional Endpoints
app.register_blueprint(tradingview_bp, url_prefix='/api/tradingview')
app.register_blueprint(indian_brokers_bp, url_prefix='/api/indian_brokers')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(copilot_bp, url_prefix='/api/copilot')

@app.route('/api/ping')
def api_ping():
    return jsonify({"status": "live", "message": "API layer responsive"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "trading-terminal-api"})

if __name__ == "__main__":
    print("FLASK SERVER STARTING - ASYNC SUPPORT ENABLED")
    import asyncio
    logging.basicConfig(level=logging.INFO)
    app.run(host='0.0.0.0', port=5000)
