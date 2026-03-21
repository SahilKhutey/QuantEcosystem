import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import talib

class IntradaySignal(Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"
    CLOSE = "CLOSE"

@dataclass
class IntradayConfig:
    symbol: str
    timeframe: str = "5m"  # 5-minute candles
    session_start: str = "09:15"
    session_end: str = "15:30"
    max_trades_per_day: int = 5
    max_position_size: float = 1000
    target_multiple: float = 1.5  # 1:1.5 risk-reward
    use_opening_range: bool = True
    opening_range_minutes: int = 30

class IntradayStrategy:
    def __init__(self, config: IntradayConfig):
        self.config = config
        self.positions = {}
        self.trade_history = []
        self.daily_stats = {
            'trades_today': 0,
            'pnl_today': 0,
            'last_trade_time': None
        }
        self.opening_range = None
        
    def analyze_intraday(self, df: pd.DataFrame) -> Dict:
        """Analyze intraday data for trading signals"""
        if len(df) < 20:
            return {'signal': IntradaySignal.HOLD, 'confidence': 0}
        
        # Reset daily stats if new day
        self._reset_daily_stats_if_needed()
        
        # Check if we can trade more today
        if not self._can_trade_today():
            return {'signal': IntradaySignal.HOLD, 'confidence': 0}
        
        # Calculate indicators
        indicators = self._calculate_intraday_indicators(df)
        
        # Check opening range breakout
        opening_signal = self._check_opening_range_breakout(df, indicators)
        
        # Check momentum
        momentum_signal = self._check_momentum(df, indicators)
        
        # Check mean reversion
        mean_reversion_signal = self._check_mean_reversion(df, indicators)
        
        # Check volume patterns
        volume_signal = self._check_volume_patterns(df)
        
        # Combine signals
        combined_signal, confidence = self._combine_intraday_signals(
            opening_signal, momentum_signal, mean_reversion_signal, volume_signal
        )
        
        # Check for exit signals on existing positions
        exit_signal = self._check_exit_signals(df, indicators)
        
        # Final decision
        if exit_signal != IntradaySignal.HOLD:
            final_signal = exit_signal
        else:
            final_signal = combined_signal
        
        # Calculate entry levels
        entry_levels = self._calculate_intraday_entry_levels(df, indicators, final_signal)
        
        return {
            'signal': final_signal,
            'confidence': confidence,
            'indicators': indicators,
            'entry_levels': entry_levels,
            'opening_range': self.opening_range,
            'trades_today': self.daily_stats['trades_today'],
            'timestamp': datetime.utcnow()
        }
    
    def _reset_daily_stats_if_needed(self):
        """Reset daily statistics if new trading day"""
        now = datetime.utcnow()
        if self.daily_stats['last_trade_time']:
            last_trade_date = self.daily_stats['last_trade_time'].date()
            if now.date() > last_trade_date:
                self.daily_stats = {
                    'trades_today': 0,
                    'pnl_today': 0,
                    'last_trade_time': None
                }
                self.opening_range = None
    
    def _can_trade_today(self) -> bool:
        """Check if we can trade more today"""
        return self.daily_stats['trades_today'] < self.config.max_trades_per_day
    
    def _calculate_intraday_indicators(self, df: pd.DataFrame) -> Dict:
        """Calculate intraday technical indicators"""
        close = df['close'].values
        high = df['high'].values
        low = df['low'].values
        volume = df['volume'].values
        
        indicators = {}
        
        # VWAP (Volume Weighted Average Price)
        typical_price = (high + low + close) / 3
        vwap = np.cumsum(typical_price * volume) / np.cumsum(volume)
        indicators['vwap'] = vwap[-1]
        indicators['price_vs_vwap'] = (close[-1] - vwap[-1]) / vwap[-1] * 100
        
        # RSI
        indicators['rsi'] = talib.RSI(close, timeperiod=14)[-1]
        
        # Stochastic
        stoch_k, stoch_d = talib.STOCH(high, low, close)
        indicators['stoch_k'] = stoch_k[-1]
        indicators['stoch_d'] = stoch_d[-1]
        
        # MACD
        macd, macd_signal, macd_hist = talib.MACD(close)
        indicators['macd'] = macd[-1]
        indicators['macd_signal'] = macd_signal[-1]
        indicators['macd_hist'] = macd_hist[-1]
        
        # Bollinger Bands
        bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20)
        indicators['bb_upper'] = bb_upper[-1]
        indicators['bb_middle'] = bb_middle[-1]
        indicators['bb_lower'] = bb_lower[-1]
        indicators['bb_width'] = (bb_upper[-1] - bb_lower[-1]) / bb_middle[-1] * 100
        
        # ATR for volatility
        indicators['atr'] = talib.ATR(high, low, close, timeperiod=14)[-1]
        
        # Volume indicators
        indicators['volume_sma'] = talib.SMA(volume, timeperiod=20)[-1]
        indicators['volume_ratio'] = volume[-1] / indicators['volume_sma'] if indicators['volume_sma'] > 0 else 1
        
        # Price rate of change
        indicators['roc'] = talib.ROC(close, timeperiod=10)[-1]
        
        return indicators
    
    def _check_opening_range_breakout(self, df: pd.DataFrame, 
                                    indicators: Dict) -> Tuple[IntradaySignal, float]:
        """Check for opening range breakout"""
        if not self.config.use_opening_range:
            return IntradaySignal.HOLD, 0
        
        # Calculate opening range (first 30 minutes)
        if self.opening_range is None:
            session_start = datetime.combine(datetime.utcnow().date(), 
                                           datetime.strptime(self.config.session_start, "%H:%M").time())
            
            opening_data = df[df.index >= session_start]
            if len(opening_data) >= (self.config.opening_range_minutes // 5):  # 5-minute candles
                opening_high = opening_data['high'].max()
                opening_low = opening_data['low'].min()
                self.opening_range = {'high': opening_high, 'low': opening_low}
        
        if self.opening_range is None:
            return IntradaySignal.HOLD, 0
        
        current_price = df['close'].iloc[-1]
        opening_high = self.opening_range['high']
        opening_low = self.opening_range['low']
        
        signal = IntradaySignal.HOLD
        confidence = 0
        
        # Breakout above opening range
        if current_price > opening_high:
            signal = IntradaySignal.BUY
            confidence = 0.7
            
            # Volume confirmation
            if indicators.get('volume_ratio', 1) > 1.5:
                confidence = 0.85
        
        # Breakdown below opening range
        elif current_price < opening_low:
            signal = IntradaySignal.SELL
            confidence = 0.7
            
            # Volume confirmation
            if indicators.get('volume_ratio', 1) > 1.5:
                confidence = 0.85
        
        return signal, confidence
    
    def _check_momentum(self, df: pd.DataFrame, 
                       indicators: Dict) -> Tuple[IntradaySignal, float]:
        """Check momentum signals"""
        signal = IntradaySignal.HOLD
        confidence = 0
        
        current_price = df['close'].iloc[-1]
        vwap = indicators.get('vwap', current_price)
        rsi = indicators.get('rsi', 50)
        macd = indicators.get('macd', 0)
        macd_signal = indicators.get('macd_signal', 0)
        roc = indicators.get('roc', 0)
        
        # RSI momentum
        if rsi > 60 and current_price > vwap:
            signal = IntradaySignal.BUY
            confidence = 0.6
        elif rsi < 40 and current_price < vwap:
            signal = IntradaySignal.SELL
            confidence = 0.6
        
        # MACD crossover
        if macd > macd_signal and signal == IntradaySignal.BUY:
            confidence += 0.1
        elif macd < macd_signal and signal == IntradaySignal.SELL:
            confidence += 0.1
        
        # Rate of Change
        if roc > 1 and signal == IntradaySignal.BUY:  # 1% ROC
            confidence += 0.1
        elif roc < -1 and signal == IntradaySignal.SELL:
            confidence += 0.1
        
        return signal, min(confidence, 1.0)
    
    def _check_mean_reversion(self, df: pd.DataFrame,
                            indicators: Dict) -> Tuple[IntradaySignal, float]:
        """Check mean reversion signals"""
        signal = IntradaySignal.HOLD
        confidence = 0
        
        current_price = df['close'].iloc[-1]
        bb_upper = indicators.get('bb_upper', current_price)
        bb_lower = indicators.get('bb_lower', current_price)
        bb_middle = indicators.get('bb_middle', current_price)
        rsi = indicators.get('rsi', 50)
        stoch_k = indicators.get('stoch_k', 50)
        
        # Bollinger Band mean reversion
        if current_price < bb_lower:
            signal = IntradaySignal.BUY
            confidence = 0.7
            
            # RSI confirmation
            if rsi < 30:
                confidence = 0.85
        
        elif current_price > bb_upper:
            signal = IntradaySignal.SELL
            confidence = 0.7
            
            # RSI confirmation
            if rsi > 70:
                confidence = 0.85
        
        # Stochastic mean reversion
        elif stoch_k < 20 and signal == IntradaySignal.HOLD:
            signal = IntradaySignal.BUY
            confidence = 0.6
        elif stoch_k > 80 and signal == IntradaySignal.HOLD:
            signal = IntradaySignal.SELL
            confidence = 0.6
        
        return signal, confidence
    
    def _check_volume_patterns(self, df: pd.DataFrame) -> Tuple[IntradaySignal, float]:
        """Check volume patterns"""
        if len(df) < 10:
            return IntradaySignal.HOLD, 0
        
        current_volume = df['volume'].iloc[-1]
        avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        current_price = df['close'].iloc[-1]
        prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
        price_change = (current_price - prev_price) / prev_price * 100
        
        signal = IntradaySignal.HOLD
        confidence = 0
        
        # High volume with price movement
        if volume_ratio > 2.0:
            if price_change > 0.5:  # 0.5% up
                signal = IntradaySignal.BUY
                confidence = 0.7
            elif price_change < -0.5:  # 0.5% down
                signal = IntradaySignal.SELL
                confidence = 0.7
        
        # Low volume after high volume (exhaustion)
        elif volume_ratio < 0.5 and len(df) > 5:
            prev_volumes = df['volume'].iloc[-5:-1]
            if prev_volumes.max() > avg_volume * 1.5:
                # Volume drying up after spike
                if price_change > 0:
                    signal = IntradaySignal.SELL  # Exhaustion after up move
                    confidence = 0.6
                elif price_change < 0:
                    signal = IntradaySignal.BUY  # Exhaustion after down move
                    confidence = 0.6
        
        return signal, confidence
    
    def _combine_intraday_signals(self, *signals: Tuple[IntradaySignal, float]) -> Tuple[IntradaySignal, float]:
        """Combine intraday signals"""
        signal_scores = {
            IntradaySignal.BUY: 0,
            IntradaySignal.SELL: 0,
            IntradaySignal.HOLD: 0
        }
        
        weights = [0.3, 0.3, 0.2, 0.2]  # Opening, momentum, mean reversion, volume
        
        for i, (signal, confidence) in enumerate(signals):
            weight = weights[i] if i < len(weights) else 0.25
            score = confidence * weight
            
            if signal == IntradaySignal.BUY:
                signal_scores[IntradaySignal.BUY] += score
            elif signal == IntradaySignal.SELL:
                signal_scores[IntradaySignal.SELL] += score
            else:
                signal_scores[IntradaySignal.HOLD] += score
        
        # Find winning signal
        winning_signal = max(signal_scores.items(), key=lambda x: x[1])
        
        # Need minimum confidence to trade
        if winning_signal[1] < 0.4:
            return IntradaySignal.HOLD, winning_signal[1]
        
        return winning_signal[0], winning_signal[1]
    
    def _check_exit_signals(self, df: pd.DataFrame, 
                          indicators: Dict) -> IntradaySignal:
        """Check exit signals for existing positions"""
        if self.config.symbol not in self.positions:
            return IntradaySignal.HOLD
        
        position = self.positions[self.config.symbol]
        current_price = df['close'].iloc[-1]
        
        # Check stop loss
        if 'stop_loss' in position and current_price <= position['stop_loss']:
            return IntradaySignal.CLOSE
        
        # Check target
        if 'target' in position and current_price >= position['target']:
            return IntradaySignal.CLOSE
        
        # Check trailing stop (simplified)
        if 'highest_price' in position:
            highest_price = position['highest_price']
            trailing_stop = highest_price * 0.99  # 1% trailing stop
            if current_price <= trailing_stop:
                return IntradaySignal.CLOSE
        
        # Check time-based exit (end of day)
        now = datetime.utcnow()
        session_end = datetime.combine(now.date(), 
                                     datetime.strptime(self.config.session_end, "%H:%M").time())
        
        if now >= session_end - timedelta(minutes=5):  # Last 5 minutes
            return IntradaySignal.CLOSE
        
        # Check indicator-based exit
        rsi = indicators.get('rsi', 50)
        if position['side'] == 'BUY' and rsi > 70:
            return IntradaySignal.CLOSE
        elif position['side'] == 'SELL' and rsi < 30:
            return IntradaySignal.CLOSE
        
        return IntradaySignal.HOLD
    
    def _calculate_intraday_entry_levels(self, df: pd.DataFrame,
                                       indicators: Dict,
                                       signal: IntradaySignal) -> Dict:
        """Calculate entry levels for intraday trading"""
        current_price = df['close'].iloc[-1]
        atr = indicators.get('atr', 0)
        
        if signal == IntradaySignal.BUY:
            entry = current_price
            stop_loss = current_price - (atr * 1.5)
            target = current_price + (atr * 1.5 * self.config.target_multiple)
            
        elif signal == IntradaySignal.SELL:
            entry = current_price
            stop_loss = current_price + (atr * 1.5)
            target = current_price - (atr * 1.5 * self.config.target_multiple)
            
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
    
    def create_intraday_trade(self, analysis: Dict, capital: float) -> Optional[Dict]:
        """Create an intraday trading plan"""
        if analysis['signal'] in [IntradaySignal.HOLD, IntradaySignal.CLOSE]:
            return None
        
        entry_levels = analysis['entry_levels']
        
        if not entry_levels['stop_loss'] or not entry_levels['target']:
            return None
        
        # Calculate position size using 1% risk rule (more aggressive for intraday)
        stop_loss_distance = abs(entry_levels['entry'] - entry_levels['stop_loss'])
        risk_per_trade = capital * 0.01  # 1% risk for intraday
        position_size = risk_per_trade / stop_loss_distance
        
        # Cap position size
        position_size = min(position_size, self.config.max_position_size)
        
        trade = {
            'trade_id': f"intraday_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
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
            'opening_range': analysis['opening_range'],
            'trades_today': analysis['trades_today'] + 1
        }
        
        # Update daily stats
        self.daily_stats['trades_today'] += 1
        self.daily_stats['last_trade_time'] = datetime.utcnow()
        
        self.trade_history.append(trade)
        return trade
