from abc import ABC, abstractmethod
import pandas as pd
import logging

class BaseStrategy(ABC):
    """
    Standard interface for all trading strategies in the ecosystem.
    """
    def __init__(self, name: str, config: dict = None):
        self.name = name
        self.config = config or {}
        self.logger = logging.getLogger(f"Strategy.{name}")
        self.is_active = False
        self.performance_metrics = {
            'total_trades': 0,
            'win_rate': 0.0,
            'pnl': 0.0,
            'max_drawdown': 0.0
        }

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Processes market data and returns signals (1: Buy, -1: Sell, 0: Hold).
        """
        pass

    def activate(self):
        self.is_active = True
        self.logger.info(f"Strategy {self.name} activated.")

    def deactivate(self):
        self.is_active = False
        self.logger.info(f"Strategy {self.name} deactivated.")

    def update_performance(self, trade_result: dict):
        """Placeholder for performance tracking logic."""
        self.performance_metrics['total_trades'] += 1
        self.performance_metrics['pnl'] += trade_result.get('pnl', 0.0)
