import asyncio
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import pandas as pd

class ScalpingSignal(Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

@dataclass
class ScalpingConfig:
    symbol: str
    max_position_size: float = 1000  # Max shares per trade
    target_profit_pct: float = 0.003  # 0.3%
    stop_loss_pct: float = 0.002  # 0.2%
    max_trades_per_hour: int = 50
    min_spread_pct: float = 0.0005  # Minimum spread to trade
    volume_threshold: float = 1.5  # Volume ratio threshold

class ScalpingStrategy:
    def __init__(self, config: ScalpingConfig):
        self.config = config
        self.positions = {}
        self.trade_history = []
        self.order_book_snapshot = None
        self.tick_buffer = []
        self.max_buffer_size = 1000
        
    async def process_tick(self, tick_data: Dict) -> Optional[ScalpingSignal]:
        """Process tick data for scalping signals"""
        # Add to buffer
        self.tick_buffer.append(tick_data)
        if len(self.tick_buffer) > self.max_buffer_size:
            self.tick_buffer.pop(0)
        
        # Analyze order book imbalance
        order_book_signal = await self._analyze_order_book_imbalance(tick_data)
        
        # Analyze volume spikes
        volume_signal = self._analyze_volume_spike(tick_data)
        
        # Analyze VWAP deviation
        vwap_signal = self._analyze_vwap_deviation()
        
        # Combine signals
        final_signal = self._combine_signals(order_book_signal, volume_signal, vwap_signal)
        
        # Apply risk checks
        if final_signal != ScalpingSignal.HOLD:
            if not await self._risk_checks_passed(tick_data):
                return ScalpingSignal.HOLD
        
        return final_signal
    
    async def _analyze_order_book_imbalance(self, tick_data: Dict) -> ScalpingSignal:
        """Analyze order book imbalance for scalping"""
        if 'order_book' not in tick_data:
            return ScalpingSignal.HOLD
        
        order_book = tick_data['order_book']
        bids = order_book.get('bids', [])
        asks = order_book.get('asks', [])
        
        if not bids or not asks:
            return ScalpingSignal.HOLD
        
        # Calculate total bid/ask volume
        total_bid_volume = sum(bid[1] for bid in bids[:5])  # Top 5 levels
        total_ask_volume = sum(ask[1] for ask in asks[:5])
        
        # Calculate imbalance ratio
        imbalance_ratio = total_bid_volume / total_ask_volume if total_ask_volume > 0 else 1
        
        # Generate signal
        if imbalance_ratio > self.config.volume_threshold:
            return ScalpingSignal.BUY
        elif imbalance_ratio < (1 / self.config.volume_threshold):
            return ScalpingSignal.SELL
        else:
            return ScalpingSignal.HOLD
    
    def _analyze_volume_spike(self, tick_data: Dict) -> ScalpingSignal:
        """Detect volume spikes for scalping"""
        if 'volume' not in tick_data or 'price' not in tick_data:
            return ScalpingSignal.HOLD
        
        current_volume = tick_data['volume']
        current_price = tick_data['price']
        
        # Calculate average volume from buffer
        if len(self.tick_buffer) >= 10:
            recent_volumes = [t.get('volume', 0) for t in self.tick_buffer[-10:]]
            avg_volume = np.mean(recent_volumes)
            
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
            # Check price direction with volume
            if len(self.tick_buffer) >= 2:
                prev_price = self.tick_buffer[-2].get('price', current_price)
                price_change = (current_price - prev_price) / prev_price
                
                if volume_ratio > 2.0 and price_change > 0:
                    return ScalpingSignal.BUY
                elif volume_ratio > 2.0 and price_change < 0:
                    return ScalpingSignal.SELL
        
        return ScalpingSignal.HOLD
    
    def _analyze_vwap_deviation(self) -> ScalpingSignal:
        """Analyze VWAP deviation for scalping"""
        if len(self.tick_buffer) < 20:
            return ScalpingSignal.HOLD
        
        # Calculate VWAP
        total_value = 0
        total_volume = 0
        
        for tick in self.tick_buffer[-20:]:
            price = tick.get('price', 0)
            volume = tick.get('volume', 0)
            total_value += price * volume
            total_volume += volume
        
        if total_volume == 0:
            return ScalpingSignal.HOLD
        
        vwap = total_value / total_volume
        current_price = self.tick_buffer[-1].get('price', 0)
        
        # Calculate deviation percentage
        deviation_pct = (current_price - vwap) / vwap
        
        # Generate signals based on deviation
        if deviation_pct < -0.001:  # Price 0.1% below VWAP
            return ScalpingSignal.BUY
        elif deviation_pct > 0.001:  # Price 0.1% above VWAP
            return ScalpingSignal.SELL
        
        return ScalpingSignal.HOLD
    
    def _combine_signals(self, *signals: ScalpingSignal) -> ScalpingSignal:
        """Combine multiple signals with voting logic"""
        signal_counts = {
            ScalpingSignal.BUY: 0,
            ScalpingSignal.SELL: 0,
            ScalpingSignal.HOLD: 0
        }
        
        for signal in signals:
            signal_counts[signal] += 1
        
        # Majority voting
        max_count = max(signal_counts.values())
        winning_signals = [s for s, count in signal_counts.items() if count == max_count]
        
        # Prefer HOLD on tie
        if len(winning_signals) > 1:
            return ScalpingSignal.HOLD
        
        return winning_signals[0]
    
    async def _risk_checks_passed(self, tick_data: Dict) -> bool:
        """Perform risk checks before trading"""
        # Check spread
        if 'bid' in tick_data and 'ask' in tick_data:
            spread = (tick_data['ask'] - tick_data['bid']) / tick_data['bid']
            if spread > self.config.min_spread_pct:
                return False
        
        # Check trade frequency
        recent_trades = [t for t in self.trade_history 
                        if datetime.utcnow() - t['timestamp'] < timedelta(hours=1)]
        if len(recent_trades) >= self.config.max_trades_per_hour:
            return False
        
        # Check market volatility (simplified)
        if len(self.tick_buffer) >= 10:
            prices = [t.get('price', 0) for t in self.tick_buffer[-10:]]
            volatility = np.std(prices) / np.mean(prices) if np.mean(prices) > 0 else 0
            if volatility > 0.01:  # 1% volatility threshold
                return False
        
        return True
    
    def calculate_position_size(self, capital: float, 
                              stop_loss_distance: float) -> float:
        """Calculate position size using 2% risk rule"""
        risk_per_trade = capital * 0.02
        position_size = risk_per_trade / abs(stop_loss_distance)
        
        # Cap at max position size
        return min(position_size, self.config.max_position_size)
    
    async def execute_scalp_trade(self, signal: ScalpingSignal,
                                current_price: float,
                                capital: float) -> Optional[Dict]:
        """Execute a scalping trade"""
        if signal == ScalpingSignal.HOLD:
            return None
        
        # Calculate stop loss and target
        if signal == ScalpingSignal.BUY:
            entry_price = current_price
            stop_loss = entry_price * (1 - self.config.stop_loss_pct)
            target = entry_price * (1 + self.config.target_profit_pct)
        else:  # SELL
            entry_price = current_price
            stop_loss = entry_price * (1 + self.config.stop_loss_pct)
            target = entry_price * (1 - self.config.target_profit_pct)
        
        # Calculate position size
        stop_loss_distance = abs(entry_price - stop_loss)
        position_size = self.calculate_position_size(capital, stop_loss_distance)
        
        # Create trade
        trade = {
            'trade_id': f"scalp_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}",
            'symbol': self.config.symbol,
            'signal': signal.value,
            'entry_price': entry_price,
            'position_size': position_size,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward_ratio': abs(target - entry_price) / abs(entry_price - stop_loss),
            'timestamp': datetime.utcnow(),
            'status': 'executed'
        }
        
        # Add to history
        self.trade_history.append(trade)
        
        return trade
