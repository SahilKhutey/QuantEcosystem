import numpy as np

class ConfidenceCalculator:
    """
    Assigns confidence scores to signals based on model performance metrics.
    """
    def __init__(self, history_len=100):
        self.history_len = history_len
        self.model_accuracies = {}

    def update_accuracy(self, model_name, was_correct):
        """Updates the running accuracy of a specific model engine."""
        if model_name not in self.model_accuracies:
            self.model_accuracies[model_name] = []
        self.model_accuracies[model_name].append(1 if was_correct else 0)
        if len(self.model_accuracies[model_name]) > self.history_len:
            self.model_accuracies[model_name].pop(0)

    def calculate_confidence(self, model_name):
        """Returns a confidence score between 0 and 1."""
        if model_name not in self.model_accuracies or not self.model_accuracies[model_name]:
            return 0.5 # Default confidence
        return np.mean(self.model_accuracies[model_name])
