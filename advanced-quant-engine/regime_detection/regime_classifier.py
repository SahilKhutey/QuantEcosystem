import numpy as np
import pandas as pd
from .kalman_filter import KalmanRegimeDetector
from .hidden_markov import HMMRegimeDetector

class UnifiedRegimeClassifier:
    """
    Orchestrator for multiple regime detection models.
    Combines Kalman signals, HMM states, and volatility metrics into a final regime classification.
    """
    def __init__(self, n_hmm_states=3):
        self.kalman = KalmanRegimeDetector()
        self.hmm = HMMRegimeDetector(n_components=n_hmm_states)
        self.n_hmm_states = n_hmm_states

    def classify(self, data: pd.Series):
        """
        Classifies the current market regime based on cumulative evidence.
        Regimes: 
        0: Steady/Mean-Reverting (Low Vol)
        1: Trending (Bull/Bear)
        2: High Volatility/Crisis
        """
        # Get individual signals
        kalman_trend = self.kalman.extract_regime_signals(data)
        
        # Fit and predict HMM
        self.hmm.fit(data)
        hmm_states = self.hmm.predict_regimes(data)
        
        # Combine using logic (simple voting or weighted average)
        # For simplicity, let's look at the correlation between trend and HMM states
        # In a real engine, this would be a trained MLP or Bayesian update.
        
        # Calculate Rolling Volatility
        vol = data.pct_change().rolling(window=20).std()
        avg_vol = vol.mean()
        
        regimes = []
        for i in range(len(data)):
            if i < 20:
                regimes.append(0) # Not enough data
                continue
                
            state_hmm = hmm_states.iloc[i]
            trend_val = abs(kalman_trend.iloc[i])
            curr_vol = vol.iloc[i]
            
            # Simple heuristic
            if curr_vol > 2 * avg_vol:
                regimes.append(2) # Crisis/High Vol
            elif trend_val > 1.5:
                regimes.append(1) # Trending
            else:
                regimes.append(0) # Steady
                
        return pd.Series(regimes, index=data.index)

if __name__ == "__main__":
    # Synthetic data test
    np.random.seed(42)
    t = np.linspace(0, 100, 1000)
    prices = pd.Series(100 + np.cumsum(np.random.normal(0, 1, 1000)))
    
    classifier = UnifiedRegimeClassifier()
    regimes = classifier.classify(prices)
    print(regimes.value_counts())
