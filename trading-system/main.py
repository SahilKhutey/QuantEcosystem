import time
import logging
import sys
import signal
import threading
import http.server
import socketserver
from config.settings import API_KEYS
from services.broker.alpaca_api import AlpacaAPI
from services.risk.manager import RiskManager
from services.data.market_data import MarketDataService
from services.trade_engine.engine import TradeEngine, TradeOrder

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
        # Initialize components
        alpaca = AlpacaAPI()
        market_data = MarketDataService(alpaca)
        risk_manager = RiskManager(alpaca)
        trade_engine = TradeEngine(alpaca, risk_manager, market_data)
        
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
            
            # Monitor active orders
            trade_engine.monitor_orders()
            
            # Check for circuit breaker conditions
            if not trade_engine.check_circuit_breaker():
                logger.critical("CIRCUIT BREAKER ACTIVE - TRADING SUSPENDED")
                # Send critical alert (in production)
                # This would notify via email/SMS in a real system
                time.sleep(300)  # Wait 5 minutes before checking again
                continue
            
            # Check market hours to reset daily metrics
            if market_data.is_market_open() and not market_data.was_market_open():
                risk_manager.reset_daily()
                logger.info("Daily metrics reset for new trading day")
            
            # Get and log system status
            status = trade_engine.get_trading_status()
            logger.info(f"Trading status: Active orders={status['active_orders']}, Capital=${status['current_capital']:,.2f}, Drawdown={status['risk_metrics']['drawdown']:.2%}")
            
            # Log portfolio analysis
            portfolio = trade_engine.get_portfolio_analysis()
            logger.info(f"Portfolio value: ${portfolio['current_portfolio_value']:,.2f}, Unrealized P&L: ${portfolio['unrealized_pnl']:,.2f}")
            
            # Log market insights
            logger.info(f"Market sentiment: {market_insights['market_sentiment']['current']:.2f} ({market_insights['market_sentiment']['trend']})")
            
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
