import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class BayesianModelFusion:
    def __init__(self):
        self.model_weights = {}
        self.model_performance = {}
        self.history = []
        
    def update_model_weights(self, model_predictions: Dict, actual_returns: pd.Series) -> Dict:
        """Update model weights using Bayesian updating based on recent performance"""
        
        if len(actual_returns) < 10:
            return self.model_weights  # Insufficient data for updating
        
        model_scores = {}
        total_score = 0
        
        for model_name, predictions in model_predictions.items():
            if 'signals' not in predictions:
                continue
            
            # Calculate model performance metrics
            signal_accuracy = self._calculate_signal_accuracy(predictions['signals'], actual_returns)
            returns_correlation = self._calculate_returns_correlation(predictions, actual_returns)
            consistency_score = self._calculate_consistency(predictions)
            
            # Composite score
            model_score = (signal_accuracy * 0.4 + 
                          returns_correlation * 0.3 + 
                          consistency_score * 0.3)
            
            model_scores[model_name] = model_score
            total_score += model_score
        
        # Update weights proportionally to performance
        new_weights = {}
        for model_name, score in model_scores.items():
            if total_score > 0:
                new_weights[model_name] = score / total_score
            else:
                new_weights[model_name] = 1.0 / len(model_scores)  # Equal weights
        
        # Smooth weight transitions
        if self.model_weights:
            for model_name in new_weights:
                if model_name in self.model_weights:
                    # Exponential smoothing
                    alpha = 0.3  # Learning rate
                    new_weights[model_name] = (alpha * new_weights[model_name] + 
                                             (1 - alpha) * self.model_weights[model_name])
        
        self.model_weights = new_weights
        self.model_performance = model_scores
        
        return new_weights
    
    def _calculate_signal_accuracy(self, signals: pd.Series, actual_returns: pd.Series) -> float:
        """Calculate accuracy of trading signals"""
        # Handle case where signals is a dict of assets
        if isinstance(signals, dict):
            # Use the first asset for accuracy calculation as a proxy
            first_asset = list(signals.keys())[0]
            signals = pd.Series(signals[first_asset])
            
        if len(signals) != len(actual_returns):
            return 0.5
        
        correct_signals = 0
        total_signals = 0
        
        for i in range(1, len(signals)):
            if signals.iloc[i] != 'HOLD':
                predicted_direction = 1 if signals.iloc[i] == 'BUY' else -1
                actual_direction = 1 if actual_returns.iloc[i] > 0 else -1
                
                if predicted_direction == actual_direction:
                    correct_signals += 1
                total_signals += 1
        
        accuracy = correct_signals / total_signals if total_signals > 0 else 0.5
        return accuracy
    
    def _calculate_returns_correlation(self, predictions: Dict, actual_returns: pd.Series) -> float:
        """Calculate correlation between predicted and actual returns"""
        if 'expected_returns' not in predictions:
            return 0.0
        
        pred_returns = predictions['expected_returns']
        if len(pred_returns) != len(actual_returns):
            return 0.0
        
        correlation = np.corrcoef(pred_returns, actual_returns)[0, 1]
        return max(0, correlation)  # Negative correlation is bad
    
    def _calculate_consistency(self, predictions: Dict) -> float:
        """Calculate consistency of model predictions"""
        if 'confidence_scores' not in predictions:
            return 0.5
        
        confidence_scores = predictions['confidence_scores']
        if len(confidence_scores) < 2:
            return 0.5
        
        # Measure volatility of confidence scores (lower is better)
        confidence_volatility = np.std(confidence_scores)
        consistency = 1.0 / (1.0 + confidence_volatility)  # Inverse relationship
        
        return min(consistency, 1.0)
    
    def fuse_predictions(self, model_predictions: Dict) -> Dict:
        """Fuse predictions from multiple models using Bayesian weighting"""
        if not self.model_weights:
            # Initialize equal weights if not set
            self.model_weights = {name: 1.0/len(model_predictions) 
                                for name in model_predictions.keys()}
        
        fused_signals = {}
        total_confidence = 0
        
        for model_name, predictions in model_predictions.items():
            weight = self.model_weights.get(model_name, 0)
            
            if 'signals' in predictions and 'confidence' in predictions:
                confidence = predictions['confidence']
                
                # Aggregate signals - predictions['signals'] is expected to be a dict of {asset: signal_str}
                signals_data = predictions['signals']
                if not isinstance(signals_data, dict):
                    # Fallback if it's a single signal
                    signals_data = {'Universal': signals_data}
                
                for asset, signal_info in signals_data.items():
                    signal_strength = self._signal_to_strength(signal_info)
                    model_contribution = signal_strength * weight * confidence
                    
                    if asset not in fused_signals:
                        fused_signals[asset] = {
                            'signal_strength': 0,
                            'model_contributions': {}
                        }
                    
                    fused_signals[asset]['signal_strength'] += model_contribution
                    fused_signals[asset]['model_contributions'][model_name] = {
                        'contribution': model_contribution,
                        'original_signal': signal_info
                    }
                
                total_confidence += weight * confidence
        
        # Normalize and generate final signals
        final_signals = {}
        for asset, fusion_data in fused_signals.items():
            signal_strength = fusion_data['signal_strength']
            
            if signal_strength > 0.6:
                final_signal = "STRONG_BUY"
            elif signal_strength > 0.3:
                final_signal = "BUY"
            elif signal_strength < -0.6:
                final_signal = "STRONG_SELL"
            elif signal_strength < -0.3:
                final_signal = "SELL"
            else:
                final_signal = "HOLD"
            
            final_signals[asset] = {
                'signal': final_signal,
                'confidence': min(abs(signal_strength), 1.0),
                'fusion_strength': signal_strength,
                'model_contributions': fusion_data['model_contributions'],
                'total_confidence': total_confidence
            }
        
        return {
            'fused_signals': final_signals,
            'model_weights': self.model_weights,
            'fusion_timestamp': pd.Timestamp.now(),
            'performance_metrics': self.model_performance
        }
    
    def _signal_to_strength(self, signal: str) -> float:
        """Convert signal to numerical strength"""
        signal_map = {
            'STRONG_BUY': 1.0,
            'BUY': 0.5,
            'HOLD': 0.0,
            'SELL': -0.5,
            'STRONG_SELL': -1.0
        }
        return signal_map.get(signal, 0.0)

# Compatibility layer
class BayesianModelAveraging(BayesianModelFusion):
    def update_weights(self, models, returns):
        # Placeholder for compatibility with previous logic
        # In the new engine, model_predictions is a dict of results
        return self.update_model_weights({}, returns)
    
    def combine_predictions(self, model_results):
        return self.fuse_predictions(model_results)
