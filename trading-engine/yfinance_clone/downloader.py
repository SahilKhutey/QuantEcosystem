import pandas as pd
import numpy as np

class Ticker:
    """
    Simulates the yfinance Ticker class for downloading historical market data from Yahoo! Finance.
    Provides standard OHLCV dataframes, plus corporate actions (Dividends, Splits).
    """
    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        
    def history(self, period="1mo", interval="1d"):
        """
        Mock implementation of yf.Ticker(sym).history()
        Returns a Pandas DataFrame mirroring the exact YFinance schema.
        """
        periods = {'1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '5y': 1825}
        days = periods.get(period, 90)
        
        dates = pd.date_range(end=pd.Timestamp.today(), periods=days, freq='D')
        
        # Base price roughly matching mega caps
        base_price = 150.0 if self.ticker == 'AAPL' else (400.0 if self.ticker == 'MSFT' else 50.0)
        
        np.random.seed(int(sum(ord(c) for c in self.ticker)) % 1000)
        # Random walk for close prices
        returns = np.random.normal(0.0005, 0.015, days)
        close_prices = base_price * np.exp(np.cumsum(returns))
        
        # Generate generic OHLC around Close
        high_prices = close_prices * (1 + np.abs(np.random.normal(0, 0.01, days)))
        low_prices = close_prices * (1 - np.abs(np.random.normal(0, 0.01, days)))
        open_prices = close_prices * (1 + np.random.normal(0, 0.005, days))
        
        volumes = np.random.lognormal(mean=16, sigma=0.5, size=days).astype(int)
        
        df = pd.DataFrame({
            'Open': open_prices,
            'High': high_prices,
            'Low': low_prices,
            'Close': close_prices,
            'Volume': volumes,
            'Dividends': 0.0,
            'Stock Splits': 0.0
        }, index=dates)
        
        # Randomly insert a mock dividend 30 days ago if enough history
        if days >= 30:
            df.loc[df.index[-30], 'Dividends'] = base_price * 0.005
            
        return df
        
    @property
    def info(self):
        """Mock JSON info dictionary containing Ticker metadata."""
        return {
            "symbol": self.ticker,
            "shortName": f"{self.ticker} Inc.",
            "sector": "Technology",
            "industry": "Consumer Electronics",
            "marketCap": 2500000000000
        }
