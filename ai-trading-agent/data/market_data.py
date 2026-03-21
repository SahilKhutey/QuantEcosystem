import ccxt
import pandas as pd
import asyncio
from typing import Dict, List, Optional
from loguru import logger

class MarketData:
    def __init__(self, exchange_id: str = 'binance'):
        self.exchange = getattr(ccxt, exchange_id)()
        logger.info(f"Initialized {exchange_id} exchange")

    async def fetch_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 100) -> pd.DataFrame:
        """Fetch historical OHLCV data."""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            logger.error(f"Error fetching OHLCV for {symbol}: {e}")
            return pd.DataFrame()

    async def fetch_ticker(self, symbol: str) -> Dict:
        """Fetch current ticker price."""
        try:
            return self.exchange.fetch_ticker(symbol)
        except Exception as e:
            logger.error(f"Error fetching ticker for {symbol}: {e}")
            return {}

if __name__ == "__main__":
    async def main():
        md = MarketData()
        df = await md.fetch_ohlcv('BTC/USDT')
        print(df.head())
    
    asyncio.run(main())
