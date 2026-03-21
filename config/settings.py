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
