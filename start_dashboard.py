#!/usr/bin/env python3
"""
Production Dashboard Launcher
Starts Streamlit trading terminal
"""

import sys
import os
import logging
import subprocess

logger = logging.getLogger("DashboardServer")

def main():
    """Start the production dashboard."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    logger.info("=" * 70)
    logger.info("Starting Production Dashboard")
    logger.info("=" * 70)
    
    try:
        logger.info("Launching Streamlit dashboard...")
        logger.info("Dashboard URL: http://localhost:8501")
        logger.info("Press Ctrl+C to stop")
        logger.info("=" * 70 + "\n")
        
        # Start Streamlit
        subprocess.run([
            sys.executable,
            "-m",
            "streamlit",
            "run",
            "trading_system/web/trading_terminal.py",
            "--logger.level=info"
        ])
        
    except Exception as e:
        logger.error(f"Failed to start dashboard: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
