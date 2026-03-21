import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from sklearn.mixture import GaussianMixture

class MarketRegimeDetector:
    """
    Uses Unsupervised Learning (GMM) to segment market states.
    Identifies regimes like: High Volatility, Bull Trend, Mean Reverting, etc.
    """
    def __init__(self, n_regimes: int = 4):
        self.clustering = GaussianMixture(n_components=n_regimes, random_state=42)
        self.regime_history = []
        self._is_fitted = False
    
    def detect_regime(self, market_data: pd.DataFrame) -> Dict:
        """Detect current market regime using clustering on recent features"""
        features = self._extract_regime_features(market_data)
        
        # Standardize and fit if needed (simplified for interactive demo)
        if not self._is_fitted:
            # We would typically train on historical data first
            # Here we mock a pre-trained state
            self._is_fitted = True
            dummy_data = np.random.randn(100, features.shape[0])
            self.clustering.fit(dummy_data)
        
        # Identify current cluster
        regime = self.clustering.predict(features.reshape(1, -1))[0]
        
        # Mapping clusters to meaningful regimes based on Volatility/Momentum Vectors
        regimes = {
            0: {'name': 'low_vol_bull', 'volatility': 'low', 'trend': 'up'},
            1: {'name': 'high_vol_bear', 'volatility': 'high', 'trend': 'down'},
            2: {'name': 'sideways_jitter', 'volatility': 'medium', 'trend': 'neutral'},
            3: {'name': 'panic_selling', 'volatility': 'very_high', 'trend': 'crash'}
        }
        
        current_regime = regimes.get(regime, regimes[2])
        
        # Calculate cluster probability as a confidence check
        probabilities = self.clustering.predict_proba(features.reshape(1, -1))[0]
        confidence = float(probabilities[regime])
        
        return {
            'regime': current_regime['name'],
            'confidence': round(confidence, 4),
            'characteristics': current_regime,
            'recommended_strategies': self._get_recommended_strategies(current_regime)
        }

    def _extract_regime_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract volatility, momentum, and volume features for state detection"""
        # Returns: [Volatility, Momentum, Volume Ratio, Spread]
        if len(df) < 20:
            return np.array([0, 0, 0, 0])
            
        returns = df['close'].pct_change().iloc[-20:]
        vol = returns.std()
        mom = returns.mean()
        vol_ratio = df['volume'].iloc[-1] / df['volume'].iloc[-20:].mean()
        
        return np.array([vol, mom, vol_ratio, 0.001]) # 0.001 as mock spread

    def _get_recommended_strategies(self, current_regime: Dict) -> List[str]:
        """Maps regimes to pre-implemented strategy modules"""
        mapping = {
            'low_vol_bull': ['momentum', 'swing'],
            'high_vol_bear': ['short_scalping', 'intraday'],
            'sideways_jitter': ['mean_reversion', 'scalping'],
            'panic_selling': ['mean_reversion', 'algo_hft']
        }
        return mapping.get(current_regime['name'], ['algorithmic'])
