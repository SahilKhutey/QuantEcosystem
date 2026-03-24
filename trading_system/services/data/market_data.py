import pandas as pd
import yfinance as yf
import ccxt
import logging
from typing import Optional, List
from trading_system.config.settings import settings

class MarketDataService:
    """
    Consolidated market data service for both equities and crypto.
    Integrates YFinance and CCXT.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.exchange = ccxt.binance({
            'apiKey': settings.BINANCE_API_KEY,
            'secret': settings.BINANCE_SECRET_KEY,
            'enableRateLimit': True,
        }) if settings.CCXT_ENABLED else None

    def get_equity_data(self, symbol: str, period: str = "1d", interval: str = "1m") -> pd.DataFrame:
        """Fetches historical/live equity data via YFinance."""
        try:
            ticker = yf.Ticker(symbol)
            return ticker.history(period=period, interval=interval)
        except Exception as e:
            self.logger.error(f"Error fetching YFinance data for {symbol}: {e}")
            return pd.DataFrame()

    def get_crypto_data(self, symbol: str, timeframe: str = '1m', limit: int = 100) -> List:
        """Fetches crypto OHLCV data via CCXT."""
        if not self.exchange:
            return []
        try:
            return self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
        except Exception as e:
            self.logger.error(f"Error fetching CCXT data for {symbol}: {e}")
            return []

    def get_latest_price(self, symbol: str, is_crypto: bool = False) -> float:
        """Quick fetch for the latest price."""
        if is_crypto:
            ticker = self.exchange.fetch_ticker(symbol)
            return ticker['last']
        else:
            ticker = yf.Ticker(symbol)
            return ticker.fast_info['last_price']

    def verify_data_integrity(self, symbol: str, threshold: float = 0.01) -> bool:
        """
        Validates real-time price against historical benchmarks.
        Returns True if the deviation is within the allowed threshold (default 1%).
        """
        try:
            # Get latest price
            current_price = self.get_latest_price(symbol)
            
            # Get historical daily average (approximate benchmark)
            hist = self.get_equity_data(symbol, period="1d", interval="1m")
            if hist.empty:
                return False
                
            benchmark_price = hist['Close'].iloc[-1]
            
            # Calculate deviation
            deviation = abs(current_price - benchmark_price) / benchmark_price
            
            if deviation <= threshold:
                self.logger.info(f"Data integrity verified for {symbol}: {deviation:.4%} deviation.")
                return True
            else:
                self.logger.warning(f"Data integrity violation for {symbol}: {deviation:.4%} deviation exceeded {threshold:.2%}")
                return False
        except Exception as e:
            self.logger.error(f"Data integrity check failed for {symbol}: {e}")
            return False
