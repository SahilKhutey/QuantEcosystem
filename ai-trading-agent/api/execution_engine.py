from loguru import logger
from typing import Dict

class ExecutionEngine:
    def __init__(self, mode: str = "SIMULATED"):
        self.mode = mode
        logger.info(f"Execution Engine Initialized in {mode} mode")

    def execute_order(self, symbol: str, side: str, amount: float, price: float) -> Dict:
        """Execute a trade order."""
        logger.info(f"Executing {side} order for {symbol} at {price}")
        
        # In SIMULATED mode, we always succeed
        return {
            "status": "COMPLETED",
            "order_id": "sim_123456",
            "symbol": symbol,
            "side": side,
            "executed_price": price,
            "amount": amount
        }

if __name__ == "__main__":
    ee = ExecutionEngine()
    print(ee.execute_order("BTC/USDT", "BUY", 0.1, 65000))
