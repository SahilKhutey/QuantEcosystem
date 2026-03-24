import logging
from datetime import datetime
import os
import requests

class AlertManager:
    """
    Centralized Alerting System for Twilio, Discord, and Email notifications.
    """
    def __init__(self):
        self.logger = logging.getLogger("Alerts.AlertManager")
        self.discord_webhook = os.getenv("DISCORD_WEBHOOK_URL")
        self.twilio_sid = os.getenv("TWILIO_SID")
        self.twilio_token = os.getenv("TWILIO_TOKEN")
        self.alert_history = []

    def send_alert(self, message: str, severity: str = "INFO", channels: list = ["LOG"]):
        """Sends alerts across specified channels."""
        timestamp = datetime.utcnow().isoformat()
        alert_data = {
            'timestamp': timestamp,
            'message': message,
            'severity': severity,
            'channels': channels
        }
        
        # 1. Internal Logging
        if "LOG" in channels:
            log_msg = f"[{severity}] {message}"
            if severity == "CRITICAL": self.logger.critical(log_msg)
            elif severity == "WARNING": self.logger.warning(log_msg)
            else: self.logger.info(log_msg)
            
        # 2. Discord Notification
        if "DISCORD" in channels and self.discord_webhook:
            try:
                requests.post(self.discord_webhook, json={"content": f"**[{severity}]** {message}"})
            except Exception as e:
                self.logger.error(f"Failed to send Discord alert: {e}")
                
        # 3. Twilio SMS (Mocked for safety)
        if "SMS" in channels and self.twilio_sid:
            self.logger.info(f"SMS Alert Queued: {message}")

        self.alert_history.append(alert_data)
        if len(self.alert_history) > 100: self.alert_history.pop(0)
        
        return alert_data

    def get_alert_history(self) -> list:
        return self.alert_history
