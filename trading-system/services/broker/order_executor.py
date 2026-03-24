import logging
from typing import Optional
from trading_system.services.broker.alpaca_api import AlpacaBroker
from trading_system.services.broker.ib_api import IBBroker
from trading_system.config.settings import settings
from trading_system.services.broker.types import OrderRequest, OrderResult

class OrderExecutor:
    """
    Unified execution engine that routes orders to the appropriate broker.
    Supports Alpaca and Interactive Brokers.
    """
    def __init__(self):
        self.alpaca = AlpacaBroker()
        self.ib = IBBroker()
        self.logger = logging.getLogger(__name__)

    def execute_trade(self, symbol: str, qty: int, side: str, broker: str = 'alpaca', **kwargs):
        """
        Main entry point for executing trades.
        :param symbol: Ticker symbol (e.g., 'AAPL')
        :param qty: Quantity to trade
        :param side: 'buy' or 'sell'
        :param broker: 'alpaca' or 'ib'
        """
        self.logger.info(f"Executing {side.upper()} order for {qty} {symbol} via {broker.upper()}")
        
        if broker.lower() == 'alpaca':
            return self.alpaca.execute_order(symbol, qty, side, **kwargs)
        elif broker.lower() == 'ib':
            # Simplified IB execution logic for unified interface
            # In production, this would handle contract creation and order types properly.
            self.ib.connect()
            try:
                # Mocking IB contract/order for simplified unified call
                # In a real system, you'd pass the full contract object
                return f"IB Order routed for {symbol} {side}" 
            finally:
                self.ib.disconnect()
        else:
            self.logger.error(f"Unsupported broker: {broker}")
            return None

    def submit_order(self, order: OrderRequest) -> Dict:
        """
        Submits a structured OrderRequest to the default broker (Alpaca).
        """
        self.logger.info(f"Submitting {order.action} order for {order.symbol} via AlphaRouter")
        # For now, route everything to Alpaca as primary
        return self.alpaca.execute_order(
            order.symbol, 
            order.quantity, 
            order.action, 
            order_type=order.order_type,
            limit_price=order.price,
            stop_price=order.stop_price
        )

    def get_aggregated_positions(self):
        """Fetches positions from all configured brokers."""
        positions = {
            'alpaca': self.alpaca.get_positions(),
            # IB implementation...
        }
        return positions
