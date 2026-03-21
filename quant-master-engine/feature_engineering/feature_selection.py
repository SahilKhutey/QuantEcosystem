from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestRegressor

class FeatureSelection:
    """
    Techniques for reducing noise and selecting the most predictive features.
    """
    def apply_pca(self, X, n_components=5):
        """Applies Principal Component Analysis for dimensionality reduction."""
        pca = PCA(n_components=n_components)
        return pca.fit_transform(X)

    def select_by_importance(self, X, y, threshold='median'):
        """Selects features based on Random Forest feature importance."""
        selector = SelectFromModel(RandomForestRegressor(), threshold=threshold)
        selector.fit(X, y)
        return selector.transform(X)
