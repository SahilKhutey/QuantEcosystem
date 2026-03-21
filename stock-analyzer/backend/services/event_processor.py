from kafka import KafkaProducer, KafkaConsumer
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Callable, Awaitable

class MarketEventProcessor:
    def __init__(self, bootstrap_servers: list = ['localhost:9092']):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        self.event_handlers: Dict[str, Callable[[Dict], Awaitable[None]]] = {
            'price_alert': self._handle_price_alert,
            'news_event': self._handle_news_event,
            'correlation_break': self._handle_correlation_break
        }
    
    def publish_event(self, event_type: str, data: Dict[str, Any]):
        """Publish event to Kafka"""
        event = {
            'type': event_type,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.producer.send('market_events', event)
        
    async def consume_events(self):
        """Consume and process events"""
        consumer = KafkaConsumer(
            'market_events',
            bootstrap_servers=['localhost:9092'],
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        for message in consumer:
            event = message.value
            handler = self.event_handlers.get(event['type'])
            if handler:
                await handler(event['data'])

    async def _handle_price_alert(self, data: Dict):
        """Handle price alert logic"""
        print(f"Price alert received: {data}")

    async def _handle_news_event(self, data: Dict):
        """Handle news event logic"""
        print(f"News event received: {data}")

    async def _handle_correlation_break(self, data: Dict):
        """Handle correlation break logic"""
        print(f"Correlation break received: {data}")

class AlertManager:
    def __init__(self, event_processor: MarketEventProcessor):
        self.event_processor = event_processor
        
    def check_price_alerts(self, current_prices: Dict[str, float], alert_thresholds: Dict[str, Dict[str, float]]):
        """Check for price threshold breaches"""
        for symbol, price in current_prices.items():
            thresholds = alert_thresholds.get(symbol, {})
            
            if price >= thresholds.get('upper', float('inf')):
                self.event_processor.publish_event('price_alert', {
                    'symbol': symbol,
                    'price': price,
                    'alert_type': 'upper_threshold_breach',
                    'threshold': thresholds['upper']
                })
                
            elif price <= thresholds.get('lower', float('-inf')):
                self.event_processor.publish_event('price_alert', {
                    'symbol': symbol,
                    'price': price,
                    'alert_type': 'lower_threshold_breach',
                    'threshold': thresholds['lower']
                })
