import time
import logging
import pandas as pd
import numpy as np
from dataclasses import dataclass
from services.broker.broker_interface import GlobalBrokerRouter, OrderRequest
from services.risk.manager import RiskManager

logger = logging.getLogger('SwingEngine')

@dataclass
class SwingSignal:
    symbol: str
    action: str  # "BUY" or "SELL"
    entry_price: float
    stop_loss: float
    target: float
    confidence: float
    risk_reward: float
    timestamp: float = None

class SwingTradingEngine:
    """
    Swing trading engine for medium-term trading (days to weeks)
    """
    
    def __init__(self, broker: GlobalBrokerRouter, risk_manager: RiskManager,
                 min_risk_reward: float = 1.5, max_position_size: int = 500,
                 max_trades_per_day: int = 3):
        self.broker = broker
        self.risk = risk_manager
        self.min_risk_reward = min_risk_reward
        self.max_position_size = max_position_size
        self.max_trades_per_day = max_trades_per_day
        self.logger = logger
        self.active_positions = {}
        self.trade_history = []
        self.daily_trades = 0
        self.last_trade_date = time.time()
        self.market_data = {}
        self.signal_history = []
        self.position_sizing = 0.02  # 2% risk per trade
    
    def process_daily_data(self, symbol: str, data: pd.DataFrame):
        """Process daily market data for swing trading opportunities"""
        # Update market data
        self.market_data[symbol] = data
        
        # Generate swing signal if conditions are met
        signal = self._generate_swing_signal(symbol, data)
        if signal and self._is_valid_signal(signal):
            self.execute_trade(signal)
    
    def _generate_swing_signal(self, symbol: str, data: pd.DataFrame) -> SwingSignal:
        """Generate swing trading signal based on technical analysis"""
        if len(data) < 50:  # Need sufficient data
            return None
        
        # Calculate technical indicators
        df = data.copy()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['sma_200'] = df['close'].rolling(window=200).mean()
        df['rsi'] = self._calculate_rsi(df['close'], 14)
        df['macd'] = self._calculate_macd(df['close'])
        
        latest = df.iloc[-1]
        
        # Bullish signal conditions
        bullish = (
            latest['close'] > latest['sma_50'] > latest['sma_200'] and
            latest['rsi'] > 30 and
            latest['macd'] > 0
        )
        
        # Bearish signal conditions
        bearish = (
            latest['close'] < latest['sma_50'] < latest['sma_200'] and
            latest['rsi'] < 70 and
            latest['macd'] < 0
        )
        
        if not (bullish or bearish):
            return None
        
        # Calculate entry, stop loss, and target
        if bullish:
            entry = latest['close']
            stop_loss = latest['close'] * 0.98  # 2% below entry
            target = latest['close'] * 1.05  # 5% above entry
            action = 'BUY'
        else:
            entry = latest['close']
            stop_loss = latest['close'] * 1.02  # 2% above entry
            target = latest['close'] * 0.95  # 5% below entry
            action = 'SELL'
        
        # Calculate risk-reward ratio
        risk = abs(entry - stop_loss)
        reward = abs(target - entry)
        risk_reward = reward / risk if risk > 0 else float('inf')
        
        # Calculate confidence (simplified)
        confidence = min(1.0, 0.6 + (risk_reward / 3.0))
        
        return SwingSignal(
            symbol=symbol,
            action=action,
            entry_price=entry,
            stop_loss=stop_loss,
            target=target,
            confidence=confidence,
            risk_reward=risk_reward,
            timestamp=time.time()
        )
    
    def _is_valid_signal(self, signal: SwingSignal) -> bool:
        """Check if swing signal is valid"""
        # Check risk-reward ratio
        if signal.risk_reward < self.min_risk_reward:
            return False
        
        # Check trading frequency
        now_date = time.strftime("%Y-%m-%d")
        last_date = time.strftime("%Y-%m-%d", time.localtime(self.last_trade_date))
        if now_date != last_date:
            self.daily_trades = 0
            self.last_trade_date = time.time()
        
        if self.daily_trades >= self.max_trades_per_day:
            return False
        
        # Check market hours (simulation/mock hours check)
        # Note: In real scenarios, this would be more granular
        return True
    
    def execute_trade(self, signal: SwingSignal):
        """Execute swing trade with proper risk management"""
        # Check circuit breaker
        if not self.risk.check_circuit_breaker():
            self.logger.warning("Circuit breaker active - no new trades allowed")
            return
        
        # Calculate position size (using 2% risk rule)
        risk_per_share = abs(signal.entry_price - signal.stop_loss)
        if risk_per_share == 0:
            return
            
        position_size = int((self.risk.current_capital * self.position_sizing) / risk_per_share)
        position_size = min(position_size, self.max_position_size)
        
        if position_size < 1:
            return
        
        # Create order request object
        order = OrderRequest(
            symbol=signal.symbol,
            action=signal.action,
            quantity=position_size,
            order_type='limit',
            price=signal.entry_price,
            stop_price=signal.stop_loss,
            time_in_force='day',
            client_order_id=f"SWING_{int(time.time())}",
            extended_hours=False,
            take_profit={'limit_price': signal.target},
            stop_loss={'stop_price': signal.stop_loss}
        )
        
        # Submit order
        result = self.broker.submit_order(order)
        
        # Track trade
        if result.get('status') in ['new', 'pending_new', 'accepted', 'pending']:
            trade_id = result.get('order_id', f"TRADE_{int(time.time())}")
            self.active_positions[trade_id] = {
                'signal': signal,
                'order': order,
                'status': 'open',
                'entry_time': time.time(),
                'position_size': position_size,
                'entry_price': signal.entry_price,
                'stop_loss': signal.stop_loss,
                'target': signal.target
            }
            self.daily_trades += 1
            self.logger.info(f"Swing trade executed: {signal.symbol} {signal.action} {position_size} @ {signal.entry_price}")
            
            # Add to signal history
            self.signal_history.append({
                'timestamp': time.time(),
                'symbol': signal.symbol,
                'action': signal.action,
                'entry_price': signal.entry_price,
                'stop_loss': signal.stop_loss,
                'target': signal.target,
                'confidence': signal.confidence,
                'risk_reward': signal.risk_reward
            })
    
    def monitor_trades(self):
        """Monitor active positions and close them according to swing strategy"""
        for trade_id, trade in list(self.active_positions.items()):
            # Check for data
            current_data = self.market_data.get(trade['signal'].symbol)
            if current_data is not None and not current_data.empty:
                latest = current_data.iloc[-1]
                
                # Check stop loss
                if (trade['order'].action == 'BUY' and latest['low'] <= trade['stop_loss']) or \
                   (trade['order'].action == 'SELL' and latest['high'] >= trade['stop_loss']):
                    self.close_trade(trade_id, reason='stop_loss')
                    continue
                
                # Check target
                if (trade['order'].action == 'BUY' and latest['high'] >= trade['target']) or \
                   (trade['order'].action == 'SELL' and latest['low'] <= trade['target']):
                    self.close_trade(trade_id, reason='target')
    
    def close_trade(self, trade_id: str, reason: str = 'time'):
        """Close an active trade"""
        if trade_id not in self.active_positions:
            return
        
        trade = self.active_positions[trade_id]
        
        # Get current market data
        current_data = self.market_data.get(trade['signal'].symbol)
        if not current_data or current_data.empty:
            return
        
        # Calculate exit price
        latest = current_data.iloc[-1]
        exit_price = latest['close']
        
        # Calculate profit/loss
        if trade['order'].action == 'BUY':
            profit_loss = (exit_price - trade['entry_price']) * trade['position_size']
        else:
            profit_loss = (trade['entry_price'] - exit_price) * trade['position_size']
        
        # Update risk metrics
        self.risk.update_position(profit_loss)
        
        # Record trade
        self.trade_history.append({
            'trade_id': trade_id,
            'symbol': trade['signal'].symbol,
            'action': trade['order'].action,
            'entry_price': trade['entry_price'],
            'exit_price': exit_price,
            'position_size': trade['position_size'],
            'entry_time': trade['entry_time'],
            'exit_time': time.time(),
            'profit_loss': profit_loss,
            'reason': reason,
            'stop_loss': trade['stop_loss'],
            'target': trade['target'],
            'confidence': trade['signal'].confidence,
            'risk_reward': trade['signal'].risk_reward
        })
        
        # Remove from active positions
        del self.active_positions[trade_id]
        
        # Log trade completion
        self.logger.info(f"Swing trade closed: {trade['signal'].symbol} P&L: ${profit_loss:.2f} ({reason})")
    
    def _calculate_rsi(self, prices, window=14):
        """Calculate RSI (Relative Strength Index)"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / (loss + 1e-9)  # Avoid division by zero
        return 100 - (100 / (1 + rs))
    
    def _calculate_macd(self, prices, fast=12, slow=26, signal=9):
        """Calculate MACD (Moving Average Convergence Divergence)"""
        ema12 = prices.ewm(span=fast, adjust=False).mean()
        ema26 = prices.ewm(span=slow, adjust=False).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        return macd_line - signal_line  # Histogram
    
    def get_performance_metrics(self):
        """Get swing trading performance metrics"""
        if not self.trade_history:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'avg_profit_per_trade': 0,
                'winning_trades': 0,
                'losing_trades': 0
            }
        
        # Calculate metrics
        total_trades = len(self.trade_history)
        winning_trades = sum(1 for trade in self.trade_history if trade['profit_loss'] > 0)
        losing_trades = total_trades - winning_trades
        
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        total_profit = sum(trade['profit_loss'] for trade in self.trade_history)
        total_wins = sum(trade['profit_loss'] for trade in self.trade_history if trade['profit_loss'] > 0)
        total_losses = abs(sum(trade['profit_loss'] for trade in self.trade_history if trade['profit_loss'] < 0))
        
        profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
        avg_profit = total_profit / total_trades if total_trades > 0 else 0
        
        return {
            'total_trades': total_trades,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'avg_profit_per_trade': avg_profit,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades
        }
    
    def get_status(self):
        """Get current swing trading engine status"""
        return {
            'active_positions': len(self.active_positions),
            'trades_today': self.daily_trades,
            'max_trades_per_day': self.max_trades_per_day,
            'min_risk_reward': self.min_risk_reward,
            'max_position_size': self.max_position_size,
            'performance_metrics': self.get_performance_metrics(),
            'last_updated': time.time()
        }
