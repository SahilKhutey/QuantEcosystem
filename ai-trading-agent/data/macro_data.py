import yfinance as yf
import pandas as pd
from typing import Dict
from loguru import logger

class MacroData:
    def __init__(self):
        # US 10-Year Treasury, DXY (Dollar Index), S&P 500
        self.tickers = {
            'US10Y': '^TNX',
            'DXY': 'DX-Y.NYB',
            'SP500': '^GSPC'
        }

    def fetch_macro_indicators(self, period: str = '1mo') -> Dict[str, pd.DataFrame]:
        """Fetch macro-economic proxies from Yahoo Finance."""
        data = {}
        for key, ticker in self.tickers.items():
            try:
                t = yf.Ticker(ticker)
                hist = t.history(period=period)
                data[key] = hist
            except Exception as e:
                logger.error(f"Error fetching {key}: {e}")
        return data

if __name__ == "__main__":
    md = MacroData()
    indicators = md.fetch_macro_indicators()
    for k, v in indicators.items():
        print(f"{k}: {v['Close'].iloc[-1]:.2f}")
