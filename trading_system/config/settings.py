import os
import logging
from typing import Dict, Any

class Settings:
    """
    Unified settings for the Global Trading Terminal.
    Loads from environment variables with sensible defaults.
    """
    # System
    PROJECT_NAME: str = "Global Trading Terminal"
    VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 5000))
    API_BASE_URL: str = os.getenv("API_BASE_URL", f"http://{API_HOST}:{API_PORT}/api")
    
    API_CONFIG: Dict[str, Any] = {
        'base_url': API_BASE_URL,
        'rate_limit': 1
    }
    
    # Brokers
    ALPACA_API_KEY: str = os.getenv("ALPACA_API_KEY", "YOUR_KEY_HERE")
    ALPACA_SECRET_KEY: str = os.getenv("ALPACA_SECRET_KEY", "YOUR_SECRET_HERE")
    ALPACA_PAPER: bool = True
    
    IB_HOST: str = os.getenv("IB_HOST", "127.0.0.1")
    IB_PORT: int = int(os.getenv("IB_PORT", 7497))
    IB_CLIENT_ID: int = int(os.getenv("IB_CLIENT_ID", 1))
    
    # Risk
    MAX_DAILY_LOSS: float = 2000.0
    MAX_DRAWDOWN: float = 0.15
    CIRCUIT_BREAKER_ENABLED: bool = True
    
    # Market Data
    YFINANCE_ENABLED: bool = True
    CCXT_ENABLED: bool = True
    BINANCE_API_KEY: str = os.getenv("BINANCE_API_KEY", "")
    BINANCE_SECRET_KEY: str = os.getenv("BINANCE_SECRET_KEY", "")
    
    # Compliance & Recovery
    COMPLIANCE_CONFIG: Dict[str, Any] = {
        'audit_storage': 'trading_system/audit_trail',
        'retention_days': 365
    }
    
    RECOVERY_CONFIG: Dict[str, Any] = {
        'primary_region': 'us-east-1',
        'secondary_region': 'us-west-2',
        'backup_interval_seconds': 1800
    }

settings = Settings()
