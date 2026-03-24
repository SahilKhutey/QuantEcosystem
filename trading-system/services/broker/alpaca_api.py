import alpaca_trade_api as tradeapi
import logging
from trading_system.config.settings import settings

class AlpacaBroker:
    """
    Production-ready Alpaca integration for the Global Trading Terminal.
    Handles order execution, account status, and position management.
    """
    def __init__(self):
        self.api = tradeapi.REST(
            settings.ALPACA_API_KEY,
            settings.ALPACA_SECRET_KEY,
            base_url='https://paper-api.alpaca.markets' if settings.ALPACA_PAPER else 'https://api.alpaca.markets'
        )
        self.logger = logging.getLogger(__name__)

    def get_account_info(self):
        """Returns account details and buying power."""
        try:
            return self.api.get_account()
        except Exception as e:
            self.logger.error(f"Error fetching Alpaca account: {e}")
            return None

    def execute_order(self, symbol, qty, side, type='market', time_in_force='day', limit_price=None):
        """Executes a trade on Alpaca."""
        try:
            order = self.api.submit_order(
                symbol=symbol,
                qty=qty,
                side=side,
                type=type,
                time_in_force=time_in_force,
                limit_price=limit_price
            )
            self.logger.info(f"Submitting {side} order for {qty} shares of {symbol}")
            return order
        except Exception as e:
            self.logger.error(f"Failed to execute Alpaca order: {e}")
            return None

    def get_positions(self):
        """Returns all open positions."""
        return self.api.list_positions()
