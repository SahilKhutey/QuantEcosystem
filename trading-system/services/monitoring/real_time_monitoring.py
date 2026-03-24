import logging
import time
import requests
import json
import smtplib
import os
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from twilio.rest import Client
from trading_system.config.settings import settings

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
        self.alert_cooldown = timedelta(minutes=15)  # 15 minutes between same alerts
        self.system_health = {
            'status': 'healthy',
            'last_checked': datetime.min,
            'issue_count': 0,
            'last_issue': None
        }
        self.critical_issues = []
        self.warning_issues = []
    
    def check_system_health(self):
        """Check health of all system components and send alerts if needed"""
        try:
            # Get current metrics via API Client methods
            risk_metrics = self.api_client.get_risk_metrics() or {}
            execution_metrics = self.api_client.get_execution_metrics() or {}
            system_status = self.api_client.get_system_status() or {}
            market_status = self.api_client.get_market_status() or {}
            
            # Check for critical issues
            self._check_risk_metrics(risk_metrics)
            self._check_execution_metrics(execution_metrics)
            self._check_system_status(system_status)
            self._check_market_status(market_status)
            
            # Update overall system health
            self._update_system_health()
            
            # Check for circuit breaker
            circuit_breaker = self.api_client.get_circuit_breaker_status()
            if circuit_breaker and circuit_breaker.get('active'):
                self._send_circuit_breaker_alert(circuit_breaker)
                
            # Log health status
            self.logger.info(f"System health: {self.system_health['status']} "
                           f"(issues: {self.system_health['issue_count']})")
            
        except Exception as e:
            self.logger.exception("Error checking system health")
            self._log_critical_issue("System monitoring failure", str(e))
            
    def _check_system_status(self, status):
        """Check core system components status"""
        if status and status.get('system', {}).get('status') != 'healthy':
             self._log_critical_issue("Core System Unhealthy", f"Reported status: {status.get('system', {}).get('status')}")

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
    
    def _check_execution_metrics(self, metrics):
        """Check execution metrics against thresholds"""
        # Slippage threshold
        if 'slippage' in metrics and metrics['slippage'] > self.alert_thresholds['slippage']:
            self._log_warning(
                "High Slippage Detected",
                f"Current slippage: {metrics['slippage']:.4f} exceeds threshold of {self.alert_thresholds['slippage']:.4f}"
            )
    
    def _check_market_status(self, status):
        """Check market status for issues"""
        if status and 'us' in status and status['us'].get('status') == 'CLOSED':
            self._log_warning(
                "Market Closed",
                "US market is closed - no new trades should be executed"
            )
    
    def _update_system_health(self):
        """Update overall system health status"""
        self.system_health['last_checked'] = datetime.now()
        
        if self.critical_issues:
            self.system_health['status'] = 'critical'
            self.system_health['issue_count'] = len(self.critical_issues)
        elif self.warning_issues:
            self.system_health['status'] = 'warning'
            self.system_health['issue_count'] = len(self.warning_issues)
        else:
            self.system_health['status'] = 'healthy'
            self.system_health['issue_count'] = 0
    
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
        if self._should_send_alert(issue['title']):
            try:
                self._send_email_alert(issue)
                self._send_sms_alert(issue)
                self.last_alert[issue['title']] = datetime.now()
                issue['alerted'] = True
                logger.critical(f"ALERT [{issue['severity'].upper()}]: {issue['title']}")
            except Exception as e:
                logger.exception("Error triggering alerts")
    
    def _should_send_alert(self, alert_type):
        last_time = self.last_alert.get(alert_type, datetime.min)
        return datetime.now() - last_time > self.alert_cooldown
    
    def _send_email_alert(self, issue):
        try:
            smtp_server = os.getenv('SMTP_SERVER', 'localhost')
            smtp_user = os.getenv('SMTP_USER')
            if not smtp_user: return
            
            msg = MIMEText(self._format_alert_message(issue))
            msg['Subject'] = f"ALERT [{issue['severity'].upper()}]: {issue['title']}"
            msg['From'] = os.getenv('ALERT_FROM', 'trading-system@domain.com')
            msg['To'] = os.getenv('ALERT_RECIPIENT', 'trading-team@domain.com')
            
            with smtplib.SMTP(smtp_server, 587) as server:
                server.starttls()
                server.login(smtp_user, os.getenv('SMTP_PASSWORD'))
                server.send_message(msg)
        except Exception:
            logger.error("Failed to send email alert")
    
    def _send_sms_alert(self, issue):
        try:
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            if not account_sid: return
            client = Client(account_sid, os.getenv('TWILIO_AUTH_TOKEN'))
            client.messages.create(
                body=self._format_sms_message(issue),
                from_=os.getenv('TWILIO_FROM_NUMBER'),
                to=os.getenv('TWILIO_TO_NUMBER')
            )
        except Exception:
            logger.error("Failed to send SMS alert")
            
    def _format_alert_message(self, issue):
        return f"Trading system alert: {issue['title']}\n{issue['message']}"
    
    def _format_sms_message(self, issue):
        return f"ALERT: {issue['title']} - {issue['message'][:100]}"
    
    def _send_circuit_breaker_alert(self, circuit_breaker):
        self._log_critical_issue("CIRCUIT BREAKER TRIGGERED", "Trading is suspended due to risk limits.")

    def get_health_status(self):
        """Expose current health status for API"""
        return {
            'summary': self.system_health,
            'critical_issues': [ {**i, 'timestamp': i['timestamp'].isoformat()} for i in self.critical_issues[-5:] ],
            'warning_issues': [ {**i, 'timestamp': i['timestamp'].isoformat()} for i in self.warning_issues[-10:] ]
        }
