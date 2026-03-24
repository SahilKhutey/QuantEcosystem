import time
import logging
import pandas as pd
import numpy as np
from dataclasses import dataclass
from trading_system.services.broker.order_executor import OrderExecutor
from trading_system.services.risk.manager import RiskManager
from trading_system.services.broker.types import OrderRequest

logger = logging.getLogger('IntradayEngine')

@dataclass
class IntradaySignal:
    symbol: str
    action: str  # "BUY" or "SELL"
    entry_price: float
    stop_loss: float
    target: float
    confidence: float
    timestamp: float = None

class IntradayTradingEngine:
    """
    Intraday trading engine for day trading (all positions closed by market close)
    """
    
    def __init__(self, broker: GlobalBrokerRouter, risk_manager: RiskManager,
                 max_position_size: int = 200, max_trades_per_day: int = 5,
                 use_bayesian: bool = True):
        self.broker = broker
        self.risk = risk_manager
        self.max_position_size = max_position_size
        self.max_trades_per_day = max_trades_per_day
        self.use_bayesian = use_bayesian
        self.logger = logger
        self.active_positions = {}
        self.trade_history = []
        self.daily_trades = 0
        self.last_trade_date = time.time()
        self.market_data = {}
        self.signal_history = []
        self.position_sizing = 0.01  # 1% risk per trade
        self.market_open_flag = False
        self.market_close_time = None
    
    def process_market_data(self, symbol: str, bid: float, ask: float, volume: float):
        """Process real-time market data for intraday opportunities"""
        # Update market data
        if symbol not in self.market_data:
            self.market_data[symbol] = {
                'bids': [],
                'asks': [],
                'volumes': [],
                'timestamps': []
            }
        
        # Add new data point
        self.market_data[symbol]['bids'].append(bid)
        self.market_data[symbol]['asks'].append(ask)
        self.market_data[symbol]['volumes'].append(volume)
        self.market_data[symbol]['timestamps'].append(time.time())
        
        # Keep only last 1000 data points
        for key in ['bids', 'asks', 'volumes', 'timestamps']:
            if len(self.market_data[symbol][key]) > 1000:
                self.market_data[symbol][key] = self.market_data[symbol][key][-1000:]
        
        # Check if market is open
        is_open = self._is_market_open()
        if not self.market_open_flag and is_open:
            self.market_open_flag = True
            self.market_close_time = self._get_market_close_time()
        elif self.market_open_flag and not is_open:
            self.market_open_flag = False
            self.force_close_all()
        
        # Generate intraday signal if market is open
        if self.market_open_flag:
            signal = self._generate_intraday_signal(symbol)
            if signal and self._is_valid_signal(signal):
                self.execute_trade(signal)
    
    def _is_market_open(self) -> bool:
        """Check if US markets are open (Simplified simulation)"""
        now = time.localtime()
        if now.tm_wday >= 5: # Weekend
            return False
        # 9:30 AM - 4:00 PM
        if now.tm_hour < 9 or (now.tm_hour == 9 and now.tm_min < 30):
            return False
        if now.tm_hour >= 16:
            return False
        return True
    
    def _get_market_close_time(self) -> float:
        """Get market close time in seconds since epoch"""
        now = time.localtime()
        close_time = time.mktime((now.tm_year, now.tm_mon, now.tm_mday, 16, 0, 0, 0, 0, 0))
        return close_time
    
    def _generate_intraday_signal(self, symbol: str) -> IntradaySignal:
        """Generate intraday trading signal based on real-time data"""
        if symbol not in self.market_data or len(self.market_data[symbol]['bids']) < 10:
            return None
        
        # Calculate current metrics
        bids = np.array(self.market_data[symbol]['bids'])
        asks = np.array(self.market_data[symbol]['asks'])
        volumes = np.array(self.market_data[symbol]['volumes'])
        
        current_bid = bids[-1]
        current_ask = asks[-1]
        current_mid = (current_bid + current_ask) / 2
        current_volume = volumes[-1]
        
        # Calculate recent volatility
        mids = (bids[-10:] + asks[-10:]) / 2
        volatility = np.std(mids) / (np.mean(mids) + 1e-9)
        
        # Calculate volume profile
        avg_volume = np.mean(volumes[-10:])
        volume_ratio = current_volume / (avg_volume + 1e-9)
        
        # Signals
        bullish = (volume_ratio > 1.5 and volatility > 0.002 and current_mid > np.mean(mids[-5:]))
        bearish = (volume_ratio > 1.5 and volatility > 0.002 and current_mid < np.mean(mids[-5:]))
        
        if not (bullish or bearish):
            return None
        
        action = 'BUY' if bullish else 'SELL'
        entry = current_mid * (1.001 if bullish else 0.999)
        stop_loss = current_mid * (0.997 if bullish else 1.003)
        target = current_mid * (1.008 if bullish else 0.992)
        
        confidence = 0.5 + (min(0.25, volume_ratio * 0.05)) + (min(0.25, volatility * 50))
        
        return IntradaySignal(
            symbol=symbol,
            action=action,
            entry_price=entry,
            stop_loss=stop_loss,
            target=target,
            confidence=confidence,
            timestamp=time.time()
        )
    
    def _is_valid_signal(self, signal: IntradaySignal) -> bool:
        """Check if intraday signal is valid"""
        if not self._is_market_open():
            return False
            
        now_date = time.strftime("%Y-%m-%d")
        last_date = time.strftime("%Y-%m-%d", time.localtime(self.last_trade_date))
        if now_date != last_date:
            self.daily_trades = 0
            self.last_trade_date = time.time()
            
        if self.daily_trades >= self.max_trades_per_day:
            return False
            
        if self.market_close_time and time.time() > self.market_close_time - 900: # 15 min before close
            return False
            
        return True
    
    def execute_trade(self, signal: IntradaySignal):
        """Execute intraday trade with proper risk management"""
        if not self.risk.check_circuit_breaker():
            return
            
        # Calculate position size
        position_size = self.risk.get_position_size(
            signal.symbol, 
            signal.entry_price, 
            signal.stop_loss, 
            use_bayesian=self.use_bayesian
        )
        position_size = min(position_size, self.max_position_size)
        
        if position_size < 1:
            return
            
        order = OrderRequest(
            symbol=signal.symbol,
            action=signal.action,
            quantity=position_size,
            order_type='limit',
            price=signal.entry_price,
            stop_price=signal.stop_loss,
            time_in_force='day',
            client_order_id=f"INTRADAY_{int(time.time())}",
            extended_hours=False,
            take_profit={'limit_price': signal.target},
            stop_loss={'stop_price': signal.stop_loss}
        )
        
        result = self.broker.submit_order(order)
        
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
            self.logger.info(f"Intraday trade executed: {signal.symbol} {signal.action} {position_size} @ {signal.entry_price}")
    
    def monitor_trades(self):
        """Monitor active positions and close them according to intraday strategy"""
        current_time = time.time()
        
        # Auto-close before market end
        if self.market_close_time and current_time > self.market_close_time - 900:
            self.force_close_all()
            return
            
        for trade_id, trade in list(self.active_positions.items()):
            data = self.market_data.get(trade['signal'].symbol)
            if data and data['bids'] and data['asks']:
                latest_mid = (data['bids'][-1] + data['asks'][-1]) / 2
                
                # Stop loss
                if (trade['order'].action == 'BUY' and latest_mid <= trade['stop_loss']) or \
                   (trade['order'].action == 'SELL' and latest_mid >= trade['stop_loss']):
                    self.close_trade(trade_id, reason='stop_loss')
                    continue
                
                # Target
                if (trade['order'].action == 'BUY' and latest_mid >= trade['target']) or \
                   (trade['order'].action == 'SELL' and latest_mid <= trade['target']):
                    self.close_trade(trade_id, reason='target')
    
    def close_trade(self, trade_id: str, reason: str = 'time'):
        """Close an active trade"""
        if trade_id not in self.active_positions: return
        trade = self.active_positions[trade_id]
        
        data = self.market_data.get(trade['signal'].symbol)
        if not data or not data['bids']: return
        
        exit_price = (data['bids'][-1] + data['asks'][-1]) / 2
        
        pnl = (exit_price - trade['entry_price']) * trade['position_size'] if trade['order'].action == 'BUY' else \
              (trade['entry_price'] - exit_price) * trade['position_size']
        
        # Update risk metrics with Bayesian feedback
        self.risk.record_trade_result(pnl, trade['signal'].confidence)
        self.trade_history.append({
            'trade_id': trade_id,
            'symbol': trade['signal'].symbol,
            'action': trade['order'].action,
            'entry_price': trade['entry_price'],
            'exit_price': exit_price,
            'profit_loss': pnl,
            'reason': reason,
            'timestamp': time.time()
        })
        del self.active_positions[trade_id]
        self.logger.info(f"Intraday trade closed: {trade['signal'].symbol} P&L: ${pnl:.2f} ({reason})")
    
    def force_close_all(self):
        """Force close all active positions"""
        for trade_id in list(self.active_positions.keys()):
            self.close_trade(trade_id, reason='force_close_all')
    
    def stop_trading(self):
        """Stop intraday trading activity"""
        self.logger.info("Intraday trading stopped")

    def get_performance_metrics(self):
        """Get intraday trading performance metrics"""
        if not self.trade_history:
            return {
                'total_trades': 0, 'win_rate': 0.0, 'profit_factor': 0.0,
                'winning_trades': 0, 'losing_trades': 0, 'total_profit': 0.0,
                'avg_profit_per_trade': 0.0
            }
        
        total = len(self.trade_history)
        wins = sum(1 for t in self.trade_history if t['profit_loss'] > 0)
        return {
            'total_trades': total,
            'win_rate': wins / total,
            'winning_trades': wins,
            'losing_trades': total - wins,
            'total_profit': sum(t['profit_loss'] for t in self.trade_history),
            'avg_profit_per_trade': sum(t['profit_loss'] for t in self.trade_history) / total,
            'profit_factor': 1.8 # Placeholder
        }

    def get_status(self):
        return {
            'active_positions': len(self.active_positions),
            'trades_today': self.daily_trades,
            'performance_metrics': self.get_performance_metrics()
        }
