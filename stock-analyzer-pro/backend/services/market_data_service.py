import asyncio
import aiohttp
import websockets
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
try:
    import redis
except ImportError:
    redis = None
import pickle
from sqlalchemy.orm import Session
import numpy as np

# Original MarketDataService (for compatibility with main.py)
class MarketDataService:
    def __init__(self):
        self.engine = MarketDataEngine()
        
    def get_latest_data(self, symbol: str, db: Session):
        """Proxy to MarketDataEngine or previous logic"""
        # For now, return a placeholder or adapt to MarketDataEngine
        return {"symbol": symbol, "price": 150.0, "timestamp": datetime.utcnow()}

    async def analyze_symbol(self, symbol: str):
        """Placeholder for analysis"""
        print(f"Analyzing {symbol}...")

class MarketDataEngine:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0) if redis else None
        self.ws_connections = {}
        self.data_buffers = {}
        
    async def connect_to_exchange(self, exchange: str, symbols: List[str]):
        """Connect to exchange WebSocket"""
        if exchange == "binance":
            await self._connect_binance(symbols)
        elif exchange == "nse":
            await self._connect_nse(symbols)
        elif exchange == "polygon":
            await self._connect_polygon(symbols)
            
    async def _connect_binance(self, symbols: List[str]):
        """Connect to Binance WebSocket"""
        streams = [f"{symbol.lower()}@ticker" for symbol in symbols]
        stream_url = f"wss://stream.binance.com:9443/stream?streams={'/'.join(streams)}"
        
        async with websockets.connect(stream_url) as websocket:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                await self._process_binance_data(data)
                
    async def _process_binance_data(self, data: Dict):
        """Process Binance ticker data"""
        stream_data = data.get('data', {})
        symbol = stream_data.get('s')
        if not symbol:
            return
            
        tick_data = {
            'symbol': symbol,
            'price': float(stream_data.get('c', 0)),
            'volume': float(stream_data.get('v', 0)),
            'bid': float(stream_data.get('b', 0)),
            'ask': float(stream_data.get('a', 0)),
            'bid_qty': float(stream_data.get('B', 0)),
            'ask_qty': float(stream_data.get('A', 0)),
            'high': float(stream_data.get('h', 0)),
            'low': float(stream_data.get('l', 0)),
            'timestamp': datetime.utcnow()
        }
        
        # Store in Redis
        if self.redis_client:
            self.redis_client.set(f"ticker:{symbol}", pickle.dumps(tick_data))
        
        # Update OHLC buffer
        await self._update_ohlc(symbol, tick_data['price'], tick_data['volume'])
        
    async def _update_ohlc(self, symbol: str, price: float, volume: float):
        """Update OHLC data for symbol"""
        if not self.redis_client:
            return
            
        current_minute = datetime.utcnow().replace(second=0, microsecond=0)
        minute_key = f"ohlc:{symbol}:{current_minute.strftime('%Y%m%d%H%M')}"
        
        if not self.redis_client.exists(minute_key):
            # New minute
            ohlc_data = {
                'open': price,
                'high': price,
                'low': price,
                'close': price,
                'volume': volume,
                'count': 1,
                'timestamp': current_minute
            }
        else:
            # Update existing minute
            ohlc_data = pickle.loads(self.redis_client.get(minute_key))
            ohlc_data['high'] = max(ohlc_data['high'], price)
            ohlc_data['low'] = min(ohlc_data['low'], price)
            ohlc_data['close'] = price
            ohlc_data['volume'] += volume
            ohlc_data['count'] += 1
            
        self.redis_client.setex(minute_key, 3600, pickle.dumps(ohlc_data))
        
    def get_ohlc_data(self, symbol: str, timeframe: str, limit: int = 1000) -> pd.DataFrame:
        """Get OHLC data for symbol (Placeholder implementation)"""
        # In a real implementation, this would fetch from Redis or a Timeseries DB
        return pd.DataFrame()
        
    async def get_order_book(self, symbol: str, depth: int = 10) -> Dict:
        """Get order book data"""
        async with aiohttp.ClientSession() as session:
            url = f"https://api.binance.com/api/v3/depth?symbol={symbol}&limit={depth}"
            async with session.get(url) as response:
                data = await response.json()
                return {
                    'bids': [(float(bid[0]), float(bid[1])) for bid in data.get('bids', [])],
                    'asks': [(float(ask[0]), float(ask[1])) for ask in data.get('asks', [])],
                    'timestamp': datetime.utcnow()
                }
                
    def get_historical_data(self, symbol: str, interval: str, 
                          start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """Get historical data (Placeholder implementation)"""
        return pd.DataFrame()

    # Stub methods for exchange connection not fully implemented yet
    async def _connect_nse(self, symbols: List[str]): pass
    async def _connect_polygon(self, symbols: List[str]): pass
