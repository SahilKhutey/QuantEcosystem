import time
import logging
import sys
import signal
import threading
import http.server
import socketserver
from config.settings import API_KEYS
from services.broker.alpaca_api import AlpacaAPI
from services.broker.ib_api import IBAPI
from services.broker.broker_interface import GlobalBrokerRouter
from services.risk.manager import RiskManager
from services.data.market_data import MarketDataService
from services.trade_engine.engine import TradeEngine, TradeOrder
from services.trading.hft_engine import HFTScalpingEngine
from services.trading.swing_engine import SwingTradingEngine
from services.trading.intraday_engine import IntradayTradingEngine

def setup_logging():
    """Configure logging for production environment"""
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_format)
    
    # File handler
    file_handler = logging.FileHandler('trading_system.log')
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    
    # Add handlers
    root.addHandler(console_handler)
    root.addHandler(file_handler)
    
    logging.info("Logging system initialized")

def start_health_server(port=8000):
    """Start a simple HTTP server for Kubernetes health checks"""
    class HealthHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/health':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "healthy"}')
            else:
                self.send_response(404)
                self.end_headers()

    with socketserver.TCPServer(("", port), HealthHandler) as httpd:
        logging.info(f"Health check server started on port {port}")
        httpd.serve_forever()

def main():
    """Production trading system entry point"""
    # Setup logging
    setup_logging()
    logger = logging.getLogger("Main")
    logger.info("Starting production trading system")
    
    try:
        # Initialize Broker Router
        router = GlobalBrokerRouter()
        # Initialize Alpaca
        alpaca = AlpacaAPI(
            api_key=API_KEYS.get('alpaca_key'),
            api_secret=API_KEYS.get('alpaca_secret')
        )
        router.add_broker('alpaca', alpaca)
        
        # Initialize Interactive Brokers (Simulated)
        ib = IBAPI(host='127.0.0.1', port=7497, client_id=1)
        router.add_broker('ibkr', ib)
        
        # Set active broker
        router.set_active_broker('alpaca')
        
        # Initialize specialized engines
        hft_engine = HFTScalpingEngine(router, risk_manager)
        swing_engine = SwingTradingEngine(router, risk_manager)
        intraday_engine = IntradayTradingEngine(router, risk_manager)
        
        # Add TD Ameritrade (If keys available)
        if API_KEYS.get('tda_key'):
            from services.broker.td_api import TDAPI
            tda = TDAPI(api_key=API_KEYS.get('tda_key'), access_token=API_KEYS.get('tda_token'))
            router.add_broker('tda', tda)
        
        # Start health server in background for K8s probes
        health_thread = threading.Thread(target=start_health_server, daemon=True)
        health_thread.start()
        
        # Setup Graceful Shutdown
        def handle_shutdown(signum, frame):
            logger.info(f"Shutdown signal ({signum}) received. Cleaning up...")
            trade_engine.stop_trading()
            logger.info("Shutdown complete.")
            sys.exit(0)
            
        signal.signal(signal.SIGINT, handle_shutdown)
        signal.signal(signal.SIGTERM, handle_shutdown)
        
        # Main trading loop
        logger.info("Starting main trading loop")
        while True:
            # Get market insights for trading decisions
            market_insights = trade_engine.get_market_insights()
            
            # 1. Standard Trading Engine Cycle
            # Process signals from the strategy engine
            opportunities = market_insights.get('trading_opportunities', [])
            for opportunity in opportunities:
                logger.info(f"Processing trading opportunity: {opportunity['symbol']} {opportunity['action']}")
                trade_engine.submit_order(TradeOrder(
                    symbol=opportunity['symbol'],
                    action=opportunity['action'],
                    quantity=trade_engine.get_position_size(
                        opportunity['symbol'],
                        opportunity['price'],
                        opportunity['stop_loss']
                    ),
                    order_type='limit',
                    price=opportunity['price'],
                    stop_price=opportunity['stop_loss'],
                    time_in_force='day',
                    strategy=opportunity.get('strategy', 'Default'),
                    signal_id=opportunity.get('signal_id', f"SIG_{int(time.time())}"),
                    risk_score=opportunity.get('risk_score', 0.0),
                    confidence=opportunity.get('confidence', 0.0),
                    entry_price=opportunity['price']
                ))
            
            # 2. HFT & Intraday Engine Cycles
            # In production, this would be triggered by real-time data push
            for symbol in ['AAPL', 'TSLA', 'SPY']:
                real_time = market_data.get_real_time_quote(symbol)
                if 'bid' in real_time and 'ask' in real_time:
                    hft_engine.process_market_data(symbol, real_time['bid'], real_time['ask'], real_time.get('volume', 1000))
                    intraday_engine.process_market_data(symbol, real_time['bid'], real_time['ask'], real_time.get('volume', 1000))
            
            hft_engine.monitor_trades()
            intraday_engine.monitor_trades()
            
            # 3. Swing Trading Engine Cycle (Daily Processing)
            # Typically runs at market close or start of day
            if market_data.is_market_open():
                for symbol in ['AAPL', 'MSFT', 'AMZN']:
                    hist_data = market_data.get_historical_ohlc(symbol, timeframe='1D')
                    if not hist_data.empty:
                        swing_engine.process_daily_data(symbol, hist_data)
            
            swing_engine.monitor_trades()
            
            # Monitor and Audit
            trade_engine.monitor_orders()
            
            # Check for circuit breaker conditions
            if not trade_engine.check_circuit_breaker():
                logger.critical("CIRCUIT BREAKER ACTIVE - TRADING SUSPENDED")
                time.sleep(300)
                continue
            
            # Status Reporting
            status = trade_engine.get_trading_status()
            hft_status = hft_engine.get_status()
            swing_status = swing_engine.get_status()
            intraday_status = intraday_engine.get_status()
            
            logger.info(f"Trading status: Active={status['active_orders']}, HFT={hft_status['active_trades']}, Swing={swing_status['active_positions']}, Intraday={intraday_status['active_positions']}")
            logger.info(f"P&L: Total=${status['current_capital']:,.2f}, HFT_WR={hft_status['performance_metrics']['win_rate']:.1%}, Swing_WR={swing_status['performance_metrics']['win_rate']:.1%}, Intraday_WR={intraday_status['performance_metrics']['win_rate']:.1%}")
            
            # Wait before next cycle
            time.sleep(10)
    
    except KeyboardInterrupt:
        logger.info("Trading system stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.exception("Critical error in trading system")
        sys.exit(1)
    finally:
        # Clean up resources
        logger.info("Shutting down trading system...")
        logger.info("Trading system shutdown complete")

if __name__ == "__main__":
    main()
