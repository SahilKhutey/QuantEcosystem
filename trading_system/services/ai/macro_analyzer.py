import logging
from datetime import datetime
import random

class MacroAnalyzer:
    """
    Integrates macro-economic indicators (Yields, DXY, Inflation) to detect market regimes.
    """
    def __init__(self):
        self.logger = logging.getLogger("AI.MacroAnalyzer")
        self.current_regime = "NORMAL"
        self.indicators = {
            "US10Y": 4.25,
            "DXY": 104.2,
            "VIX": 15.5,
            "GOLD": 2150.0
        }

    def update_indicators(self, new_data: dict):
        self.indicators.update(new_data)
        self._detect_regime()

    def _detect_regime(self):
        """
        Logic for regime detection.
        Example: High VIX + Rising DXY = RISK_OFF
        """
        vix = self.indicators.get("VIX", 15)
        dxy = self.indicators.get("DXY", 100)
        
        if vix > 25:
            self.current_regime = "HIGH_VOLATILITY"
        elif vix < 12:
            self.current_regime = "LOW_VOLATILITY"
        elif dxy > 105:
            self.current_regime = "RISK_OFF"
        else:
            self.current_regime = "NORMAL"
            
        self.logger.info(f"Market Regime updated to: {self.current_regime}")

    def get_macro_context(self) -> dict:
        return {
            'regime': self.current_regime,
            'indicators': self.indicators,
            'timestamp': datetime.utcnow().isoformat()
        }
