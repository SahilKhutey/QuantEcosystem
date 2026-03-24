import logging
from abc import ABC, abstractmethod
from typing import Dict, List

class Strategy(ABC):
    """
    Base class for all trading strategies.
    Defines the standard interface for signal generation.
    """
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(name)

    @abstractmethod
    def generate_signals(self, market_data: Dict) -> List[Dict]:
        pass

class RSIDivergenceStrategy(Strategy):
    """
    Example strategy targeting RSI divergence patterns.
    """
    def __init__(self):
        super().__init__("RSIDivergence")

    def generate_signals(self, market_data: Dict) -> List[Dict]:
        # Implementation of divergence logic
        return []
