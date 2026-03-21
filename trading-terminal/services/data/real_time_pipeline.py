import asyncio
import pandas as pd
from typing import Dict, List
from dataclasses import dataclass
import logging

@dataclass
class MarketEvent:
    symbol: str
    event_type: str  # trade, quote, minute_bar
    timestamp: pd.Timestamp
    data: Dict

class RealTimeDataPipeline:
    def __init__(self, market_data_service):
        self.market_data = market_data_service
        self.event_queue = asyncio.Queue()
        self.subscribers = {}
        self.logger = logging.getLogger('RealTimePipeline')
        self._processed_trades = {}
        
    async def start_pipeline(self):
        """Start the real-time data pipeline"""
        asyncio.create_task(self._process_events())
        asyncio.create_task(self._monitor_market_data())
        
    async def _process_events(self):
        """Process events from the queue"""
        while True:
            event = await self.event_queue.get()
            await self._distribute_event(event)
            self.event_queue.task_done()
    
    async def _monitor_market_data(self):
        """Monitor market data service for new data"""
        while True:
            # Check for new data from market data service
            for symbol in list(self.market_data.data_cache.keys()):
                if self.market_data.data_cache[symbol].get('last_trade'):
                    trade = self.market_data.data_cache[symbol]['last_trade']
                    
                    # Store unique trade reference in _processed_trades
                    # Note: In production, use a more robust ID (e.g., trade ID from provider)
                    if symbol not in self._processed_trades:
                        self._processed_trades[symbol] = set()
                    
                    trade_payload = trade.get('raw', trade)
                    # Simple heuristic: hash the timestamp and price to detect new trades
                    trade_id = f"{trade['timestamp']}_{trade['price']}_{trade['size']}"
                    
                    if trade_id not in self._processed_trades[symbol]:
                        event = MarketEvent(
                            symbol=symbol,
                            event_type='trade',
                            timestamp=trade['timestamp'],
                            data=trade
                        )
                        await self.event_queue.put(event)
                        
                        self._processed_trades[symbol].add(trade_id)
                        
                        # Limit memory leak
                        if len(self._processed_trades[symbol]) > 1000:
                            # Remove oldest half roughly (approximated here)
                            self._processed_trades[symbol] = set(list(self._processed_trades[symbol])[-500:])
            
            await asyncio.sleep(0.1)  # Check every 100ms
    
    async def _distribute_event(self, event: MarketEvent):
        """Distribute event to all subscribers"""
        if event.symbol in self.subscribers:
            for callback in self.subscribers[event.symbol]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(event)
                    else:
                        callback(event)
                except Exception as e:
                    self.logger.error(f"Error in event callback: {str(e)}")
    
    def subscribe(self, symbol: str, callback):
        """Subscribe to real-time events for a symbol"""
        if symbol not in self.subscribers:
            self.subscribers[symbol] = []
        self.subscribers[symbol].append(callback)
    
    def unsubscribe(self, symbol: str, callback):
        """Unsubscribe from real-time events"""
        if symbol in self.subscribers:
            self.subscribers[symbol] = [
                cb for cb in self.subscribers[symbol] 
                if cb != callback
            ]
            if not self.subscribers[symbol]:
                del self.subscribers[symbol]
