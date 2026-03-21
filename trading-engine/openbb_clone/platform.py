import pandas as pd
import numpy as np

class OpenBBStocks:
    """Simulates obbb.stocks module."""
    def load(self, symbol="AAPL", start_date="2023-01-01"):
        periods = 90
        dates = pd.date_range(end=pd.Timestamp.today(), periods=periods, freq='D')
        
        # Base price logic
        base_price = 150.0 if symbol.upper() == 'AAPL' else 100.0
        
        np.random.seed(int(sum(ord(c) for c in symbol)) % 1000)
        returns = np.random.normal(0.0005, 0.015, periods)
        close_prices = base_price * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame({
            'date': dates.strftime('%Y-%m-%d'),
            'open': close_prices * (1 + np.random.normal(0, 0.005, periods)),
            'high': close_prices * (1 + np.abs(np.random.normal(0, 0.01, periods))),
            'low': close_prices * (1 - np.abs(np.random.normal(0, 0.01, periods))),
            'close': close_prices,
            'volume': np.random.lognormal(mean=16, sigma=0.5, size=periods).astype(int)
        })
        return {"provider": "yfinance", "dataset": df.to_dict(orient='records'), "type": "candlestick"}

class OpenBBCrypto:
    """Simulates obbb.crypto module."""
    def load(self, symbol="BTC-USD"):
        periods = 90
        dates = pd.date_range(end=pd.Timestamp.today(), periods=periods, freq='D')
        
        base_price = 65000.0 if 'BTC' in symbol.upper() else 3000.0
        
        np.random.seed(int(sum(ord(c) for c in symbol)) % 1000)
        returns = np.random.normal(0.001, 0.03, periods) # Higher vol
        close_prices = base_price * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame({
            'date': dates.strftime('%Y-%m-%d'),
            'open': close_prices * (1 + np.random.normal(0, 0.01, periods)),
            'high': close_prices * (1 + np.abs(np.random.normal(0, 0.02, periods))),
            'low': close_prices * (1 - np.abs(np.random.normal(0, 0.02, periods))),
            'close': close_prices,
            'volume': np.random.lognormal(mean=18, sigma=0.8, size=periods).astype(int)
        })
        return {"provider": "ccxt", "dataset": df.to_dict(orient='records'), "type": "candlestick"}

class OpenBBEconomy:
    """Simulates obbb.economy module."""
    def macro(self, parameter="OIS", country="united_states"):
        periods = 12 * 5 # 5 years monthly data
        dates = pd.date_range(end=pd.Timestamp.today(), periods=periods, freq='M')
        
        # Interest Rate or GDP Growth drift
        np.random.seed(42)
        base_rate = 5.25 # Current macro interest rate mock
        
        drift = np.random.normal(-0.02, 0.15, periods)
        rates = base_rate + np.cumsum(drift)
        # Floor rates above 0
        rates = np.clip(rates, 0.25, 8.0)
        
        df = pd.DataFrame({
            'date': dates.strftime('%Y-%m'),
            'rate': rates
        })
        return {"provider": "fred", "dataset": df.to_dict(orient='records'), "type": "area"}

class OpenBBPlatform:
    """
    Simulates the unified root 'obbb' namespace object, abstracting hundreds 
    of proprietary data vendor endpoints behind a massively normalized class structure.
    """
    def __init__(self):
        self.stocks = OpenBBStocks()
        self.crypto = OpenBBCrypto()
        self.economy = OpenBBEconomy()

obbb = OpenBBPlatform()
