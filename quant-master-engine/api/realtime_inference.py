class RealtimeInference:
    """
    Engine optimized for low-latency signal calculation on live data streams.
    """
    def __init__(self, ensemble_model):
        self.ensemble_model = ensemble_model

    def process_tick(self, tick_data):
        """Processes a single market tick and returns a signal if conditions met."""
        # Implementation would use pre-loaded weights for speed
        prediction = self.ensemble_model.predict(tick_data)
        return {
            "timestamp": tick_data.get('timestamp'),
            "prediction": prediction,
            "action": "BUY" if prediction > 0.6 else "HOLD"
        }
