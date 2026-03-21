import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import talib

class SwingSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class SwingConfig:
    symbol: str
    timeframe: str = "1d"  # Daily data for swing trading
    rsi_period: int = 14
    rsi_oversold: float = 30
    rsi_overbought: float = 70
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    sma_short: int = 20
    sma_long: int = 50
    atr_period: int = 14
    atr_multiplier: float = 2.0
    min_volume_ratio: float = 1.2

class SwingStrategy:
    def __init__(self, config: SwingConfig):
        self.config = config
        self.positions = {}
        self.trade_history = []
        self.data_buffer = pd.DataFrame()
        
    def analyze(self, df: pd.DataFrame) -> Dict:
        """Analyze data for swing trading signals"""
        if len(df) < max(self.config.sma_long, self.config.rsi_period, 50):
            return {'signal': SwingSignal.HOLD, 'confidence': 0}
        
        # Calculate indicators
        indicators = self._calculate_indicators(df)
        
        # Generate signals from different methods
        trend_signal = self._trend_analysis(df, indicators)
        momentum_signal = self._momentum_analysis(df, indicators)
        breakout_signal = self._breakout_analysis(df, indicators)
        volume_signal = self._volume_analysis(df)
        
        # Combine signals
        combined_signal, confidence = self._combine_signals(
            trend_signal, momentum_signal, breakout_signal, volume_signal
        )
        
        # Calculate entry/exit levels
        entry_levels = self._calculate_entry_levels(df, indicators, combined_signal)
        
        return {
            'signal': combined_signal,
            'confidence': confidence,
            'indicators': indicators,
            'entry_levels': entry_levels,
            'timestamp': datetime.utcnow()
        }
    
    def _calculate_indicators(self, df: pd.DataFrame) -> Dict:
        """Calculate technical indicators"""
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        volume = df['volume'].values
        
        indicators = {}
        
        # RSI
        indicators['rsi'] = talib.RSI(close, timeperiod=self.config.rsi_period)[-1]
        
        # MACD
        macd, macd_signal, macd_hist = talib.MACD(
            close, 
            fastperiod=self.config.macd_fast,
            slowperiod=self.config.macd_slow,
            signalperiod=self.config.macd_signal
        )
        indicators['macd'] = macd[-1]
        indicators['macd_signal'] = macd_signal[-1]
        indicators['macd_hist'] = macd_hist[-1]
        
        # Moving Averages
        indicators['sma_20'] = talib.SMA(close, timeperiod=self.config.sma_short)[-1]
        indicators['sma_50'] = talib.SMA(close, timeperiod=self.config.sma_long)[-1]
        
        # ATR for volatility
        indicators['atr'] = talib.ATR(high, low, close, timeperiod=self.config.atr_period)[-1]
        
        # Bollinger Bands
        bb_upper, bb_middle, bb_lower = talib.BBANDS(
            close, 
            timeperiod=20,
            nbdevup=2,
            nbdevdn=2
        )
        indicators['bb_upper'] = bb_upper[-1]
        indicators['bb_middle'] = bb_middle[-1]
        indicators['bb_lower'] = bb_lower[-1]
        indicators['bb_position'] = (close[-1] - bb_lower[-1]) / (bb_upper[-1] - bb_lower[-1])
        
        # Stochastic
        stoch_k, stoch_d = talib.STOCH(high, low, close)
        indicators['stoch_k'] = stoch_k[-1]
        indicators['stoch_d'] = stoch_d[-1]
        
        return indicators
    
    def _trend_analysis(self, df: pd.DataFrame, indicators: Dict) -> Tuple[SwingSignal, float]:
        """Analyze trend for swing trading"""
        close = df['close'].values
        sma_20 = indicators['sma_20']
        sma_50 = indicators['sma_50']
        current_price = close[-1]
        
        # Check trend direction
        if sma_20 > sma_50 and current_price > sma_20:
            # Uptrend
            signal = SwingSignal.BUY
            confidence = 0.7
            
            # Check for strong uptrend
            if current_price > sma_20 * 1.02:  # 2% above SMA20
                signal = SwingSignal.STRONG_BUY
                confidence = 0.85
                
        elif sma_20 < sma_50 and current_price < sma_20:
            # Downtrend
            signal = SwingSignal.SELL
            confidence = 0.7
            
            # Check for strong downtrend
            if current_price < sma_20 * 0.98:  # 2% below SMA20
                signal = SwingSignal.STRONG_SELL
                confidence = 0.85
        else:
            # Sideways or unclear
            signal = SwingSignal.HOLD
            confidence = 0.3
        
        return signal, confidence
    
    def _momentum_analysis(self, df: pd.DataFrame, indicators: Dict) -> Tuple[SwingSignal, float]:
        """Analyze momentum indicators"""
        rsi = indicators['rsi']
        macd = indicators['macd']
        macd_signal = indicators['macd_signal']
        stoch_k = indicators['stoch_k']
        stoch_d = indicators['stoch_d']
        
        signal = SwingSignal.HOLD
        confidence = 0.5
        
        # RSI signals
        if rsi < self.config.rsi_oversold:
            signal = SwingSignal.BUY
            confidence = 0.6
        elif rsi > self.config.rsi_overbought:
            signal = SwingSignal.SELL
            confidence = 0.6
        
        # MACD signals
        if macd > macd_signal and signal == SwingSignal.BUY:
            confidence += 0.1
            signal = SwingSignal.STRONG_BUY if confidence > 0.7 else SwingSignal.BUY
        elif macd < macd_signal and signal == SwingSignal.SELL:
            confidence += 0.1
            signal = SwingSignal.STRONG_SELL if confidence > 0.7 else SwingSignal.SELL
        
        # Stochastic signals
        if stoch_k < 20 and stoch_d < 20:
            if signal == SwingSignal.BUY:
                confidence += 0.1
        elif stoch_k > 80 and stoch_d > 80:
            if signal == SwingSignal.SELL:
                confidence += 0.1
        
        return signal, min(confidence, 1.0)
    
    def _breakout_analysis(self, df: pd.DataFrame, indicators: Dict) -> Tuple[SwingSignal, float]:
        """Analyze breakout patterns"""
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        
        # Look for recent highs/lows
        lookback = 20
        if len(close) < lookback:
            return SwingSignal.HOLD, 0
        
        recent_high = max(high[-lookback:])
        recent_low = min(low[-lookback:])
        current_price = close[-1]
        
        signal = SwingSignal.HOLD
        confidence = 0
        
        # Breakout above resistance
        if current_price > recent_high:
            signal = SwingSignal.BUY
            confidence = 0.7
            
            # Check volume confirmation
            if len(df) > 1:
                current_volume = df['volume'].iloc[-1]
                avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
                if current_volume > avg_volume * self.config.min_volume_ratio:
                    signal = SwingSignal.STRONG_BUY
                    confidence = 0.85
        
        # Breakdown below support
        elif current_price < recent_low:
            signal = SwingSignal.SELL
            confidence = 0.7
            
            # Check volume confirmation
            if len(df) > 1:
                current_volume = df['volume'].iloc[-1]
                avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
                if current_volume > avg_volume * self.config.min_volume_ratio:
                    signal = SwingSignal.STRONG_SELL
                    confidence = 0.85
        
        return signal, confidence
    
    def _volume_analysis(self, df: pd.DataFrame) -> Tuple[SwingSignal, float]:
        """Analyze volume patterns"""
        if len(df) < 20:
            return SwingSignal.HOLD, 0
        
        current_volume = df['volume'].iloc[-1]
        avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        # Volume spike with price movement
        current_price = df['close'].iloc[-1]
        prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
        price_change = (current_price - prev_price) / prev_price
        
        signal = SwingSignal.HOLD
        confidence = 0
        
        if volume_ratio > self.config.min_volume_ratio:
            if price_change > 0.01:  # 1% up on high volume
                signal = SwingSignal.BUY
                confidence = 0.6
            elif price_change < -0.01:  # 1% down on high volume
                signal = SwingSignal.SELL
                confidence = 0.6
        
        return signal, confidence
    
    def _combine_signals(self, *signals: Tuple[SwingSignal, float]) -> Tuple[SwingSignal, float]:
        """Combine multiple signals with weighted confidence"""
        signal_scores = {
            SwingSignal.STRONG_BUY: 0,
            SwingSignal.BUY: 0,
            SwingSignal.HOLD: 0,
            SwingSignal.SELL: 0,
            SwingSignal.STRONG_SELL: 0
        }
        
        total_weight = 0
        
        # Weight different analysis methods
        weights = {
            'trend': 0.4,
            'momentum': 0.3,
            'breakout': 0.2,
            'volume': 0.1
        }
        
        for i, (signal, confidence) in enumerate(signals):
            weight = list(weights.values())[i] if i < len(weights) else 0.25
            score = confidence * weight
            
            if signal == SwingSignal.STRONG_BUY:
                signal_scores[SwingSignal.BUY] += score * 1.5
            elif signal == SwingSignal.STRONG_SELL:
                signal_scores[SwingSignal.SELL] += score * 1.5
            else:
                signal_scores[signal] += score
            
            total_weight += weight
        
        # Normalize scores
        if total_weight > 0:
            for signal in signal_scores:
                signal_scores[signal] /= total_weight
        
        # Find winning signal
        winning_signal = max(signal_scores.items(), key=lambda x: x[1])
        
        return winning_signal[0], winning_signal[1]
    
    def _calculate_entry_levels(self, df: pd.DataFrame, 
                              indicators: Dict, 
                              signal: SwingSignal) -> Dict:
        """Calculate entry, stop loss, and target levels"""
        current_price = df['close'].iloc[-1]
        atr = indicators['atr']
        
        if signal in [SwingSignal.BUY, SwingSignal.STRONG_BUY]:
            # For buy signals
            entry = current_price
            stop_loss = current_price - (atr * self.config.atr_multiplier)
            target = current_price + (atr * self.config.atr_multiplier * 2)  # 1:2 risk-reward
            
        elif signal in [SwingSignal.SELL, SwingSignal.STRONG_SELL]:
            # For sell signals
            entry = current_price
            stop_loss = current_price + (atr * self.config.atr_multiplier)
            target = current_price - (atr * self.config.atr_multiplier * 2)
            
        else:
            # For hold signals
            entry = current_price
            stop_loss = None
            target = None
        
        return {
            'entry': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward_ratio': abs(target - entry) / abs(entry - stop_loss) 
                               if stop_loss and target else None,
            'atr_multiple': self.config.atr_multiplier
        }
    
    def create_swing_trade(self, analysis: Dict, capital: float) -> Optional[Dict]:
        """Create a swing trading plan"""
        if analysis['signal'] == SwingSignal.HOLD:
            return None
        
        entry_levels = analysis['entry_levels']
        
        if not entry_levels['stop_loss'] or not entry_levels['target']:
            return None
        
        # Calculate position size using 2% risk rule
        stop_loss_distance = abs(entry_levels['entry'] - entry_levels['stop_loss'])
        risk_per_trade = capital * 0.02
        position_size = risk_per_trade / stop_loss_distance
        
        trade = {
            'trade_id': f"swing_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'symbol': self.config.symbol,
            'signal': analysis['signal'].value,
            'confidence': analysis['confidence'],
            'entry_price': entry_levels['entry'],
            'position_size': position_size,
            'stop_loss': entry_levels['stop_loss'],
            'target': entry_levels['target'],
            'risk_reward_ratio': entry_levels['risk_reward_ratio'],
            'timestamp': datetime.utcnow(),
            'timeframe': self.config.timeframe,
            'indicators': analysis['indicators']
        }
        
        self.trade_history.append(trade)
        return trade
