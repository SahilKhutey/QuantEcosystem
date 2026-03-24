import logging
from datetime import datetime, timedelta
import random

class MultiStrategyAggregator:
    """
    Aggregates performance and control for disparate trading algorithms.
    """
    def __init__(self, storage):
        self.logger = logging.getLogger("Portfolio.Aggregator")
        self.storage = storage
        self.strategies = {
            "Momentum_v2": {"status": "ACTIVE", "capital": 500000, "pnl": 12500, "drawdown": 0.02},
            "HFT_Scalper": {"status": "ACTIVE", "capital": 200000, "pnl": 8400, "drawdown": 0.012},
            "Gold_Arbitrage": {"status": "PAUSED", "capital": 100000, "pnl": -2100, "drawdown": 0.045},
            "SIP_Wealth": {"status": "ACTIVE", "capital": 1000000, "pnl": 45000, "drawdown": 0.005},
            "SWP_Distribution": {"status": "ACTIVE", "capital": 1000000, "pnl": -12000, "drawdown": 0.002}
        }

    def get_strategy_stats(self) -> dict:
        return self.strategies

    def toggle_strategy(self, name: str) -> bool:
        if name in self.strategies:
            current = self.strategies[name]["status"]
            self.strategies[name]["status"] = "PAUSED" if current == "ACTIVE" else "ACTIVE"
            self.logger.info(f"Strategy {name} toggled to {self.strategies[name]['status']}")
            return True
        return False

    def get_portfolio_allocation(self) -> list:
        total = sum(s["capital"] for s in self.strategies.values())
        return [
            {"name": k, "value": v["capital"], "percentage": (v["capital"]/total)*100}
            for k, v in self.strategies.items()
        ]

    def get_attribution_metrics(self) -> dict:
        """Simple Brinson-style attribution results"""
        return {
            "selection_effect": 0.024, # Alpha from stock picking
            "allocation_effect": 0.018, # Alpha from sector/algo weighting
            "interaction_effect": 0.003,
            "total_alpha": 0.045
        }
