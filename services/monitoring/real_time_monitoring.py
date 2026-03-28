import logging
import time
import requests
import json
import smtplib
import os
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from twilio.rest import Client
from config.settings import ALERT_CONFIG

logger = logging.getLogger("RealTimeMonitoring")

class RealTimeMonitor:
    """Production-grade monitoring system with real-time alerting and issue detection"""
    
    def __init__(self, api_client, alert_thresholds=None):
        self.api_client = api_client
        self.logger = logger
        self.alert_thresholds = alert_thresholds or {
            'daily_loss': 0.04,  # 4% daily loss threshold
            'drawdown': 0.12,     # 12% drawdown threshold
            'position_risk': 0.15,# 15% position risk threshold
            'slippage': 0.01,     # 1% slippage threshold
            'fill_rate': 0.85,    # 85% fill rate threshold
            'order_processing': 5.0  # 5-second order processing threshold
        }
        self.last_alert = {
            'daily_loss': datetime.min,
            'drawdown': datetime.min,
            'position_risk': datetime.min,
            'slippage': datetime.min,
            'fill_rate': datetime.min,
            'order_processing': datetime.min,
            'system_failure': datetime.min
        }
        self.alert_cooldown = timedelta(minutes=ALERT_CONFIG.get('cooldown_minutes', 15))
        self.system_health = {
            'status': 'healthy',
            'last_checked': datetime.min,
            'issue_count': 0,
            'last_issue': None
        }
        self.critical_issues = []
        self.warning_issues = []
    
    def start_monitoring(self, interval=30):
        """Start continuous monitoring with the specified interval (in seconds)"""
        self.logger.info(f"Starting real-time monitoring (interval: {interval} seconds)")
        
        while True:
            try:
                self.check_system_health()
                time.sleep(interval)
            except Exception as e:
                self.logger.exception("Monitoring error")
                time.sleep(60)  # Prevent tight loop on error
    
    def check_system_health(self):
        """Check health of all system components and send alerts if needed"""
        try:
            # Get current metrics
            risk_metrics = self._get_risk_metrics()
            execution_metrics = self._get_execution_metrics()
            system_status = self._get_system_status()
            market_status = self._get_market_status()
            
            # Check for critical issues
            self._check_risk_metrics(risk_metrics)
            self._check_execution_metrics(execution_metrics)
            self._check_system_status_details(system_status)
            self._check_market_status(market_status)
            
            # Update overall system health
            self._update_system_health()
            
            # Check for circuit breaker
            circuit_breaker = self._get_circuit_breaker_status()
            if circuit_breaker and circuit_breaker.get('active'):
                self._send_circuit_breaker_alert(circuit_breaker)
                
            # Log health status
            self.logger.info(f"System health: {self.system_health['status']} "
                           f"(issues: {self.system_health['issue_count']})")
            
        except Exception as e:
            self.logger.exception("Error checking system health")
            self._log_critical_issue("System monitoring failure", str(e))
    
    def _get_risk_metrics(self):
        """Get risk metrics from API with error handling"""
        try:
            response = requests.get(
                f"{self.api_client.base_url}/risk/metrics",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Failed to get risk metrics: {str(e)}")
            self._log_warning("Risk metrics API failure", str(e))
        
        return {}
    
    def _get_execution_metrics(self):
        """Get execution metrics from API with error handling"""
        try:
            response = requests.get(
                f"{self.api_client.base_url}/trading/execution-metrics",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Failed to get execution metrics: {str(e)}")
            self._log_warning("Execution metrics API failure", str(e))
        
        return {}
    
    def _get_system_status(self):
        """Get system status from API with error handling"""
        try:
            response = requests.get(
                f"{self.api_client.base_url}/system/status",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Failed to get system status: {str(e)}")
            self._log_critical_issue("System status API failure", str(e))
        
        return {}
    
    def _get_market_status(self):
        """Get market status from API with error handling"""
        try:
            response = requests.get(
                f"{self.api_client.base_url}/market/status",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Failed to get market status: {str(e)}")
            self._log_warning("Market status API failure", str(e))
        
        return {}
    
    def _get_circuit_breaker_status(self):
        """Get circuit breaker status from API with error handling"""
        try:
            response = requests.get(
                f"{self.api_client.base_url}/risk/circuit-breaker",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Failed to get circuit breaker status: {str(e)}")
            self._log_critical_issue("Circuit breaker API failure", str(e))
        
        return {}
    
    def _check_risk_metrics(self, metrics):
        """Check risk metrics against thresholds"""
        # Daily loss threshold
        if 'daily_loss' in metrics and metrics['daily_loss'] > self.alert_thresholds['daily_loss']:
            self._log_critical_issue(
                "Daily Loss Threshold Exceeded",
                f"Daily loss: ${metrics['daily_loss']:.2f} exceeds threshold of ${self.alert_thresholds['daily_loss']:.2f}"
            )
        
        # Drawdown threshold
        if 'drawdown' in metrics and metrics['drawdown'] > self.alert_thresholds['drawdown']:
            self._log_critical_issue(
                "Drawdown Threshold Exceeded",
                f"Current drawdown: {metrics['drawdown']:.2%} exceeds threshold of {self.alert_thresholds['drawdown']:.2%}"
            )
        
        # Position risk threshold
        if 'position_risk' in metrics and metrics['position_risk'] > self.alert_thresholds['position_risk']:
            self._log_warning(
                "Position Risk Threshold Exceeded",
                f"Position risk: {metrics['position_risk']:.2%} exceeds threshold of {self.alert_thresholds['position_risk']:.2%}"
            )
    
    def _check_execution_metrics(self, metrics):
        """Check execution metrics against thresholds"""
        # Slippage threshold
        if 'slippage' in metrics and metrics['slippage'] > self.alert_thresholds['slippage']:
            self._log_warning(
                "High Slippage Detected",
                f"Current slippage: {metrics['slippage']:.4f} exceeds threshold of {self.alert_thresholds['slippage']:.4f}"
            )
        
        # Fill rate threshold
        if 'fill_rate' in metrics and metrics['fill_rate'] < self.alert_thresholds['fill_rate']:
            self._log_warning(
                "Low Fill Rate Detected",
                f"Current fill rate: {metrics['fill_rate']:.2%} below threshold of {self.alert_thresholds['fill_rate']:.2%}"
            )
        
        # Order processing time threshold
        if 'order_processing_time' in metrics and metrics['order_processing_time'] > self.alert_thresholds['order_processing']:
            self._log_critical_issue(
                "Order Processing Delay",
                f"Order processing time: {metrics['order_processing_time']:.2f}s exceeds threshold of {self.alert_thresholds['order_processing']}s"
            )
    
    def _check_system_status_details(self, status):
        """Check system status for critical failures"""
        if status and status.get('status') == 'error':
             self._log_critical_issue(
                "System Failure Detected",
                f"Status report: {status.get('message', 'Unknown system error')}"
            )

    def _check_market_status(self, status):
        """Check market status for issues"""
        if status and 'us' in status and status['us']['status'] == 'CLOSED':
            self._log_warning(
                "Market Closed",
                "US market is closed - no new trades should be executed"
            )
    
    def _update_system_health(self):
        """Update overall system health status"""
        self.system_health['last_checked'] = datetime.now()
        
        # Determine health status based on issues
        if self.critical_issues:
            self.system_health['status'] = 'critical'
            self.system_health['issue_count'] = len(self.critical_issues)
        elif self.warning_issues:
            self.system_health['status'] = 'warning'
            self.system_health['issue_count'] = len(self.warning_issues)
        else:
            self.system_health['status'] = 'healthy'
            self.system_health['issue_count'] = 0
        
        # Clear old issues (keep for 1 hour)
        one_hour_ago = datetime.now() - timedelta(hours=1)
        self.critical_issues = [issue for issue in self.critical_issues 
                              if issue['timestamp'] > one_hour_ago]
        self.warning_issues = [issue for issue in self.warning_issues 
                              if issue['timestamp'] > one_hour_ago]
    
    def _log_critical_issue(self, title, message):
        """Log a critical issue and trigger alerts"""
        issue = {
            'timestamp': datetime.now(),
            'title': title,
            'message': message,
            'severity': 'critical',
            'alerted': False
        }
        self.critical_issues.append(issue)
        self._trigger_alerts(issue)
    
    def _log_warning(self, title, message):
        """Log a warning issue"""
        issue = {
            'timestamp': datetime.now(),
            'title': title,
            'message': message,
            'severity': 'warning',
            'alerted': False
        }
        self.warning_issues.append(issue)
    
    def _trigger_alerts(self, issue):
        """Trigger all configured alerts for an issue"""
        # Only send alerts if cooldown period has passed
        if self._should_send_alert(issue['title']):
            try:
                # Send email
                if 'email' in ALERT_CONFIG.get('channels', []):
                    self._send_email_alert(issue)
                
                # Send SMS
                if 'sms' in ALERT_CONFIG.get('channels', []):
                    self._send_sms_alert(issue)
                
                # Update alert timestamp
                self.last_alert[issue['title']] = datetime.now()
                
                # Mark as alerted
                issue['alerted'] = True
                
                self.logger.critical(f"ALERT [{issue['severity'].upper()}]: {issue['title']}")
                self.logger.critical(f"  {issue['message']}")
                
            except Exception as e:
                self.logger.exception("Error triggering alerts")
    
    def _should_send_alert(self, alert_type):
        """Check if we should send this alert based on cooldown period"""
        # Use a generic key if alert_type is not specifically tracked
        key = alert_type if alert_type in self.last_alert else 'system_failure'
        last_time = self.last_alert.get(key, datetime.min)
        return datetime.now() - last_time > self.alert_cooldown
    
    def _send_email_alert(self, issue):
        """Send email alert with proper formatting"""
        try:
            # Get email configuration from environment
            smtp_server = os.getenv('SMTP_SERVER', 'localhost')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            smtp_user = os.getenv('SMTP_USER')
            smtp_password = os.getenv('SMTP_PASSWORD')
            
            if not smtp_user or not smtp_password:
                self.logger.error("SMTP credentials not configured")
                return
            
            # Create email message
            msg = MIMEText(self._format_alert_message(issue))
            msg['Subject'] = f"ALERT [{issue['severity'].upper()}]: {issue['title']}"
            msg['From'] = os.getenv('ALERT_FROM', 'trading-system@domain.com')
            msg['To'] = os.getenv('ALERT_RECIPIENT', 'trading-team@domain.com')
            
            # Send email
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
        except Exception as e:
            self.logger.exception("Failed to send email alert")
    
    def _send_sms_alert(self, issue):
        """Send SMS alert using Twilio"""
        try:
            # Get Twilio configuration
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            from_number = os.getenv('TWILIO_FROM_NUMBER')
            to_number = os.getenv('TWILIO_TO_NUMBER')
            
            if not account_sid or not auth_token or not from_number or not to_number:
                self.logger.error("Twilio configuration incomplete")
                return
            
            # Send SMS
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=self._format_sms_message(issue),
                from_=from_number,
                to=to_number
            )
            
            self.logger.info(f"SMS alert sent (SID: {message.sid})")
            
        except Exception as e:
            self.logger.exception("Failed to send SMS alert")
    
    def _format_alert_message(self, issue):
        """Format issue as email message"""
        return (
            f"Global Trading Terminal Alert\n\n"
            f"Time: {issue['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Level: {issue['severity'].upper()}\n"
            f"Source: Global Trading Terminal\n\n"
            f"Title: {issue['title']}\n\n"
            f"Details: {issue['message']}\n\n"
            f"This is an automated alert from the Global Trading Terminal system.\n"
            f"Please investigate immediately to prevent potential financial losses."
        )
    
    def _format_sms_message(self, issue):
        """Format issue as SMS message (limited to 160 characters)"""
        return (
            f"ALERT [{issue['severity'].upper()}]: {issue['title']}\n"
            f"{issue['message'][:100]}"
        )
    
    def _send_circuit_breaker_alert(self, circuit_breaker):
        """Send special circuit breaker alert"""
        title = "CIRCUIT BREAKER TRIGGERED"
        message = (
            f"CIRCUIT BREAKER TRIGGERED\n"
            f"Daily Loss: ${circuit_breaker.get('daily_loss', 0):.2f}\n"
            f"Drawdown: {circuit_breaker.get('drawdown', 0):.2%}\n"
            f"Trading is suspended"
        )
        
        self._log_critical_issue(title, message)
