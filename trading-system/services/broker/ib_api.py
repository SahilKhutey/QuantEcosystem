from ib_insync import IB, Stock, MarketOrder
from config.settings import settings
from config.logging import logger

class IBKRAPI:
    def __init__(self):
        self.ib = IB()
        self.connected = False

    async def connect(self):
        try:
            await self.ib.connectAsync(
                settings.IB_HOST, settings.IB_PORT, clientId=settings.IB_CLIENT_ID
            )
            self.connected = True
            logger.info("Connected to IBKR Gateway/TWS.")
        except Exception as e:
            logger.error(f"IBKR Connection failed: {str(e)}")

    async def place_order(self, symbol, qty, action='BUY', exchange='SMART', currency='USD'):
        if not self.connected:
            await self.connect()
        
        contract = Stock(symbol, exchange, currency)
        order = MarketOrder(action, qty)
        trade = self.ib.placeOrder(contract, order)
        logger.info(f"Order placed on IBKR: {trade.order.orderId} for {symbol}")
        return trade
