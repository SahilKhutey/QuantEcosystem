import asyncio
import logging
from trading_system.config.settings import settings

try:
    asyncio.get_event_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())

from ib_insync import (
    IB,
    Stock,
    MarketOrder,
    LimitOrder,
    StopOrder,
    StopLimitOrder,
)


class IBBroker:
    """
    Professional Interactive Brokers integration using ib_insync.
    Maintains a persistent connection for real-time execution.
    """

    def __init__(self):
        self.ib = IB()
        self.logger = logging.getLogger(__name__)

    def connect(self):
        """Connects to TWS or IB Gateway."""
        try:
            if not self.ib.isConnected():
                self.ib.connect(
                    settings.IB_HOST,
                    settings.IB_PORT,
                    clientId=settings.IB_CLIENT_ID,
                )
            self.logger.info(
                "Connected to IB Gateway at %s:%s",
                settings.IB_HOST,
                settings.IB_PORT,
            )
            return True
        except Exception as e:
            self.logger.error(f"IB Connection failed: {e}")
            return False

    def disconnect(self):
        try:
            if self.ib.isConnected():
                self.ib.disconnect()
        except Exception as e:
            self.logger.warning(f"Error disconnecting from IB Gateway: {e}")

    def create_stock_contract(self, symbol, exchange="SMART", currency="USD"):
        """Builds a stock contract for IB order placement."""
        return Stock(symbol, exchange=exchange, currency=currency)

    def create_order(
        self,
        action,
        quantity,
        order_type="market",
        limit_price=None,
        stop_price=None,
        time_in_force="DAY",
    ):
        """Creates an IB order object for the requested trade."""
        order_type_lower = order_type.lower()
        if order_type_lower == "limit":
            order = LimitOrder(action.upper(), quantity, limit_price)
        elif order_type_lower == "stop":
            order = StopOrder(action.upper(), quantity, stop_price)
        elif order_type_lower == "stop_limit":
            order = StopLimitOrder(
                action.upper(),
                quantity,
                limit_price,
                stop_price,
            )
        else:
            order = MarketOrder(action.upper(), quantity)

        order.tif = time_in_force.upper()
        return order

    def get_account_summary(self):
        try:
            return self.ib.accountSummary()
        except Exception as e:
            self.logger.error(f"IB account summary failed: {e}")
            return []

    def place_order(self, contract, order):
        """Places an order and returns the trade object."""
        try:
            trade = self.ib.placeOrder(contract, order)
            self.logger.info(
                "Placed order for %s: %s %s",
                contract.symbol,
                order.action,
                order.totalQuantity,
            )
            return trade
        except Exception as e:
            self.logger.error(f"IB order placement failed: {e}")
            return None

    def get_open_orders(self):
        try:
            return self.ib.orders()
        except Exception as e:
            self.logger.error(f"Error fetching open IB orders: {e}")
            return []

    def get_positions(self):
        try:
            return self.ib.positions()
        except Exception as e:
            self.logger.error(f"Error fetching IB positions: {e}")
            return []

    def get_account(self):
        try:
            return self.ib.accountValues()
        except Exception as e:
            self.logger.error(f"Error fetching IB account values: {e}")
            return []
