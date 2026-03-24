import logging
from datetime import datetime

class AssetClassExpander:
    """
    Expands the trading ecosystem into new asset classes (Futures, Forex).
    Handles specialized margin requirements and contract-based execution.
    """
    def __init__(self, risk_manager):
        self.logger = logging.getLogger("Broker.AssetExpander")
        self.risk_manager = risk_manager
        self.supported_assets = {
            "forex": ["EUR/USD", "GBP/USD", "USD/JPY"],
            "futures": ["/ES", "/NQ", "/GC", "/CL"]
        }

    def get_margin_requirements(self, symbol: str) -> dict:
        """Calculate margin needed for Futures or Forex leverage"""
        if symbol.startswith("/"): # Future
            return {"initial_margin": 12000, "maintenance_margin": 11000, "leverage": "High"}
        else: # Forex (Pairs like EUR/USD)
            return {"margin_percent": 0.02, "max_leverage": 50, "type": "Cash-Settled"}

    def prepare_order(self, symbol: str, side: str, quantity: float) -> dict:
        """Formats the specialized order for the broker API"""
        self.logger.info(f"Preparing {symbol} order for multi-asset execution...")
        
        is_future = symbol.startswith("/")
        order_params = {
            "symbol": symbol,
            "side": side,
            "qty": quantity,
            "asset_class": "FUTURES" if is_future else "FOREX",
            "contract_month": "M26" if is_future else None,
            "timestamp": datetime.utcnow().isoformat()
        }
        return order_params

    def get_supported_universe(self):
        return self.supported_assets
