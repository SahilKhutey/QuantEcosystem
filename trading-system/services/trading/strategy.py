from abc import ABC, abstractmethod
import logging
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger('Strategy')

class Strategy(ABC):
    """
    Professional Base Strategy Class with lifecycle management
    """
    def __init__(self, name: str, symbol: str):
        self.name = name
        self.symbol = symbol
        self.active = False
        self.logger = logger
        self.positions = {}
        self.signals = []
        
    @abstractmethod
    def on_start(self):
        """Called when strategy starts"""
        self.active = True
        self.logger.info(f"Strategy {self.name} started for {self.symbol}")

    @abstractmethod
    def on_stop(self):
        """Called when strategy stops"""
        self.active = False
        self.logger.info(f"Strategy {self.name} stopped")

    @abstractmethod
    def on_bar(self, bar: Dict):
        """Called on every new candle/bar"""
        pass

    @abstractmethod
    def on_tick(self, tick: Dict):
        """Called on every new price tick"""
        pass

    @abstractmethod
    def on_order_update(self, order: Dict):
        """Called when an order status changes"""
        pass

    def log_signal(self, signal_type: str, price: float, confidence: float):
        """Log and store generated signals"""
        signal = {
            'timestamp': datetime.now().isoformat(),
            'symbol': self.symbol,
            'type': signal_type,
            'price': price,
            'confidence': confidence
        }
        self.signals.append(signal)
        self.logger.info(f"SIGNAL [{self.name}]: {signal_type} at {price} (Conf: {confidence:.2f})")
        return signal
