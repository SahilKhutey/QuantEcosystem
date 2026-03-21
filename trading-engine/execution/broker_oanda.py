import os
import requests
import logging
from datetime import datetime
from .execution_handler import ExecutionHandler
from core.events import FillEvent, OrderEvent

class OandaExecutionHandler(ExecutionHandler):
    """
    Handles order execution via the OANDA v20 REST API for Forex trading.
    """

    def __init__(self, events_queue):
        """
        Initializes the OANDA handler.
        """
        self.events = events_queue
        self.logger = logging.getLogger("OandaExecutionHandler")
        self.token = os.environ.get("OANDA_API_TOKEN")
        self.account_id = os.environ.get("OANDA_ACCOUNT_ID")
        self.domain = os.environ.get("OANDA_DOMAIN", "api-fxpractice.oanda.com")
        
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        self.logger.info("OANDA Execution Handler initialized.")

    def execute_order(self, event: OrderEvent):
        """
        Translates our OrderEvent to an OANDA order and sends it via REST.
        """
        if event.type == 'ORDER':
            self.logger.info(f"Routing {event.direction} order for {event.quantity} {event.symbol} to OANDA")
            
            # OANDA formatting:
            # symbol mapping (e.g. EURUSD -> EUR_USD)
            oanda_instrument = event.symbol[:3] + '_' + event.symbol[3:]
            
            # Direction
            units = str(event.quantity) if event.direction == 'BUY' else str(-event.quantity)
            
            data = {
                "order": {
                    "units": units,
                    "instrument": oanda_instrument,
                    "timeInForce": "FOK",
                    "type": "MARKET",
                    "positionFill": "DEFAULT"
                }
            }
            
            # Mock the actual HTTP request
            # response = requests.post(
            #     f"https://{self.domain}/v3/accounts/{self.account_id}/orders",
            #     headers=self.headers,
            #     json=data
            # )
            
            # if response.status_code == 201:
            #     # Parse success
            
            # Mocking the async fill response
            fill_event = FillEvent(
                timeindex=datetime.utcnow(),
                symbol=event.symbol,
                exchange='OANDA',
                quantity=event.quantity,
                direction=event.direction,
                fill_cost=1.10, # Mocked price for forex
                commission=0.0 # OANDA uses spread, 0 commission typical
            )
            self.events.put(fill_event)
