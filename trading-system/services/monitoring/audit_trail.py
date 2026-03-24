import logging
import json
from datetime import datetime

class AuditTrail:
    """
    Transaction and audit logging service.
    Maintains a persistent record of all system actions and trades.
    """
    def __init__(self, log_file: str = "audit_trail.json"):
        self.log_file = log_file
        self.logger = logging.getLogger(__name__)

    def log_event(self, event_type: str, details: dict):
        """Logs a system event with timestamp."""
        event = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'details': details
        }
        self.logger.info(f"AUDIT | {event_type} | {details}")
        
        # In a real system, this would write to a DB or a secure log file.
        with open(self.log_file, "a") as f:
            f.write(json.dumps(event) + "\n")

    def log_trade(self, trade_details: dict):
        """Specifically logs trade executions."""
        self.log_event("TRADE_EXECUTION", trade_details)
