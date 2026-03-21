from sklearn.ensemble import VotingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression

class EnsembleMethods:
    """
    Ensemble logic to combine predictions from multiple base models.
    """
    def __init__(self, base_models):
        self.base_models = base_models
        self.ensemble = VotingClassifier(
            estimators=[(name, model) for name, model in base_models.items()],
            voting='soft'
        )

    def fit(self, X, y):
        self.ensemble.fit(X, y)

    def predict(self, X):
        return self.ensemble.predict(X)

    def get_stacking_ensemble(self, X, y):
        # Advanced stacking with meta-learner
        return StackingClassifier(
            estimators=[(name, model) for name, model in self.base_models.items()],
            final_estimator=LogisticRegression()
        )
