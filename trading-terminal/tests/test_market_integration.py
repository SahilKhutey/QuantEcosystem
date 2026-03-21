import unittest
import asyncio
import logging
from datetime import datetime, timedelta
import sys
import os

# Add root directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.market_integration import MarketIntegrationService
from services.data.market_data_service import MarketDataService
from config.settings import API_KEYS

class TestMarketIntegrationService(unittest.TestCase):
    """Test Market Integration Service with real market data"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test class with services"""
        logging.basicConfig(level=logging.INFO)
        cls.logger = logging.getLogger('TestMarketIntegration')
        market_data = MarketDataService(API_KEYS)
        cls.market_integration = MarketIntegrationService(market_data)
    
    def test_market_regions_loading(self):
        """Test global market regions are properly loaded"""
        self.assertGreaterEqual(len(self.market_integration.regions), 8)
        self.assertIn('united_states', self.market_integration.regions)
        self.assertIn('europe', self.market_integration.regions)
        self.assertIn('india', self.market_integration.regions)
    
    def test_market_hours_logic(self):
        """Test market open/close detection logic (stub)"""
        region = self.market_integration.regions['united_states']
        # US market is open 9:30-16:00
        # This is a unit test for the logic, not current time
        self.assertTrue(hasattr(self.market_integration, '_is_market_open'))

    def test_sentiment_analysis_logic(self):
        """Test sentiment scoring algorithm"""
        score = self.market_integration._analyze_article_sentiment("strong growth rally positive")
        self.assertGreater(score, 0)
        
        score = self.market_integration._analyze_article_sentiment("weak decline recession sell")
        self.assertLess(score, 0)
        
        score = self.market_integration._analyze_article_sentiment("neutral news report today")
        self.assertEqual(score, 0)

    def test_correlation_matrix_structure(self):
        """Test correlation matrix calculation structure (stub)"""
        self.assertTrue(hasattr(self.market_integration, 'get_market_correlation'))

if __name__ == '__main__':
    unittest.main(verbosity=2)
