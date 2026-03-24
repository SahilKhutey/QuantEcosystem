import logging
from datetime import datetime
import numpy as np

class SignalFusion:
    """
    Aggregates multi-modal signals (Sentiment, OBI, Macro) into a unified Master Alpha signal.
    """
    def __init__(self):
        self.logger = logging.getLogger("AI.SignalFusion")
        self.weights = {
            'sentiment': 0.3,
            'obi': 0.4,
            'macro': 0.3
        }

    def fuse_signals(self, sentiment: float, obi: float, macro_regime: str) -> dict:
        """
        Bayesian-inspired signal fusion.
        Macro regime acts as a multiplier/gate.
        """
        # Regime Multiplier
        regime_map = {
            "NORMAL": 1.0,
            "RISK_ON": 1.2,
            "RISK_OFF": 0.5,
            "HIGH_VOLATILITY": 0.3
        }
        regime_multiplier = regime_map.get(macro_regime, 1.0)
        
        # Weighted Average
        raw_score = (sentiment * self.weights['sentiment']) + (obi * self.weights['obi'])
        
        # Final Master Score
        fused_score = raw_score * regime_multiplier
        
        # Confidence calculation (agreement between sources)
        agreement = 1.0 - abs(sentiment - obi) / 2.0
        confidence = agreement * regime_multiplier
        
        action = "NEUTRAL"
        if fused_score > 0.4: action = "STRENGTH_BUY"
        elif fused_score > 0.15: action = "MODERATE_BUY"
        elif fused_score < -0.4: action = "STRENGTH_SELL"
        elif fused_score < -0.15: action = "MODERATE_SELL"
        
        return {
            'master_score': round(fused_score, 4),
            'confidence': round(min(1.0, confidence), 4),
            'action': action,
            'components': {
                'sentiment': sentiment,
                'obi': obi,
                'regime': macro_regime
            },
            'timestamp': datetime.utcnow().isoformat()
        }
