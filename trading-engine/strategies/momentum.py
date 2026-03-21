import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import talib

class MomentumSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class MomentumConfig:
    symbol: str
    timeframe: str = "1d"
    momentum_period: int = 20  # Days for momentum calculation
    volume_confirmation: bool = True
    min_volume_ratio: float = 1.5
    trend_confirmation: bool = True
    min_trend_strength: float = 0.7  # R-squared
    breakout_confirmation: bool = True
    consolidation_period: int = 10  # Days of consolidation before breakout

class MomentumStrategy:
    def __init__(self, config: MomentumConfig):
        self.config = config
        self.positions = {}
        self.trade_history = []
        self.momentum_ranking = {}
        
    def calculate_momentum_score(self, df: pd.DataFrame) -> float:
        """Calculate momentum score for a stock"""
        if len(df) < self.config.momentum_period * 2:
            return 0
        
        close = df['close'].values
        
        # Price momentum
        price_momentum = (close[-1] / close[-self.config.momentum_period] - 1) * 100
        
        # Rate of Change
        roc = talib.ROC(close, timeperiod=self.config.momentum_period)[-1]
        
        # RSI momentum
        rsi = talib.RSI(close, timeperiod=14)[-1]
        rsi_momentum = 0
        if rsi > 50:
            rsi_momentum = (rsi - 50) / 50  # Normalize to 0-1
        else:
            rsi_momentum = -(50 - rsi) / 50
        
        # MACD momentum
        macd, macd_signal, _ = talib.MACD(close)
        macd_momentum = 1 if macd[-1] > macd_signal[-1] else -1
        
        # Volume momentum
        volume = df['volume'].values
        volume_ma = talib.SMA(volume, timeperiod=20)[-1]
        volume_ratio = volume[-1] / volume_ma if volume_ma > 0 else 1
        volume_momentum = min(2, volume_ratio) - 1  # Normalize to -1 to 1
        
        # Combine scores with weights
        weights = {
            'price': 0.4,
            'roc': 0.2,
            'rsi': 0.2,
            'macd': 0.1,
            'volume': 0.1
        }
        
        score = (
            price_momentum * weights['price'] +
            roc * weights['roc'] +
            rsi_momentum * 100 * weights['rsi'] +
            macd_momentum * 100 * weights['macd'] +
            volume_momentum * 100 * weights['volume']
        )
        
        return score
    
    def identify_momentum_stocks(self, stocks_data: Dict[str, pd.DataFrame], 
                               top_n: int = 10) -> List[Dict]:
        """Identify top momentum stocks"""
        momentum_scores = {}
        
        for symbol, df in stocks_data.items():
            score = self.calculate_momentum_score(df)
            momentum_scores[symbol] = score
        
        # Sort by score
        sorted_stocks = sorted(momentum_scores.items(), key=lambda x: x[1], reverse=True)
        
        top_stocks = []
        for symbol, score in sorted_stocks[:top_n]:
            df = stocks_data[symbol]
            analysis = self.analyze_momentum(df)
            
            top_stocks.append({
                'symbol': symbol,
                'momentum_score': score,
                'signal': analysis['signal'],
                'confidence': analysis['confidence'],
                'current_price': df['close'].iloc[-1],
                'momentum_pct': (df['close'].iloc[-1] / df['close'].iloc[-self.config.momentum_period] - 1) * 100
            })
        
        return top_stocks
    
    def analyze_momentum(self, df: pd.DataFrame) -> Dict:
        """Analyze momentum for trading signals"""
        if len(df) < max(self.config.momentum_period, 50):
            return {'signal': MomentumSignal.HOLD, 'confidence': 0}
        
        # Calculate momentum indicators
        indicators = self._calculate_momentum_indicators(df)
        
        # Check price momentum
        price_signal, price_confidence = self._check_price_momentum(df, indicators)
        
        # Check volume confirmation
        volume_signal, volume_confidence = self._check_volume_confirmation(df, indicators)
        
        # Check trend strength
        trend_signal, trend_confidence = self._check_trend_strength(df, indicators)
        
        # Check breakout
        breakout_signal, breakout_confidence = self._check_breakout(df, indicators)
        
        # Combine signals
        combined_signal, combined_confidence = self._combine_momentum_signals(
            price_signal, price_confidence,
            volume_signal, volume_confidence,
            trend_signal, trend_confidence,
            breakout_signal, breakout_confidence
        )
        
        # Calculate entry levels
        entry_levels = self._calculate_momentum_entry_levels(df, indicators, combined_signal)
        
        return {
            'signal': combined_signal,
            'confidence': combined_confidence,
            'indicators': indicators,
            'entry_levels': entry_levels,
            'timestamp': datetime.utcnow()
        }
    
    def _calculate_momentum_indicators(self, df: pd.DataFrame) -> Dict:
        """Calculate momentum indicators"""
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        volume = df['volume'].values
        
        indicators = {}
        
        # Price momentum
        indicators['price_momentum'] = (close[-1] / close[-self.config.momentum_period] - 1) * 100
        
        # Rate of Change
        indicators['roc'] = talib.ROC(close, timeperiod=self.config.momentum_period)[-1]
        
        # RSI
        indicators['rsi'] = talib.RSI(close, timeperiod=14)[-1]
        
        # MACD
        macd, macd_signal, macd_hist = talib.MACD(close)
        indicators['macd'] = macd[-1]
        indicators['macd_signal'] = macd_signal[-1]
        indicators['macd_hist'] = macd_hist[-1]
        
        # Stochastic
        stoch_k, stoch_d = talib.STOCH(high, low, close)
        indicators['stoch_k'] = stoch_k[-1]
        indicators['stoch_d'] = stoch_d[-1]
        
        # ADX (Trend strength)
        indicators['adx'] = talib.ADX(high, low, close, timeperiod=14)[-1]
        
        # Volume indicators
        indicators['volume_sma'] = talib.SMA(volume, timeperiod=20)[-1]
        indicators['volume_ratio'] = volume[-1] / indicators['volume_sma'] if indicators['volume_sma'] > 0 else 1
        indicators['obv'] = talib.OBV(close, volume)[-1]
        
        # Price position
        indicators['high_20'] = np.max(high[-20:])
        indicators['low_20'] = np.min(low[-20:])
        indicators['price_position'] = (close[-1] - indicators['low_20']) / (indicators['high_20'] - indicators['low_20'])
        
        # Trend line
        if len(close) >= 20:
            x = np.arange(len(close[-20:]))
            y = close[-20:]
            slope, intercept = np.polyfit(x, y, 1)
            indicators['trend_slope'] = slope
            indicators['trend_r_squared'] = np.corrcoef(x, y)[0, 1] ** 2
            
        # Store full RSI array for divergence calculations
        indicators['rsi_array'] = talib.RSI(close, timeperiod=14)
        
        return indicators
    
    def _detect_rsi_divergence(self, df: pd.DataFrame, indicators: Dict) -> int:
        """
        Scans for Institutional Hidden/Regular Divergence.
        Returns:
            1: Bullish Divergence (Price Lower Lows, RSI Higher Lows)
           -1: Bearish Divergence (Price Higher Highs, RSI Lower Highs)
            0: No statistically significant divergence
        """
        rsi_array = indicators.get('rsi_array')
        if rsi_array is None or len(df) < 30:
            return 0
            
        close = df['close'].values
        
        # Lookback windows
        current_price = close[-1]
        current_rsi = rsi_array[-1]
        
        # Find extreme points in the last N periods
        lookback = 15
        if len(close) < lookback + 5: return 0
        
        past_price_high = np.max(close[-lookback:-5])
        past_price_low = np.min(close[-lookback:-5])
        
        past_rsi_high = np.nanmax(rsi_array[-lookback:-5])
        past_rsi_low = np.nanmin(rsi_array[-lookback:-5])
        
        # Bullish Divergence (Accumulation)
        # Price forms a lower low, but momentum (RSI) formed a higher low.
        if current_price < past_price_low and current_rsi > past_rsi_low:
            return 1
            
        # Bearish Divergence (Distribution)
        # Price forms a higher high, but momentum (RSI) formed a lower high.
        if current_price > past_price_high and current_rsi < past_rsi_high:
            return -1
            
        return 0
        
    def _check_price_momentum(self, df: pd.DataFrame, 
                            indicators: Dict) -> Tuple[MomentumSignal, float]:
        """Check price momentum augmented by Institutional Divergence arrays"""
        price_momentum = indicators.get('price_momentum', 0)
        roc = indicators.get('roc', 0)
        
        divergence = self._detect_rsi_divergence(df, indicators)
        
        signal = MomentumSignal.HOLD
        confidence = 0
        
        if price_momentum > 10 and roc > 5:
            if divergence == -1:
                # Upward trend but Bearish Divergence halts strong buy! Institutional trap.
                signal = MomentumSignal.HOLD
                confidence = 0
            else:
                signal = MomentumSignal.STRONG_BUY
                confidence = 0.8
        elif price_momentum > 5 and roc > 2:
            signal = MomentumSignal.BUY
            confidence = 0.6
        elif price_momentum < -10 and roc < -5:
            if divergence == 1:
                # Downward trend but Bullish Divergence halts strong sell! Institutional trap.
                signal = MomentumSignal.HOLD
                confidence = 0
            else:
                signal = MomentumSignal.STRONG_SELL
                confidence = 0.8
        elif price_momentum < -5 and roc < -2:
            signal = MomentumSignal.SELL
            confidence = 0.6
            
        # Pure Divergence Reversal Entries
        if divergence == 1 and signal == MomentumSignal.HOLD:
            signal = MomentumSignal.BUY
            confidence = 0.9 # High conviction accumulation
        elif divergence == -1 and signal == MomentumSignal.HOLD:
            signal = MomentumSignal.SELL
            confidence = 0.9 # High conviction distribution
        
        return signal, confidence
    
    def _check_volume_confirmation(self, df: pd.DataFrame,
                                 indicators: Dict) -> Tuple[MomentumSignal, float]:
        """Check volume confirmation"""
        if not self.config.volume_confirmation:
            return MomentumSignal.HOLD, 0
        
        volume_ratio = indicators.get('volume_ratio', 1)
        obv = indicators.get('obv', 0)
        
        signal = MomentumSignal.HOLD
        confidence = 0
        
        # Check if volume confirms price movement
        price_change = (df['close'].iloc[-1] - df['close'].iloc[-2]) / df['close'].iloc[-2] * 100 if len(df) > 1 else 0
        
        if volume_ratio > self.config.min_volume_ratio:
            if price_change > 0 and obv > 0:
                signal = MomentumSignal.BUY
                confidence = 0.7
            elif price_change < 0 and obv < 0:
                signal = MomentumSignal.SELL
                confidence = 0.7
        
        return signal, confidence
    
    def _check_trend_strength(self, df: pd.DataFrame,
                            indicators: Dict) -> Tuple[MomentumSignal, float]:
        """Check trend strength"""
        if not self.config.trend_confirmation:
            return MomentumSignal.HOLD, 0
        
        adx = indicators.get('adx', 0)
        trend_r_squared = indicators.get('trend_r_squared', 0)
        trend_slope = indicators.get('trend_slope', 0)
        
        signal = MomentumSignal.HOLD
        confidence = 0
        
        # Strong trend confirmation
        if adx > 25 and trend_r_squared > self.config.min_trend_strength:
            if trend_slope > 0:
                signal = MomentumSignal.BUY
                confidence = 0.6
            elif trend_slope < 0:
                signal = MomentumSignal.SELL
                confidence = 0.6
        
        return signal, confidence
    
    def _check_breakout(self, df: pd.DataFrame,
                       indicators: Dict) -> Tuple[MomentumSignal, float]:
        """Check for breakout from consolidation"""
        if not self.config.breakout_confirmation:
            return MomentumSignal.HOLD, 0
        
        if len(df) < self.config.consolidation_period * 2:
            return MomentumSignal.HOLD, 0
        
        current_price = df['close'].iloc[-1]
        
        # Calculate consolidation range
        consolidation_data = df.iloc[-self.config.consolidation_period:]
        consolidation_high = consolidation_data['high'].max()
        consolidation_low = consolidation_data['low'].min()
        consolidation_range = consolidation_high - consolidation_low
        
        signal = MomentumSignal.HOLD
        confidence = 0
        
        # Breakout above consolidation
        if current_price > consolidation_high and consolidation_range > 0:
            # Check volume
            current_volume = df['volume'].iloc[-1]
            avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
            
            if current_volume > avg_volume * 1.5:
                signal = MomentumSignal.BUY
                confidence = 0.7
        
        # Breakdown below consolidation
        elif current_price < consolidation_low and consolidation_range > 0:
            # Check volume
            current_volume = df['volume'].iloc[-1]
            avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
            
            if current_volume > avg_volume * 1.5:
                signal = MomentumSignal.SELL
                confidence = 0.7
        
        return signal, confidence
    
    def _combine_momentum_signals(self, *signals: Tuple[MomentumSignal, float]) -> Tuple[MomentumSignal, float]:
        """Combine momentum signals"""
        signal_scores = {
            MomentumSignal.STRONG_BUY: 0,
            MomentumSignal.BUY: 0,
            MomentumSignal.HOLD: 0,
            MomentumSignal.SELL: 0,
            MomentumSignal.STRONG_SELL: 0
        }
        
        weights = [0.4, 0.2, 0.2, 0.2]  # Price, volume, trend, breakout
        
        for i, (signal, confidence) in enumerate(signals):
            weight = weights[i] if i < len(weights) else 0.25
            score = confidence * weight
            
            if signal == MomentumSignal.STRONG_BUY:
                signal_scores[MomentumSignal.BUY] += score * 1.5
            elif signal == MomentumSignal.STRONG_SELL:
                signal_scores[MomentumSignal.SELL] += score * 1.5
            else:
                signal_scores[signal] += score
        
        # Find winning signal
        winning_signal = max(signal_scores.items(), key=lambda x: x[1])
        
        # Convert back to strong signals if confidence high
        if winning_signal[0] == MomentumSignal.BUY and winning_signal[1] > 0.6:
            final_signal = MomentumSignal.STRONG_BUY
        elif winning_signal[0] == MomentumSignal.SELL and winning_signal[1] > 0.6:
            final_signal = MomentumSignal.STRONG_SELL
        else:
            final_signal = winning_signal[0]
        
        return final_signal, winning_signal[1]
    
    def _calculate_momentum_entry_levels(self, df: pd.DataFrame,
                                       indicators: Dict,
                                       signal: MomentumSignal) -> Dict:
        """Calculate entry levels for momentum trading"""
        current_price = df['close'].iloc[-1]
        
        # Use ATR for stop loss
        atr = self._calculate_atr(df)
        
        if signal in [MomentumSignal.BUY, MomentumSignal.STRONG_BUY]:
            entry = current_price
            stop_loss = current_price - (atr * 2)
            target = current_price + (atr * 4)  # 1:2 risk-reward
            
        elif signal in [MomentumSignal.SELL, MomentumSignal.STRONG_SELL]:
            entry = current_price
            stop_loss = current_price + (atr * 2)
            target = current_price - (atr * 4)
            
        else:
            entry = current_price
            stop_loss = None
            target = None
        
        return {
            'entry': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward_ratio': abs(target - entry) / abs(entry - stop_loss) 
                               if stop_loss and target else None
        }
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """Calculate ATR"""
        high = df['high'].values
        low = df['low'].values
        close = df['close'].values
        
        if len(high) < period:
            return 0
        
        return talib.ATR(high, low, close, timeperiod=period)[-1]
    
    def create_momentum_trade(self, analysis: Dict, capital: float) -> Optional[Dict]:
        """Create a momentum trading plan"""
        if analysis['signal'] == MomentumSignal.HOLD:
            return None
        
        entry_levels = analysis['entry_levels']
        
        if not entry_levels['stop_loss'] or not entry_levels['target']:
            return None
        
        # Calculate position size
        stop_loss_distance = abs(entry_levels['entry'] - entry_levels['stop_loss'])
        
        # Use momentum-based risk (higher momentum = higher risk)
        base_risk = 0.02  # 2%
        momentum_multiplier = min(2, analysis['confidence'] * 2)  # Up to 2x for high confidence
        
        risk_per_trade = capital * base_risk * momentum_multiplier
        position_size = risk_per_trade / stop_loss_distance
        
        trade = {
            'trade_id': f"momentum_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'symbol': self.config.symbol,
            'signal': analysis['signal'].value,
            'confidence': analysis['confidence'],
            'momentum_score': analysis['indicators'].get('price_momentum', 0),
            'entry_price': entry_levels['entry'],
            'position_size': position_size,
            'stop_loss': entry_levels['stop_loss'],
            'target': entry_levels['target'],
            'risk_reward_ratio': entry_levels['risk_reward_ratio'],
            'risk_multiplier': momentum_multiplier,
            'timestamp': datetime.utcnow(),
            'timeframe': self.config.timeframe,
            'indicators': analysis['indicators']
        }
        
        self.trade_history.append(trade)
        return trade
