import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
try:
    import talib
except ImportError:
    # Fallback or diagnostic message for TA-Lib
    talib = None

class TechnicalIndicators:
    @staticmethod
    def calculate_all_indicators(df: pd.DataFrame) -> Dict:
        """Calculate comprehensive technical indicators using TA-Lib"""
        if talib is None:
            return {"error": "TA-Lib not installed"}
            
        if len(df) < 50:
            return {}
        
        # Ensure we have required columns
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        if not all(col in df.columns for col in required_cols):
            return {}
        
        # Price data
        high = df['high'].values.astype(float)
        low = df['low'].values.astype(float)
        close = df['close'].values.astype(float)
        volume = df['volume'].values.astype(float)
        
        indicators = {}
        
        # Trend Indicators
        indicators['sma_20'] = float(talib.SMA(close, timeperiod=20)[-1])
        indicators['sma_50'] = float(talib.SMA(close, timeperiod=50)[-1])
        indicators['ema_12'] = float(talib.EMA(close, timeperiod=12)[-1])
        indicators['ema_26'] = float(talib.EMA(close, timeperiod=26)[-1])
        
        # MACD
        macd, macd_signal, macd_hist = talib.MACD(close)
        indicators['macd'] = float(macd[-1])
        indicators['macd_signal'] = float(macd_signal[-1])
        indicators['macd_hist'] = float(macd_hist[-1])
        
        # RSI
        indicators['rsi'] = float(talib.RSI(close, timeperiod=14)[-1])
        
        # Bollinger Bands
        bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2)
        indicators['bb_upper'] = float(bb_upper[-1])
        indicators['bb_middle'] = float(bb_middle[-1])
        indicators['bb_lower'] = float(bb_lower[-1])
        
        # Avoid division by zero for BB position
        bb_range = bb_upper[-1] - bb_lower[-1]
        indicators['bb_position'] = float((close[-1] - bb_lower[-1]) / (bb_range if bb_range != 0 else 1.0))
        
        # Stochastic
        slowk, slowd = talib.STOCH(high, low, close)
        indicators['stoch_k'] = float(slowk[-1])
        indicators['stoch_d'] = float(slowd[-1])
        
        # Volume Indicators
        indicators['volume_sma'] = float(talib.SMA(volume, timeperiod=20)[-1])
        indicators['ad'] = float(talib.AD(high, low, close, volume)[-1])
        
        # Volatility
        indicators['atr'] = float(talib.ATR(high, low, close, timeperiod=14)[-1])
        indicators['volatility'] = float(talib.STDDEV(close, timeperiod=20, nbdev=1)[-1])
        
        return indicators
    
    @staticmethod
    def generate_signals(indicators: Dict, current_price: float) -> Dict:
        """Generate trading signals based on indicators"""
        signals = {}
        
        # Trend signals
        signals['trend'] = 'bullish' if indicators.get('sma_20', 0) > indicators.get('sma_50', 0) else 'bearish'
        
        # RSI signals
        rsi = indicators.get('rsi', 50)
        if rsi > 70:
            signals['rsi_signal'] = 'overbought'
        elif rsi < 30:
            signals['rsi_signal'] = 'oversold'
        else:
            signals['rsi_signal'] = 'neutral'
        
        # MACD signals
        macd = indicators.get('macd', 0)
        macd_signal = indicators.get('macd_signal', 0)
        signals['macd_signal'] = 'bullish' if macd > macd_signal else 'bearish'
        
        # Bollinger Bands signals
        bb_pos = indicators.get('bb_position', 0.5)
        if bb_pos > 0.8:
            signals['bb_signal'] = 'overbought'
        elif bb_pos < 0.2:
            signals['bb_signal'] = 'oversold'
        else:
            signals['bb_signal'] = 'neutral'
        
        # Overall signal
        signals['overall'] = TechnicalIndicators._calculate_overall_signal(signals)
        
        return signals
    
    @staticmethod
    def _calculate_overall_signal(signals: Dict) -> str:
        """Calculate overall trading signal"""
        bullish_signals = 0
        bearish_signals = 0
        
        if signals.get('trend') == 'bullish':
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        if signals.get('rsi_signal') == 'oversold':
            bullish_signals += 1
        elif signals.get('rsi_signal') == 'overbought':
            bearish_signals += 1
        
        if signals.get('macd_signal') == 'bullish':
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        if bullish_signals > bearish_signals:
            return 'BUY'
        elif bearish_signals > bullish_signals:
            return 'SELL'
        else:
            return 'HOLD'
