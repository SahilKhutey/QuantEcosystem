import pandas as pd
import numpy as np

class LightGBMRegressorModel:
    """
    Simulates a powerful Microsoft supervised machine learning regressor.
    Ingests technical features across the universe and attempts to map them to Future Return Labels.
    """
    def __init__(self):
        self.is_trained = False
        self.feature_importance = {}

    def fit(self, features: dict, labels: pd.DataFrame):
        """
        Mocks the extensive training process (gradient boosting decision trees).
        """
        # In reality: model.fit(X_train, y_train) using LightGBM/CatBoost
        self.is_trained = True
        
        # Simulated feature importance
        self.feature_importance = {
            'mom_10': 0.65,
            'mom_30': 0.35
        }
        return True

    def predict(self, features: dict) -> pd.DataFrame:
        """
        Outputs "Alpha Scores": the continuous prediction of each asset's localized forward return.
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before calling predict().")
            
        # To simulate a mildly predictive Alpha model, we will generate scores
        # that correlate slightly with the actual underlying momentum (mocking the fit)
        # We use a noisy combination of our mocked features.
        
        mom_10 = features['mom_10'].fillna(0)
        mom_30 = features['mom_30'].fillna(0)
        
        # Alpha Score = Weighted feature prediction + heavy irreducible market noise
        alpha_scores = (mom_10 * 0.65) + (mom_30 * 0.35)
        
        # Add random noise to lower the Information Coefficient (IC) down to realistic ~0.05 levels
        # (A realistic ML model is only right 52-54% of the time)
        noise = pd.DataFrame(
             np.random.normal(0, 0.1, size=alpha_scores.shape),
             index=alpha_scores.index,
             columns=alpha_scores.columns
        )
        
        final_alpha_predictions = alpha_scores + noise
        
        return final_alpha_predictions
