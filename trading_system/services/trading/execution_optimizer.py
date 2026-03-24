import logging
from datetime import datetime
import random

class ExecutionOptimizer:
    """
    Optimizes order execution for top-tier instruments by analyzing
    slippage, fill rates, and market impact.
    """
    def __init__(self, storage):
        self.logger = logging.getLogger("Execution.Optimizer")
        self.storage = storage
        self.top_instruments = ["SPY", "QQQ", "AAPL", "MSFT", "TSLA"]
        self.execution_stats = {
            symbol: {"avg_slippage": 0.0002, "fill_rate": 0.98, "impact_cost": 0.0001}
            for symbol in self.top_instruments
        }

    def get_optimized_route(self, symbol: str, side: str, quantity: float) -> dict:
        """Suggests the best order type and routing based on recent stats"""
        stats = self.execution_stats.get(symbol, {"avg_slippage": 0.0005, "fill_rate": 0.92})
        
        # Adaptive Logic:
        # If slippage is high, use Limit orders
        # If fill rate is low, use IOC (Immediate or Cancel) or Market with max slippage
        
        if stats['avg_slippage'] > 0.001:
            order_type = "LIMIT"
            limit_price = "MID_PRICE + OFFSET" 
        else:
            order_type = "MARKET"
            limit_price = None

        return {
            "symbol": symbol,
            "side": side,
            "quantity": quantity,
            "suggested_type": order_type,
            "limit_price_hint": limit_price,
            "expected_impact": quantity * stats.get('impact_cost', 0.0001),
            "timestamp": datetime.utcnow().isoformat()
        }

    def update_stats(self, symbol: str, actual_slippage: float, fill_rate: float):
        if symbol in self.execution_stats:
            # Simple moving average update
            s = self.execution_stats[symbol]
            s['avg_slippage'] = (s['avg_slippage'] * 0.9) + (actual_slippage * 0.1)
            s['fill_rate'] = (s['fill_rate'] * 0.9) + (fill_rate * 0.1)
            self.logger.info(f"Updated Execution Stats for {symbol}: Slippage={s['avg_slippage']:.6f}")

    def get_top_instrument_stats(self):
        return self.execution_stats
