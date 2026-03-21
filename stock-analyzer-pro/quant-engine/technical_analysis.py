import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import talib
from scipy import signal
from scipy.signal import find_peaks

class TechnicalAnalysisEngine:
    def __init__(self):
        self.indicators_config = {
            'rsi': {'period': 14},
            'macd': {'fast': 12, 'slow': 26, 'signal': 9},
            'bollinger': {'period': 20, 'std': 2},
            'stochastic': {'k_period': 14, 'd_period': 3}
        }
        
    def calculate_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate all technical indicators using TA-Lib"""
        df = df.copy()
        
        # Ensure data is float
        high = df['high'].values.astype(float)
        low = df['low'].values.astype(float)
        close = df['close'].values.astype(float)
        volume = df['volume'].values.astype(float)
        
        # Trend Indicators
        df['sma_20'] = talib.SMA(close, timeperiod=20)
        df['sma_50'] = talib.SMA(close, timeperiod=50)
        df['sma_200'] = talib.SMA(close, timeperiod=200)
        df['ema_12'] = talib.EMA(close, timeperiod=12)
        df['ema_26'] = talib.EMA(close, timeperiod=26)
        
        # MACD
        df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(
            close, 
            fastperiod=12, 
            slowperiod=26, 
            signalperiod=9
        )
        
        # RSI
        df['rsi'] = talib.RSI(close, timeperiod=14)
        
        # Bollinger Bands
        df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(
            close, 
            timeperiod=20, 
            nbdevup=2, 
            nbdevdn=2
        )
        
        # Stochastic
        df['stoch_k'], df['stoch_d'] = talib.STOCH(
            high, low, close,
            fastk_period=14,
            slowk_period=3,
            slowd_period=3
        )
        
        # ATR (Volatility)
        df['atr'] = talib.ATR(high, low, close, timeperiod=14)
        
        # Volume Indicators
        df['obv'] = talib.OBV(close, volume)
        df['volume_sma'] = talib.SMA(volume, timeperiod=20)
        
        # ADX (Trend Strength)
        df['adx'] = talib.ADX(high, low, close, timeperiod=14)
        
        # Parabolic SAR
        df['sar'] = talib.SAR(high, low, acceleration=0.02, maximum=0.2)
        
        return df
        
    def detect_support_resistance(self, df: pd.DataFrame, window: int = 20) -> Dict:
        """Automatically detect support and resistance levels using local extrema"""
        if df.empty or len(df) < window:
            return {'support': [], 'resistance': [], 'current_price': 0}
            
        close_prices = df['close'].values
        
        # Find local minima and maxima
        minima_indices = signal.argrelextrema(close_prices, np.less_equal, order=window)[0]
        maxima_indices = signal.argrelextrema(close_prices, np.greater_equal, order=window)[0]
        
        support_levels = close_prices[minima_indices].tolist()
        resistance_levels = close_prices[maxima_indices].tolist()
        
        # Cluster similar levels
        support_levels = self._cluster_levels(support_levels, tolerance=0.02)
        resistance_levels = self._cluster_levels(resistance_levels, tolerance=0.02)
        
        return {
            'support': sorted(support_levels),
            'resistance': sorted(resistance_levels),
            'current_price': float(close_prices[-1])
        }
        
    def _cluster_levels(self, levels: List[float], tolerance: float = 0.02) -> List[float]:
        """Cluster similar price levels to avoid reporting redundant lines"""
        if not levels:
            return []
            
        levels = sorted(levels)
        clusters = []
        current_cluster = [levels[0]]
        
        for price in levels[1:]:
            if abs(price - np.mean(current_cluster)) / np.mean(current_cluster) <= tolerance:
                current_cluster.append(price)
            else:
                clusters.append(float(np.mean(current_cluster)))
                current_cluster = [price]
                
        if current_cluster:
            clusters.append(float(np.mean(current_cluster)))
            
        return clusters
        
    def detect_chart_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Detect common chart patterns using basic geometric logic"""
        patterns = []
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        
        # Head and Shoulders detection
        if len(close) >= 100:
            hs_pattern = self._detect_head_shoulders(close[-100:])
            if hs_pattern:
                patterns.append({
                    'pattern': 'head_shoulders',
                    'direction': hs_pattern['direction'],
                    'confidence': hs_pattern['confidence']
                })
                
        # Triangle detection (Placeholder for logic)
        triangle = self._detect_triangle(high[-50:], low[-50:])
        if triangle:
            patterns.append({
                'pattern': 'triangle',
                'type': triangle['type'],
                'confidence': triangle['confidence']
            })
            
        return patterns
        
    def _detect_head_shoulders(self, prices: np.array) -> Optional[Dict]:
        """Detect potential head and shoulders pattern from a price array"""
        if len(prices) < 30:
            return None
            
        # Find peaks with some distance
        peaks, _ = find_peaks(prices, distance=10)
        
        if len(peaks) >= 3:
            # Check for the last 3 peaks for HS form
            p1, p2, p3 = prices[peaks[-3]], prices[peaks[-2]], prices[peaks[-1]]
            
            # Head must be higher than shoulders
            if p2 > p1 and p2 > p3:
                # Shoulders should be roughly at the same level (within 5%)
                if abs(p1 - p3) / max(p1, p3) < 0.05:
                    return {
                        'direction': 'bearish',
                        'confidence': 0.75
                    }
                
        return None

    def _detect_triangle(self, highs: np.array, lows: np.array) -> Optional[Dict]:
        """Detect potential triangle patterns (Ascending/Descending/Symmetrical)"""
        if len(highs) < 20:
            return None
            
        # Simple trendline analysis (approximation)
        high_slope = np.polyfit(np.arange(len(highs)), highs, 1)[0]
        low_slope = np.polyfit(np.arange(len(lows)), lows, 1)[0]
        
        # Converging lines
        if high_slope < 0 and low_slope > 0:
            return {'type': 'symmetrical', 'confidence': 0.6}
        elif abs(high_slope) < 0.001 and low_slope > 0:
            return {'type': 'ascending', 'confidence': 0.7}
        elif high_slope < 0 and abs(low_slope) < 0.001:
            return {'type': 'descending', 'confidence': 0.7}
            
        return None
