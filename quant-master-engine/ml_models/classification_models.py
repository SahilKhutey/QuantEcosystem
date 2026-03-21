from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import xgboost as xgb

class ClassificationModels:
    """
    Directional prediction models (Up/Down/Flat).
    """
    def __init__(self, model_type='rf'):
        if model_type == 'rf':
            self.model = RandomForestClassifier(n_estimators=100)
        elif model_type == 'svc':
            self.model = SVC(probability=True)
        elif model_type == 'xgb':
            self.model = xgb.XGBClassifier()
        else:
            raise ValueError("Unsupported classification model.")

    def fit(self, X, y):
        self.model.fit(X, y)

    def predict_proba(self, X):
        return self.model.predict_proba(X)
