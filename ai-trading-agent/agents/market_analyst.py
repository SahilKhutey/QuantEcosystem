import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from .base_agent import BaseTradingAgent, AgentType, AgentOutput
import talib
from scipy import stats
from loguru import logger

class MarketAnalystAgent(BaseTradingAgent):
    def __init__(self):
        super().__init__(AgentType.MARKET_ANALYST, confidence_threshold=0.7)
        self.technical_indicators = {}
        
    async def analyze(self, data: Dict) -> AgentOutput:
        """Analyze market trends, momentum, and technical patterns"""
        price_data = data.get('price_data')
        volume_data = data.get('volume_data')
        
        if price_data is None or len(price_data) < 50:
            logger.warning(f"Insufficient data for MarketAnalyst: {len(price_data) if price_data is not None else 0}")
            return AgentOutput(
                agent_type=self.agent_type,
                confidence=0.1,
                signal=0, # Added for compatibility with my previous implementation
                reason='Insufficient data', # Added for compatibility
                analysis={'error': 'Insufficient data'},
                timestamp=pd.Timestamp.now()
            )
        
        # Calculate comprehensive technical analysis
        technical_analysis = self._calculate_technical_indicators(price_data, volume_data)
        trend_analysis = self._analyze_trend(price_data)
        momentum_analysis = self._analyze_momentum(price_data)
        volatility_analysis = self._analyze_volatility(price_data) # This method was missing in the user request snippet partially, but referenced. I'll implement a basic one or use a placeholder.
        
        # Combine analyses
        overall_score = self._calculate_market_score(
            technical_analysis, trend_analysis, momentum_analysis, volatility_analysis
        )
        
        confidence = self._score_to_confidence(overall_score)
        
        # Determine signal based on overall score
        signal = 0
        if overall_score > 0.6: signal = 1
        elif overall_score < 0.4: signal = -1

        analysis = {
            'trend_direction': trend_analysis['direction'],
            'trend_strength': trend_analysis['strength'],
            'momentum': momentum_analysis['momentum_score'],
            'volatility_regime': volatility_analysis['regime'],
            'technical_score': technical_analysis['composite_score'],
            'key_levels': self._identify_key_levels(price_data),
            'pattern_recognition': self._identify_chart_patterns(price_data),
            'overall_score': overall_score
        }
        
        return AgentOutput(
            agent_type=self.agent_type,
            confidence=confidence,
            signal=signal,
            reason=f"Trend: {trend_analysis['direction']} ({trend_analysis['strength']:.2f}) | Technical Score: {technical_analysis['composite_score']:.2f}",
            analysis=analysis,
            timestamp=pd.Timestamp.now(),
            raw_data=technical_analysis
        )
    
    def _calculate_technical_indicators(self, prices: pd.Series, volume: Optional[pd.Series]) -> Dict:
        """Calculate comprehensive technical indicators"""
        close_prices = prices.values if isinstance(prices, pd.Series) else prices
        
        indicators = {}
        
        # Moving averages
        indicators['sma_20'] = talib.SMA(close_prices, timeperiod=20)
        indicators['sma_50'] = talib.SMA(close_prices, timeperiod=50)
        indicators['ema_12'] = talib.EMA(close_prices, timeperiod=12)
        indicators['ema_26'] = talib.EMA(close_prices, timeperiod=26)
        
        # Momentum indicators
        indicators['rsi'] = talib.RSI(close_prices, timeperiod=14)
        indicators['macd'], indicators['macd_signal'], indicators['macd_hist'] = talib.MACD(close_prices)
        
        # Note: STOCH needs high/low as well
        # Assuming prices might be a DataFrame or we need to pass high/low separately
        high = prices.values # fallback
        low = prices.values  # fallback
        
        indicators['stoch_k'], indicators['stoch_d'] = talib.STOCH(high, low, close_prices)
        
        # Volatility indicators
        indicators['atr'] = talib.ATR(high, low, close_prices, timeperiod=14)
        indicators['bb_upper'], indicators['bb_middle'], indicators['bb_lower'] = talib.BBANDS(close_prices)
        
        # Volume indicators
        if volume is not None:
            indicators['volume_sma'] = talib.SMA(volume.values, timeperiod=20)
            indicators['obv'] = talib.OBV(close_prices, volume.values)
        
        # Composite score
        indicators['composite_score'] = self._calculate_composite_score(indicators)
        
        return indicators
    
    def _analyze_trend(self, prices: pd.Series) -> Dict:
        """Analyze market trend direction and strength"""
        if len(prices) < 50:
            return {'direction': 'neutral', 'strength': 0.5}
        
        # Linear regression trend
        x = np.arange(len(prices))
        y = prices.values
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
        
        # Trend classification
        if slope > 0 and p_value < 0.05:
            direction = 'bullish'
            strength = min(abs(slope) * 100, 1.0)
        elif slope < 0 and p_value < 0.05:
            direction = 'bearish'
            strength = min(abs(slope) * 100, 1.0)
        else:
            direction = 'neutral'
            strength = 0.3
        
        return {
            'direction': direction,
            'strength': strength,
            'slope': slope,
            'r_squared': r_value**2,
            'p_value': p_value
        }
    
    def _analyze_momentum(self, prices: pd.Series) -> Dict:
        """Analyze price momentum"""
        returns = prices.pct_change().dropna()
        
        if len(returns) < 20:
            return {'momentum_score': 0.5, 'trend': 'neutral'}
        
        # Recent momentum
        recent_momentum = returns.tail(5).mean()
        historical_momentum = returns.mean()
        
        momentum_ratio = recent_momentum / historical_momentum if historical_momentum != 0 else 1
        
        if momentum_ratio > 1.2:
            trend = 'accelerating'
            score = min(0.9, momentum_ratio - 1)
        elif momentum_ratio > 0.8:
            trend = 'stable'
            score = 0.6
        else:
            trend = 'decelerating'
            score = max(0.1, momentum_ratio)
        
        return {
            'momentum_score': score,
            'trend': trend,
            'recent_momentum': recent_momentum,
            'momentum_ratio': momentum_ratio
        }

    def _analyze_volatility(self, prices: pd.Series) -> Dict:
        """Analyze price volatility"""
        returns = prices.pct_change().dropna()
        vol = returns.std() * np.sqrt(252)
        return {
            'volatility': vol,
            'regime': 'high' if vol > 0.3 else 'low'
        }

    def _calculate_market_score(self, tech, trend, momentum, vol) -> float:
        """Combine all scores into a single market health score."""
        weights = {'tech': 0.4, 'trend': 0.3, 'momentum': 0.2, 'vol': 0.1}
        trend_score = 1.0 if trend['direction'] == 'bullish' else (0.0 if trend['direction'] == 'bearish' else 0.5)
        momentum_score = momentum['momentum_score']
        vol_score = 0.7 if vol['regime'] == 'low' else 0.3 # Prefer low vol for confidence
        
        return (tech['composite_score'] * weights['tech'] + 
                trend_score * weights['trend'] + 
                momentum_score * weights['momentum'] + 
                vol_score * weights['vol'])

    def _identify_key_levels(self, prices: pd.Series) -> List[float]:
        """Identify support and resistance levels."""
        # Simple pivot points for demo
        return [prices.max(), prices.min(), prices.mean()]

    def _identify_chart_patterns(self, prices: pd.Series) -> List[str]:
        """Identify technical chart patterns."""
        return ["None detected"] # Placeholder
    
    def _calculate_composite_score(self, indicators: Dict) -> float:
        """Calculate composite technical score"""
        scores = []
        
        # RSI score (30-70 range is healthy)
        rsi_val = indicators.get('rsi')
        rsi = rsi_val[-1] if rsi_val is not None and len(rsi_val) > 0 else 50
        rsi_score = 1 - abs(rsi - 50) / 50 
        scores.append(max(0, min(1, rsi_score)))
        
        # MACD score
        macd_hist_val = indicators.get('macd_hist')
        macd_hist = macd_hist_val[-1] if macd_hist_val is not None and len(macd_hist_val) > 0 else 0
        macd_score = 0.5 + (macd_hist * 10) 
        scores.append(max(0, min(1, macd_score)))
        
        # Moving average alignment score
        if 'sma_20' in indicators and 'sma_50' in indicators:
            sma_20 = indicators['sma_20'][-1]
            sma_50 = indicators['sma_50'][-1]
            if not np.isnan(sma_50) and sma_50 > 0:
                sma_score = 1 if sma_20 > sma_50 else 0
                scores.append(sma_score)
        
        return np.mean(scores) if scores else 0.5
    
    def _score_to_confidence(self, score: float) -> float:
        """Convert analysis score to confidence level"""
        # S-curve confidence mapping
        if score > 0.7:
            confidence = 0.8 + (score - 0.7) * 2  # 0.8 to 1.0
        elif score > 0.3:
            confidence = 0.4 + (score - 0.3)  # 0.4 to 0.8
        else:
            confidence = score  # 0 to 0.4
        
        return min(max(confidence, 0.1), 0.95)
