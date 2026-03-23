import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

logger = logging.getLogger('BrokerInterface')

@dataclass
class OrderRequest:
    symbol: str
    action: str  # "BUY" or "SELL"
    quantity: int
    order_type: str = "market"
    price: float = None
    stop_price: float = None
    time_in_force: str = "day"
    client_order_id: str = None
    order_class: str = None
    extended_hours: bool = False
    limit_price: float = None
    take_profit: dict = None
    stop_loss: dict = None

class BrokerAPI(ABC):
    """Abstract base class for all broker integrations"""
    
    @abstractmethod
    def submit_order(self, order: OrderRequest) -> dict:
        """Submit an order to the broker API"""
        pass
    
    @abstractmethod
    def get_order_status(self, order_id: str) -> dict:
        """Get status of a specific order"""
        pass
    
    @abstractmethod
    def cancel_order(self, order_id: str) -> bool:
        """Cancel a specific order"""
        pass
    
    @abstractmethod
    def get_positions(self) -> list:
        """Get current positions"""
        pass
    
    @abstractmethod
    def get_account(self) -> dict:
        """Get account information"""
        pass
    
    @abstractmethod
    def get_historical_data(self, symbol: str, timeframe: str = '1D', 
                          start: str = None, end: str = None) -> dict:
        """Get historical market data"""
        pass
    
    @abstractmethod
    def get_real_time_data(self, symbol: str) -> dict:
        """Get real-time market data"""
        pass
    
    def _check_rate_limit(self):
        """Enforce broker-specific rate limits - to be implemented by subclasses"""
        pass
    
    def _get_headers(self):
        """Get authentication headers - to be implemented by subclasses"""
        pass
    
    def _validate_order(self, order: OrderRequest) -> tuple:
        """Validate order parameters before submission"""
        # Common validation
        if not order.symbol or not order.symbol.strip():
            return False, "Missing symbol"
        
        if order.action not in ['BUY', 'SELL']:
            return False, f"Invalid action: {order.action}"
        
        if order.quantity <= 0:
            return False, f"Invalid quantity: {order.quantity}"
        
        # Broker-specific validation
        return True, "Valid order"

class GlobalBrokerRouter(BrokerAPI):
    """Routes requests to the appropriate broker API"""
    
    def __init__(self):
        self.brokers = {}
        self.active_broker = None
    
    def add_broker(self, name: str, broker: BrokerAPI):
        """Add a broker to the routing system"""
        self.brokers[name] = broker
        if not self.active_broker:
            self.active_broker = name
        logger.info(f"Added broker: {name}")
    
    def set_active_broker(self, name: str):
        """Set the active broker for trading operations"""
        if name not in self.brokers:
            logger.error(f"Broker {name} not found")
            return False
        self.active_broker = name
        logger.info(f"Active broker set to: {name}")
        return True
    
    def get_active_broker(self) -> BrokerAPI:
        """Get the active broker API instance"""
        if not self.active_broker:
            logger.error("No active broker set")
            return None
        return self.brokers[self.active_broker]
    
    def submit_order(self, order: OrderRequest) -> dict:
        """Submit an order using the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return {'error': 'No active broker', 'status': 'rejected'}
        return broker.submit_order(order)
    
    def get_order_status(self, order_id: str) -> dict:
        """Get order status using the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return {'error': 'No active broker', 'status': 'unknown'}
        return broker.get_order_status(order_id)
    
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an order using the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return False
        return broker.cancel_order(order_id)
    
    def get_positions(self) -> list:
        """Get current positions from the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return []
        return broker.get_positions()
    
    def get_account(self) -> dict:
        """Get account information from the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return {'error': 'No active broker'}
        return broker.get_account()
    
    def get_historical_data(self, symbol: str, timeframe: str = '1D', 
                          start: str = None, end: str = None) -> dict:
        """Get historical data from the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return {'error': 'No active broker'}
        return broker.get_historical_data(symbol, timeframe, start, end)
    
    def get_real_time_data(self, symbol: str) -> dict:
        """Get real-time data from the active broker"""
        broker = self.get_active_broker()
        if not broker:
            return {'error': 'No active broker'}
        return broker.get_real_time_data(symbol)
    
    def get_broker_list(self) -> list:
        """Get list of available brokers"""
        return list(self.brokers.keys())
