import time
import logging
import sys
import signal
import os
from config.settings import API_KEYS
from services.broker.broker_interface import GlobalBrokerRouter
from services.broker.alpaca_api import AlpacaAPI
from services.broker.ib_api import IBAPI
from services.broker.td_api import TDAPI
from services.risk.manager import RiskManager
from services.trading.hft_engine import HFTScalpingEngine
from services.trading.swing_engine import SwingTradingEngine
from services.trading.intraday_engine import IntradayTradingEngine
from services.trading.autonomous_engine import AutonomousTradingEngine

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
    log_dir = os.getenv('LOG_DIR', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f'trading_system_{time.strftime("%Y%m%d")}.log')
    
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    
    # Add handlers
    root.addHandler(console_handler)
    root.addHandler(file_handler)
    
    # Add process ID to logs for better tracking
    logging.info(f"Starting trading system with PID: {os.getpid()}")
    return logging.getLogger("Main")

def initialize_components():
    """Initialize all trading system components"""
    logger = logging.getLogger("Main")
    logger.info("Initializing trading system components")
    
    try:
        # Initialize broker router and add brokers
        broker_router = GlobalBrokerRouter()
        
        # Add Alpaca API
        alpaca_api = AlpacaAPI(
            api_key=API_KEYS.get('alpaca_key'),
            api_secret=API_KEYS.get('alpaca_secret')
        )
        broker_router.add_broker("Alpaca", alpaca_api)
        logger.info("Alpaca API initialized")
        
        # Add Interactive Brokers API (simulated in production)
        ib_api = IBAPI()
        broker_router.add_broker("Interactive Brokers", ib_api)
        logger.info("Interactive Brokers API initialized")
        
        # Add TD Ameritrade API
        td_api = TDAPI(
            api_key=API_KEYS.get('tda_key'), # Fixed from 'td_key' to match settings.py
            access_token=API_KEYS.get('tda_token') # Fixed from 'td_token'
        )
        broker_router.add_broker("TD Ameritrade", td_api)
        logger.info("TD Ameritrade API initialized")
        
        # Initialize risk manager
        risk_manager = RiskManager(alpaca_api)
        logger.info("Risk manager initialized")
        
        # Initialize trading engines
        hft_engine = HFTScalpingEngine(
            broker_router, 
            risk_manager,
            min_spread=0.05,
            max_position_size=100,
            max_trades_per_minute=20
        )
        logger.info("HFT scalping engine initialized")
        
        swing_engine = SwingTradingEngine(
            broker_router,
            risk_manager,
            min_risk_reward=1.5,
            max_position_size=500,
            max_trades_per_day=3
        )
        logger.info("Swing trading engine initialized")
        
        intraday_engine = IntradayTradingEngine(
            broker_router,
            risk_manager,
            max_position_size=200,
            max_trades_per_day=5
        )
        logger.info("Intraday trading engine initialized")
        
        # Initialize autonomous trading engine
        autonomous_engine = AutonomousTradingEngine(
            broker_router,
            risk_manager,
            hft_engine,
            swing_engine,
            intraday_engine,
            market_data_interval=1,
            monitor_interval=5
        )
        logger.info("Autonomous trading engine initialized")
        
        return {
            'logger': logger,
            'broker_router': broker_router,
            'risk_manager': risk_manager,
            'hft_engine': hft_engine,
            'swing_engine': swing_engine,
            'intraday_engine': intraday_engine,
            'autonomous_engine': autonomous_engine
        }
    
    except Exception as e:
        logger = logging.getLogger("Main")
        logger.exception("Error initializing trading system components")
        raise

def handle_shutdown(signum, frame):
    """Handle graceful shutdown"""
    logger = logging.getLogger("Main")
    logger.info("Received shutdown signal - initiating graceful shutdown")
    
    # Get system components
    components = sys.modules['__main__'].__dict__.get('system')
    if not components:
        sys.exit(0)
    
    # Stop the autonomous engine
    if components.get('autonomous_engine'):
        components['autonomous_engine'].stop()
    
    # Clean up resources
    logger.info("Shutting down trading system components")
    time.sleep(2)  # Give time for components to shut down
    
    logger.info("Trading system shutdown complete")
    sys.exit(0)

def main():
    """Production trading system entry point"""
    # Setup logging
    logger = setup_logging()
    logger.info("Starting production autonomous trading system")
    
    # Register signal handlers for graceful shutdown (SIGINT = Ctrl+C, SIGTERM = Termination)
    signal.signal(signal.SIGINT, handle_shutdown)
    if os.name != 'nt': # SIGTERM not fully supported on Windows via signal.signal in some contexts, but fine for docker
        signal.signal(signal.SIGTERM, handle_shutdown)
    
    system = None
    try:
        # Initialize components
        system = initialize_components()
        logger = system['logger']
        
        # Set system as global for shutdown handler
        sys.modules['__main__'].__dict__['system'] = system
        
        # Start autonomous trading engine
        system['autonomous_engine'].start()
        logger.info("Autonomous trading engine started")
        
        # Main loop - just wait for shutdown signal
        while True:
            # Check system status periodically
            status = system['autonomous_engine'].get_status()
            logger.info(
                f"System status: "
                f"Active={status['system']['active']}, "
                f"Market Open={status['system'].get('market_open', False)}, "
                f"Circuit Breaker={status['system'].get('circuit_breaker', False)}"
            )
            
            time.sleep(60) # Log status every 60 seconds
    
    except KeyboardInterrupt:
        logger.info("Trading system stopped by user")
        if system:
            system['autonomous_engine'].stop()
        sys.exit(0)
    except Exception as e:
        logger = logging.getLogger("Main")
        logger.exception("Critical error in trading system")
        if system:
            system['autonomous_engine'].stop()
        sys.exit(1)
    finally:
        logger.info("Trading system process terminating")

if __name__ == "__main__":
    main()
