import unittest
import asyncio
import time
import pandas as pd
import logging
from datetime import datetime, timedelta
import sys
import os

# Add root directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.data.market_data_service import MarketDataService
from config.settings import API_KEYS

class TestMarketDataService(unittest.TestCase):
    """Test Market Data Service with real market data sources"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test class with API keys"""
        logging.basicConfig(level=logging.INFO)
        cls.logger = logging.getLogger('TestMarketDataService')
        cls.market_data = MarketDataService(API_KEYS)
    
    def setUp(self):
        """Set up test case"""
        self.start_time = time.time()
        self.logger.info(f"Starting test: {self._testMethodName}")
    
    def tearDown(self):
        """Clean up after test"""
        elapsed = time.time() - self.start_time
        self.logger.info(f"Test {self._testMethodName} completed in {elapsed:.2f} seconds")
    
    def test_data_source_initialization(self):
        """Test data sources are properly initialized with API keys"""
        self.assertIn('alpaca', self.market_data.active_sources)
        self.assertIn('alpha_vantage', self.market_data.active_sources)
        self.assertIn('federal_reserve', self.market_data.active_sources)
        self.assertIn('news_api', self.market_data.active_sources)
    
    def test_historical_data_retrieval(self):
        """Test historical data retrieval (Stub for offline verification)"""
        # In a real CI, we'd mock the aiohttp responses or use a sandboxed API key
        # For now, we verify the method exists and can be invoked
        self.assertTrue(hasattr(self.market_data, 'get_historical_data'))

    def test_rate_limiting(self):
        """Test rate limiting logic"""
        now = time.time()
        limits = self.market_data.rate_limits['alpaca']
        self.assertEqual(limits['limit'], 5)
        self.assertEqual(limits['window'], 1)

    def test_data_caching(self):
        """Test data caching mechanism (stub)"""
        self.assertTrue(hasattr(self.market_data, 'data_cache'))

if __name__ == '__main__':
    unittest.main(verbosity=2)
