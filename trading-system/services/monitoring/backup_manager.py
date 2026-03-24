import os
import shutil
import time
import logging
import tarfile
from datetime import datetime
from trading_system.config.settings import settings

logger = logging.getLogger("BackupManager")

class BackupManager:
    """Handles automated hourly backups of trading data and state"""
    
    def __init__(self, backup_dir="backups", source_dirs=None):
        self.backup_dir = backup_dir
        self.source_dirs = source_dirs or ["logs", "data", "config"]
        self.logger = logger
        self.max_backups = 24 * 7 # Keep 1 week of hourly backups
        
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)
            
    def run_backup(self):
        """Creates a compressed archive of the system state"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = os.path.join(self.backup_dir, f"system_backup_{timestamp}.tar.gz")
        
        try:
            self.logger.info(f"Starting automated backup: {backup_filename}")
            
            with tarfile.open(backup_filename, "w:gz") as tar:
                for s_dir in self.source_dirs:
                    if os.path.exists(s_dir):
                        tar.add(s_dir, arcname=s_dir)
                    else:
                        self.logger.warning(f"Source directory {s_dir} not found, skipping.")
            
            self.logger.info(f"Backup completed: {os.path.getsize(backup_filename) / 1024:.2f} KB")
            
            # Enforce retention policy
            self._cleanup_old_backups()
            return backup_filename
            
        except Exception as e:
            self.logger.error(f"Backup failed: {e}")
            return None
            
    def _cleanup_old_backups(self):
        """Removes old backups based on retention policy"""
        backups = sorted([os.path.join(self.backup_dir, f) for f in os.listdir(self.backup_dir) if f.endswith(".tar.gz")])
        if len(backups) > self.max_backups:
            to_delete = backups[:-self.max_backups]
            for b in to_delete:
                os.remove(b)
                self.logger.info(f"Deleted old backup: {b}")

    def verify_integrity(self, backup_path):
        """Verifies the integrity of a backup archive"""
        try:
            with tarfile.open(backup_path, "r:gz") as tar:
                return tar.getmembers() is not None
        except Exception:
            return False

    def get_latest_backup(self):
        """Returns the path to the most recent backup"""
        backups = sorted([os.path.join(self.backup_dir, f) for f in os.listdir(self.backup_dir) if f.endswith(".tar.gz")])
        return backups[-1] if backups else None
