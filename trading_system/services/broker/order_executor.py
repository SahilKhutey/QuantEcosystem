import logging
from typing import Dict
from trading_system.services.broker.alpaca_api import AlpacaBroker
from trading_system.services.broker.ib_api import IBBroker
from trading_system.services.broker.types import OrderRequest


class OrderExecutor:
    """
    Unified execution engine that routes orders to the appropriate broker.
    Supports Alpaca and Interactive Brokers.
    """

    def __init__(self):
        self.alpaca = AlpacaBroker()
        self.ib = IBBroker()
        self.logger = logging.getLogger(__name__)

    def execute_trade(
        self, symbol: str, qty: int, side: str, broker: str = "alpaca", **kwargs
    ):
        """
        Main entry point for executing trades.
        :param symbol: Ticker symbol (e.g., 'AAPL')
        :param qty: Quantity to trade
        :param side: 'buy' or 'sell'
        :param broker: 'alpaca' or 'ib'
        """
        self.logger.info(
            "Executing %s order for %s %s via %s",
            side.upper(),
            qty,
            symbol,
            broker.upper(),
        )

        if broker.lower() == "alpaca":
            return self.alpaca.execute_order(
                symbol,
                qty,
                side,
                order_type=kwargs.get("order_type", "market"),
                time_in_force=kwargs.get("time_in_force", "day"),
                limit_price=kwargs.get("limit_price"),
                stop_price=kwargs.get("stop_price"),
                client_order_id=kwargs.get("client_order_id"),
                extended_hours=kwargs.get("extended_hours", False),
            )
        elif broker.lower() == "ib":
            if not self.ib.connect():
                self.logger.error("Unable to connect to IB Gateway")
                return None
            try:
                contract = self.ib.create_stock_contract(
                    symbol,
                    exchange=kwargs.get("exchange", "SMART"),
                    currency=kwargs.get("currency", "USD"),
                )
                order = self.ib.create_order(
                    side,
                    qty,
                    order_type=kwargs.get("order_type", "market"),
                    limit_price=kwargs.get("limit_price"),
                    stop_price=kwargs.get("stop_price"),
                    time_in_force=kwargs.get("time_in_force", "DAY"),
                )
                return self.ib.place_order(contract, order)
            finally:
                self.ib.disconnect()
        else:
            self.logger.error(f"Unsupported broker: {broker}")
            return None

    def submit_order(self, order: OrderRequest) -> Dict:
        """
        Submits a structured OrderRequest to the default broker (Alpaca).
        """
        self.logger.info(
            "Submitting %s order for %s via AlphaRouter",
            order.action,
            order.symbol,
        )
        # For now, route everything to Alpaca as primary
        return self.alpaca.execute_order(
            order.symbol,
            order.quantity,
            order.action,
            order_type=order.order_type,
            limit_price=order.price,
            stop_price=order.stop_price,
        )

    def get_aggregated_positions(self):
        """Fetches positions from all configured brokers."""
        positions = {
            "alpaca": self.alpaca.get_positions(),
            "ib": self.ib.get_positions(),
        }
        return positions
