# config/settings.py
import os

# API Keys for data sources
API_KEYS = {
    'alpha_vantage': os.environ.get('ALPHA_VANTAGE_API_KEY', 'demo_key'),
    'news_api': os.environ.get('NEWS_API_KEY', 'demo_key'),
    'fred_api': os.environ.get('FRED_API_KEY', 'demo_key')
}

# Pipeline settings
UPDATE_INTERVAL = 60 # seconds
STORAGE_PATH = "data/financial_data.db"

# Alerting Configuration
ALERT_CONFIG = {
    'channels': ['email', 'sms'],
    'cooldown_minutes': 15,
    'severity_levels': ['info', 'warning', 'critical']
}

# Recovery Configuration
RECOVERY_CONFIG = {
    'primary_region': os.environ.get('PRIMARY_REGION', 'us-east-1'),
    'secondary_region': os.environ.get('SECONDARY_REGION', 'us-west-2'),
    'failover_threshold': 5,
    'max_failover_duration': 15,
    'backup_retention': 30,
    'rpo': 300,  # 5 minutes
    'rto': 300   # 5 minutes
}

# Compliance Configuration
COMPLIANCE_CONFIG = {
    'audit_storage': 'data/audit_trail',
    'retention_days': 365,
    'system_version': '1.1.0',
    'environment': os.environ.get('ENV', 'production')
}
