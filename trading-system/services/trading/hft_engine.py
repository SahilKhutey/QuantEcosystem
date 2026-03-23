import time
import logging
import numpy as np
import pandas as pd
from dataclasses import dataclass
from services.broker.broker_interface import GlobalBrokerRouter
from services.risk.manager import RiskManager

logger = logging.getLogger('HFTScalper')

@dataclass
class HFTSignal:
    symbol: str
    action: str  # "BUY" or "SELL"
    price: float
    spread: float
    confidence: float
    volume: float
    timestamp: float = None

class HFTScalpingEngine:
    """
    High-frequency scalping engine for executing rapid trades
    """
    
    def __init__(self, broker: GlobalBrokerRouter, risk_manager: RiskManager, 
                 min_spread: float = 0.05, max_position_size: int = 100, 
                 max_trades_per_minute: int = 20):
        self.broker = broker
        self.risk = risk_manager
        self.min_spread = min_spread
        self.max_position_size = max_position_size
        self.max_trades_per_minute = max_trades_per_minute
        self.logger = logger
        self.active_trades = {}
        self.trade_history = []
        self.last_trade_time = time.time()
        self.trades_this_minute = 0
        self.order_book = {}
    
    def process_market_data(self, symbol: str, bid: float, ask: float, volume: float):
        """Process real-time market data for scalping opportunities"""
        # Update order book
        self.order_book[symbol] = {
            'bid': bid,
            'ask': ask,
            'spread': ask - bid,
            'midpoint': (bid + ask) / 2,
            'volume': volume,
            'timestamp': time.time()
        }
        
        # Generate scalping signal if conditions are met
        if self._is_scalping_opportunity(symbol):
            signal = self._generate_scalping_signal(symbol)
            self.execute_trade(signal)
    
    def _is_scalping_opportunity(self, symbol: str) -> bool:
        """Check if scalping opportunity exists"""
        if symbol not in self.order_book:
            return False
        
        book = self.order_book[symbol]
        
        # Check spread condition
        if book['spread'] < self.min_spread:
            return False
        
        # Check volume condition
        if book['volume'] < 100:
            return False
        
        # Check trading frequency
        if self.trades_this_minute >= self.max_trades_per_minute:
            return False
        
        # Check market hours (for US markets)
        now = time.time()
        current_hour = time.localtime(now).tm_hour
        current_minute = time.localtime(now).tm_min
        
        # Trading hours: 9:30 AM - 4:00 PM ET
        if current_hour < 9 or (current_hour == 9 and current_minute < 30):
            return False
        if current_hour > 16 or (current_hour == 16 and current_minute > 0):
            return False
        
        return True
    
    def _generate_scalping_signal(self, symbol: str) -> HFTSignal:
        """Generate scalping signal based on market conditions"""
        book = self.order_book[symbol]
        
        # Calculate confidence based on spread and volume
        confidence = min(1.0, (book['spread'] / 0.5) * (book['volume'] / 1000))
        
        return HFTSignal(
            symbol=symbol,
            action='BUY' if book['spread'] > 0.1 else 'SELL',
            price=book['midpoint'],
            spread=book['spread'],
            confidence=confidence,
            volume=book['volume']
        )
    
    def execute_trade(self, signal: HFTSignal):
        """Execute high-frequency trade with proper risk management"""
        # Check circuit breaker
        if not self.risk.check_circuit_breaker():
            self.logger.warning("Circuit breaker active - no new trades allowed")
            return
        
        # Calculate position size (small for HFT)
        position_size = min(
            self.max_position_size,
            int(self.risk.current_capital * 0.005 / signal.price)  # 0.5% of capital
        )
        
        if position_size < 1:
            return
        
        # Create order request
        from services.broker.broker_interface import OrderRequest
        order = OrderRequest(
            symbol=signal.symbol,
            action=signal.action,
            quantity=position_size,
            order_type='limit',
            price=signal.price,
            stop_price=signal.price * (0.995 if signal.action == 'BUY' else 1.005),
            time_in_force='day',
            client_order_id=f"HFT_{int(time.time())}",
            extended_hours=False
        )
        
        # Submit order
        result = self.broker.submit_order(order)
        
        # Track trade
        if result.get('status') in ['new', 'pending_new', 'accepted', 'pending']:
            trade_id = result.get('order_id', f"TRADE_{int(time.time())}")
            self.active_trades[trade_id] = {
                'signal': signal,
                'order': order,
                'status': 'open',
                'entry_time': time.time(),
                'position_size': position_size,
                'entry_price': signal.price,
                'stop_price': order.stop_price
            }
            self.trades_this_minute += 1
            self.logger.info(f"Scalping trade executed: {signal.symbol} {signal.action} {position_size} @ {signal.price}")
        
        # Update metrics
        self._update_metrics(signal, result)
    
    def monitor_trades(self):
        """Monitor active trades and close them according to scalping strategy"""
        current_time = time.time()
        
        for trade_id, trade in list(self.active_trades.items()):
            # Calculate elapsed time (in seconds)
            elapsed = current_time - trade['entry_time']
            
            # Close trade if conditions are met
            if elapsed >= 15:  # Close after 15 seconds (scalping)
                self.close_trade(trade_id)
            
            # Check stop loss
            current_data = self.order_book.get(trade['signal'].symbol)
            if current_data:
                if (trade['order'].action == 'BUY' and current_data['bid'] <= trade['stop_price']) or \
                   (trade['order'].action == 'SELL' and current_data['ask'] >= trade['stop_price']):
                    self.close_trade(trade_id, reason='stop_loss')
    
    def close_trade(self, trade_id: str, reason: str = 'time'):
        """Close an active trade"""
        if trade_id not in self.active_trades:
            return
        
        trade = self.active_trades[trade_id]
        
        # Get current market data
        current_data = self.order_book.get(trade['signal'].symbol)
        if not current_data:
            return
        
        # Calculate exit price
        exit_price = current_data['bid'] if trade['order'].action == 'BUY' else current_data['ask']
        
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
            'spread': trade['signal'].spread,
            'confidence': trade['signal'].confidence,
            'volume': trade['signal'].volume
        })
        
        # Remove from active trades
        del self.active_trades[trade_id]
        
        # Log trade completion
        self.logger.info(f"Scalping trade closed: {trade['signal'].symbol} P&L: ${profit_loss:.2f} ({reason})")
    
    def _update_metrics(self, signal: HFTSignal, result: dict):
        """Update scalping engine metrics"""
        # Update trade frequency metrics
        current_time = time.time()
        minute_ago = current_time - 60
        
        # Reset trade count if minute has passed
        if self.last_trade_time < minute_ago:
            self.trades_this_minute = 0
            self.last_trade_time = current_time
        
        # Update trade count
        self.trades_this_minute += 1
    
    def stop_trading(self):
        """Stop scaling activity"""
        self.logger.info("Scaling activity stopped")

    def get_performance_metrics(self):
        """Get scalping performance metrics"""
        if not self.trade_history:
            return {
                'total_trades': 0, 'win_rate': 0.0, 'profit_factor': 0.0,
                'winning_trades': 0, 'losing_trades': 0, 'total_profit': 0.0,
                'avg_profit_per_trade': 0.0
            }
        
        total = len(self.trade_history)
        wins = sum(1 for t in self.trade_history if t['profit_loss'] > 0)
        total_p = sum(t['profit_loss'] for t in self.trade_history)
        return {
            'total_trades': total,
            'win_rate': wins / total,
            'winning_trades': wins,
            'losing_trades': total - wins,
            'total_profit': total_p,
            'avg_profit_per_trade': total_p / total,
            'profit_factor': 1.5 # Placeholder
        }
    
    def reset_minute(self):
        """Reset trade count for new minute"""
        self.trades_this_minute = 0
        self.last_trade_time = time.time()
    
    def get_active_trades(self):
        """Get currently active trades"""
        return list(self.active_trades.values())
    
    def get_trade_history(self):
        """Get trade history with detailed metrics"""
        return self.trade_history
    
    def get_order_book(self):
        """Get current order book data for monitoring"""
        return {k: v for k, v in self.order_book.items()}
    
    def get_status(self):
        """Get current scalping engine status"""
        return {
            'active_trades': len(self.active_trades),
            'trades_this_minute': self.trades_this_minute,
            'max_trades_per_minute': self.max_trades_per_minute,
            'min_spread': self.min_spread,
            'max_position_size': self.max_position_size,
            'performance_metrics': self.get_performance_metrics(),
            'last_updated': time.time()
        }
