import numpy as np

class RegimeDetector:
    """
    Determines the current market regime (e.g., Trending vs Mean-Reverting).
    """
    def detect_regime(self, prices, window=30):
        """Identifies volatility and trend to classify market state."""
        returns = prices.pct_change().dropna()
        volatility = returns.rolling(window=window).std().iloc[-1]
        trend = (prices.iloc[-1] / prices.iloc[-window]) - 1
        
        if trend > 0.02 and volatility < 0.01:
            return "STEADY_BULL"
        elif trend < -0.02 and volatility > 0.02:
            return "VOLATILE_BEAR"
        elif abs(trend) < 0.01:
            return "SIDEWAYS"
        else:
            return "UNKNOWN"
