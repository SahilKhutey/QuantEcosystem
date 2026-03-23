import json
from datetime import datetime
from config.logging import logger

class AuditTrail:
    def __init__(self, log_file: str = "trades.json"):
        self.log_file = log_file

    def log_trade(self, symbol, qty, side, price, order_id):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "symbol": symbol,
            "qty": qty,
            "side": side,
            "price": price,
            "order_id": order_id
        }
        # Append to json file
        with open(self.log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
        logger.info(f"AUDIT TRAIL: Trade logged for {symbol}")
