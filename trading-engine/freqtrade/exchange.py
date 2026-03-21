import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class Exchange:
    """
    Mimics the CCXT exchange integration used natively by Freqtrade.
    Fetches real-time or historical OHLCV data.
    """
    def __init__(self, config=None):
        self.config = config or {}
        
    def get_historical_data(self, pair: str, timeframe: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """
        Generate mock OHLCV crypto data for backtesting or live simulation.
        """
        # Calculate periods based on mock date span (Assuming 1d for simplicity in demo)
        days = (end_date - start_date).days
        periods = max(days, 100)
        
        dates = pd.date_range(end=end_date, periods=periods, freq='D')
        
        # Crypto-esque volatility
        base_price = 50000.0 if 'BTC' in pair else 3000.0
        returns = np.random.normal(0, 0.03, periods)
        closes = np.cumprod(1 + returns) * base_price
        
        df = pd.DataFrame({
            'date': dates,
            'open': closes * (1 + np.random.normal(0, 0.01, periods)),
            'high': closes * 1.02,
            'low': closes * 0.98,
            'close': closes,
            'volume': np.random.uniform(500, 5000, periods)
        })
        
        return df

    def create_order(self, pair: str, ordertype: str, side: str, amount: float, rate: float):
        """Mock order execution."""
        return {
            'id': f"mock_order_{np.random.randint(1000, 9999)}",
            'symbol': pair,
            'type': ordertype,
            'side': side,
            'amount': amount,
            'price': rate,
            'status': 'closed' # Instant execution for test purposes
        }
