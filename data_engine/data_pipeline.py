import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from data_engine.data_aggregator import DataAggregator
from data_engine.data_storage import DataStorage
from data_engine.data_processors import (
    PriceProcessor,
    NewsProcessor,
    MacroProcessor,
    AlternativeDataProcessor
)

class DataPipeline:
    """Real-time data pipeline for financial data"""
    
    def __init__(self, api_keys: Dict, update_interval: int = 60):
        self.logger = logging.getLogger('DataPipeline')
        self.aggregator = DataAggregator(api_keys)
        self.storage = DataStorage()
        self.update_interval = update_interval
        self.running = False
        self.last_update = 0
    
    def start(self):
        """Start the data pipeline"""
        self.logger.info(f"Starting data pipeline with {self.update_interval} second update interval")
        self.running = True
        
        # Initial update
        self._update()
        
        # Start update loop
        while self.running:
            current_time = time.time()
            
            # Check if it's time for an update
            if current_time - self.last_update >= self.update_interval:
                self._update()
            
            time.sleep(1)
    
    def stop(self):
        """Stop the data pipeline"""
        self.running = False
        self.logger.info("Data pipeline stopped")
    
    def _update(self):
        """Perform a data update cycle"""
        self.last_update = time.time()
        self.logger.info("Starting data update cycle")
        
        try:
            # Update market data for major indices
            self._update_market_data()
            
            # Update news data
            self._update_news_data()
            
            # Update economic data
            self._update_economic_data()
            
            # Update alternative data
            self._update_alternative_data()
            
            self.logger.info("Data update cycle completed successfully")
        except Exception as e:
            self.logger.error(f"Error during data update: {str(e)}")
    
    def _update_market_data(self):
        """Update market data for major assets"""
        major_assets = [
            {'symbol': 'AAPL', 'asset_type': 'stocks'},
            {'symbol': 'MSFT', 'asset_type': 'stocks'},
            {'symbol': 'TSLA', 'asset_type': 'stocks'},
            {'symbol': 'SPY', 'asset_type': 'etf'},
            {'symbol': '^GSPC', 'asset_type': 'indices'},
            {'symbol': 'EURUSD', 'asset_type': 'forex'},
            {'symbol': 'BTCUSD', 'asset_type': 'crypto'}
        ]
        
        for asset in major_assets:
            try:
                data = self.aggregator.get_market_data(
                    symbol=asset['symbol'],
                    asset_type=asset['asset_type'],
                    start=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                    end=datetime.now().strftime("%Y-%m-%d"),
                    timeframe='1D'
                )
                
                if not data.empty:
                    self.logger.info(f"Updated {asset['symbol']} data with {len(data)} points")
                else:
                    self.logger.warning(f"No data received for {asset['symbol']}")
            except Exception as e:
                self.logger.error(f"Error updating {asset['symbol']}: {str(e)}")
    
    def _update_news_data(self):
        """Update news data"""
        try:
            # Get top news
            news = self.aggregator.get_news_data(
                query="market",
                max_results=50
            )
            
            self.logger.info(f"Updated with {len(news)} news articles")
        except Exception as e:
            self.logger.error(f"Error updating news data: {str(e)}")
    
    def _update_economic_data(self):
        """Update economic data"""
        try:
            # Get major economic indicators
            indicators = ['GDP', 'CPIAUCSL', 'UNRATE', 'FEDFUNDS']
            
            for indicator in indicators:
                try:
                    data = self.aggregator.get_economic_data(
                        indicator=indicator,
                        start_date=(datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
                        end_date=datetime.now().strftime("%Y-%m-%d")
                    )
                    
                    if not data.empty:
                        self.logger.info(f"Updated {indicator} with {len(data)} data points")
                except Exception as e:
                    self.logger.error(f"Error updating {indicator}: {str(e)}")
        except Exception as e:
            self.logger.error(f"Error updating economic data: {str(e)}")
    
    def _update_alternative_data(self):
        """Update alternative data"""
        try:
            # In production, this would integrate with alternative data sources
            # For demonstration, log a message
            self.logger.info("Alternative data update (mock)")
        except Exception as e:
            self.logger.error(f"Error updating alternative data: {str(e)}")
    
    def get_market_insights(self) -> Dict:
        """Get market insights from processed data"""
        return {
            'global_market_status': self._get_global_market_status(),
            'sector_performance': self.aggregator.get_sector_performance(),
            'top_opportunities': self._get_top_opportunities(),
            'market_sentiment': self._get_market_sentiment()
        }
    
    def _get_global_market_status(self) -> Dict:
        """Get global market status from processed data"""
        # In production, this would analyze market data across regions
        return {
            'us_stocks': 'bullish',
            'europe': 'moderate',
            'asia': 'volatile',
            'emerging_markets': 'weak',
            'global_sentiment': 'bullish'
        }
    
    def _get_top_opportunities(self) -> List[Dict]:
        """Get top trading opportunities"""
        # In production, this would analyze news impact and market data
        return [
            {
                'asset': 'AAPL',
                'sector': 'technology',
                'recommendation': 'BUY',
                'confidence': 0.85,
                'reason': 'Strong earnings report with positive guidance',
                'impact_score': 0.9,
                'expected_return': 0.12
            },
            {
                'asset': 'TSLA',
                'sector': 'technology',
                'recommendation': 'SELL',
                'confidence': 0.78,
                'reason': 'Competition increasing in EV market',
                'impact_score': 0.8,
                'expected_return': -0.15
            }
        ]
    
    def _get_market_sentiment(self) -> Dict:
        """Get market sentiment from news and social data"""
        # In production, this would analyze news and social media data
        return {
            'global': 0.2,
            'us': 0.3,
            'europe': 0.1,
            'asia': -0.1,
            'technology': 0.35,
            'financials': 0.15,
            'energy': -0.2
        }
