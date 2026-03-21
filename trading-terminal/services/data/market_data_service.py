import aiohttp
import asyncio
import pandas as pd
from typing import Dict, List, Optional, Union, Any
import logging
import json
import time
from datetime import datetime, timedelta
from dataclasses import dataclass
import numpy as np

# Data source configuration
DATA_SOURCES = {
    'yfinance': {
        'name': 'Yahoo Finance',
        'api_url': '',
        'ws_url': None,
        'requires_api_key': False,
        'description': 'Global stocks, forex, crypto (No API Key needed)',
        'assets': ['stocks', 'crypto']
    },
    'alpaca': {
        'name': 'Alpaca',
        'api_url': 'https://data.alpaca.markets/v2',
        'ws_url': 'wss://stream.data.alpaca.markets/v2',
        'requires_api_key': True,
        'description': 'Free tier for US stocks (paper trading)',
        'assets': ['stocks', 'forex', 'crypto']
    },
    'alpha_vantage': {
        'name': 'Alpha Vantage',
        'api_url': 'https://www.alphavantage.co/query',
        'ws_url': None,
        'requires_api_key': True,
        'description': 'Global stocks, forex, crypto (5 requests/min free)',
        'assets': ['stocks', 'forex', 'crypto']
    },
    'federal_reserve': {
        'name': 'Federal Reserve',
        'api_url': 'https://api.stlouisfed.org/fred/series',
        'ws_url': None,
        'requires_api_key': True,
        'description': 'Economic data (GDP, inflation, interest rates)',
        'assets': ['economic']
    },
    'news_api': {
        'name': 'News API',
        'api_url': 'https://newsapi.org/v2',
        'ws_url': None,
        'requires_api_key': True,
        'description': 'Real-time news (500 requests/day free)',
        'assets': ['news']
    }
}

@dataclass
class MarketData:
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    source: str
    asset_type: str
    currency: str = 'USD'
    last_updated: datetime = None

