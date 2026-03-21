import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

class PCAFactorAnalyzer:
    """
    Principal Component Analysis (PCA) for identifying latent factors in asset returns.
    Used for factor-based hedging and Eigen-portfolio construction.
    """
    def __init__(self, n_factors=5):
        self.n_factors = n_factors
        self.pca = PCA(n_components=n_factors)
        self.scaler = StandardScaler()
        self.loadings = None

    def fit(self, returns_df: pd.DataFrame):
        """
        Fits PCA to the asset returns.
        """
        # Standardize returns
        scaled_returns = self.scaler.fit_transform(returns_df.dropna())
        
        self.pca.fit(scaled_returns)
        self.loadings = pd.DataFrame(
            self.pca.components_.T, 
            index=returns_df.columns,
            columns=[f'Factor_{i+1}' for i in range(self.n_factors)]
        )
        return self

    def get_explained_variance(self):
        """
        Returns the percentage of variance explained by each factor.
        """
        return self.pca.explained_variance_ratio_

    def construct_eigen_portfolios(self):
        """
        Generates portfolio weights proportional to factor loadings (eigenvectors).
        """
        if self.loadings is None:
            raise ValueError("PCA must be fitted first.")
        
        # Normalize loadings so they sum to 1 (long-only flavor) or have unit norm
        eigen_portfolios = self.loadings.divide(self.loadings.sum(axis=0), axis=1)
        return eigen_portfolios

    def project_returns(self, returns_df: pd.DataFrame):
        """
        Projects returns onto the principal components (factors).
        """
        scaled_returns = self.scaler.transform(returns_df.dropna())
        factor_returns = self.pca.transform(scaled_returns)
        return pd.DataFrame(
            factor_returns, 
            index=returns_df.dropna().index,
            columns=[f'Factor_{i+1}' for i in range(self.n_factors)]
        )

if __name__ == "__main__":
    # Example with synthetic returns
    np.random.seed(42)
    assets = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META']
    returns = pd.DataFrame(np.random.normal(0.001, 0.02, (1000, 5)), columns=assets)
    
    analyzer = PCAFactorAnalyzer(n_factors=3)
    analyzer.fit(returns)
    print("Explained Variance:", analyzer.get_explained_variance())
    print("Eigen Portfolios:\n", analyzer.construct_eigen_portfolios())
