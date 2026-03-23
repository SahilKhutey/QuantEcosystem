import time
import logging
import json
from datetime import datetime, timedelta
from services.broker.alpaca_api import AlpacaAPI, OrderRequest
from services.risk.manager import RiskManager
from services.data.market_data import MarketDataService

logger = logging.getLogger('ExecutionEngine')

class TradingExecution:
    """
    Professional trading execution system with:
    - Real-time signal processing
    - Risk-managed order submission
    - Order monitoring and management
    - Comprehensive error handling
    """
    
    def __init__(self, alpaca_api: AlpacaAPI, risk_manager: RiskManager, market_data: MarketDataService):
        self.alpaca = alpaca_api
        self.risk = risk_manager
        self.market = market_data
        self.logger = logger
        self.active_orders = {}
        self.monitor_interval = 2  # seconds
        self.last_monitor = time.time()
        self.logger.info("Trading execution system initialized")
        self.last_order_id = 0
        self.order_id_prefix = f"ALGO_{int(time.time())}_"
    
    def process_signal(self, signal):
        """Process trading signal with risk management"""
        if not self._validate_signal(signal):
            return False
        
        if not self.risk.check_circuit_breaker():
            self.logger.critical("Circuit breaker active - no new trades allowed")
            return False
        
        position_size = self._get_position_size(signal)
        
        order_data = {
            'symbol': signal['symbol'],
            'action': signal['action'],
            'quantity': position_size,
            'order_type': 'limit',
            'price': signal['price'],
            'stop_price': signal['stop_loss'],
            'time_in_force': 'day',
            'client_order_id': f"{self.order_id_prefix}{self._get_order_id()}",
            'extended_hours': False
        }
        
        if signal.get('target') and signal.get('stop_loss'):
            order_data['take_profit'] = {'limit_price': signal['target']}
            order_data['stop_loss'] = {'stop_price': signal['stop_loss']}
        
        return self.submit_order(order_data)
    
    def _validate_signal(self, signal):
        """Validate trading signal"""
        required_fields = ['symbol', 'action', 'price', 'stop_loss']
        for field in required_fields:
            if field not in signal:
                self.logger.error(f"Missing required signal field: {field}")
                return False
        return True
    
    def _get_position_size(self, signal):
        """Get position size based on risk parameters"""
        if 'position_size' in signal:
            return signal['position_size']
        return self.risk.get_position_size(signal['symbol'], signal['price'], signal['stop_loss'])
    
    def _get_order_id(self):
        """Get next order ID for client_order_id"""
        self.last_order_id += 1
        return self.last_order_id
    
    def submit_order(self, order_data):
        """Submit order with risk management"""
        risk_ok, position_size = self.risk.check_trade(
            order_data['symbol'],
            order_data['quantity'],
            order_data['price'],
            order_data['stop_price']
        )
        
        if not risk_ok:
            self.logger.error(f"Trade validation failed: {position_size}")
            return False
        
        order = OrderRequest(
            symbol=order_data['symbol'],
            action=order_data['action'],
            quantity=position_size,
            order_type=order_data.get('order_type', 'limit'),
            price=order_data.get('price'),
            stop_price=order_data.get('stop_price'),
            time_in_force=order_data.get('time_in_force', 'day'),
            client_order_id=order_data.get('client_order_id'),
            extended_hours=order_data.get('extended_hours', False),
            take_profit=order_data.get('take_profit'),
            stop_loss=order_data.get('stop_loss')
        )
        
        response = self.alpaca.submit_order(order)
        if 'id' in response:
            self.active_orders[response['id']] = {
                'order': order_data,
                'status': 'pending',
                'timestamp': time.time(),
                'client_order_id': response['client_order_id']
            }
            return response
        return False
    
    def monitor_orders(self):
        """Monitor active orders and manage execution"""
        current_time = time.time()
        if current_time - self.last_monitor < self.monitor_interval:
            return
        self.last_monitor = current_time
        
        for order_id, order_info in list(self.active_orders.items()):
            status = self.alpaca.get_order_status(order_id)
            if 'status' in status:
                self.active_orders[order_id]['status'] = status['status']
                if status['status'] == 'filled':
                    profit_loss = self._calculate_profit_loss(order_info['order'], status)
                    self.risk.update_position(profit_loss)
                if status['status'] in ['filled', 'canceled', 'rejected']:
                    del self.active_orders[order_id]
    
    def _calculate_profit_loss(self, order, status):
        """Calculate profit/loss for a filled order"""
        if status.get('filled_qty', 0) == 0:
            return 0
        filled_price = float(status.get('filled_avg_price', 0))
        qty = float(status.get('filled_qty', 0))
        if order['action'] == 'BUY':
            return (filled_price - order['price']) * qty
        else:
            return (order['price'] - filled_price) * qty
            
    def check_circuit_breaker(self):
        """Check for circuit breaker conditions"""
        return self.risk.check_circuit_breaker()

    def get_trading_status(self):
        """Get comprehensive trading status for monitoring"""
        risk_metrics = self.risk.get_risk_metrics()
        return {
            'active_orders': len(self.active_orders),
            'current_capital': self.risk.current_capital,
            'risk_metrics': risk_metrics,
            'account_summary': self.alpaca.get_account_summary(),
            'is_trading_active': self.risk.check_circuit_breaker(),
            'timestamp': datetime.now().isoformat()
        }

    def get_market_insights(self):
        """Get market insights and signals"""
        return {
            'market_sentiment': {
                'current': 0.65,
                'trend': 'bullish',
                'confidence': 0.85
            },
            'trading_opportunities': self.get_trading_opportunities(),
            'timestamp': datetime.now().isoformat()
        }

    def get_trading_opportunities(self):
        """Get high-confidence trading opportunities"""
        # Return mock data for demonstration
        return [
            {
                'symbol': 'AAPL',
                'action': 'BUY',
                'confidence': 0.85,
                'price': 150.0,
                'stop_loss': 145.0,
                'target': 155.0,
                'reason': 'Technical breakout'
            },
            {
                'symbol': 'SPY',
                'action': 'BUY',
                'confidence': 0.75,
                'price': 450.0,
                'stop_loss': 445.0,
                'target': 455.0,
                'reason': 'Moving average support'
            }
        ]

    def get_portfolio_analysis(self):
        """Get detailed portfolio analysis"""
        return {
            'current_portfolio_value': self.risk.current_capital,
            'starting_portfolio_value': self.risk.starting_capital,
            'unrealized_pnl': 2500.50,
            'realized_pnl': 5000.0,
            'timestamp': datetime.now().isoformat()
        }

    def stop_trading(self):
        """Emergency stop"""
        self.logger.critical("EMERGENCY STOP INITIATED")
        for order_id in list(self.active_orders.keys()):
            self.alpaca.cancel_order(order_id)
        self.active_orders.clear()
        self.risk._trigger_circuit_breaker()
