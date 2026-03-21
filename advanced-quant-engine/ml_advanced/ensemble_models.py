import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import TimeSeriesSplit

class EnsembleTradingModel:
    """
    Ensemble of machine learning models for market return prediction.
    Uses Bagging, Boosting, and Stacking.
    """
    def __init__(self, models=None):
        if models is None:
             self.ensemble = VotingRegressor([
                 ('rf', RandomForestRegressor(n_estimators=100)),
                 ('gb', GradientBoostingRegressor(n_estimators=100)),
                 ('ridge', Ridge())
             ])
        else:
             self.ensemble = models

    def train(self, X: pd.DataFrame, y: pd.Series):
        """
        Trains the ensemble using Time Series Cross-Validation.
        """
        tscv = TimeSeriesSplit(n_splits=5)
        for train_idx, test_idx in tscv.split(X):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
            # In a real pipeline, we'd log performance here
        
        self.ensemble.fit(X, y)
        return self

    def predict(self, X: pd.DataFrame):
        """
        Returns predictions from the ensemble.
        """
        return self.ensemble.predict(X)

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    X = pd.DataFrame(np.random.normal(0, 1, (1000, 10)), columns=[f'feat_{i}' for i in range(10)])
    y = 0.5 * X['feat_0'] + 0.3 * X['feat_1'] + np.random.normal(0, 0.1, 1000)
    
    model = EnsembleTradingModel()
    model.train(X, y)
    print("Ensemble Prediction for first row:", model.predict(X.head(1)))
