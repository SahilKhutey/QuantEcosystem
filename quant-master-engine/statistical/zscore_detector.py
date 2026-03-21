import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class ZScoreMeanReversion:
    def __init__(self, lookback_period: int = 20, zscore_threshold: float = 2.0):
        self.lookback_period = lookback_period
        self.zscore_threshold = zscore_threshold
        self.historical_zscore = []
        
    def calculate_zscore(self, series: pd.Series) -> float:
        """Calculate Z-score for the latest value"""
        if len(series) < self.lookback_period:
            return 0
        
        recent_data = series.tail(self.lookback_period)
        mean = recent_data.mean()
        std = recent_data.std()
        
        if std == 0:
            return 0
        
        current_value = series.iloc[-1]
        zscore = (current_value - mean) / std
        
        self.historical_zscore.append(zscore)
        return zscore
    
    def detect_mean_reversion_setup(self, series: pd.Series) -> Dict:
        """Detect mean reversion trading setups"""
        zscore = self.calculate_zscore(series)
        current_price = series.iloc[-1]
        
        # Calculate mean reversion probability
        if abs(zscore) > self.zscore_threshold:
            # Probability of reversion using normal distribution
            reversion_probability = 2 * (1 - stats.norm.cdf(abs(zscore)))
        else:
            reversion_probability = 0.5  # Neutral zone
        
        # Generate signal based on Z-score
        if zscore < -self.zscore_threshold:
            signal = "BUY"  # Oversold - expect reversion up
            confidence = min(0.9, reversion_probability)
            expected_move = "up"
        elif zscore > self.zscore_threshold:
            signal = "SELL"  # Overbought - expect reversion down
            confidence = min(0.9, reversion_probability)
            expected_move = "down"
        else:
            signal = "HOLD"
            confidence = 0.3
            expected_move = "sideways"
        
        # Calculate expected return based on historical mean reversion
        expected_return = self._calculate_expected_return(series, zscore)
        
        return {
            'zscore': zscore,
            'signal': signal,
            'confidence': confidence,
            'current_price': current_price,
            'expected_move': expected_move,
            'expected_return_pct': expected_return,
            'is_extreme': abs(zscore) > self.zscore_threshold,
            'reversion_probability': reversion_probability,
            'lookback_period': self.lookback_period,
            'threshold': self.zscore_threshold
        }
    
    def _calculate_expected_return(self, series: pd.Series, current_zscore: float) -> float:
        """Calculate expected return based on historical mean reversion patterns"""
        if len(series) < self.lookback_period * 2:
            return 0
        
        # Analyze historical mean reversion behavior
        future_returns = []
        zscore_history = []
        
        for i in range(self.lookback_period, len(series) - 5):  # 5-period forward return
            window = series.iloc[i-self.lookback_period:i]
            zscore_val = (series.iloc[i] - window.mean()) / window.std()
            
            if window.std() > 0:  # Avoid division by zero
                future_return = (series.iloc[i+5] - series.iloc[i]) / series.iloc[i] * 100
                future_returns.append(future_return)
                zscore_history.append(zscore_val)
        
        if len(zscore_history) < 10:
            return 0
        
        # Simple linear regression: future_return ~ zscore
        correlation = np.corrcoef(zscore_history, future_returns)[0, 1]
        if not np.isnan(correlation):
            expected_return = correlation * current_zscore * 10  # Scale factor
        else:
            expected_return = -current_zscore * 2  # Basic mean reversion expectation
        
        return expected_return
    
    def bollinger_bands_zscore(self, series: pd.Series, period: int = 20, 
                              num_std: float = 2.0) -> Dict:
        """Calculate Bollinger Bands and related Z-score"""
        if len(series) < period:
            return {}
        
        rolling_mean = series.rolling(window=period).mean()
        rolling_std = series.rolling(window=period).std()
        
        upper_band = rolling_mean + (rolling_std * num_std)
        lower_band = rolling_mean - (rolling_std * num_std)
        
        current_price = series.iloc[-1]
        bb_zscore = (current_price - rolling_mean.iloc[-1]) / rolling_std.iloc[-1] if rolling_std.iloc[-1] > 0 else 0
        
        # Bollinger Band position (0 to 1)
        bb_position = (current_price - lower_band.iloc[-1]) / (upper_band.iloc[-1] - lower_band.iloc[-1]) if (upper_band.iloc[-1] - lower_band.iloc[-1]) > 0 else 0.5
        
        return {
            'upper_band': upper_band.iloc[-1],
            'lower_band': lower_band.iloc[-1],
            'middle_band': rolling_mean.iloc[-1],
            'bb_zscore': bb_zscore,
            'bb_position': bb_position,
            'band_width': (upper_band.iloc[-1] - lower_band.iloc[-1]) / rolling_mean.iloc[-1] * 100,
            'current_price': current_price
        }
    
    def generate_composite_signal(self, price_series: pd.Series, 
                               volume_series: Optional[pd.Series] = None) -> Dict:
        """Generate composite mean reversion signal with volume confirmation"""
        # Basic Z-score signal
        zscore_signal = self.detect_mean_reversion_setup(price_series)
        
        # Bollinger Bands signal
        bb_signal = self.bollinger_bands_zscore(price_series)
        
        # Volume confirmation (if available)
        volume_confirmation = 0.5  # Neutral
        if volume_series is not None and len(volume_series) >= self.lookback_period:
            volume_zscore = self.calculate_zscore(volume_series)
            # High volume confirms extreme moves
            if abs(zscore_signal['zscore']) > self.zscore_threshold and abs(volume_zscore) > 1.0:
                volume_confirmation = 0.8
            else:
                volume_confirmation = 0.3
        
        # Combine signals
        composite_confidence = (zscore_signal['confidence'] * 0.6 + 
                               min(abs(bb_signal.get('bb_zscore', 0)) / 2, 1) * 0.3 +
                               volume_confirmation * 0.1)
        
        # Final signal decision
        if zscore_signal['zscore'] < -self.zscore_threshold and composite_confidence > 0.6:
            final_signal = "BUY"
        elif zscore_signal['zscore'] > self.zscore_threshold and composite_confidence > 0.6:
            final_signal = "SELL"
        else:
            final_signal = "HOLD"
        
        return {
            'final_signal': final_signal,
            'composite_confidence': composite_confidence,
            'zscore_signal': zscore_signal,
            'bollinger_signal': bb_signal,
            'volume_confirmation': volume_confirmation,
            'lookback_period': self.lookback_period
        }
