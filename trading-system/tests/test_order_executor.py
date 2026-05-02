import asyncio
import unittest
from unittest.mock import MagicMock, patch

try:
    asyncio.get_running_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())

from trading_system.services.broker.order_executor import OrderExecutor


class TestOrderExecutor(unittest.TestCase):
    def test_execute_trade_routing_to_alpaca(self):
        executor = OrderExecutor()
        executor.alpaca.execute_order = MagicMock(
            return_value={"order_id": "alpaca-123"}
        )

        result = executor.execute_trade(
            "AAPL",
            10,
            "buy",
            broker="alpaca",
            order_type="market",
            time_in_force="day",
        )

        self.assertEqual(result, {"order_id": "alpaca-123"})
        executor.alpaca.execute_order.assert_called_once_with(
            "AAPL",
            10,
            "buy",
            order_type="market",
            time_in_force="day",
            limit_price=None,
            stop_price=None,
            client_order_id=None,
            extended_hours=False,
        )

    @patch("trading_system.services.broker.order_executor.IBBroker")
    def test_execute_trade_routing_to_ib(self, mock_ibbroker_class):
        mock_ib = mock_ibbroker_class.return_value
        mock_ib.connect.return_value = True
        mock_ib.create_stock_contract.return_value = MagicMock(symbol="AAPL")
        mock_ib.create_order.return_value = MagicMock()
        mock_ib.place_order.return_value = {"status": "submitted"}

        executor = OrderExecutor()
        executor.ib = mock_ib

        result = executor.execute_trade(
            "AAPL",
            5,
            "sell",
            broker="ib",
            order_type="limit",
            limit_price=150.0,
            time_in_force="DAY",
        )

        self.assertEqual(result, {"status": "submitted"})
        mock_ib.connect.assert_called_once()
        mock_ib.create_stock_contract.assert_called_once_with(
            "AAPL",
            exchange="SMART",
            currency="USD",
        )
        mock_ib.create_order.assert_called_once_with(
            "sell",
            5,
            order_type="limit",
            limit_price=150.0,
            stop_price=None,
            time_in_force="DAY",
        )
        mock_ib.place_order.assert_called_once()
        mock_ib.disconnect.assert_called_once()


if __name__ == "__main__":
    unittest.main()
