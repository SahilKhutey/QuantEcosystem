import os
import tarfile
import shutil
import sys
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SystemRestore")

def restore_latest_backup(backup_dir="backups", target_dir="."):
    """Restores the system state from the latest available backup"""
    if not os.path.exists(backup_dir):
        logger.error(f"Backup directory {backup_dir} not found.")
        return False
        
    backups = sorted([os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.endswith(".tar.gz")])
    if not backups:
        logger.error("No backups found to restore.")
        return False
        
    latest_backup = backups[-1]
    logger.info(f"Restoring from: {latest_backup}")
    
    try:
        # Emergency backup of current state before restoration
        emergency_backup = f"emergency_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tar.gz"
        logger.info(f"Creating emergency backup of current state: {emergency_backup}")
        with tarfile.open(emergency_backup, "w:gz") as tar:
            for d in ["logs", "data", "config"]:
                if os.path.exists(d):
                    tar.add(d)
        
        # Clearing current state
        for d in ["logs", "data", "config"]:
            if os.path.exists(d):
                shutil.rmtree(d)
                logger.info(f"Cleared existing {d} directory.")
        
        # Extracting backup
        with tarfile.open(latest_backup, "r:gz") as tar:
            tar.extractall(path=target_dir)
            
        logger.info("System restoration successful.")
        return True
        
    except Exception as e:
        logger.error(f"Restoration failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--confirm":
        restore_latest_backup()
    else:
        print("Usage: python restore_system.py --confirm")
        print("WARNING: This will overwrite current logs, data, and config directories.")
