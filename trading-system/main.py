import time
import logging
import sys
import os
import signal
from config.settings import API_KEYS
from services.broker.broker_interface import GlobalBrokerRouter
from services.broker.alpaca_api import AlpacaAPI
from services.broker.ib_api import IBAPI
from services.broker.td_api import TDAPI
from services.core.system_integrator import SystemIntegrator

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
    logging.info(f"Starting advanced trading system with PID: {os.getpid()}")
    return logging.getLogger("Main")

def initialize_components():
    """Initialize all advanced trading system components"""
    logger = logging.getLogger("Main")
    logger.info("Initializing advanced trading system components")
    
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
            api_key=API_KEYS.get('td_key'),
            access_token=API_KEYS.get('td_token')
        )
        broker_router.add_broker("TD Ameritrade", td_api)
        logger.info("TD Ameritrade API initialized")
        
        # Initialize advanced trading system
        system_integrator = SystemIntegrator(broker_router)
        system_integrator.initialize_components()
        logger.info("Advanced trading system components initialized")
        
        return {
            'logger': logger,
            'broker_router': broker_router,
            'system_integrator': system_integrator
        }
    
    except Exception as e:
        logger = logging.getLogger("Main")
        logger.exception("Error initializing advanced trading system components")
        raise

def handle_shutdown(signum, frame):
    """Handle graceful shutdown"""
    logger = logging.getLogger("Main")
    logger.info("Received shutdown signal - initiating graceful shutdown")
    
    # Get system components
    components = sys.modules['__main__'].__dict__.get('system')
    if not components:
        sys.exit(0)
    
    # Stop the advanced trading system
    if components.get('system_integrator'):
        components['system_integrator'].stop()
    
    # Clean up resources
    logger.info("Shutting down advanced trading system components")
    time.sleep(2)  # Give time for components to shut down
    
    logger.info("Advanced trading system shutdown complete")
    sys.exit(0)

def main():
    """Production trading system entry point"""
    # Setup logging
    logger = setup_logging()
    logger.info("Starting production advanced trading system")
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    system = None
    try:
        # Initialize components
        system = initialize_components()
        logger = system['logger']
        
        # Set system as global for shutdown handler
        sys.modules['__main__'].__dict__['system'] = system
        
        # Start advanced trading system
        system['system_integrator'].start()
        logger.info("Advanced trading system started")
        
        # Main loop - just wait for shutdown signal
        while True:
            # Check system status every minute
            if int(time.time()) % 60 == 0:
                status = system['system_integrator'].get_system_status()
                logger.info(
                    f"System status: "
                    f"Active={status['active']}, "
                    f"Components={len(status['components'])}"
                )
                time.sleep(1) # Prevent multiple logs in same second
            
            time.sleep(0.5)
    
    except KeyboardInterrupt:
        logger.info("Advanced trading system stopped by user")
        if system:
            system['system_integrator'].stop()
        sys.exit(0)
    except Exception as e:
        logger = logging.getLogger("Main")
        logger.exception("Critical error in advanced trading system")
        if system:
            system['system_integrator'].stop()
        sys.exit(1)
    finally:
        # Clean up resources
        logger = logging.getLogger("Main")
        logger.info("Shutting down advanced trading system...")
        logger.info("Advanced trading system shutdown complete")

if __name__ == "__main__":
    main()
