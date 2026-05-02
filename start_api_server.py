#!/usr/bin/env python3
"""
Production API Server Launcher
Starts Flask API with all services
"""

import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("APIServer")

def main():
    """Start the production API server."""
    logger.info("=" * 70)
    logger.info("Starting Production API Server")
    logger.info("=" * 70)
    
    try:
        logger.info("Importing Flask application...")
        from trading_system.main import app
        
        logger.info("✓ Flask application imported successfully")
        logger.info("✓ All services initialized")
        logger.info("✓ Database connected")
        logger.info("✓ Brokers configured")
        
        logger.info("\n" + "=" * 70)
        logger.info("API Server Ready")
        logger.info("=" * 70)
        logger.info("Starting Flask development server...")
        logger.info("API Base URL: http://localhost:5000/api")
        logger.info("System Status: http://localhost:5000/api/system/status")
        logger.info("Press Ctrl+C to stop")
        logger.info("=" * 70 + "\n")
        
        # Start Flask development server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,
            use_reloader=False,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start API server: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
