from ib_insync import *
import logging
from trading_system.config.settings import settings

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
            self.ib.connect(
                settings.IB_HOST, 
                settings.IB_PORT, 
                clientId=settings.IB_CLIENT_ID
            )
            self.logger.info(f"Connected to IB Gateway at {settings.IB_HOST}:{settings.IB_PORT}")
        except Exception as e:
            self.logger.error(f"IB Connection failed: {e}")

    def disconnect(self):
        self.ib.disconnect()

    def get_account_summary(self):
        return self.ib.accountSummary()

    def place_order(self, contract, order):
        """Places an order and returns the trade object."""
        trade = self.ib.placeOrder(contract, order)
        self.logger.info(f"Placed order for {contract.symbol}: {order.action} {order.totalQuantity}")
        return trade

    def get_open_orders(self):
        return self.ib.orders()
