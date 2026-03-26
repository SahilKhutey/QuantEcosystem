import streamlit as st
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# App Configuration
APP_NAME = "Trading Terminal"
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api")
DEFAULT_TICKER = "AAPL"
REFRESH_INTERVAL = 5  # seconds

# Theme Configuration
THEME = {
    "primaryColor": "#00FFA3",
    "backgroundColor": "#0E1117",
    "secondaryBackgroundColor": "#262730",
    "textColor": "#FAFAFA"
}
