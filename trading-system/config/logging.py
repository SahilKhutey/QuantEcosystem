import logging
import sys
from logging.handlers import RotatingFileHandler
from trading_system.config.settings import settings

def setup_logging():
    """
    Configures professional logging for the entire system.
    Outputs to both console and a rotating log file.
    """
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(log_format))
    logger.addHandler(console_handler)
    
    # File Handler
    file_handler = RotatingFileHandler(
        'trading_system.log', 
        maxBytes=10*1024*1024, 
        backupCount=5
    )
    file_handler.setFormatter(logging.Formatter(log_format))
    logger.addHandler(file_handler)
    
    logging.info(f"Logging initialized for {settings.PROJECT_NAME}")

if __name__ == "__main__":
    setup_logging()
