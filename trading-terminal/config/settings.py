import os
from dotenv import load_dotenv

load_dotenv()

API_KEYS = {
    'alpaca_key': os.getenv('ALPACA_API_KEY', 'YOUR_ALPACA_KEY'),
    'alpaca_secret': os.getenv('ALPACA_API_SECRET', 'YOUR_ALPACA_SECRET'),
    'alpha_vantage': os.getenv('ALPHA_VANTAGE_KEY', 'YOUR_ALPHA_VANTAGE_KEY'),
    'federal_reserve': os.getenv('FRED_API_KEY', 'YOUR_FRED_KEY'),
    'news_api': os.getenv('NEWS_API_KEY', 'YOUR_NEWS_KEY'),
    'secret_key': os.getenv('JWT_SECRET_KEY', 'institutional-grade-secret-key-2026')
}
