from enum import Enum
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

class EventType(Enum):
    MARKET = "MARKET"
    SIGNAL = "SIGNAL"
    ORDER = "ORDER"
    FILL = "FILL"

class Event:
    """Base class providing an interface for all subsequent events."""
    pass

@dataclass
class MarketEvent(Event):
    """
    Handles the event of receiving a new market update with corresponding bars.
    """
    type: EventType = EventType.MARKET

@dataclass
class SignalEvent(Event):
    """
    Handles the event of sending a Signal from a Strategy object.
    This is received by a Portfolio object and acted upon.
    """
    symbol: str
    datetime: datetime
    signal_type: str  # 'LONG' or 'SHORT'
    target_pos: Optional[float] = None
    strength: float = 1.0
    type: EventType = EventType.SIGNAL

@dataclass
class OrderEvent(Event):
    """
    Handles the event of sending an Order to an execution system.
    """
    symbol: str
    order_type: str # 'MKT' or 'LMT'
    quantity: int
    direction: str # 'BUY' or 'SELL'
    type: EventType = EventType.ORDER

    def print_order(self):
        print(f"Order: Symbol={self.symbol}, Type={self.order_type}, Quantity={self.quantity}, Direction={self.direction}")

@dataclass
class FillEvent(Event):
    """
    Encapsulates the notion of a Filled Order, as returned
    from a brokerage/execution handler.
    """
    timeindex: datetime
    symbol: str
    exchange: str
    quantity: int
    direction: str # 'BUY' or 'SELL'
    fill_cost: float
    commission: float = 0.0
    type: EventType = EventType.FILL

    def calculate_commission(self):
        """Default simple model for calculating commissions based on IB's typical structure"""
        if self.commission == 0.0:
            self.commission = max(1.0, self.fill_cost * self.quantity * 0.001)
        return self.commission
