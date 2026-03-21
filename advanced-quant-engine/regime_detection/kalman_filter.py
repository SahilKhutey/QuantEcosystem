import numpy as np
import pandas as pd
from pykalman import KalmanFilter
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class AdvancedKalmanFilter:
    def __init__(self, state_dim: int = 2, observation_dim: int = 1):
        self.state_dim = state_dim
        self.observation_dim = observation_dim
        self.kf = None
        self.state_means = []
        self.state_covariances = []
        
    def initialize_filter(self, initial_state: np.ndarray, 
                         transition_matrix: np.ndarray,
                         observation_matrix: np.ndarray,
                         process_noise: np.ndarray,
                         observation_noise: np.ndarray) -> None:
        """Initialize Kalman Filter with system parameters"""
        self.kf = KalmanFilter(
            transition_matrices=transition_matrix,
            observation_matrices=observation_matrix,
            initial_state_mean=initial_state,
            initial_state_covariance=process_noise,
            transition_covariance=process_noise,
            observation_covariance=observation_noise
        )
    
    def fit_adaptive_kalman(self, prices: pd.Series, 
                           volatility_window: int = 20) -> Dict:
        """Fit adaptive Kalman Filter to price series"""
        observations = prices.values.reshape(-1, 1)
        
        # Adaptive parameters based on recent volatility
        recent_volatility = prices.pct_change().rolling(volatility_window).std().iloc[-1]
        if np.isnan(recent_volatility):
            recent_volatility = prices.pct_change().std()
        
        # Dynamic noise adjustment
        process_noise_scale = max(0.001, recent_volatility * 0.1)
        observation_noise_scale = max(0.001, recent_volatility * 0.05)
        
        # State transition: [price, trend]
        transition_matrix = np.array([[1, 1], [0, 1]])
        observation_matrix = np.array([[1, 0]])
        
        process_noise = np.array([[process_noise_scale, 0], 
                                [0, process_noise_scale * 0.1]])
        observation_noise = np.array([[observation_noise_scale]])
        
        initial_state = np.array([prices.iloc[0], 0])
        
        self.initialize_filter(initial_state, transition_matrix, 
                             observation_matrix, process_noise, observation_noise)
        
        # Filter all observations
        state_means, state_covariances = self.kf.filter(observations)
        
        self.state_means = state_means
        self.state_covariances = state_covariances
        
        return {
            'filtered_prices': state_means[:, 0],
            'trend_estimates': state_means[:, 1],
            'confidence_intervals': self._calculate_confidence_intervals(state_covariances),
            'adaptation_metrics': {
                'volatility_estimate': recent_volatility,
                'process_noise_scale': process_noise_scale,
                'observation_noise_scale': observation_noise_scale
            }
        }
    
    def _calculate_confidence_intervals(self, covariances: np.ndarray) -> np.ndarray:
        """Calculate 95% confidence intervals from covariance matrices"""
        std_errors = np.sqrt(covariances[:, 0, 0])
        confidence_intervals = 1.96 * std_errors
        return confidence_intervals
    
    def detect_trend_changes(self, confidence_level: float = 0.95) -> List[Dict]:
        """Detect significant trend changes using Kalman Filter"""
        if len(self.state_means) < 2:
            return []
        
        trend_estimates = self.state_means[:, 1]
        trend_variances = self.state_covariances[:, 1, 1]
        
        changes = []
        for i in range(1, len(trend_estimates)):
            trend_change = trend_estimates[i] - trend_estimates[i-1]
            trend_change_std = np.sqrt(trend_variances[i] + trend_variances[i-1])
            
            if trend_change_std > 0:
                z_score = abs(trend_change) / trend_change_std
                p_value = 2 * (1 - stats.norm.cdf(z_score))
                
                if p_value < (1 - confidence_level):
                    changes.append({
                        'index': i,
                        'trend_change': trend_change,
                        'p_value': p_value,
                        'confidence': 1 - p_value,
                        'old_trend': trend_estimates[i-1],
                        'new_trend': trend_estimates[i]
                    })
        
        return changes
    
    def generate_kalman_signals(self, prices: pd.Series) -> Dict:
        """Generate trading signals based on Kalman Filter estimates"""
        kalman_results = self.fit_adaptive_kalman(prices)
        
        filtered_prices = kalman_results['filtered_prices']
        trend_estimates = kalman_results['trend_estimates']
        current_price = prices.iloc[-1]
        current_filtered = filtered_prices[-1]
        current_trend = trend_estimates[-1]
        
        # Calculate signal based on deviation from filtered price
        price_deviation = current_price - current_filtered
        deviation_zscore = price_deviation / kalman_results['confidence_intervals'][-1] if kalman_results['confidence_intervals'][-1] > 0 else 0
        
        # Trend-based signal
        trend_strength = current_trend / np.std(trend_estimates) if np.std(trend_estimates) > 0 else 0
        
        # Combined signal logic
        if deviation_zscore < -2 and trend_strength > 0.5:
            signal = "STRONG_BUY"
            confidence = min(0.9, abs(deviation_zscore) / 3)
        elif deviation_zscore < -1 and trend_strength > 0:
            signal = "BUY"
            confidence = min(0.7, abs(deviation_zscore) / 2)
        elif deviation_zscore > 2 and trend_strength < -0.5:
            signal = "STRONG_SELL"
            confidence = min(0.9, abs(deviation_zscore) / 3)
        elif deviation_zscore > 1 and trend_strength < 0:
            signal = "SELL"
            confidence = min(0.7, abs(deviation_zscore) / 2)
        else:
            signal = "HOLD"
            confidence = 0.3
        
        return {
            'signal': signal,
            'confidence': confidence,
            'price_deviation': price_deviation,
            'deviation_zscore': deviation_zscore,
            'trend_strength': trend_strength,
            'filtered_price': current_filtered,
            'kalman_trend': current_trend,
            'model_type': 'kalman_filter'
        }

# For backward compatibility with previous implementation
class KalmanRegimeDetector(AdvancedKalmanFilter):
    def extract_regime_signals(self, prices: pd.Series):
        results = self.fit_adaptive_kalman(prices)
        return pd.Series(results['trend_estimates'], index=prices.index)
