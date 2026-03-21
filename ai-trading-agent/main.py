import subprocess
import sys
import os
from loguru import logger

def run_dashboard():
    """Launch the Streamlit dashboard."""
    dashboard_path = os.path.join("dashboard", "realtime_dashboard.py")
    if not os.path.exists(dashboard_path):
        logger.error(f"Dashboard file not found at {dashboard_path}")
        return

    logger.info("Launching AI Trading Agent Dashboard...")
    try:
        subprocess.run(["streamlit", "run", dashboard_path], check=True)
    except KeyboardInterrupt:
        logger.info("Dashboard stopped by user.")
    except Exception as e:
        logger.error(f"Failed to launch dashboard: {e}")

if __name__ == "__main__":
    run_dashboard()
