import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from data_engine.market_data.yahoo_finance import YahooFinanceAPI
from data_engine.market_data.alpha_vantage import AlphaVantageAPI
from data_engine.geopolitics.gdelt import GDELTAPI
from data_engine.data_storage import DataStorage
from data_engine.data_processors import (
    PriceProcessor,
    NewsProcessor,
    MacroProcessor,
    AlternativeDataProcessor
)

class DataAggregator:
    """Aggregates data from multiple sources into a unified format"""
    
    def __init__(self, api_keys: Dict):
        self.logger = logging.getLogger('DataAggregator')
        self.data_storage = DataStorage()
        self.price_processor = PriceProcessor()
        self.news_processor = NewsProcessor()
        self.macro_processor = MacroProcessor()
        self.alt_data_processor = AlternativeDataProcessor()
        
        # Initialize data sources
        self.sources = {
            'yahoo_finance': YahooFinanceAPI(),
            'alpha_vantage': AlphaVantageAPI(api_keys.get('alpha_vantage')),
            'gdelt': GDELTAPI()
        }
    
    def get_market_data(self, 
                      symbol: str,
                      asset_type: str = 'stocks',
                      start: Optional[str] = None,
                      end: Optional[str] = None,
                      timeframe: str = '1D') -> pd.DataFrame:
        """Get market data from multiple sources and aggregate"""
        # First check if we have cached data
        cached_data = self.data_storage.get_market_data(symbol, start, end, timeframe)
        
        if not cached_data.empty:
            self.logger.info(f"Found {len(cached_data)} cached data points for {symbol}")
            return cached_data
        
        # If no cache, fetch from sources
        all_data = []
        
        # Try Yahoo Finance first
        if 'yahoo_finance' in self.sources:
            yf_data = self.sources['yahoo_finance'].get_historical_data(
                symbol=symbol,
                start=start,
                end=end,
                period=timeframe
            )
            
            if not yf_data.empty:
                all_data.append(yf_data)
        
        # If Yahoo Finance didn't provide enough data, try Alpha Vantage
        if len(all_data) == 0 or len(all_data[0]) < 10:
            if 'alpha_vantage' in self.sources:
                av_data = self.sources['alpha_vantage'].get_historical_data(
                    symbol=symbol,
                    asset_type=asset_type,
                    timeframe=timeframe,
                    start=start,
                    end=end
                )
                
                if not av_data.empty:
                    all_data.append(av_data)
        
        # Combine data from multiple sources
        if all_data:
            # Standardize and combine
            combined = pd.concat(all_data, ignore_index=True)
            
            # Remove duplicates (keep most recent)
            combined = combined.sort_values('timestamp', ascending=False)
            combined = combined.drop_duplicates(subset=['timestamp'], keep='first')
            combined = combined.sort_values('timestamp')
            
            # Store in cache
            self._store_market_data(combined)
            
            return combined
        
        return pd.DataFrame()
    
    def get_news_data(self, 
                     query: str = "market",
                     start_date: str = None,
                     end_date: str = None,
                     max_results: int = 100) -> List[Dict]:
        """Get news data from multiple sources and aggregate"""
        # Check cache first
        cached_news = self.data_storage.get_news_data(
            query=query,
            start_date=start_date,
            end_date=end_date
        )
        
        if cached_news:
            self.logger.info(f"Found {len(cached_news)} cached news articles")
            return cached_news
        
        # Get news from GDELT
        gdelt_news = []
        if 'gdelt' in self.sources:
            events = self.sources['gdelt'].get_events(
                query=query,
                start_date=start_date,
                end_date=end_date,
                max_results=max_results
            )
            
            # Process GDELT events into news format
            for event in events:
                news_item = {
                    'title': event['title'],
                    'description': event.get('description', ''),
                    'content': event.get('content', ''),
                    'url': event['url'],
                    'source': event['source'],
                    'author': event.get('author', ''),
                    'published_at': event['seendate'],
                    'image': event.get('socialimage', ''),
                    'category': event.get('category', 'general'),
                    'sentiment_score': event.get('sentiment_score', 0),
                    'region': self._determine_region(event),
                    'symbols': self._extract_symbols(event)
                }
                gdelt_news.append(news_item)
        
        # Get news from other sources (in production, add more)
        
        # Store in cache
        if gdelt_news:
            self._store_news_data(gdelt_news)
        
        return gdelt_news
    
    def get_economic_data(self, 
                         indicator: str,
                         start_date: str = None,
                         end_date: str = None) -> pd.DataFrame:
        """Get economic data from multiple sources and aggregate"""
        # Check cache first
        cached_data = self.data_storage.get_economic_data(
            indicator=indicator,
            start_date=start_date,
            end_date=end_date
        )
        
        if not cached_data.empty:
            self.logger.info(f"Found {len(cached_data)} cached economic data points")
            return cached_data
        
        # In production, integrate with FRED, World Bank, etc.
        # For demonstration, return empty DataFrame
        return pd.DataFrame()
    
    def get_alternative_data(self, 
                           data_type: str,
                           start_date: str = None,
                           end_date: str = None) -> List[Dict]:
        """Get alternative data from multiple sources"""
        # This would integrate with satellite, shipping, and other alternative data sources
        return []
    
    def get_global_market_view(self) -> Dict:
        """Get comprehensive global market view"""
        # This would combine all data sources into a unified view
        # For demonstration, return mock data
        return {
            'timestamp': datetime.now().isoformat(),
            'market_status': {
                'us_stocks': 'bullish',
                'europe': 'moderate',
                'asia': 'volatile',
                'emerging_markets': 'weak'
            },
            'news_sentiment': {
                'global': 0.2,
                'us': 0.3,
                'europe': 0.1,
                'asia': -0.1
            },
            'economic_indicators': {
                'gdp': 0.8,
                'inflation': -0.5,
                'unemployment': -0.3,
                'interest_rates': 0.2
            },
            'correlation_matrix': {
                'us_europe': 0.85,
                'us_asia': 0.65,
                'europe_asia': 0.75
            }
        }
    
    def _store_market_data(self, data: pd.DataFrame):
        """Store market data in the database"""
        try:
            # Convert DataFrame to list of dictionaries
            data_list = data.to_dict('records')
            
            # Store in database
            count = self.data_storage.store_market_data(data_list)
            
            self.logger.info(f"Stored {count} market data points")
        except Exception as e:
            self.logger.error(f"Error storing market data: {str(e)}")
    
    def _store_news_data(self, data: List[Dict]):
        """Store news data in the database"""
        try:
            # Process news data
            processed = self.news_processor.process_news(data)
            
            # Store in database
            count = self.data_storage.store_news_data(processed)
            
            self.logger.info(f"Stored {count} news articles")
        except Exception as e:
            self.logger.error(f"Error storing news data: {str(e)}")
    
    def _determine_region(self, event: Dict) -> str:
        """Determine region for a GDELT event"""
        # In production, use NLP to determine region
        # For demonstration, return a simple heuristic
        locations = event.get('locations', [])
        
        for location in locations:
            if 'United States' in location.get('name', ''):
                return 'North America'
            if 'China' in location.get('name', '') or 'Japan' in location.get('name', ''):
                return 'Asia'
            if 'Germany' in location.get('name', '') or 'France' in location.get('name', ''):
                return 'Europe'
        
        return 'Global'
    
    def _extract_symbols(self, event: Dict) -> List[str]:
        """Extract relevant stock symbols from an event"""
        # In production, use NLP to extract symbols
        # For demonstration, return a simple heuristic
        symbols = []
        
        # Check themes for company names
        for theme in event.get('themes', []):
            if 'APPLE' in theme or 'AAPL' in theme:
                symbols.append('AAPL')
            if 'MICROSOFT' in theme or 'MSFT' in theme:
                symbols.append('MSFT')
            if 'GOOGLE' in theme or 'GOOGL' in theme:
                symbols.append('GOOGL')
            if 'AMAZON' in theme or 'AMZN' in theme:
                symbols.append('AMZN')
            if 'TSLA' in theme or 'TESLA' in theme:
                symbols.append('TSLA')
        
        # Check for specific stock symbols
        for org in event.get('organizations', []):
            if org in ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']:
                symbols.append(org)
        
        return list(set(symbols))
    
    def get_market_impact(self, news: Dict) -> Dict:
        """Analyze market impact of news"""
        return self.news_processor.analyze_news_impact(news)
    
    def get_sector_performance(self, region: str = None) -> Dict:
        """Get sector performance data"""
        # In production, this would analyze market data by sector
        # For demonstration, return mock data
        return {
            'technology': {'change': 2.5, 'status': 'bullish'},
            'financials': {'change': 1.2, 'status': 'moderate'},
            'energy': {'change': -0.8, 'status': 'bearish'},
            'healthcare': {'change': 0.5, 'status': 'neutral'},
            'consumer': {'change': 1.8, 'status': 'bullish'}
        }
