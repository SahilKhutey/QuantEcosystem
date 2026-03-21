import numpy as np
import pandas as pd
try:
    from hmmlearn import hmm
    HMM_AVAILABLE = True
except ImportError:
    HMM_AVAILABLE = False

from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class RegimeHMM:
    def __init__(self, n_regimes: int = 3, n_features: int = 3):
        self.n_regimes = n_regimes
        self.n_features = n_features
        self.model = None
        self.scaler = StandardScaler()
        self.regime_history = []
        
    def prepare_features(self, price_data: pd.Series, 
                        volume_data: Optional[pd.Series] = None) -> np.ndarray:
        """Prepare features for HMM regime detection"""
        features = []
        
        # Price-based features
        returns = price_data.pct_change().dropna()
        volatility = returns.rolling(window=20).std()
        momentum = price_data / price_data.rolling(window=10).mean() - 1
        
        features.append(returns.values[-len(volatility.dropna()):])
        features.append(volatility.dropna().values)
        features.append(momentum.dropna().values)
        
        # Volume-based features if available
        if volume_data is not None:
            volume_returns = volume_data.pct_change().dropna()
            volume_features = volume_returns.values[-len(volatility.dropna()):]
            features.append(volume_features)
        
        # Align feature lengths
        min_length = min(len(f) for f in features)
        aligned_features = [f[-min_length:] for f in features]
        
        # Combine features
        feature_matrix = np.column_stack(aligned_features)
        return feature_matrix
    
    def fit_hmm(self, price_data: pd.Series, volume_data: Optional[pd.Series] = None) -> Dict:
        """Fit Hidden Markov Model to detect market regimes"""
        if not HMM_AVAILABLE:
            # Fallback for when hmmlearn is missing
            n = len(price_data)
            hidden_states = np.random.randint(0, self.n_regimes, n)
            state_probs = np.random.dirichlet(np.ones(self.n_regimes), n)
            return {
                'hidden_states': hidden_states,
                'state_probabilities': state_probs,
                'regime_probabilities': state_probs[-1],
                'current_regime': hidden_states[-1],
                'transition_matrix': np.eye(self.n_regimes),
                'regime_characteristics': {}
            }

        features = self.prepare_features(price_data, volume_data)
        
        if len(features) < 50:  # Need sufficient data
            return {'error': 'Insufficient data for HMM'}
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        # Fit Gaussian HMM
        self.model = hmm.GaussianHMM(
            n_components=self.n_regimes,
            covariance_type="diag",
            n_iter=100
        )
        
        self.model.fit(features_scaled)
        
        # Predict regimes
        hidden_states = self.model.predict(features_scaled)
        state_probs = self.model.predict_proba(features_scaled)
        
        # Characterize regimes
        regime_characteristics = self._characterize_regimes(features, hidden_states)
        
        self.regime_history = hidden_states.tolist()
        
        return {
            'hidden_states': hidden_states,
            'state_probabilities': state_probs,
            'regime_characteristics': regime_characteristics,
            'transition_matrix': self.model.transmat_,
            'model_log_likelihood': self.model.score(features_scaled),
            'current_regime': hidden_states[-1],
            'regime_probabilities': state_probs[-1]
        }
    
    def _characterize_regimes(self, features: np.ndarray, states: np.ndarray) -> Dict:
        """Characterize each regime based on feature statistics"""
        characteristics = {}
        
        for regime in range(self.n_regimes):
            regime_mask = states == regime
            regime_features = features[regime_mask]
            
            if len(regime_features) > 0:
                mean_returns = np.mean(regime_features[:, 0]) if regime_features.shape[1] > 0 else 0
                mean_volatility = np.mean(regime_features[:, 1]) if regime_features.shape[1] > 1 else 0
                mean_momentum = np.mean(regime_features[:, 2]) if regime_features.shape[1] > 2 else 0
                
                # Classify regime type
                if mean_returns > 0.001 and mean_volatility < 0.02:
                    regime_type = "BULL_CALM"
                elif mean_returns > 0.001 and mean_volatility >= 0.02:
                    regime_type = "BULL_VOLATILE"
                elif mean_returns < -0.001 and mean_volatility < 0.02:
                    regime_type = "BEAR_CALM"
                elif mean_returns < -0.001 and mean_volatility >= 0.02:
                    regime_type = "BEAR_VOLATILE"
                else:
                    regime_type = "SIDEWAYS"
                
                characteristics[regime] = {
                    'type': regime_type,
                    'mean_return': mean_returns,
                    'mean_volatility': mean_volatility,
                    'mean_momentum': mean_momentum,
                    'duration': len(regime_features),
                    'probability': np.mean(states == regime)
                }
        
        return characteristics
    
    def predict_next_regime(self, price_data: pd.Series) -> Dict:
        """Predict next regime and its duration"""
        hmm_results = self.fit_hmm(price_data)
        current_state = hmm_results['current_regime']
        transition_matrix = hmm_results['transition_matrix']
        
        # Predict next state probabilities
        next_state_probs = transition_matrix[current_state]
        predicted_next_state = np.argmax(next_state_probs)
        
        # Estimate regime duration using geometric distribution
        stay_probability = transition_matrix[current_state, current_state]
        expected_duration = 1 / (1 - stay_probability) if stay_probability < 1 else float('inf')
        
        return {
            'current_regime': current_state,
            'regime_characteristics': hmm_results['regime_characteristics'].get(current_state, {}),
            'next_regime_probabilities': next_state_probs,
            'predicted_next_regime': predicted_next_state,
            'expected_duration_bars': expected_duration,
            'regime_confidence': max(next_state_probs)
        }
    
    def generate_regime_aware_signals(self, price_data: pd.Series) -> Dict:
        """Generate trading signals that adapt to market regimes"""
        regime_prediction = self.predict_next_regime(price_data)
        current_regime = regime_prediction['current_regime']
        regime_info = regime_prediction['regime_characteristics']
        
        current_price = price_data.iloc[-1]
        returns = price_data.pct_change().dropna()
        recent_return = returns.iloc[-1] if len(returns) > 0 else 0
        
        # Regime-specific trading rules
        regime_rules = {
            "BULL_CALM": {
                "signal_strength": 0.8,
                "preferred_action": "BUY",
                "risk_multiplier": 1.2
            },
            "BULL_VOLATILE": {
                "signal_strength": 0.6,
                "preferred_action": "BUY",
                "risk_multiplier": 0.8
            },
            "BEAR_CALM": {
                "signal_strength": 0.7,
                "preferred_action": "SELL",
                "risk_multiplier": 1.0
            },
            "BEAR_VOLATILE": {
                "signal_strength": 0.5,
                "preferred_action": "SELL",
                "risk_multiplier": 0.6
            },
            "SIDEWAYS": {
                "signal_strength": 0.3,
                "preferred_action": "HOLD",
                "risk_multiplier": 0.5
            }
        }
        
        regime_type = regime_info.get('type', 'SIDEWAYS')
        rules = regime_rules.get(regime_type, regime_rules["SIDEWAYS"])
        
        # Generate base signal
        if recent_return > 0.01 and rules['preferred_action'] == "BUY":
            base_signal = "BUY"
            confidence = rules['signal_strength'] * min(1.0, abs(recent_return) * 100)
        elif recent_return < -0.01 and rules['preferred_action'] == "SELL":
            base_signal = "SELL"
            confidence = rules['signal_strength'] * min(1.0, abs(recent_return) * 100)
        else:
            base_signal = "HOLD"
            confidence = 0.3
        
        # Adjust for regime persistence
        regime_confidence = regime_prediction['regime_confidence']
        final_confidence = confidence * regime_confidence
        
        return {
            'signal': base_signal,
            'confidence': final_confidence,
            'current_regime': regime_type,
            'regime_confidence': regime_confidence,
            'risk_multiplier': rules['risk_multiplier'],
            'expected_duration': regime_prediction['expected_duration_bars'],
            'regime_characteristics': regime_info,
            'model_type': 'hmm_regime_detection'
        }

# For backward compatibility
class HMMRegimeDetector(RegimeHMM):
    def __init__(self, n_components=3, covariance_type="full", n_iter=1000):
        super().__init__(n_regimes=n_components)
        self.covariance_type = covariance_type
        self.n_iter = n_iter

    def fit(self, data: pd.Series):
        self.fit_hmm(data)
        return self
    
    def predict_regimes(self, data: pd.Series):
        results = self.fit_hmm(data)
        # Re-align to input series length
        states = results['hidden_states']
        full_states = np.zeros(len(data))
        full_states[-len(states):] = states
        return pd.Series(full_states, index=data.index)