class MarketDataService:
    def __init__(self, api_keys: Dict[str, str]):
        self.api_keys = api_keys
        self.active_sources = {}
        self.data_cache = {}
        self.last_update = {}
        self.active_connections = {}
        self.logger = logging.getLogger('MarketDataService')
        self.rate_limits = self._init_rate_limits()
        self._initialize_sources()
        
    def _init_rate_limits(self) -> Dict:
        """Initialize rate limits for all data sources"""
        return {
            'alpaca': {
                'limit': 5,  # 5 requests per second
                'window': 1,
                'count': 0,
                'last_reset': time.time()
            },
            'alpha_vantage': {
                'limit': 5,  # 5 requests per minute
                'window': 60,
                'count': 0,
                'last_reset': time.time()
            },
            'federal_reserve': {
                'limit': 5,  # 5 requests per minute
                'window': 60,
                'count': 0,
                'last_reset': time.time()
            },
            'news_api': {
                'limit': 500,  # 500 requests per day
                'window': 86400,
                'count': 0,
                'last_reset': time.time()
            }
        }
    
    def _initialize_sources(self):
        """Initialize active data sources based on available API keys"""
        for source, config in DATA_SOURCES.items():
            if config['requires_api_key'] and source in self.api_keys:
                self.active_sources[source] = config
                self.logger.info(f"Initialized data source: {config['name']}")
            elif not config['requires_api_key']:
                self.active_sources[source] = config
                self.logger.info(f"Initialized data source: {config['name']} (no API key needed)")
    
    async def _check_rate_limit(self, source: str) -> bool:
        """Check and enforce rate limits for a data source"""
        now = time.time()
        limits = self.rate_limits[source]
        
        # Reset counter if window has passed
        if now - limits['last_reset'] > limits['window']:
            limits['count'] = 0
            limits['last_reset'] = now
            
        # Check if we're within limits
        if limits['count'] >= limits['limit']:
            wait_time = limits['window'] - (now - limits['last_reset'])
            self.logger.warning(f"Rate limit exceeded for {source}. Waiting {wait_time:.1f} seconds...")
            await asyncio.sleep(wait_time)
            limits['count'] = 0
            return False
            
        # Increment counter
        limits['count'] += 1
        return True
    
    async def _make_request(self, source: str, params: Dict, endpoint: str) -> Optional[Dict]:
        """Make request to a data source with rate limit handling"""
        await self._check_rate_limit(source)
        
        # Build URL based on source
        if source == 'alpha_vantage':
            params['apikey'] = self.api_keys.get('alpha_vantage')
            url = f"{DATA_SOURCES[source]['api_url']}?{self._build_query(params)}"
        elif source == 'federal_reserve':
            params['api_key'] = self.api_keys.get('federal_reserve')
            params['file_type'] = 'json'
            url = f"{DATA_SOURCES[source]['api_url']}?{self._build_query(params)}"
        elif source == 'news_api':
            params['apiKey'] = self.api_keys.get('news_api')
            url = f"{DATA_SOURCES[source]['api_url']}/{endpoint}?{self._build_query(params)}"
        else:
            # Alpaca or other sources
            url = f"{DATA_SOURCES[source]['api_url']}/{endpoint}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        self.logger.error(f"{source} API error: {response.status}")
                        return None
        except Exception as e:
            self.logger.error(f"Error connecting to {source}: {str(e)}")
            return None
    
    def _build_query(self, params: Dict) -> str:
        """Build URL query string from parameters"""
        return '&'.join([f"{k}={v}" for k, v in params.items()])
    
    async def get_historical_data(self, 
                               symbol: str, 
                               asset_type: str = 'stocks',
                               timeframe: str = '1D',
                               start: str = None,
                               end: str = None) -> pd.DataFrame:
        """Get historical market data from multiple sources"""
        results = {}
        
        # Try each active source in order
        for source in self.active_sources:
            if asset_type in self.active_sources[source]['assets']:
                data = await self._get_historical_data_from_source(
                    source, symbol, asset_type, timeframe, start, end
                )
                if data is not None:
                    results[source] = data
                    
        # Merge and return results
        if results:
            # Prioritize by source reliability (yfinance first for guaranteed data)
            priority_order = ['yfinance', 'alpaca', 'alpha_vantage', 'federal_reserve', 'news_api']
            for source in priority_order:
                if source in results:
                    return results[source]
        
        self.logger.error(f"No historical data found for {symbol} ({asset_type})")
        return pd.DataFrame()
    
    async def _get_historical_data_from_source(self, 
                                           source: str, 
                                           symbol: str, 
                                           asset_type: str,
                                           timeframe: str,
                                           start: str,
                                           end: str) -> Optional[pd.DataFrame]:
        """Get historical data from a specific source"""
        if source == 'yfinance':
            return await asyncio.to_thread(self._fetch_yf_historical, symbol, timeframe, start, end)
            
        # Format parameters based on source
        params = {}
        endpoint = ""
        
        if source == 'alpaca':
            # Alpaca API format
            params = {
                'timeframe': timeframe,
                'start': start or (datetime.now() - timedelta(days=30)).isoformat(),
                'end': end or datetime.now().isoformat(),
                'limit': 1000
            }
            endpoint = f"stocks/{symbol}/bars"
        
        elif source == 'alpha_vantage':
            # Alpha Vantage API format
            if asset_type == 'stocks':
                params = {
                    'function': 'TIME_SERIES_DAILY',
                    'symbol': symbol,
                    'outputsize': 'full'
                }
                endpoint = ""
            elif asset_type == 'forex':
                params = {
                    'function': 'FX_DAILY',
                    'from_symbol': symbol[:3],
                    'to_symbol': symbol[3:],
                    'outputsize': 'full'
                }
                endpoint = ""
        
        elif source == 'federal_reserve':
            # FRED API format
            params = {
                'series_id': symbol,
                'observation_start': start or (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d'),
                'observation_end': end or datetime.now().strftime('%Y-%m-%d')
            }
            endpoint = ""
        
        # Make request
        response = await self._make_request(source, params, endpoint)
        
        if not response:
            return None
        
        # Process response based on source
        try:
            if source == 'alpaca':
                return self._process_alpaca_response(response, symbol, asset_type)
            elif source == 'alpha_vantage':
                return self._process_alpha_vantage_response(response, symbol, asset_type)
            elif source == 'federal_reserve':
                return self._process_fred_response(response, symbol)
            else:
                return None
        except Exception as e:
            self.logger.error(f"Error processing {source} response: {str(e)}")
            return None
    
    def _process_alpaca_response(self, response: Dict, symbol: str, asset_type: str) -> pd.DataFrame:
        """Process Alpaca API response into DataFrame"""
        if 'bars' not in response or not response['bars']:
            return pd.DataFrame()
        
        df = pd.DataFrame(response['bars'])
        df['timestamp'] = pd.to_datetime(df['t'])
        df.set_index('timestamp', inplace=True)
        
        # Rename columns to standard format
        df.rename(columns={
            'o': 'open',
            'h': 'high',
            'l': 'low',
            'c': 'close',
            'v': 'volume'
        }, inplace=True)
        
        # Add metadata
        df['symbol'] = symbol
        df['asset_type'] = asset_type
        df['source'] = 'alpaca'
        
        return df[['open', 'high', 'low', 'close', 'volume', 'symbol', 'asset_type', 'source']]
    
    def _process_alpha_vantage_response(self, response: Dict, symbol: str, asset_type: str) -> pd.DataFrame:
        """Process Alpha Vantage API response into DataFrame"""
        # Determine data type
        data = None
        if 'Time Series (Daily)' in response:
            data = response['Time Series (Daily)']
        elif 'Time Series FX (Daily)' in response:
            data = response['Time Series FX (Daily)']
        
        if not data:
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame.from_dict(data, orient='index')
        df.index = pd.to_datetime(df.index)
        df.sort_index(inplace=True)
        
        # Rename columns to standard format
        # Alpha Vantage uses numbered keys like "1. open", "2. high"
        df.columns = ['open', 'high', 'low', 'close', 'volume'][:len(df.columns)]
        
        # Add metadata
        df['symbol'] = symbol
        df['asset_type'] = asset_type
        df['source'] = 'alpha_vantage'
        
        return df
    
    def _process_fred_response(self, response: Dict, symbol: str) -> pd.DataFrame:
        """Process FRED API response into DataFrame"""
        if 'observations' not in response or not response['observations']:
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(response['observations'])
        df['timestamp'] = pd.to_datetime(df['date'])
        df['value'] = pd.to_numeric(df['value'], errors='coerce')
        
        # Process time series
        df.set_index('timestamp', inplace=True)
        df = df[['value']].rename(columns={'value': 'close'})
        
        # Add metadata
        df['symbol'] = symbol
        df['asset_type'] = 'economic'
        df['source'] = 'federal_reserve'
        
        return df[['close', 'symbol', 'asset_type', 'source']]
    
    async def get_real_time_data(self, symbol: str, asset_type: str = 'stocks') -> Dict[str, Any]:
        """Get real-time market data from available sources"""
        for source in self.active_sources:
            if asset_type in self.active_sources[source]['assets']:
                data = await self._get_real_time_data_from_source(source, symbol, asset_type)
                if data:
                    return data
        
        return {
            'error': f"No real-time data available for {symbol} ({asset_type})"
        }
    
    async def _get_real_time_data_from_source(self, source: str, symbol: str, asset_type: str) -> Optional[Dict]:
        """Get real-time data from a specific source"""
        if source == 'yfinance':
            return await asyncio.to_thread(self._fetch_yf_realtime, symbol)
            
        if source == 'alpaca':
            return await self._make_request(
                source,
                {'symbols': symbol},
                'stocks/snapshots'
            )
        
        elif source == 'alpha_vantage':
            if asset_type == 'stocks':
                return await self._make_request(
                    source,
                    {'function': 'GLOBAL_QUOTE', 'symbol': symbol},
                    ''
                )
        
        return None
    
    async def get_forex_pairs(self) -> List[Dict]:
        """Get available forex currency pairs"""
        response = await self._make_request(
            'alpaca',
            {},
            'forex/symbols'
        )
        
        if response and 'symbols' in response:
            return [{'symbol': s['symbol'], 'name': s['name']} for s in response['symbols']]
        
        return []
    
    async def get_economic_indicators(self) -> List[Dict]:
        """Get available economic indicators from FRED"""
        return [
            {'id': 'GDP', 'name': 'Gross Domestic Product'},
            {'id': 'CPIAUCSL', 'name': 'Consumer Price Index'},
            {'id': 'UNRATE', 'name': 'Unemployment Rate'},
            {'id': 'FEDFUNDS', 'name': 'Federal Funds Rate'},
            {'id': 'T10YFF', 'name': '10-Year Treasury Rate'}
        ]
    
    async def get_news(self, query: str = None, sources: List[str] = None, 
                     from_date: str = None) -> List[Dict]:
        """Get real-time news from multiple sources"""
        all_news = []
        if 'news_api' in self.active_sources:
            news = await self._get_news_from_news_api(query, sources, from_date)
            all_news.extend(news)
        
        all_news.sort(key=lambda x: x['published_at'], reverse=True)
        return all_news
    
    async def _get_news_from_news_api(self, query: str, sources: List[str], from_date: str) -> List[Dict]:
        """Get news from News API"""
        params = {
            'q': query or 'market',
            'language': 'en',
            'pageSize': 20
        }
        if from_date:
            params['from'] = from_date
        if sources:
            params['sources'] = ','.join(sources)
        
        response = await self._make_request('news_api', params, 'top-headlines')
        if not response or 'articles' not in response:
            return []
        
        return [{
            'title': article['title'],
            'description': article['description'],
            'url': article['url'],
            'source': article['source']['name'],
            'published_at': article['publishedAt'],
            'category': self._categorize_news(article['title'] + ' ' + (article['description'] or ''))
        } for article in response['articles']]
    
    def _categorize_news(self, text: str) -> str:
        """Categorize news based on content"""
        text = text.lower()
        categories = {
            'monetary': ['fed', 'interest', 'rate', 'inflation'],
            'earnings': ['earnings', 'revenue', 'profit', 'results'],
            'tech': ['ai', 'software', 'digital', 'innovation']
        }
        for category, keywords in categories.items():
            if any(k in text for k in keywords):
                return category
        return 'general'

    def _fetch_yf_historical(self, symbol, timeframe, start, end):
        try:
            import yfinance as yf
            interval_map = {'1Min': '1m', '5Min': '5m', '15Min': '15m', '1H': '1h', '1D': '1d', '1W': '1wk', '1M': '1mo'}
            interval = interval_map.get(timeframe, '1d')
            
            ticker = yf.Ticker(symbol)
            if start and end:
                df = ticker.history(interval=interval, start=start, end=end)
            else:
                period_map = {'1m': '7d', '5m': '60d', '15m': '60d', '1h': '730d', '1d': '1y'}
                period = period_map.get(interval, '1mo') # default to 1mo for frontend chart performance
                df = ticker.history(interval=interval, period=period)
                
            if df.empty:
                return None
                
            df = df.reset_index()
            time_col = 'Datetime' if 'Datetime' in df.columns else 'Date'
            if time_col in df.columns:
                if df[time_col].dt.tz is not None:
                    df['timestamp'] = df[time_col].dt.tz_convert(None)
                else:
                    df['timestamp'] = df[time_col]
                df.set_index('timestamp', inplace=True)
            
            df.rename(columns={
                'Open': 'open', 'High': 'high', 'Low': 'low', 
                'Close': 'close', 'Volume': 'volume'
            }, inplace=True)
            
            df['symbol'] = symbol
            df['asset_type'] = 'stocks'
            df['source'] = 'yfinance'
            
            return df[['open', 'high', 'low', 'close', 'volume', 'symbol', 'asset_type', 'source']]
        except Exception as e:
            self.logger.error(f"yfinance historical error for {symbol}: {str(e)}")
            return None

    def _fetch_yf_realtime(self, symbol):
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            
            try:
                price = info.last_price
            except AttributeError:
                price = None
                
            if price is None or pd.isna(price):
                df = ticker.history(period='1d')
                if not df.empty:
                    price = df['Close'].iloc[-1]
                else:
                    return None
                    
            return {
                'symbol': symbol,
                'price': float(price),
                'source': 'yfinance',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"yfinance realtime error for {symbol}: {str(e)}")
            return None

