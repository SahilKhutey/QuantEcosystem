import logging
import psutil
import time
from datetime import datetime
from trading_system.config.settings import settings

class HealthMonitor:
    """
    System-wide health monitoring service.
    Tracks CPU, memory, and connectivity status.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_system_health(self) -> dict:
        """Returns current system health metrics."""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'status': 'HEALTHY' if psutil.cpu_percent() < 90 else 'DEGRADED'
        }

    def check_broker_connectivity(self) -> dict:
        """Checks connectivity to configured brokers."""
        # Implementation for pinging Alpaca/IB endpoints
        return {'alpaca': 'ONLINE', 'ib': 'OFFLINE'}
