import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import time
from data_engine.data_processors import PriceProcessor

class YahooFinanceAPI:
    """Yahoo Finance API integration for stock, ETF, and index data"""
    
    def __init__(self):
        self.logger = logging.getLogger('YahooFinance')
        self.price_processor = PriceProcessor()
        self.rate_limit = 2  # seconds between requests (Yahoo's rate limit)
        self.last_request = 0
    
    def _check_rate_limit(self):
        """Enforce rate limiting to avoid hitting Yahoo's limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request
        
        if time_since_last < self.rate_limit:
            time.sleep(self.rate_limit - time_since_last)
        
        self.last_request = time.time()
    
    def get_historical_data(self, 
                          symbol: str, 
                          start: Optional[str] = None,
                          end: Optional[str] = None,
                          period: str = "1d",
                          interval: str = "1d",
                          include_prepost: bool = False) -> pd.DataFrame:
        """Get historical market data from Yahoo Finance"""
        self._check_rate_limit()
        
        try:
            # If no dates provided, default to last 30 days
            if not start:
                start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            if not end:
                end = datetime.now().strftime("%Y-%m-%d")
            
            self.logger.info(f"Fetching {symbol} data from {start} to {end}")
            
            # Get data from Yahoo Finance
            if start and end:
                data = yf.download(
                    symbol,
                    start=start,
                    end=end,
                    interval=interval,
                    prepost=include_prepost,
                    progress=False
                )
            else:
                data = yf.download(
                    symbol,
                    period=period,
                    interval=interval,
                    prepost=include_prepost,
                    progress=False
                )
            
            # Process data
            if not data.empty:
                # Clean columns if they are MultiIndex (common in newer yfinance versions)
                if isinstance(data.columns, pd.MultiIndex):
                    data.columns = data.columns.get_level_values(-1)
                
                # Standardize column names (lowercase)
                data.columns = [col.lower() for col in data.columns]
                
                # Ensure essential columns exist (rename if necessary)
                column_mapping = {
                    'adj close': 'adj_close'
                }
                data = data.rename(columns=column_mapping)
                
                # Add metadata columns
                data['symbol'] = symbol
                data['source'] = 'yahoo_finance'
                data['asset_type'] = self._determine_asset_type(symbol)
                data['currency'] = self._determine_currency(symbol)
                
                # Handle timestamp
                if 'date' in data.columns:
                    data['timestamp'] = pd.to_datetime(data['date'])
                else:
                    data['timestamp'] = data.index
                    # If index is already datetime, just ensure it's a column
                    if pd.api.types.is_datetime64_any_dtype(data.index):
                        pass # timestamp already set to index
                
                # Reset index to be clean
                data = data.reset_index(drop=True) if 'timestamp' in data.columns else data.reset_index()
                if 'index' in data.columns and 'timestamp' not in data.columns:
                    data.rename(columns={'index': 'timestamp'}, inplace=True)
                
                # Add technical indicators
                self.price_processor.calculate_indicators(data)
                
                # Ensure all required columns are present before filtering
                required_cols = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'adj_close',
                                'symbol', 'source', 'asset_type', 'currency']
                
                # Fill missing required columns with None/NaN if they don't exist
                for col in required_cols:
                    if col not in data.columns:
                        data[col] = None
                
                # Return only relevant columns
                indicator_cols = [col for col in data.columns if col.startswith('indicator_')]
                return data[required_cols + indicator_cols]
            
            return pd.DataFrame()
        except Exception as e:
            self.logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return pd.DataFrame()
    
    def get_real_time_data(self, symbol: str) -> Dict:
        """Get real-time market data from Yahoo Finance"""
        self._check_rate_limit()
        
        try:
            # Get data from Yahoo Finance
            ticker = yf.Ticker(symbol)
            data = ticker.fast_info
            
            if data:
                # Process real-time data
                return {
                    'symbol': symbol,
                    'price': data.last_price,
                    'change': data.price_change,
                    'change_percent': data.price_change_percent,
                    'volume': data.volume,
                    'avg_volume': data.avg_volume,
                    'bid': data.bid,
                    'ask': data.ask,
                    'open': data.day_open,
                    'high': data.day_high,
                    'low': data.day_low,
                    'previous_close': data.previous_close,
                    'timestamp': datetime.now(),
                    'source': 'yahoo_finance',
                    'asset_type': self._determine_asset_type(symbol),
                    'currency': self._determine_currency(symbol)
                }
            return {}
        except Exception as e:
            self.logger.error(f"Error fetching real-time data for {symbol}: {str(e)}")
            return {}
    
    def get_symbols(self, category: str = "stocks") -> List[Dict]:
        """Get available symbols by category (stocks, etfs, indices)"""
        # In production, this would connect to Yahoo's API
        # For demonstration, return mock data
        return [
            {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corp.", "type": "stock", "exchange": "NASDAQ"},
            {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "type": "etf", "exchange": "NYSE"},
            {"symbol": "^GSPC", "name": "S&P 500 Index", "type": "index", "exchange": "US"}
        ]
    
    def _determine_asset_type(self, symbol: str) -> str:
        """Determine asset type based on symbol format"""
        # Simple heuristic for demonstration
        if '.' in symbol:
            if symbol.endswith(('.NS', '.BO', '.NS', '.BSE')):
                return 'stocks'
            return 'forex' if 'USD' in symbol else 'stocks'
        elif '^' in symbol:
            return 'indices'
        elif len(symbol) == 3 and symbol.isalpha():
            return 'forex'
        return 'stocks'
    
    def _determine_currency(self, symbol: str) -> str:
        """Determine currency based on symbol format"""
        # Simple heuristic for demonstration
        if '.' in symbol:
            if symbol.endswith('.NS'):
                return 'INR'
            elif symbol.endswith(('.BO', '.BSE')):
                return 'INR'
            elif symbol.endswith('.US'):
                return 'USD'
        elif '^' in symbol or symbol in ['SPY', 'QQQ']:
            return 'USD'
        return 'USD'
    
    def get_market_status(self, symbol: str) -> Dict:
        """Get current market status for a symbol"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get market hours
            market_hours = info.get('marketHours', {})
            
            return {
                'symbol': symbol,
                'market_open': info.get('marketState') == 'OPEN',
                'current_price': info.get('currentPrice'),
                'previous_close': info.get('previousClose'),
                'market_cap': info.get('marketCap'),
                'volume': info.get('volume'),
                'bid': info.get('bid'),
                'ask': info.get('ask'),
                'open': info.get('open'),
                'high': info.get('dayHigh'),
                'low': info.get('dayLow'),
                '52w_high': info.get('fiftyTwoWeekHigh'),
                '52w_low': info.get('fiftyTwoWeekLow'),
                'market_hours': market_hours,
                'source': 'yahoo_finance'
            }
        except Exception as e:
            self.logger.error(f"Error getting market status for {symbol}: {str(e)}")
            return {}
