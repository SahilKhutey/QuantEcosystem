import time
import logging
import json
import numpy as np
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
from services.broker.alpaca_api import AlpacaAPI, OrderRequest
from services.risk.manager import RiskManager
from services.data.market_data import MarketDataService

logger = logging.getLogger('TradeEngine')

@dataclass
class TradeOrder:
    symbol: str
    action: str  # "BUY" or "SELL"
    quantity: int
    order_type: str = "market"
    price: float = None
    stop_price: float = None
    time_in_force: str = "day"
    client_order_id: str = None
    order_class: str = None
    extended_hours: bool = False
    limit_price: float = None
    take_profit: dict = None
    stop_loss: dict = None
    strategy: str = "Default"
    signal_id: str = None
    risk_score: float = 0.0
    confidence: float = 0.0
    entry_price: float = None
    exit_price: float = None
    status: str = "pending"
    timestamp: float = None
    filled_qty: int = 0
    avg_fill_price: float = None

class TradeEngine:
    """
    Production-grade trade execution engine with:
    - Intelligent order routing
    - Real-time market data integration
    - Advanced risk management
    - Circuit breaker system
    - Comprehensive audit trail
    """
    
    def __init__(self, alpaca_api: AlpacaAPI, risk_manager: RiskManager, market_data: MarketDataService):
        self.alpaca = alpaca_api
        self.risk = risk_manager
        self.market = market_data
        self.logger = logger
        self.active_orders = {}
        self.order_history = []
        self.last_order_id = 0
        self.order_id_prefix = f"TRD_{int(time.time())}_"
        self.order_queue = []
        self.last_monitor = time.time()
        self.monitor_interval = 2  # seconds
        self.last_data_check = time.time()
        self.data_refresh_interval = 300  # 5 minutes
        self.execution_states = {
            'PENDING': 'Order submitted, awaiting execution',
            'FILLED': 'Order fully executed',
            'PARTIALLY_FILLED': 'Order partially executed',
            'CANCELED': 'Order canceled by user',
            'REJECTED': 'Order rejected by broker',
            'EXPIRED': 'Order expired',
            'REPLACED': 'Order replaced with new order'
        }
        
        # Initialize execution parameters
        self.execution_strategies = {
            'market': self._execute_market_order,
            'limit': self._execute_limit_order,
            'stop': self._execute_stop_order,
            'stop_limit': self._execute_stop_limit_order,
            'oco': self._execute_oco_order
        }
        
        # Initialize metrics
        self.metrics = {
            'total_orders': 0,
            'filled_orders': 0,
            'canceled_orders': 0,
            'rejections': 0,
            'avg_fill_price': 0.0,
            'slippage': 0.0,
            'last_update': time.time()
        }
    
    def submit_order(self, trade_order: TradeOrder) -> dict:
        """Submit a trade order with full risk management"""
        # Set timestamp if not provided
        if not trade_order.timestamp:
            trade_order.timestamp = time.time()
        
        # Generate client order ID if not provided
        if not trade_order.client_order_id:
            self.last_order_id += 1
            trade_order.client_order_id = f"{self.order_id_prefix}{self.last_order_id}"
        
        # Validate order parameters
        validation = self._validate_order(trade_order)
        if not validation['valid']:
            self.logger.error(f"Order validation failed: {validation['reason']}")
            return {
                'status': 'rejected',
                'order_id': None,
                'client_order_id': trade_order.client_order_id,
                'error': validation['reason'],
                'timestamp': time.time()
            }
        
        # Check circuit breaker
        if not self.risk.check_circuit_breaker():
            self.logger.critical("Circuit breaker active - no new trades allowed")
            return {
                'status': 'circuit_breaker',
                'order_id': None,
                'client_order_id': trade_order.client_order_id,
                'error': 'Circuit breaker active',
                'timestamp': time.time()
            }
        
        # Check risk management
        risk_ok, position_size = self.risk.check_trade(
            trade_order.symbol,
            trade_order.quantity,
            trade_order.entry_price or trade_order.price,
            trade_order.stop_price
        )
        
        if not risk_ok:
            self.logger.error(f"Risk check failed: {position_size}")
            return {
                'status': 'risk_rejected',
                'order_id': None,
                'client_order_id': trade_order.client_order_id,
                'error': position_size,
                'timestamp': time.time()
            }
        
        # Update trade order with approved quantity
        trade_order.quantity = position_size
        
        # Process order based on type
        execution_result = self._process_order(trade_order)
        
        # Update metrics
        self._update_metrics(trade_order, execution_result)
        
        # Log the order
        self.order_history.append({
            **asdict(trade_order),
            'execution_result': execution_result,
            'timestamp': datetime.now().isoformat()
        })
        
        # Track active order
        if execution_result.get('status') in ['pending', 'new', 'accepted']:
            self.active_orders[execution_result['order_id']] = {
                **asdict(trade_order),
                'status': 'pending',
                'execution_result': execution_result,
                'timestamp': time.time()
            }
        
        return execution_result
    
    def _validate_order(self, trade_order: TradeOrder) -> dict:
        """Validate order parameters before submission"""
        # Check required fields
        if not trade_order.symbol or not trade_order.symbol.strip():
            return {'valid': False, 'reason': 'Missing symbol'}
        
        if trade_order.action not in ['BUY', 'SELL']:
            return {'valid': False, 'reason': f"Invalid action: {trade_order.action}"}
        
        if trade_order.quantity <= 0:
            return {'valid': False, 'reason': f"Invalid quantity: {trade_order.quantity}"}
        
        # Validate price-based orders
        if trade_order.order_type in ['limit', 'stop', 'stop_limit']:
            if trade_order.price is None or trade_order.price <= 0:
                return {'valid': False, 'reason': f"Invalid price for {trade_order.order_type} order"}
            
            if trade_order.order_type == 'stop' and trade_order.stop_price is None:
                return {'valid': False, 'reason': 'Stop price required for stop orders'}
            
            if trade_order.order_type == 'stop_limit':
                if trade_order.stop_price is None or trade_order.stop_price <= 0:
                    return {'valid': False, 'reason': 'Stop price required for stop-limit orders'}
                if trade_order.limit_price is None or trade_order.limit_price <= 0:
                    return {'valid': False, 'reason': 'Limit price required for stop-limit orders'}
        
        # Validate OCO orders
        if trade_order.order_class == 'oco':
            if not trade_order.take_profit or not trade_order.stop_loss:
                return {'valid': False, 'reason': 'Take profit and stop loss required for OCO orders'}
        
        # Check market hours
        if not self._is_market_open():
            return {'valid': False, 'reason': 'Market is closed'}
        
        return {'valid': True}
    
    def _process_order(self, trade_order: TradeOrder) -> dict:
        """Process order through the execution engine"""
        # Get real-time market data
        market_data = self.market.get_real_time_data(trade_order.symbol)
        
        # Set entry price if not provided
        if not trade_order.entry_price:
            if market_data and 'latest' in market_data:
                trade_order.entry_price = market_data['latest'].get('price', 0.0)
        
        # Process order based on type
        if trade_order.order_type in self.execution_strategies:
            return self.execution_strategies[trade_order.order_type](trade_order)
        
        # Default to market order if type not recognized
        self.logger.warning(f"Unknown order type: {trade_order.order_type}. Using market order.")
        return self._execute_market_order(trade_order)
    
    def _execute_market_order(self, trade_order: TradeOrder) -> dict:
        """Execute a market order with risk management"""
        # Create order request
        order = {
            'symbol': trade_order.symbol,
            'action': trade_order.action,
            'quantity': trade_order.quantity,
            'order_type': 'market',
            'time_in_force': trade_order.time_in_force,
            'client_order_id': trade_order.client_order_id,
            'extended_hours': trade_order.extended_hours
        }
        
        # Submit to broker
        response = self.alpaca.submit_order(OrderRequest(**order))
        
        # Handle response
        if response.get('status') in ['new', 'pending_new', 'accepted', 'pending_new']:
            return {
                'status': 'accepted',
                'order_id': response['id'],
                'client_order_id': response['client_order_id'],
                'symbol': response['symbol'],
                'quantity': response['qty'],
                'timestamp': time.time()
            }
        
        # Handle specific Alpaca errors
        error = response.get('error', 'Unknown error')
        self.logger.error(f"Market order execution failed: {error}")
        return {
            'status': 'rejected',
            'client_order_id': trade_order.client_order_id,
            'error': error,
            'timestamp': time.time()
        }
    
    def _execute_limit_order(self, trade_order: TradeOrder) -> dict:
        """Execute a limit order with risk management"""
        # Create order request
        order = {
            'symbol': trade_order.symbol,
            'action': trade_order.action,
            'quantity': trade_order.quantity,
            'order_type': 'limit',
            'price': trade_order.price,
            'time_in_force': trade_order.time_in_force,
            'client_order_id': trade_order.client_order_id,
            'extended_hours': trade_order.extended_hours
        }
        
        # Submit to broker
        response = self.alpaca.submit_order(OrderRequest(**order))
        
        # Handle response
        if response.get('status') in ['new', 'pending_new', 'accepted', 'pending_new']:
            return {
                'status': 'accepted',
                'order_id': response['id'],
                'client_order_id': response['client_order_id'],
                'symbol': response['symbol'],
                'quantity': response['qty'],
                'price': response.get('limit_price'),
                'timestamp': time.time()
            }
        
        # Handle specific Alpaca errors
        error = response.get('error', 'Unknown error')
        self.logger.error(f"Limit order execution failed: {error}")
        return {
            'status': 'rejected',
            'client_order_id': trade_order.client_order_id,
            'error': error,
            'timestamp': time.time()
        }
    
    def _execute_stop_order(self, trade_order: TradeOrder) -> dict:
        """Execute a stop order with risk management"""
        # Create order request
        order = {
            'symbol': trade_order.symbol,
            'action': trade_order.action,
            'quantity': trade_order.quantity,
            'order_type': 'stop',
            'stop_price': trade_order.stop_price,
            'time_in_force': trade_order.time_in_force,
            'client_order_id': trade_order.client_order_id,
            'extended_hours': trade_order.extended_hours
        }
        
        # Submit to broker
        response = self.alpaca.submit_order(OrderRequest(**order))
        
        # Handle response
        if response.get('status') in ['new', 'pending_new', 'accepted', 'pending_new']:
            return {
                'status': 'accepted',
                'order_id': response['id'],
                'client_order_id': response['client_order_id'],
                'symbol': response['symbol'],
                'quantity': response['qty'],
                'stop_price': response.get('stop_price'),
                'timestamp': time.time()
            }
        
        # Handle specific Alpaca errors
        error = response.get('error', 'Unknown error')
        self.logger.error(f"Stop order execution failed: {error}")
        return {
            'status': 'rejected',
            'client_order_id': trade_order.client_order_id,
            'error': error,
            'timestamp': time.time()
        }
    
    def _execute_stop_limit_order(self, trade_order: TradeOrder) -> dict:
        """Execute a stop-limit order with risk management"""
        # Create order request
        order = {
            'symbol': trade_order.symbol,
            'action': trade_order.action,
            'quantity': trade_order.quantity,
            'order_type': 'stop_limit',
            'price': trade_order.limit_price,
            'stop_price': trade_order.stop_price,
            'time_in_force': trade_order.time_in_force,
            'client_order_id': trade_order.client_order_id,
            'extended_hours': trade_order.extended_hours
        }
        
        # Submit to broker
        response = self.alpaca.submit_order(OrderRequest(**order))
        
        # Handle response
        if response.get('status') in ['new', 'pending_new', 'accepted', 'pending_new']:
            return {
                'status': 'accepted',
                'order_id': response['id'],
                'client_order_id': response['client_order_id'],
                'symbol': response['symbol'],
                'quantity': response['qty'],
                'price': response.get('limit_price'),
                'stop_price': response.get('stop_price'),
                'timestamp': time.time()
            }
        
        # Handle specific Alpaca errors
        error = response.get('error', 'Unknown error')
        self.logger.error(f"Stop-limit order execution failed: {error}")
        return {
            'status': 'rejected',
            'client_order_id': trade_order.client_order_id,
            'error': error,
            'timestamp': time.time()
        }
    
    def _execute_oco_order(self, trade_order: TradeOrder) -> dict:
        """Execute an OCO (One-Cancels-Other) order with risk management"""
        # Create order request
        order = {
            'symbol': trade_order.symbol,
            'action': trade_order.action,
            'quantity': trade_order.quantity,
            'order_type': 'limit',
            'price': trade_order.price,
            'time_in_force': trade_order.time_in_force,
            'client_order_id': trade_order.client_order_id,
            'extended_hours': trade_order.extended_hours,
            'order_class': 'oco',
            'take_profit': trade_order.take_profit,
            'stop_loss': trade_order.stop_loss
        }
        
        # Submit to broker
        response = self.alpaca.submit_order(OrderRequest(**order))
        
        # Handle response
        if response.get('status') in ['new', 'pending_new', 'accepted', 'pending_new']:
            return {
                'status': 'accepted',
                'order_id': response['id'],
                'client_order_id': response['client_order_id'],
                'symbol': response['symbol'],
                'quantity': response['qty'],
                'price': response.get('limit_price'),
                'take_profit': response.get('take_profit'),
                'stop_loss': response.get('stop_loss'),
                'timestamp': time.time()
            }
        
        # Handle specific Alpaca errors
        error = response.get('error', 'Unknown error')
        self.logger.error(f"OCO order execution failed: {error}")
        return {
            'status': 'rejected',
            'client_order_id': trade_order.client_order_id,
            'error': error,
            'timestamp': time.time()
        }
    
    def modify_order(self, order_id: str, new_price: float = None, new_stop: float = None) -> dict:
        """Modify an existing order with risk management"""
        if order_id not in self.active_orders:
            self.logger.error(f"Order {order_id} not found")
            return {
                'status': 'error',
                'order_id': order_id,
                'error': 'Order not found',
                'timestamp': time.time()
            }
        
        # Get current order
        order_dict = self.active_orders[order_id]
        
        # Create new order object with updates
        new_order = TradeOrder(
            symbol=order_dict['symbol'],
            action=order_dict['action'],
            quantity=order_dict['quantity'],
            order_type=order_dict['order_type'],
            price=new_price or order_dict.get('price'),
            stop_price=new_stop or order_dict.get('stop_price'),
            time_in_force=order_dict['time_in_force'],
            client_order_id=order_dict['client_order_id'],
            order_class=order_dict.get('order_class'),
            extended_hours=order_dict.get('extended_hours', False),
            limit_price=new_price or order_dict.get('limit_price'),
            take_profit=order_dict.get('take_profit'),
            stop_loss=order_dict.get('stop_loss'),
            strategy=order_dict.get('strategy', 'Default'),
            signal_id=order_dict.get('signal_id'),
            risk_score=order_dict.get('risk_score', 0.0),
            confidence=order_dict.get('confidence', 0.0),
            entry_price=order_dict.get('entry_price'),
            exit_price=order_dict.get('exit_price'),
            status='modifying',
            timestamp=time.time(),
            filled_qty=order_dict.get('filled_qty', 0),
            avg_fill_price=order_dict.get('avg_fill_price')
        )
        
        # Calculate new position size
        position_size = self.risk.get_position_size(
            new_order.symbol,
            new_order.entry_price or new_order.price,
            new_order.stop_price
        )
        new_order.quantity = position_size
        
        # Submit modification
        response = self.alpaca.modify_order(order_id, OrderRequest(**asdict(new_order)))
        
        # Handle response
        if response.get('status') in ['accepted', 'replaced']:
            # Update local order
            self.active_orders[order_id] = {
                **asdict(new_order),
                'status': 'pending',
                'timestamp': time.time()
            }
            self.logger.info(f"Order {order_id} modified - New price: {new_order.price}")
            return {
                'status': 'modified',
                'order_id': order_id,
                'client_order_id': new_order.client_order_id,
                'new_price': new_order.price,
                'timestamp': time.time()
            }
        
        self.logger.error(f"Order modification failed: {response.get('error', 'Unknown error')}")
        return {
            'status': 'error',
            'order_id': order_id,
            'client_order_id': new_order.client_order_id,
            'error': response.get('error', 'Unknown error'),
            'timestamp': time.time()
        }
    
    def cancel_order(self, order_id: str) -> dict:
        """Cancel a specific order"""
        if order_id not in self.active_orders:
            self.logger.error(f"Order {order_id} not found")
            return {
                'status': 'error',
                'order_id': order_id,
                'error': 'Order not found',
                'timestamp': time.time()
            }
        
        # Cancel through broker API
        response = self.alpaca.cancel_order(order_id)
        
        # Update local order status
        if response.get('status') in ['canceled', 'cancel_replaced']:
            self.active_orders[order_id]['status'] = 'canceled'
            self.logger.info(f"Order {order_id} canceled")
            return {
                'status': 'canceled',
                'order_id': order_id,
                'client_order_id': self.active_orders[order_id]['client_order_id'],
                'timestamp': time.time()
            }
        
        self.logger.error(f"Order cancellation failed: {response.get('error', 'Unknown error')}")
        return {
            'status': 'error',
            'order_id': order_id,
            'client_order_id': self.active_orders[order_id]['client_order_id'],
            'error': response.get('error', 'Unknown error'),
            'timestamp': time.time()
        }
    
    def cancel_all_orders(self) -> list:
        """Cancel all active orders"""
        results = []
        
        for order_id in list(self.active_orders.keys()):
            result = self.cancel_order(order_id)
            results.append(result)
            time.sleep(0.1)  # Add small delay between cancellations
        
        self.logger.info(f"Cancelled {len(results)} active orders")
        return results
    
    def monitor_orders(self):
        """Monitor active orders and update status"""
        current_time = time.time()
        
        # Only check orders at interval
        if current_time - self.last_monitor < self.monitor_interval:
            return
        
        self.last_monitor = current_time
        
        # Get order status for all active orders
        for order_id, order_info in list(self.active_orders.items()):
            status = self.alpaca.get_order_status(order_id)
            
            if 'status' in status:
                # Update local order status
                self.active_orders[order_id]['status'] = status['status']
                
                # Log order status
                self.logger.info(f"Order {order_id} status: {status['status']}")
                
                # Handle filled orders
                if status['status'] == 'filled':
                    # Update trade order with fill information
                    self.active_orders[order_id]['status'] = 'filled'
                    self.active_orders[order_id]['filled_qty'] = int(status.get('filled_qty', 0))
                    self.active_orders[order_id]['avg_fill_price'] = float(status.get('filled_avg_price', 0))
                    self.active_orders[order_id]['exit_price'] = float(status.get('filled_avg_price', 0))
                    
                    # Calculate profit/loss
                    profit_loss = self._calculate_profit_loss(
                        self.active_orders[order_id],
                        status
                    )
                    
                    # Update risk metrics
                    self.risk.update_position(profit_loss)
                    
                    # Log completion
                    self.logger.info(f"Order {order_id} filled - Profit/Loss: ${profit_loss:,.2f}")
                
                # Clean up completed orders
                if status['status'] in ['filled', 'canceled', 'rejected', 'expired']:
                    self.order_history.append({
                        **self.active_orders[order_id],
                        'status': status['status'],
                        'timestamp': time.time(),
                        'execution_result': status
                    })
                    del self.active_orders[order_id]
    
    def _calculate_profit_loss(self, order, status):
        """Calculate profit/loss for a filled order"""
        if status.get('filled_qty') == 0:
            return 0
            
        filled_price = float(status.get('filled_avg_price', 0))
        entry_price = float(order.get('entry_price', 0))
        if order['action'] == 'BUY':
            return (filled_price - entry_price) * float(status.get('filled_qty', 0))
        else:
            return (entry_price - filled_price) * float(status.get('filled_qty', 0))
    
    def get_active_orders(self):
        """Get current active orders"""
        return {k: {**v, 'timestamp': datetime.fromtimestamp(v['timestamp']).isoformat() if isinstance(v['timestamp'], (int, float)) else v['timestamp']} 
                for k, v in self.active_orders.items()}
    
    def get_order_history(self):
        """Get complete order history with detailed information"""
        return [{
            **order,
            'timestamp': datetime.fromtimestamp(order['timestamp']).isoformat() if isinstance(order.get('timestamp'), (int, float)) else order.get('timestamp')
        } for order in self.order_history]
    
    def get_order_status(self, order_id: str):
        """Get detailed status for a specific order"""
        # Check active orders
        if order_id in self.active_orders:
            return {
                'status': 'active',
                **self.active_orders[order_id],
                'timestamp': datetime.fromtimestamp(self.active_orders[order_id]['timestamp']).isoformat() if isinstance(self.active_orders[order_id]['timestamp'], (int, float)) else self.active_orders[order_id]['timestamp']
            }
        
        # Check order history
        for order in self.order_history:
            if order['client_order_id'] == order_id or order.get('order_id') == order_id:
                return {
                    'status': 'historical',
                    **order,
                    'timestamp': datetime.fromtimestamp(order['timestamp']).isoformat() if isinstance(order.get('timestamp'), (int, float)) else order.get('timestamp')
                }
        
        # Check with broker
        status = self.alpaca.get_order_status(order_id)
        if 'status' in status:
            return {
                'status': 'broker',
                **status,
                'timestamp': datetime.now().isoformat()
            }
        
        return {
            'status': 'not_found',
            'order_id': order_id,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_trading_status(self):
        """Get comprehensive trading status for monitoring"""
        active_orders = self.get_active_orders()
        order_history = self.get_order_history()
        
        # Calculate performance metrics
        total_trades = len(order_history)
        filled_trades = sum(1 for o in order_history if o.get('status') == 'filled')
        win_rate = 0.0
        profit_factor = 0.0
        total_profit = 0.0
        max_drawdown = 0.0
        sharpe_ratio = 0.0
        
        if total_trades > 0:
            # Calculate win rate
            winning_trades = sum(1 for o in order_history if o.get('profit', 0) > 0)
            win_rate = winning_trades / total_trades
            
            # Calculate profit factor
            total_profit = sum(o.get('profit', 0) for o in order_history)
            total_wins = sum(o.get('profit', 0) for o in order_history if o.get('profit', 0) > 0)
            total_losses = sum(abs(o.get('profit', 0)) for o in order_history if o.get('profit', 0) < 0)
            profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
            
            # Calculate max drawdown (simplified)
            cumulative_pnl = [0]
            for o in order_history:
                cumulative_pnl.append(cumulative_pnl[-1] + o.get('profit', 0))
            peak = 0
            max_drawdown = 0
            for value in cumulative_pnl:
                if value > peak:
                    peak = value
                drawdown = peak - value
                if drawdown > max_drawdown:
                    max_drawdown = drawdown
            
            # Calculate Sharpe ratio (simplified)
            daily_pnl = []
            for i in range(1, len(cumulative_pnl)):
                daily_pnl.append(cumulative_pnl[i] - cumulative_pnl[i-1])
            if len(daily_pnl) > 0:
                daily_std = np.std(daily_pnl)
                daily_mean = np.mean(daily_pnl)
                sharpe_ratio = daily_mean / daily_std if daily_std > 0 else 0.0
        
        return {
            'active_orders': len(active_orders),
            'total_trades': total_trades,
            'filled_trades': filled_trades,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'total_profit': total_profit,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'daily_loss': self.risk.daily_loss,
            'current_capital': self.risk.current_capital,
            'is_trading_active': self.risk.check_circuit_breaker(),
            'position_size': self.risk.position_size,
            'max_daily_loss': self.risk.max_daily_loss,
            'timestamp': datetime.now().isoformat()
        }
    
    def _update_metrics(self, trade_order: TradeOrder, execution_result: dict):
        """Update performance metrics after trade execution"""
        self.metrics['total_orders'] += 1
        self.metrics['last_update'] = time.time()
        
        if execution_result.get('status') == 'accepted':
            self.metrics['filled_orders'] += 1
        elif execution_result.get('status') == 'rejected':
            self.metrics['rejections'] += 1
        elif execution_result.get('status') == 'canceled':
            self.metrics['canceled_orders'] += 1
        
        # Update average fill price
        if 'price' in execution_result and execution_result['price'] is not None and execution_result['price'] > 0:
            self.metrics['avg_fill_price'] = (
                (self.metrics['avg_fill_price'] * (self.metrics['total_orders'] - 1) + execution_result['price']) / 
                self.metrics['total_orders']
            )
        
        # Calculate slippage (simplified)
        if 'price' in execution_result and execution_result['price'] is not None and trade_order.price:
            self.metrics['slippage'] = abs(execution_result['price'] - trade_order.price)
    
    def _is_market_open(self) -> bool:
        """Check if US markets are open"""
        now = datetime.now()
        weekday = now.weekday()
        
        # US markets are closed on weekends
        if weekday >= 5:  # Saturday=5, Sunday=6
            return False
        
        # US market hours: 9:30 AM - 4:00 PM ET
        if now.hour < 9 or (now.hour == 9 and now.minute < 30):
            return False
        if now.hour > 16 or (now.hour == 16 and now.minute > 0):
            return False
        
        return True
    
    def stop_trading(self):
        """Stop all trading activity (circuit breaker)"""
        self.logger.critical("STOPPING ALL TRADING ACTIVITY - CIRCUIT BREAKER")
        
        # Cancel all active orders
        self.cancel_all_orders()
        
        # Close all positions
        positions = self.alpaca.get_positions()
        for position in positions:
            action = "SELL" if position["side"] == "long" else "BUY"
            self.alpaca.submit_order(OrderRequest(
                symbol=position["symbol"],
                action=action,
                quantity=int(position["qty"]),
                order_type="market",
                time_in_force="day"
            ))
        
        # Reset risk manager (not recommended for live trading without manual intervention)
        # self.risk.reset_daily()
        self.logger.info("Trading halted via circuit breaker. Manual intervention required.")
    
    def get_trading_log(self, days=7):
        """Get detailed trading log for the specified number of days"""
        log = []
        now = datetime.now()
        
        for i in range(days):
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            day_orders = [o for o in self.order_history 
                         if isinstance(o.get('timestamp'), str) and datetime.fromisoformat(o['timestamp']).strftime("%Y-%m-%d") == date]
            
            if day_orders:
                log.append({
                    'date': date,
                    'orders': [{
                        'symbol': o['symbol'],
                        'action': o['action'],
                        'quantity': o['quantity'],
                        'price': o.get('price', o.get('avg_fill_price', 'N/A')),
                        'status': o['status'],
                        'profit': o.get('profit', 'N/A'),
                        'timestamp': o['timestamp']
                    } for o in day_orders],
                    'daily_pnl': sum(o.get('profit', 0) for o in day_orders),
                    'trades_count': len(day_orders)
                })
        
        return log
    
    def get_performance_report(self):
        """Get comprehensive trading performance report"""
        return {
            'performance': self.get_performance_metrics(),
            'trading_status': self.get_trading_status(),
            'portfolio': self.get_portfolio_analysis(),
            'market_insights': self.get_market_insights(),
            'trading_log': self.get_trading_log(30),
            'active_positions': self.alpaca.get_positions(),
            'open_orders': self.alpaca.get_orders('open'),
            'account_summary': self.alpaca.get_account_summary(),
            'risk_metrics': self.risk.get_risk_metrics(),
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_daily_pnl(self):
        """Calculate daily P&L from order history"""
        daily_pnl = {}
        
        for order in self.order_history:
            if 'profit' in order:
                date = datetime.fromisoformat(order['timestamp']).strftime("%Y-%m-%d") if isinstance(order.get('timestamp'), str) else "Unknown"
                daily_pnl[date] = daily_pnl.get(date, 0) + order['profit']
        
        return [{'date': date, 'pnl': pnl} for date, pnl in daily_pnl.items()]
    
    def get_portfolio_analysis(self):
        """Get detailed portfolio analysis"""
        positions = self.alpaca.get_positions()
        total_market_value = sum(float(p['market_value']) for p in positions)
        
        position_analysis = []
        for position in positions:
            market_value = float(position['market_value'])
            allocation = market_value / total_market_value if total_market_value > 0 else 0
            
            position_analysis.append({
                'symbol': position['symbol'],
                'quantity': float(position['qty']),
                'current_price': float(position['current_price']),
                'market_value': market_value,
                'allocation': allocation * 100,
                'unrealized_pl': float(position['unrealized_pl']),
                'unrealized_plpc': float(position['unrealized_plpc']) * 100
            })
        
        # Sector allocation based on symbols
        sector_allocation = self._analyze_sector_allocation(position_analysis)
        
        return {
            'current_portfolio_value': self.risk.current_capital,
            'starting_portfolio_value': self.risk.starting_capital,
            'unrealized_pnl': sum(p['unrealized_pl'] for p in position_analysis),
            'realized_pnl': self._calculate_realized_pnl(),
            'position_analysis': position_analysis,
            'sector_allocation': sector_allocation,
            'risk_metrics': self.risk.get_risk_metrics(),
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_realized_pnl(self):
        """Calculate realized P&L from closed positions"""
        # Simplified for demonstration
        return sum(o.get('profit', 0) for o in self.order_history if o.get('status') == 'filled')
    
    def _analyze_sector_allocation(self, position_analysis):
        """Analyze sector allocation for positions"""
        sector_weights = {}
        
        # Basic mapping for demonstration
        sector_map = {
            'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'NVDA': 'Technology',
            'JPM': 'Financials', 'GS': 'Financials', 'BAC': 'Financials',
            'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare',
            'XOM': 'Energy', 'CVX': 'Energy',
            'PG': 'Consumer Staples', 'KO': 'Consumer Staples',
            'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary'
        }
        
        for pos in position_analysis:
            symbol = pos['symbol']
            sector = sector_map.get(symbol, 'Other')
            weight = pos['allocation']
            sector_weights[sector] = sector_weights.get(sector, 0) + weight
            
        return sector_weights
    
    def get_market_insights(self):
        """Get market insights using history and real-time data"""
        insights = {
            'market_trend': self._analyze_market_trend(),
            'volatility': self._analyze_volatility(),
            'sector_performance': self._analyze_sector_performance(),
            'trading_opportunities': self._generate_trading_opportunities(),
            'risk_metrics': self.risk.get_risk_metrics(),
            'timestamp': datetime.now().isoformat()
        }
        return insights
    
    def _analyze_market_trend(self):
        """Analyze major indices for overall market trend"""
        # Simplified: Check SPY 200 SMA
        spy_data = self.alpaca.get_historical_data("SPY", timeframe="1D", limit=200)
        if spy_data is not None and not spy_data.empty:
            sma_200 = spy_data['close'].mean()
            current_price = spy_data['close'].iloc[-1]
            if current_price > sma_200:
                return 'bullish'
            return 'bearish'
        return 'neutral'
    
    def _analyze_volatility(self):
        """Analyze VIX and local volatility"""
        vix_data = self.alpaca.get_historical_data("VIX", timeframe="1D", limit=1)
        vix_val = vix_data['close'].iloc[-1] if vix_data is not None and not vix_data.empty else 0.0
        
        if vix_val > 30:
            status = 'high'
        elif vix_val > 20:
            status = 'elevated'
        else:
            status = 'low'
            
        return {
            'vix_value': vix_val,
            'status': status,
            'interpretation': 'High volatility - proceed with caution' if status == 'high' else 'Moderate/Low volatility'
        }
    
    def _analyze_sector_performance(self):
        """Analyze performance of major sector ETFs"""
        sectors = {'XLK': 'Technology', 'XLF': 'Financials', 'XLV': 'Healthcare', 'XLE': 'Energy'}
        performance = {}
        for symbol, name in sectors.items():
            data = self.alpaca.get_historical_data(symbol, timeframe="1D", limit=2)
            if data is not None and len(data) >= 2:
                ret = (data['close'].iloc[-1] - data['close'].iloc[-2]) / data['close'].iloc[-2]
                performance[name] = {'performance': ret, 'status': 'strong' if ret > 0.01 else 'weak' if ret < -0.01 else 'neutral'}
        return performance

    def _generate_trading_opportunities(self):
        """Identify potential high-confidence trades"""
        # This would integrate with a scanner or signal generator
        return [
            {
                'symbol': 'AAPL',
                'action': 'BUY',
                'confidence': 0.85,
                'price': 150.0,
                'stop_loss': 145.0,
                'target': 158.0,
                'reason': 'Bounce off major support with high volume'
            }
        ]

    def get_performance_metrics(self):
        """Aggregate performance metrics for reporting"""
        status = self.get_trading_status()
        return {
            'win_rate': status['win_rate'],
            'profit_factor': status['profit_factor'],
            'total_profit': status['total_profit'],
            'max_drawdown': status['max_drawdown'],
            'sharpe_ratio': status['sharpe_ratio'],
            'total_trades': status['total_trades'],
            'timestamp': datetime.now().isoformat()
        }

    def get_trading_signal(self, symbol, timeframe="1D"):
        """Get signal and technical indicators for a specific symbol"""
        indicators = self.market.get_technical_indicators(symbol)
        sentiment = self.market.get_news_sentiment(symbol)
        
        # Simplified logic
        action = 'HOLD'
        if indicators.get('rsi', 50) < 30:
            action = 'BUY'
        elif indicators.get('rsi', 50) > 70:
            action = 'SELL'
            
        return {
            'symbol': symbol,
            'action': action,
            'confidence': 0.75,
            'technical_indicators': indicators,
            'news_sentiment': sentiment,
            'timestamp': datetime.now().isoformat()
        }

    def get_account_summary(self):
        return self.alpaca.get_account_summary()

    def get_current_trades(self):
        """Provide a unified view of open positions and pending orders"""
        positions = self.alpaca.get_positions()
        orders = self.alpaca.get_orders('open')
        
        return {
            'positions': positions,
            'pending_orders': orders,
            'count': len(positions) + len(orders),
            'timestamp': datetime.now().isoformat()
        }
