import queue
import time
from typing import Callable
import logging

class EventEngine:
    """
    EventEngine is a simple event loop for the trading system.
    It manages an event queue and dispatches events to registered handlers.
    """
    def __init__(self):
        self.queue = queue.Queue()
        self.active = False
        self.handlers = {} # dict of EventType: List[Callable]
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("EventEngine")

    def register_handler(self, event_type, handler: Callable):
        """Register a handler function for a specific event type."""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        if handler not in self.handlers[event_type]:
            self.handlers[event_type].append(handler)
            self.logger.debug(f"Registered handler {handler} for {event_type}")

    def unregister_handler(self, event_type, handler: Callable):
        """Unregister a handler."""
        if event_type in self.handlers and handler in self.handlers[event_type]:
            self.handlers[event_type].remove(handler)
            self.logger.debug(f"Unregistered handler {handler} for {event_type}")

    def put_event(self, event):
        """Put an event into the queue."""
        self.queue.put(event)

    def process_events(self):
        """Process all events currently in the queue."""
        while not self.queue.empty():
            try:
                event = self.queue.get(block=False)
                if hasattr(event, 'type') and event.type in self.handlers:
                    for handler in self.handlers[event.type]:
                        try:
                            handler(event)
                        except Exception as e:
                            self.logger.error(f"Error processing event {event.type} in handler {handler}: {e}")
            except queue.Empty:
                break

    def run(self):
        """
        Main continuous event loop. 
        Will block until self.active is set to False.
        """
        self.active = True
        self.logger.info("Starting Event Engine Loop")
        while self.active:
            self.process_events()
            # Sleep slightly to prevent high CPU usage when idle
            time.sleep(1e-4)

    def stop(self):
        """Stop the event loop."""
        self.active = False
        self.logger.info("Stopping Event Engine Loop")
