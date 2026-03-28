import logging
import time
import json
import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from twilio.rest import Client
import requests
from config.settings import RECOVERY_CONFIG

logger = logging.getLogger("DisasterRecovery")

class DisasterRecoverySystem:
    """
    Enterprise-grade disaster recovery system for trading operations.
    Handles automatic failover, data recovery, and business continuity.
    """
    
    def __init__(self, api_client, backup_interval=1800):
        self.api_client = api_client
        self.logger = logger
        self.backup_interval = backup_interval  # 30 minutes by default
        self.last_backup = datetime.min
        self.last_failover = datetime.min
        self.failover_cooldown = timedelta(hours=1)
        
        self.config = {
            'primary_region': RECOVERY_CONFIG.get('primary_region', 'us-east-1'),
            'secondary_region': RECOVERY_CONFIG.get('secondary_region', 'us-west-2'),
            'failover_threshold': RECOVERY_CONFIG.get('failover_threshold', 5),
            'max_failover_duration': RECOVERY_CONFIG.get('max_failover_duration', 15),
            'backup_retention': RECOVERY_CONFIG.get('backup_retention', 30),
            'recovery_point_objective': RECOVERY_CONFIG.get('rpo', 300),  # 5 minutes
            'recovery_time_objective': RECOVERY_CONFIG.get('rto', 300)   # 5 minutes
        }
        
        self.recovery_status = {
            'state': 'active',
            'last_backup': self.last_backup,
            'last_failover': self.last_failover,
            'primary_region': self.config['primary_region'],
            'secondary_region': self.config['secondary_region']
        }
        
        self.logger.info(f"Recovery system initialized: {self.config}")
    
    def start_recovery_monitoring(self, interval=300):
        """Start continuous recovery monitoring"""
        self.logger.info(f"Starting disaster recovery monitoring (interval: {interval} seconds)")
        
        while True:
            try:
                self._check_system_health()
                time.sleep(interval)
            except Exception as e:
                self.logger.exception("Disaster recovery monitoring error")
                time.sleep(60)
    
    def _check_system_health(self):
        """Check system health and trigger recovery procedures if needed"""
        try:
            # Check if primary region is healthy
            primary_healthy = self._check_region_health(self.config['primary_region'])
            
            # Check if we've recently performed failover
            if datetime.now() - self.last_failover < self.failover_cooldown:
                return
            
            # Check failover conditions
            if not primary_healthy:
                self.logger.warning(f"Primary region {self.config['primary_region']} is unhealthy")
                
                # Check secondary region health
                secondary_healthy = self._check_region_health(self.config['secondary_region'])
                
                if secondary_healthy:
                    self.logger.critical("Primary region failure detected - initiating failover")
                    self._initiate_failover()
                else:
                    self.logger.critical("Both primary and secondary regions are unhealthy - system is down")
                    self._notify_critical_failure()
            
            # Check if backup is needed
            if datetime.now() - self.last_backup > timedelta(seconds=self.backup_interval):
                self._perform_backup()
        
        except Exception as e:
            self.logger.exception("Error checking system health")
    
    def _check_region_health(self, region):
        """Check health of a specific region"""
        try:
            # Simulate region health check (95% healthy)
            return random.random() > 0.05
        except Exception as e:
            self.logger.exception(f"Error checking region health for {region}")
            return False
    
    def _initiate_failover(self):
        """Initiate failover to secondary region"""
        try:
            self.logger.critical("STARTING FAILOVER PROCEDURE")
            
            # 1. Stop all trading activity in primary region
            self._stop_trading()
            
            # 2. Check data synchronization status
            if not self._check_data_sync():
                self.logger.error("Data synchronization incomplete - cannot safely fail over")
                return
            
            # 3. Switch to secondary region
            self._switch_to_secondary()
            
            # 4. Verify system functionality in secondary region
            if not self._verify_system_functionality():
                self.logger.error("Secondary region verification failed - reverting to primary")
                self._revert_to_primary()
                return
            
            # 5. Update system configuration
            self._update_system_configuration()
            
            # 6. Notify stakeholders
            self._notify_failover()
            
            # Update recovery status
            self.last_failover = datetime.now()
            self.recovery_status['state'] = 'failover_active'
            self.recovery_status['last_failover'] = self.last_failover
            
            self.logger.critical("FAILOVER COMPLETED SUCCESSFULLY")
            
        except Exception as e:
            self.logger.exception("Error during failover procedure")
            self._notify_critical_failure()
    
    def _stop_trading(self):
        """Safely stop all trading activity"""
        try:
            self.logger.info("Stopping all trading activity...")
            self.api_client.update_system_status(market_open=False)
            self.api_client.cancel_all_orders()
            self.api_client.close_all_positions()
            self.api_client.suspend_signal_generation()
            self.logger.info("Trading activity stopped")
        except Exception as e:
            self.logger.exception("Error stopping trading activity")
            raise
    
    def _check_data_sync(self):
        """Check data synchronization status between regions"""
        try:
            last_backup = self._get_last_backup_timestamp()
            if not last_backup or datetime.now() - last_backup > timedelta(seconds=self.config['recovery_point_objective']):
                self.logger.error("Backup is outside RPO - cannot safely fail over")
                return False
            return True
        except Exception as e:
            self.logger.exception("Error checking data synchronization")
            return False

    def _get_last_backup_timestamp(self):
        try:
            response = requests.get(f"{self.api_client.base_url}/recovery/last-backup", timeout=10)
            if response.status_code == 200:
                return datetime.fromisoformat(response.json()['timestamp'])
        except:
            return None
        return None

    def _switch_to_secondary(self):
        self.api_client.update_region(self.config['secondary_region'])
        time.sleep(30)
        if self.api_client.get_current_region() != self.config['secondary_region']:
            raise Exception("Failed to switch region")

    def _verify_system_functionality(self):
        try:
            status = self.api_client.get_system_status()
            if not status or not status.get('system', {}).get('active', False):
                return False
            return True
        except:
            return False

    def _revert_to_primary(self):
        self.api_client.update_region(self.config['primary_region'])

    def _update_system_configuration(self):
        self.api_client.update_region(self.config['secondary_region'])

    def _notify_failover(self):
        self._send_email_notification("FAILOVER COMPLETE", "System failed over to secondary region")

    def _notify_critical_failure(self):
        self._send_email_notification("CRITICAL FAILURE", "Both regions are down")

    def _send_email_notification(self, subject, message):
        try:
            smtp_user = os.getenv('SMTP_USER')
            smtp_password = os.getenv('SMTP_PASSWORD')
            if not smtp_user: return
            msg = MIMEText(message)
            msg['Subject'] = subject
            msg['From'] = os.getenv('ALERT_FROM', 'trading@domain.com')
            msg['To'] = os.getenv('ALERT_RECIPIENT', 'team@domain.com')
            with smtplib.SMTP(os.getenv('SMTP_SERVER', 'localhost'), int(os.getenv('SMTP_PORT', '587'))) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        except:
            self.logger.error("Email notification failed")

    def _perform_backup(self):
        try:
            response = requests.post(f"{self.api_client.base_url}/recovery/backup", timeout=300)
            if response.status_code == 200:
                self.last_backup = datetime.now()
        except:
            self.logger.error("Backup failed")
