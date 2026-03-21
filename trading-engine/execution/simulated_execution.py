from datetime import datetime
from .execution_handler import ExecutionHandler
from core.events import FillEvent, OrderEvent
from data.feed import DataHandler

class SimulatedExecutionHandler(ExecutionHandler):
    """
    The simulated execution handler simply converts all order
    objects into their equivalent fill objects automatically
    without latency, slippage or fill-ratio issues.

    This allows a straightforward "first pass" test of any strategy,
    before implementation with a more sophisticated execution handler.
    """

    def __init__(self, events_queue, data_handler: DataHandler):
        """
        Initializes the handler, setting the event queue.
        Parameters:
            events_queue - The Queue of Event objects.
            data_handler - So we can fetch the current price for fill cost.
        """
        self.events = events_queue
        self.data_handler = data_handler

    def execute_order(self, event: OrderEvent):
        """
        Simply turns Order objects into Fill objects.
        """
        if event.type == 'ORDER':
            # Get latest price to simulate fill
            try:
                # Naively assume we get filled at the latest close
                fill_price = self.data_handler.get_latest_bar_value(event.symbol, "close")
                timeindex = self.data_handler.get_latest_bar_datetime(event.symbol)
            except KeyError:
                # Fallback if no data available yet
                fill_price = 0.0
                timeindex = datetime.utcnow()

            # Simulate simple slippage - add to buy cost, subtract from sell cost
            # e.g., 0.01% slippage
            slippage = fill_price * 0.0001
            if event.direction == 'BUY':
                fill_price += slippage
            elif event.direction == 'SELL':
                fill_price -= slippage
            
            fill_event = FillEvent(
                timeindex=timeindex,
                symbol=event.symbol,
                exchange='ARCA',    # simulated
                quantity=event.quantity,
                direction=event.direction,
                fill_cost=fill_price,
                commission=0.0 # Will calculate automatically
            )
            fill_event.calculate_commission() # Uses default simple IB model
            self.events.put(fill_event)
