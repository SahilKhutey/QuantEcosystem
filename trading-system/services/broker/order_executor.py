from .alpaca_api import AlpacaAPI, OrderRequest
from .ib_api import IBKRAPI
from config.logging import logger

class OrderExecutor:
    def __init__(self, preferred_broker='alpaca'):
        self.alpaca = AlpacaAPI()
        self.ibkr = IBKRAPI()
        self.preferred_broker = preferred_broker

    async def execute(self, symbol, qty, side, price=None, order_type='market'):
        logger.info(f"Executing {side} order for {qty} shares of {symbol}")
        
        if self.preferred_broker == 'alpaca':
            # Use the new OrderRequest dataclass for Alpaca
            order_req = OrderRequest(
                symbol=symbol,
                action=side.upper(),
                quantity=qty,
                order_type=order_type,
                price=price
            )
            return self.alpaca.submit_order(order_req)
            
        elif self.preferred_broker == 'ibkr':
            return await self.ibkr.place_order(symbol, qty, side.upper())
        else:
            logger.error(f"Unsupported broker: {self.preferred_broker}")
            return None
