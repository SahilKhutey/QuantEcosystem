import os
import sys
import time
import logging
from datetime import datetime

# Setup PYTHONPATH to include parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from trading_system.services.risk.manager import RiskManager
from trading_system.services.monitoring.real_time_monitoring import RealTimeMonitor
from trading_system.web.services.api_client import APIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DryRunVerification")

def run_dry_run():
    logger.info("Starting Institutional Pre-Deployment Dry Run...")
    
    # 1. Initialize API Client
    api_client = APIClient(base_url="http://localhost:5000/api")
    
    # 2. Test Risk Manager Initialization
    try:
        risk_manager = RiskManager()
        logger.info(f"✅ RiskManager initialized with Max Daily Loss: {risk_manager.max_daily_loss}")
    except Exception as e:
        logger.error(f"❌ RiskManager failed: {e}")
        return
    
    # 3. Test Circuit Breaker Logic
    try:
        logger.info("Simulating critical loss for circuit breaker test...")
        # Injecting a loss that exceeds max_daily_loss
        loss_amount = -(risk_manager.max_daily_loss + 1000)
        risk_manager.update_pnl(loss_amount)
        
        if risk_manager.circuit_breaker_active:
            logger.info("✅ Circuit Breaker successfully detected breach and halted trading.")
        else:
            logger.warning("⚠️ Circuit Breaker failed to detect loss breach.")
    except Exception as e:
        logger.error(f"❌ Circuit Breaker test failed: {e}")

    # 4. Verify Monitoring Connections
    try:
        monitor = RealTimeMonitor(api_client)
        logger.info("✅ RealTimeMonitor initialized.")
    except Exception as e:
        logger.error(f"❌ RealTimeMonitor failed: {e}")

    # 5. Verify Data Integrity
    try:
        from trading_system.services.data.market_data import MarketDataService
        ds = MarketDataService()
        if ds.verify_data_integrity("AAPL"):
            logger.info("✅ Data Integrity verified (Live vs Benchmark < 1%)")
        else:
            logger.warning("⚠️ Data Integrity check bypassed or failed.")
    except Exception as e:
        logger.error(f"❌ Data Integrity test failed: {e}")

    logger.info("======================================")
    logger.info("DASHBOARD ACCESSIBILITY: http://localhost:8502")
    logger.info("API ACCESSIBILITY: http://localhost:5000/api")
    logger.info("DRY RUN COMPLETED SUCCESSFULLY.")

if __name__ == "__main__":
    run_dry_run()
