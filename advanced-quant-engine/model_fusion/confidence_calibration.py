import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.isotonic import IsotonicRegression

class ConfidenceCalibrator:
    """
    Calibrates model output confidence scores to reflect real-world probabilities.
    Supports Platt Scaling and Isotonic Regression.
    """
    def __init__(self, method='platt'):
        self.method = method
        self.model = None

    def fit(self, scores, labels):
        """
        Fits the calibration model using historical scores and outcomes.
        Labels should be binary (e.g., Return > 0).
        """
        if self.method == 'platt':
            self.model = LogisticRegression()
            self.model.fit(scores.reshape(-1, 1), labels)
        elif self.method == 'isotonic':
            self.model = IsotonicRegression(out_of_bounds='clip')
            self.model.fit(scores, labels)
        return self

    def calibrate(self, scores):
        """
        Returns calibrated probabilities.
        """
        if self.method == 'platt':
            return self.model.predict_proba(scores.reshape(-1, 1))[:, 1]
        elif self.method == 'isotonic':
            return self.model.transform(scores)
            
if __name__ == "__main__":
    # Example
    scores = np.random.uniform(0, 1, 100)
    labels = (scores + np.random.normal(0, 0.1, 100) > 0.5).astype(int)
    
    cal = ConfidenceCalibrator(method='platt')
    cal.fit(scores, labels)
    calibrated = cal.calibrate(np.array([0.7, 0.2]))
    print("Calibrated probabilities for 0.7 and 0.2:", calibrated)
