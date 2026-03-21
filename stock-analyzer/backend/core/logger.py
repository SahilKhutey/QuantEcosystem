import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        # Check if logger already has handlers to avoid duplicate logs in some environments
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_market_event(self, event_type: str, symbol: str, data: dict):
        """Log structured market events"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'symbol': symbol,
            'data': data
        }
        self.logger.info(json.dumps(log_entry))

# Export for usage
logger = StructuredLogger('market_events')
# Example usage comment:
# logger.log_market_event('price_update', 'AAPL', {'price': 150.0, 'volume': 1000})
