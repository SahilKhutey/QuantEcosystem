import time
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from services.broker.broker_interface import BrokerAPI

logger = logging.getLogger('MarketData')

class MarketDataService:
    """
    Professional market data service with:
    - Real-time data streaming
    - Historical data retrieval
    - Data quality validation
    - Rate limit management
    """
    
    def __init__(self, broker: BrokerAPI):
        self.alpaca = broker
        self.data_cache = {}
        self.last_update = {}
        self.rate_limit = {
            'max_requests': 10,
            'window_seconds': 1,
            'current': 0,
            'last_reset': time.time()
        }
        self.logger = logger
    
    def _check_rate_limit(self):
        """Enforce rate limit for data requests"""
        current_time = time.time()
        
        # Reset counter if window has passed
        if current_time - self.rate_limit['last_reset'] > self.rate_limit['window_seconds']:
            self.rate_limit['current'] = 0
            self.rate_limit['last_reset'] = current_time
        
        # Check if we're within limits
        if self.rate_limit['current'] >= self.rate_limit['max_requests']:
            wait_time = self.rate_limit['window_seconds'] - (current_time - self.rate_limit['last_reset'])
            self.logger.warning(f"Data rate limit hit. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
            self.rate_limit['current'] = 0
            self.rate_limit['last_reset'] = time.time()
        
        # Increment counter
        self.rate_limit['current'] += 1
    
    def get_historical_data(self, symbol: str, timeframe: str = '1D', 
                          start: str = None, end: str = None) -> pd.DataFrame:
        """Get historical market data with caching and validation"""
        # Format dates
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        # Check cache first
        cache_key = f"{symbol}_{timeframe}_{start}_{end}"
        if cache_key in self.data_cache:
            self.logger.info(f"Using cached data for {symbol}")
            return self.data_cache[cache_key]
        
        # Make API request
        self._check_rate_limit()
        data = self.alpaca.get_historical_data(symbol, timeframe, start, end)
        
        # Process data
        if 'error' in data or 'bars' not in data:
            self.logger.error(f"Failed to get historical data for {symbol}: {data.get('error', 'Unknown error')}")
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(data['bars'])
        if df.empty:
            return pd.DataFrame()
        
        # Standardize column names
        df.rename(columns={
            't': 'timestamp',
            'o': 'open',
            'h': 'high',
            'l': 'low',
            'c': 'close',
            'v': 'volume'
        }, inplace=True)
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)
        
        # Add technical indicators
        self._calculate_technical_indicators(df)
        
        # Cache the data
        self.data_cache[cache_key] = df
        self.last_update[cache_key] = time.time()
        
        return df
    
    def _calculate_technical_indicators(self, df: pd.DataFrame):
        """Calculate common technical indicators"""
        # Simple moving averages
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['sma_200'] = df['close'].rolling(window=200).mean()
        
        # Relative Strength Index (RSI)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        df['ema_12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['ema_26'] = df['close'].ewm(span=26, adjust=False).mean()
        df['macd'] = df['ema_12'] - df['ema_26']
        df['signal_line'] = df['macd'].ewm(span=9, adjust=False).mean()
        df['macd_hist'] = df['macd'] - df['signal_line']
        
        # Bollinger Bands
        df['middle_band'] = df['close'].rolling(window=20).mean()
        df['std'] = df['close'].rolling(window=20).std()
        df['upper_band'] = df['middle_band'] + (df['std'] * 2)
        df['lower_band'] = df['middle_band'] - (df['std'] * 2)
        
        return df
    
    def get_real_time_data(self, symbol: str) -> dict:
        """Get real-time market data (simplified for demonstration)"""
        self._check_rate_limit()
        return self.alpaca.get_real_time_data(symbol)
    
    def get_news_data(self, query: str = "market", start: str = None, end: str = None) -> list:
        """Get news data from Alpaca Data API (simplified)"""
        # In production, this would integrate with a dedicated news API
        # For demonstration, we'll return mock data
        return [
            {
                "headline": "Fed Announces Rate Cut",
                "summary": "The Federal Reserve has signaled it may pause rate hikes due to cooling inflation",
                "url": "https://example.com/fed-rate-cut",
                "source": "Financial Times",
                "timestamp": datetime.now().isoformat(),
                "symbols": ["SPY", "QQQ"],
                "sentiment_score": 0.85
            }
        ]
    
    def get_news_sentiment(self, symbol: str) -> dict:
        """Get news sentiment for a symbol (mock implementation)"""
        return {
            'symbol': symbol,
            'score': 0.75,
            'label': 'positive',
            'count': 5,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_technical_indicators(self, symbol: str) -> dict:
        """Get key technical indicators for a symbol"""
        df = self.get_historical_data(symbol)
        if df.empty:
            return {}
        
        # Get most recent values
        latest = df.iloc[-1]
        
        return {
            'rsi': latest['rsi'],
            'macd': latest['macd'],
            'signal_line': latest['signal_line'],
            'macd_hist': latest['macd_hist'],
            'sma_20': latest['sma_20'],
            'sma_50': latest['sma_50'],
            'sma_200': latest['sma_200'],
            'upper_band': latest['upper_band'],
            'middle_band': latest['middle_band'],
            'lower_band': latest['lower_band']
        }
    
    def validate_data_quality(self, df: pd.DataFrame) -> dict:
        """Validate data quality metrics"""
        if df.empty:
            return {'is_valid': False, 'reason': 'Empty dataset'}
        
        # Check for missing critical columns
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return {
                'is_valid': False,
                'reason': f"Missing critical columns: {', '.join(missing_columns)}"
            }
        
        # Check for negative values where they shouldn't be
        if (df[['open', 'high', 'low', 'close']] < 0).any().any():
            return {'is_valid': False, 'reason': 'Negative price values detected'}
        
        # Check for high > low
        if (df['high'] < df['low']).any():
            return {'is_valid': False, 'reason': 'High price lower than low price in some periods'}
        
        # Check for reasonable volume
        if (df['volume'] < 0).any():
            return {'is_valid': False, 'reason': 'Negative volume values detected'}
        
        # Check for missing values
        missing_values = df.isnull().sum().to_dict()
        if sum(missing_values.values()) > 0:
            return {
                'is_valid': False,
                'reason': f"Data contains missing values: {missing_values}",
                'missing_count': sum(missing_values.values())
            }
        
        return {'is_valid': True, 'quality_score': 100}

    def is_market_open(self) -> bool:
        """Check if US markets are currently open (9:30 AM - 4:00 PM ET)"""
        now = datetime.now()
        # Simple weekday and time check
        if now.weekday() >= 5:
            return False
        
        market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
        market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
        return market_open <= now <= market_close

    def was_market_open(self) -> bool:
        """Check if market was open in the previous check (stub for session tracking)"""
        # In production, this would track state transitions
        return False
