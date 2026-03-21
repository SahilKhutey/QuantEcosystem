import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class BayesianProbabilityUpdater:
    def __init__(self):
        self.prior_beliefs = {}
        self.evidence_history = []
        
    def bayesian_update(self, prior: float, likelihood: float, evidence: float) -> float:
        """
        Bayesian update: P(A|B) = P(B|A) * P(A) / P(B)
        
        Parameters:
        prior: P(A) - Prior probability
        likelihood: P(B|A) - Likelihood of evidence given hypothesis
        evidence: P(B) - Total probability of evidence
        """
        if evidence == 0:
            return prior  # Avoid division by zero
        
        posterior = (likelihood * prior) / evidence
        return min(max(posterior, 0), 1)  # Keep between 0 and 1
    
    def update_trading_signal_probability(self, initial_signal: Dict, new_evidence: Dict) -> Dict:
        """Update trading signal probability using Bayesian reasoning"""
        
        # Initial probabilities
        prior_bullish = initial_signal.get('bullish_probability', 0.5)
        prior_bearish = 1 - prior_bullish
        
        # Evidence likelihoods
        evidence_type = new_evidence.get('type', 'technical')
        evidence_strength = new_evidence.get('strength', 0.5)
        
        # Likelihood mappings (P(Evidence|Hypothesis))
        likelihood_mappings = {
            'technical': {'bullish': 0.7, 'bearish': 0.3},
            'fundamental': {'bullish': 0.6, 'bearish': 0.4},
            'sentiment': {'bullish': 0.8, 'bearish': 0.2},
            'market_regime': {'bullish': 0.9, 'bearish': 0.1}
        }
        
        likelihoods = likelihood_mappings.get(evidence_type, {'bullish': 0.5, 'bearish': 0.5})
        
        # Adjust likelihoods by evidence strength
        bullish_likelihood = likelihoods['bullish'] * evidence_strength
        bearish_likelihood = likelihoods['bearish'] * evidence_strength
        
        # Total evidence probability P(B)
        total_evidence = (bullish_likelihood * prior_bullish + 
                         bearish_likelihood * prior_bearish)
        
        if total_evidence == 0:
            return initial_signal
        
        # Bayesian update
        posterior_bullish = self.bayesian_update(prior_bullish, bullish_likelihood, total_evidence)
        posterior_bearish = 1 - posterior_bullish
        
        # Calculate confidence increase
        confidence_change = abs(posterior_bullish - prior_bullish)
        
        return {
            'bullish_probability': posterior_bullish,
            'bearish_probability': posterior_bearish,
            'confidence_change': confidence_change,
            'prior_probability': prior_bullish,
            'evidence_used': evidence_type,
            'update_timestamp': pd.Timestamp.now(),
            'signal_strength': self._calculate_signal_strength(posterior_bullish)
        }
    
    def _calculate_signal_strength(self, probability: float) -> str:
        """Convert probability to signal strength"""
        if probability > 0.7:
            return "STRONG_BUY"
        elif probability > 0.6:
            return "BUY"
        elif probability < 0.3:
            return "STRONG_SELL"
        elif probability < 0.4:
            return "SELL"
        else:
            return "HOLD"
    
    def sequential_bayesian_update(self, initial_prob: float, evidence_sequence: List[Dict]) -> Dict:
        """Perform sequential Bayesian updates with multiple pieces of evidence"""
        current_prob = initial_prob
        update_history = []
        
        for i, evidence in enumerate(evidence_sequence):
            update_result = self.update_trading_signal_probability(
                {'bullish_probability': current_prob}, evidence
            )
            current_prob = update_result['bullish_probability']
            update_history.append({
                'step': i + 1,
                'evidence_type': evidence.get('type'),
                'probability_after_update': current_prob,
                'confidence_change': update_result['confidence_change']
            })
        
        return {
            'final_probability': current_prob,
            'total_confidence_change': abs(current_prob - initial_prob),
            'update_history': update_history,
            'final_signal': self._calculate_signal_strength(current_prob)
        }
    
    def calculate_bayesian_confidence_interval(self, probability: float, sample_size: int) -> Tuple[float, float]:
        """Calculate Bayesian confidence interval using Beta distribution"""
        # Use Beta distribution for binomial probability
        # Assuming success = bullish, failure = bearish
        alpha = probability * sample_size + 1  # Successes + 1
        beta = (1 - probability) * sample_size + 1  # Failures + 1
        
        # Calculate 95% credible interval
        lower_bound = stats.beta.ppf(0.025, alpha, beta)
        upper_bound = stats.beta.ppf(0.975, alpha, beta)
        
        return lower_bound, upper_bound
    
    def market_regime_detection(self, price_data: pd.Series, window: int = 50) -> Dict:
        """Detect market regimes using Bayesian methods"""
        if len(price_data) < window:
            return {'regime': 'UNKNOWN', 'confidence': 0.0}
            
        returns = price_data.pct_change().dropna()
        
        if len(returns) < window:
            return {'regime': 'UNKNOWN', 'confidence': 0.0}
        
        # Calculate rolling statistics
        rolling_mean = returns.rolling(window=window).mean()
        rolling_std = returns.rolling(window=window).std()
        rolling_skew = returns.rolling(window=window).skew()
        
        # Current regime probabilities (simplified)
        current_mean = rolling_mean.iloc[-1] if not np.isnan(rolling_mean.iloc[-1]) else 0
        current_vol = rolling_std.iloc[-1] if not np.isnan(rolling_std.iloc[-1]) else 1
        current_skew = rolling_skew.iloc[-1] if not np.isnan(rolling_skew.iloc[-1]) else 0
        
        # Regime classification rules
        bull_prob = stats.norm.cdf(current_mean / current_vol) if current_vol > 0 else 0.5
        high_vol_prob = stats.norm.cdf(current_vol / returns.std()) if returns.std() > 0 else 0.5
        
        # Adjust for skewness
        if current_skew > 0.5:
            bull_prob *= 1.2  # Positive skew favors bulls
        elif current_skew < -0.5:
            bull_prob *= 0.8  # Negative skew favors bears
        
        # Normalize probabilities
        bull_prob = min(max(bull_prob, 0), 1)
        bear_prob = 1 - bull_prob
        
        return {
            'bull_market_probability': bull_prob,
            'bear_market_probability': bear_prob,
            'high_volatility_probability': high_vol_prob,
            'current_regime': 'BULL' if bull_prob > 0.6 else 'BEAR' if bear_prob > 0.6 else 'NEUTRAL',
            'regime_confidence': max(bull_prob, bear_prob),
            'market_conditions': {
                'mean_return': current_mean,
                'volatility': current_vol,
                'skewness': current_skew
            }
        }
