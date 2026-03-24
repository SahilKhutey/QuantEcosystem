from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class OrderRequest:
    symbol: str
    action: str  # "BUY" or "SELL"
    quantity: int
    order_type: str = "market"
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "day"
    client_order_id: Optional[str] = None
    extended_hours: bool = False
    take_profit: Optional[Dict[str, float]] = None
    stop_loss: Optional[Dict[str, float]] = None

@dataclass
class OrderResult:
    order_id: str
    status: str
    symbol: str
    action: str
    quantity: int
    price: Optional[float] = None
    timestamp: float = 0.0
    error: Optional[str] = None
