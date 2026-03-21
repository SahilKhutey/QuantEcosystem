class SignalCombiner:
    """
    Combines signals from multiple sources using weighted voting or logic gates.
    """
    def combine(self, signals, weights=None):
        """Merges multiple signals into a single output."""
        if weights is None:
            # Simple average IF weights are NOT provided
            return sum(signals) / len(signals)
        
        # Weighted combination
        weighted_signal = sum(s * w for s, w in zip(signals, weights))
        return weighted_signal

    def apply_logic_gate(self, signals, threshold=0.7):
        """Only returns a signal if a certain percentage of models agree."""
        agreement = sum(1 for s in signals if s > 0) / len(signals)
        return 1 if agreement >= threshold else 0
