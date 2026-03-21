class ModelOrchestrator:
    """
    Coordinates execution across multiple model engines to produce a unified signal feed.
    """
    def __init__(self, models):
        self.models = models

    def execute_pipeline(self, data):
        """Runs data through all registered models and collects results."""
        results = {}
        for name, model in self.models.items():
            results[name] = model.predict(data)
        return results

    def aggregate_results(self, results):
        """Combines model results into a primary signal."""
        # Weighted average based on confidence scores
        return sum(results.values()) / len(results)
