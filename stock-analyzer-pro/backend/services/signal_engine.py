import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from enum import Enum
import json

class SignalStrength(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    NEUTRAL = "NEUTRAL"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

class SignalEngine:
    def __init__(self):
        self.signal_weights = {
            'technical': 0.4,
            'sentiment': 0.3,
            'volume': 0.2,
            'macro': 0.1
        }
        
    def generate_signal(self, symbol: str, 
                       technical_data: Dict,
                       sentiment_data: Dict,
                       volume_data: Dict,
                       macro_data: Dict) -> Dict:
        """Generate multi-factor trading signal from component scores"""
        
        # Calculate individual scores (0 to 1 scale)
        technical_score = self._calculate_technical_score(technical_data)
        sentiment_score = self._calculate_sentiment_score(sentiment_data)
        volume_score = self._calculate_volume_score(volume_data)
        macro_score = self._calculate_macro_score(macro_data)
        
        # Weighted composite score
        composite_score = (
            technical_score * self.signal_weights['technical'] +
            sentiment_score * self.signal_weights['sentiment'] +
            volume_score * self.signal_weights['volume'] +
            macro_score * self.signal_weights['macro']
        )
        
        signal_enum, strength_label = self._score_to_signal(composite_score)
        
        # Calculate confidence based on signal agreement
        confidence = self._calculate_confidence(
            technical_score, sentiment_score, volume_score, macro_score
        )
        
        reasoning = self._generate_reasoning(
            signal_enum, technical_data, sentiment_data, volume_data, macro_data
        )
        
        return {
            'symbol': symbol,
            'signal': signal_enum.value,
            'strength': strength_label,
            'composite_score': float(composite_score),
            'confidence': float(confidence),
            'reasoning': reasoning,
            'components': {
                'technical': float(technical_score),
                'sentiment': float(sentiment_score),
                'volume': float(volume_score),
                'macro': float(macro_score)
            },
            'timestamp': datetime.utcnow()
        }
        
    def _calculate_technical_score(self, data: Dict) -> float:
        """Derive score from technical indicators"""
        score = 0.5
        
        if 'rsi' in data:
            rsi = data['rsi']
            if rsi < 30: score += 0.3
            elif rsi > 70: score -= 0.3
                
        if 'macd' in data and 'macd_signal' in data:
            if data['macd'] > data['macd_signal']: score += 0.2
            else: score -= 0.2
                
        if data.get('trend') == 'bullish': score += 0.2
        elif data.get('trend') == 'bearish': score -= 0.2
                
        if 'bb_position' in data:
            pos = data['bb_position']
            if pos < 0.2: score += 0.2
            elif pos > 0.8: score -= 0.2
                
        return max(0.0, min(1.0, score))
        
    def _calculate_sentiment_score(self, data: Dict) -> float:
        """Derive score from AI sentiment analysis"""
        if not data: return 0.5
        sentiment = data.get('sentiment', 'neutral').lower()
        confidence = data.get('confidence', 0.5)
        
        if sentiment == 'positive': return 0.5 + (confidence * 0.5)
        if sentiment == 'negative': return 0.5 - (confidence * 0.5)
        return 0.5
            
    def _calculate_volume_score(self, data: Dict) -> float:
        """Derive score from volume dynamics"""
        if not data: return 0.5
        ratio = data.get('volume_ratio', 1.0)
        trend = data.get('volume_trend', 'neutral')
        
        score = 0.5
        if ratio > 2.0: score += 0.3
        elif ratio < 0.5: score -= 0.2
            
        if trend == 'increasing': score += 0.1
        elif trend == 'decreasing': score -= 0.1
        return max(0.0, min(1.0, score))
        
    def _calculate_macro_score(self, data: Dict) -> float:
        """Derive score from macro intelligence"""
        return float(data.get('risk_on_off', 0.5))
        
    def _score_to_signal(self, score: float) -> Tuple[SignalStrength, str]:
        if score >= 0.8: return SignalStrength.STRONG_BUY, "very strong"
        if score >= 0.6: return SignalStrength.BUY, "strong"
        if score >= 0.4: return SignalStrength.NEUTRAL, "neutral"
        if score >= 0.2: return SignalStrength.SELL, "weak"
        return SignalStrength.STRONG_SELL, "very weak"
            
    def _calculate_confidence(self, *scores) -> float:
        """Determine confidence based on standard deviation and extremity"""
        variance = np.var(scores)
        avg_score = np.mean(scores)
        confidence = (1 - variance) * (1 - 2 * abs(avg_score - 0.5))
        return float(max(0.0, min(1.0, confidence)))
        
    def _generate_reasoning(self, signal: SignalStrength,
                          technical: Dict, sentiment: Dict,
                          volume: Dict, macro: Dict) -> str:
        """Generate human-readable justification for the signal"""
        reasons = []
        if 'rsi' in technical:
            rsi = technical['rsi']
            if rsi < 30: reasons.append(f"RSI oversold ({rsi:.1f})")
            elif rsi > 70: reasons.append(f"RSI overbought ({rsi:.1f})")
                
        if 'trend' in technical: reasons.append(f"{technical['trend']} trend")
        if sentiment.get('sentiment'): reasons.append(f"{sentiment['sentiment']} sentiment")
        if volume.get('volume_ratio', 0) > 2.0: reasons.append("high volume confirmation")
        if macro.get('risk_on_off', 0.5) > 0.7: reasons.append("risk-on environment")
                
        if not reasons: reasons.append("neutral market conditions")
        return f"{signal.value} signal based on: {', '.join(reasons)}"
        
    def detect_anomalies(self, price_data: pd.Series,
                        volume_data: pd.Series,
                        window: int = 20) -> List[Dict]:
        """Identify statistical outliers in price and volume"""
        anomalies = []
        if len(price_data) < window: return []
        
        p_mean, p_std = price_data.rolling(window).mean(), price_data.rolling(window).std()
        v_mean, v_std = volume_data.rolling(window).mean(), volume_data.rolling(window).std()
        
        for i in range(window, len(price_data)):
            p_z = abs((price_data.iloc[i] - p_mean.iloc[i]) / p_std.iloc[i]) if p_std.iloc[i] > 0 else 0
            v_z = abs((volume_data.iloc[i] - v_mean.iloc[i]) / v_std.iloc[i]) if v_std.iloc[i] > 0 else 0
            
            if p_z > 3 or v_z > 3:
                anomalies.append({
                    'timestamp': price_data.index[i],
                    'price': float(price_data.iloc[i]),
                    'price_zscore': float(p_z),
                    'volume': float(volume_data.iloc[i]),
                    'volume_zscore': float(v_z),
                    'anomaly_type': 'price' if p_z > 3 else 'volume'
                })
        return anomalies
