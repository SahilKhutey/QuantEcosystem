import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis

class AdvancedFeatureEngineer:
    """
    Advanced Feature Extraction for financial time series.
    Includes Fractional Differentiation, Lagging, and Rolling Statistics.
    """
    def __init__(self, lags=[1, 2, 5, 20]):
        self.lags = lags

    def fractional_differentiation(self, series: pd.Series, d=0.5, thres=1e-4):
        """
        Implementation of fractional differentiation to preserve memory in returns.
        Based on Marcos Lopez de Prado's "Advances in Financial Machine Learning".
        """
        # Simplified Fixed-Window Fractional Difference
        w = self._get_weights(d, len(series), thres)
        res = series.rolling(window=len(w)).apply(lambda x: np.dot(x, w), raw=True)
        return res

    def _get_weights(self, d, size, thres):
        w = [1.]
        for k in range(1, size):
            w_k = -w[-1] * (d - k + 1) / k
            if abs(w_k) < thres:
                 break
            w.append(w_k)
        return np.array(w[::-1])

    def build_features(self, df: pd.DataFrame):
        """
        Builds a comprehensive feature set for a given price dataframe.
        """
        features = pd.DataFrame(index=df.index)
        
        # 1. Log Returns
        features['returns'] = np.log(df / df.shift(1))
        
        # 2. Lags
        for lag in self.lags:
            features[f'return_lag_{lag}'] = features['returns'].shift(lag)
            
        # 3. Volatility (Rolling Std)
        features['vol_20'] = features['returns'].rolling(window=20).std()
        
        # 4. Momentum (RSI, MA Cross)
        features['ma_50'] = df.rolling(window=50).mean() / df
        
        # 5. Fractionally Differentiated Prices
        features['frac_diff_0.5'] = self.fractional_differentiation(df, d=0.5)
        
        return features.dropna()

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    prices = pd.Series(100 + np.cumsum(np.random.normal(0, 1, 1000)))
    
    eng = AdvancedFeatureEngineer()
    feats = eng.build_features(prices)
    print("Feature columns:", feats.columns.tolist())
    print("Feature preview:\n", feats.head())
