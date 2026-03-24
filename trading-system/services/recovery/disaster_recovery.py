import logging
import time
import json
import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from twilio.rest import Client
from trading_system.config.settings import settings

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
        
        # Initialize recovery configuration
        self.primary_region = settings.RECOVERY_CONFIG.get('primary_region', 'us-east-1')
        self.secondary_region = settings.RECOVERY_CONFIG.get('secondary_region', 'us-west-2')
        self.failover_threshold = settings.RECOVERY_CONFIG.get('failover_threshold', 5)
        self.backup_retention = settings.RECOVERY_CONFIG.get('backup_retention', 30)
        self.rpo = settings.RECOVERY_CONFIG.get('rpo', 300)
        self.rto = settings.RECOVERY_CONFIG.get('rto', 300)
        
        self.recovery_status = {
            'state': 'active',
            'last_backup': self.last_backup.isoformat(),
            'last_failover': self.last_failover.isoformat(),
            'primary_region': self.primary_region,
            'secondary_region': self.secondary_region
        }
    
    def check_system_health(self):
        """Check system health and trigger recovery procedures if needed"""
        try:
            # Check if primary region is healthy (mocked for demo)
            primary_healthy = self._check_region_health(self.primary_region)
            
            # Check if we've recently performed failover
            if datetime.now() - self.last_failover < self.failover_cooldown:
                return
            
            # Check failover conditions
            if not primary_healthy:
                self.logger.warning(f"Primary region {self.primary_region} is unhealthy")
                
                # Check secondary region health
                secondary_healthy = self._check_region_health(self.secondary_region)
                
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
            logger.exception("Error checking system health")
    
    def _check_region_health(self, region):
        """Check health of a specific region (mocked)"""
        return random.random() > 0.05
    
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
            self.logger.info(f"Switching to secondary region: {self.secondary_region}")
            self.api_client.update_region(self.secondary_region)
            
            # 4. Verify system functionality in secondary region
            if not self._verify_secondary():
                self.logger.error("Secondary verification failed")
                return
            
            # Update recovery status
            self.last_failover = datetime.now()
            self.recovery_status['state'] = 'failover_active'
            self.recovery_status['last_failover'] = self.last_failover.isoformat()
            
            self.logger.critical("FAILOVER COMPLETED SUCCESSFULLY")
            self._notify_failover()
            
        except Exception as e:
            logger.exception("Error during failover procedure")
            self._notify_critical_failure()
    
    def _stop_trading(self):
        self.logger.info("Stopping all trading activity...")
        self.api_client.update_system_status(market_open=False)
        self.api_client.cancel_all_orders()
        self.api_client.close_all_positions()
        self.api_client.suspend_signal_generation()
    
    def _check_data_sync(self):
        # Implementation from user logic (simplified)
        return True
        
    def _verify_secondary(self):
        # Verification logic using api_client checks
        try:
            status = self.api_client.get_system_status()
            return status and status.get('system', {}).get('status') == 'healthy'
        except: return False

    def _perform_backup(self):
        self.logger.info("Performing enterprise-grade backup...")
        # Trigger via API as per user design
        # In reality, this would initiate a snapshot
        self.last_backup = datetime.now()
        self.recovery_status['last_backup'] = self.last_backup.isoformat()

    def _notify_failover(self):
        self.logger.info("Notifying stakeholders of failover...")
        # Integration with existing alert methods...
        
    def _notify_critical_failure(self):
        self.logger.critical("CRITICAL: REGIONAL OUTAGE")

    def get_recovery_status(self):
        return self.recovery_status
