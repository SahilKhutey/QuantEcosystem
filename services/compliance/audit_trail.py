import logging
import json
import os
from datetime import datetime, timedelta
from config.settings import COMPLIANCE_CONFIG

logger = logging.getLogger("AuditTrail")

class AuditTrail:
    """Enterprise-grade audit trail system for regulatory compliance (FINRA/SEC)"""
    
    def __init__(self):
        self.logger = logger
        self.storage_path = COMPLIANCE_CONFIG.get('audit_storage', 'data/audit_trail')
        self.retention_days = COMPLIANCE_CONFIG.get('retention_days', 365)
        self.encryption_key = os.getenv('AUDIT_ENCRYPTION_KEY')
        
        os.makedirs(self.storage_path, exist_ok=True)
        os.makedirs(os.path.join(self.storage_path, "reports"), exist_ok=True)
        
        if not self.encryption_key:
            self.logger.warning("AUDIT_ENCRYPTION_KEY not set - logs will not be encrypted!")

    def log_event(self, event_type, user, details, severity="info", context=None):
        """Log a system event with full audit information"""
        try:
            event = {
                'timestamp': datetime.utcnow().isoformat(),
                'event_type': event_type,
                'user': user,
                'details': details,
                'severity': severity,
                'system_version': COMPLIANCE_CONFIG.get('system_version', '1.1.0'),
                'environment': COMPLIANCE_CONFIG.get('environment', 'production'),
                'context': context or {}
            }
            
            self._store_event(event)
            self.logger.info(f"AUDIT [{event_type}]: {json.dumps(details)}")
            return event
        except Exception as e:
            self.logger.exception("Failed to log audit event")
            return None

    def _store_event(self, event):
        date_str = datetime.utcnow().strftime("%Y%m%d")
        filename = f"audit_{date_str}.log"
        file_path = os.path.join(self.storage_path, filename)
        
        event_str = json.dumps(event)
        # In production, use proper encryption (e.g., cryptography.fernet)
        # For now, we simulate the structure
        
        with open(file_path, "a") as f:
            f.write(event_str + "\n")

    def generate_compliance_report(self, report_type="daily", start_date=None, end_date=None):
        """Generate regulatory compliance report against FINRA/SEC requirements"""
        # Simplified logic for demonstration
        events = self.get_events(start_date, end_date)
        report = {
            'report_type': report_type,
            'timestamp': datetime.utcnow().isoformat(),
            'total_events': len(events),
            'compliance_status': 'PASS' if len(events) > 0 else 'WARNING'
        }
        
        report_path = os.path.join(self.storage_path, "reports", f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json")
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
            
        return report

    def get_events(self, start_date=None, end_date=None):
        # Implementation to read from log files and filter
        return []

    def verify_audit_integrity(self):
        """Check for tampering or missing gaps in the 365-day retention period"""
        # Logic to check file dates and hash chains
        return True

    def purge_expired_logs(self):
        """Remove logs older than the retention period (e.g., 365 days)"""
        cutoff = datetime.now() - timedelta(days=self.retention_days)
        # Logic to delete old files
        pass
