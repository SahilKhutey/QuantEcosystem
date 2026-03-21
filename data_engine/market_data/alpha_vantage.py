import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import time
import json
from data_engine.data_processors import PriceProcessor

class AlphaVantageAPI:
    """Alpha Vantage API integration for stock, forex, and crypto data"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        self.logger = logging.getLogger('AlphaVantage')
        self.price_processor = PriceProcessor()
        self.rate_limit = 15  # seconds between requests (5 requests per minute)
        self.last_request = 0
        self.request_count = 0
        self.request_window_start = time.time()
    
    def _check_rate_limit(self):
        """Enforce rate limiting to avoid hitting Alpha Vantage limits"""
        current_time = time.time()
        
        # Reset counter if window has passed
        if current_time - self.request_window_start > 60:
            self.request_count = 0
            self.request_window_start = current_time
        
        # Check if we're within limits
        if self.request_count >= 5:  # Alpha Vantage free tier limit
            wait_time = 60 - (current_time - self.request_window_start)
            self.logger.warning(f"Rate limit reached. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
            self.request_count = 0
            self.request_window_start = time.time()
        
        # Increment counter
        self.request_count += 1
        self.last_request = current_time
    
    def _make_request(self, params: Dict) -> Optional[Dict]:
        """Make API request with error handling"""
        self._check_rate_limit()
        
        try:
            params['apikey'] = self.api_key
            response = requests.get(self.base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for API errors
                if 'Error Message' in data:
                    self.logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                    return None
                
                # Check for rate limit errors
                if 'Information' in data and 'rate limit' in data['Information'].lower():
                    self.logger.error("Alpha Vantage rate limit reached")
                    return None
                
                return data
            else:
                self.logger.error(f"Alpha Vantage API error: HTTP {response.status_code}")
                return None
        except Exception as e:
            self.logger.error(f"Error making Alpha Vantage request: {str(e)}")
            return None
    
    def get_historical_data(self, 
                          symbol: str, 
                          asset_type: str = 'stocks',
                          timeframe: str = 'daily',
                          start: Optional[str] = None,
                          end: Optional[str] = None) -> pd.DataFrame:
        """Get historical market data from Alpha Vantage"""
        try:
            # Format dates
            if not start:
                start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            if not end:
                end = datetime.now().strftime("%Y-%m-%d")
            
            # Set up parameters based on asset type
            params = {
                'function': '',
                'symbol': symbol,
                'outputsize': 'full'  # Get as much data as possible
            }
            
            if asset_type == 'stocks':
                if timeframe == 'daily':
                    params['function'] = 'TIME_SERIES_DAILY'
                elif timeframe == 'intraday':
                    params['function'] = 'TIME_SERIES_INTRADAY'
                    params['interval'] = '5min'
            
            elif asset_type == 'forex':
                params['function'] = 'FX_DAILY'
                params['from_symbol'] = symbol[:3]
                params['to_symbol'] = symbol[3:]
            
            elif asset_type == 'crypto':
                params['function'] = 'DIGITAL_CURRENCY_DAILY'
                params['market'] = 'USD'
            
            # Make request
            data = self._make_request(params)
            
            if not data:
                return pd.DataFrame()
            
            # Process data
            if asset_type == 'stocks' and (timeframe == 'daily' or timeframe == 'intraday'):
                time_series_key = next(k for k in data.keys() if 'Time Series' in k)
                time_series = data[time_series_key]
                
                # Convert to DataFrame
                df = pd.DataFrame.from_dict(time_series, orient='index')
                df.index = pd.to_datetime(df.index)
                df.sort_index(inplace=True)
                
                # Rename columns to standard format
                column_mapping = {
                    '1. open': 'open',
                    '2. high': 'high',
                    '3. low': 'low',
                    '4. close': 'close',
                    '5. volume': 'volume',
                    '1a. open (USD)': 'open',
                    '2a. high (USD)': 'high',
                    '3a. low (USD)': 'low',
                    '4a. close (USD)': 'close',
                    '5. volume': 'volume'
                }
                
                # Rename columns
                df = df.rename(columns=column_mapping)
                
                # Keep only standard columns
                df = df[['open', 'high', 'low', 'close', 'volume']]
                
                # Convert to numeric
                for col in ['open', 'high', 'low', 'close', 'volume']:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                
                # Add metadata
                df['symbol'] = symbol
                df['source'] = 'alpha_vantage'
                df['asset_type'] = asset_type
                df['currency'] = 'USD'  # Alpha Vantage returns USD for most data
                
                # Add technical indicators
                self.price_processor.calculate_indicators(df)
                
                # Filter by date range
                if start:
                    df = df[df.index >= pd.Timestamp(start)]
                if end:
                    df = df[df.index <= pd.Timestamp(end)]
                
                return df
            
            # Additional asset type processing would go here
            return pd.DataFrame()
        except Exception as e:
            self.logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return pd.DataFrame()
    
    def get_real_time_data(self, symbol: str, asset_type: str = 'stocks') -> Dict:
        """Get real-time market data from Alpha Vantage"""
        try:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol
            }
            
            data = self._make_request(params)
            
            if not data or 'Global Quote' not in data:
                return {}
            
            quote = data['Global Quote']
            
            return {
                'symbol': symbol,
                'price': float(quote['05. price']),
                'change': float(quote['09. change']),
                'change_percent': quote['10. change percent'].strip('%'),
                'volume': int(quote['06. volume']),
                'open': float(quote['02. open']),
                'high': float(quote['03. high']),
                'low': float(quote['04. low']),
                'previous_close': float(quote['08. previous close']),
                'latest_trading_day': quote['07. latest trading day'],
                'timestamp': datetime.now(),
                'source': 'alpha_vantage',
                'asset_type': asset_type,
                'currency': 'USD'
            }
        except Exception as e:
            self.logger.error(f"Error fetching real-time data for {symbol}: {str(e)}")
            return {}
    
    def get_technical_indicators(self, 
                               symbol: str,
                               indicator: str,
                               time_period: int = 14,
                               series_type: str = 'close') -> pd.DataFrame:
        """Get technical indicators from Alpha Vantage"""
        try:
            params = {
                'function': indicator,
                'symbol': symbol,
                'interval': 'daily',
                'time_period': str(time_period),
                'series_type': series_type,
                'outputsize': 'compact'
            }
            
            data = self._make_request(params)
            
            if not data:
                return pd.DataFrame()
            
            # Extract time series data
            time_series_key = next(k for k in data.keys() if 'Technical Analysis' in k)
            time_series = data[time_series_key]
            
            # Convert to DataFrame
            df = pd.DataFrame.from_dict(time_series, orient='index')
            df.index = pd.to_datetime(df.index)
            df.sort_index(inplace=True)
            
            # Standardize column names
            indicator_map = {
                'SMA': 'sma',
                'EMA': 'ema',
                'WMA': 'wma',
                'DEMA': 'dema',
                'KAMA': 'kama',
                'MAMA': 'mama',
                'T3': 't3',
                'RSI': 'rsi',
                'STOCH': 'stochastic',
                'STOCHF': 'stochastic_fast',
                'MACD': 'macd',
                'MACDEXT': 'macd_ext',
                'STOCHRSI': 'stochastic_rsi',
                'WILLR': 'williams_r',
                'ADXR': 'adxr',
                'APO': 'apo',
                'PPO': 'ppo',
                'MOM': 'momentum',
                'BOP': 'bop',
                'CCI': 'commodity_channel_index',
                'CMO': 'chande_momentum_oscillator',
                'ROC': 'rate_of_change',
                'ROCR': 'rate_of_change_ratio',
                'AROON': 'aroon',
                'AROONOSC': 'aroon_oscillator',
                'MFI': 'money_flow_index',
                'ADX': 'average_directional_index',
                'MINUS_DI': 'minus_directional_index',
                'PLUS_DI': 'plus_directional_index',
                'MINUS_DM': 'minus_directional_movement',
                'PLUS_DM': 'plus_directional_movement',
                'BBANDS': 'bollinger_bands',
                'BBANDS': 'bollinger_bands',
                'MIDPOINT': 'midpoint',
                'MIDPRICE': 'midprice',
                'SAR': 'parabolic_sar',
                'TRANGE': 'true_range',
                'ATR': 'average_true_range',
                'NATR': 'normalized_atr',
                'AD': 'accumulation_distribution',
                'ADOSC': 'ad_oscillator',
                'OBV': 'on_balance_volume'
            }
            
            # Add metadata
            df['symbol'] = symbol
            df['source'] = 'alpha_vantage'
            df['indicator_type'] = indicator_map.get(indicator, indicator)
            
            return df
        except Exception as e:
            self.logger.error(f"Error fetching technical indicators for {symbol}: {str(e)}")
            return pd.DataFrame()
