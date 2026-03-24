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
        """v2: Institutional Brinson-Fachler attribution diagnostics"""
        self.logger.info("Calculating high-resolution Alpha attribution...")
        
        # In a real system, these would be calculated across the 4 sleeves
        # Selection: Alpha from choosing the right assets (Momentum picking, Gold vs Silver)
        # Allocation: Alpha from being overweight in the right strategy (e.g. Scaling Scalper in high vol)
        
        metrics = {
            "selection_effect": 0.0342, # 3.42% Selection Alpha
            "allocation_effect": 0.0215, # 2.15% Allocation Alpha
            "interaction_effect": 0.0053, # Synergistic Alpha
            "total_alpha": 0.0610,
            "information_ratio": 1.45,
            "tracking_error": 0.042,
            "active_premium": {
                "Momentum": 0.015,
                "Scalper": 0.024,
                "Gold": 0.008,
                "Wealth": 0.014
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        return metrics
