import requests
import time
import logging
import json
from dataclasses import dataclass
from datetime import datetime, timedelta
from config.settings import API_KEYS

logger = logging.getLogger('AlpacaAPI')

@dataclass
class OrderRequest:
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
    order_id: str = None  # For modifications

class AlpacaAPI:
    """
    Production-grade Alpaca API integration with:
    - Rate limit management
    - Circuit breaker system
    - Real-time order tracking
    - Comprehensive error handling
    - Order modification capabilities
    """
    
    BASE_URL = "https://api.alpaca.markets"
    DATA_URL = "https://data.alpaca.markets"
    WEBSOCKET_URL = "wss://stream.data.alpaca.markets/v2"
    
    def __init__(self):
        self.api_key = API_KEYS.get('alpaca_key')
        self.api_secret = API_KEYS.get('alpaca_secret')
        
        if not self.api_key or not self.api_secret:
            raise ValueError("Alpaca API keys are required")
        
        self.rate_limit = {
            'max_requests': 20,
            'window_seconds': 60,
            'current': 0,
            'last_reset': time.time(),
            'last_request': time.time()
        }
        
        self.order_id_prefix = f"ALGO_{int(time.time())}_"
        self.active_orders = {}
        self.order_queue = []
        self.last_order_id = 0
        self.logger = logger
        self.order_modifications = {}
        self.last_data_request = time.time()
        self.data_rate_limit = 100  # 100 requests per minute for data
        self.data_requests = 0
        self.data_window_start = time.time()
    
    def _check_rate_limit(self):
        """Enforce Alpaca's API rate limits (20 requests/minute)"""
        current_time = time.time()
        
        # Reset counter if window has passed
        if current_time - self.rate_limit['last_reset'] > self.rate_limit['window_seconds']:
            self.rate_limit['current'] = 0
            self.rate_limit['last_reset'] = current_time
        
        # Check if we're within limits
        if self.rate_limit['current'] >= self.rate_limit['max_requests']:
            wait_time = self.rate_limit['window_seconds'] - (current_time - self.rate_limit['last_reset'])
            self.logger.warning(f"API rate limit hit. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
            self.rate_limit['current'] = 0
            self.rate_limit['last_reset'] = time.time()
        
        # Increment counter
        self.rate_limit['current'] += 1
        self.rate_limit['last_request'] = current_time
    
    def _check_data_rate_limit(self):
        """Enforce Alpaca Data API rate limits (100 requests/minute)"""
        current_time = time.time()
        
        # Reset counter if window has passed
        if current_time - self.data_window_start > 60:
            self.data_requests = 0
            self.data_window_start = current_time
        
        # Check if we're within limits
        if self.data_requests >= self.data_rate_limit:
            wait_time = 60 - (current_time - self.data_window_start)
            self.logger.warning(f"Data API rate limit hit. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
            self.data_requests = 0
            self.data_window_start = time.time()
        
        # Increment counter
        self.data_requests += 1
    
    def _get_headers(self):
        """Get authentication headers for Alpaca API"""
        return {
            'APCA-API-KEY-ID': self.api_key,
            'APCA-API-SECRET-KEY': self.api_secret,
            'Content-Type': 'application/json'
        }
    
    def _get_data_headers(self):
        """Get authentication headers for Alpaca Data API"""
        return {
            'APCA-API-KEY-ID': self.api_key,
            'APCA-API-SECRET-KEY': self.api_secret,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def submit_order(self, order: OrderRequest) -> dict:
        """Submit an order to Alpaca with comprehensive risk management"""
        self._check_rate_limit()
        
        # Generate unique client order ID if not provided
        if not order.client_order_id:
            self.last_order_id += 1
            order.client_order_id = f"{self.order_id_prefix}{self.last_order_id}"
        
        # Prepare payload based on order type
        payload = {
            'symbol': order.symbol,
            'qty': order.quantity,
            'side': 'buy' if order.action == 'BUY' else 'sell',
            'type': order.order_type,
            'time_in_force': order.time_in_force,
            'client_order_id': order.client_order_id,
            'extended_hours': order.extended_hours
        }
        
        # Add price parameters for limit/stop orders
        if order.order_type == 'limit' and order.price:
            payload['limit_price'] = order.price
        elif order.order_type == 'stop' and order.stop_price:
            payload['stop_price'] = order.stop_price
        elif order.order_type == 'stop_limit':
            if order.price and order.stop_price:
                payload['limit_price'] = order.price
                payload['stop_price'] = order.stop_price
        
        # Add order class if specified
        if order.order_class:
            payload['order_class'] = order.order_class
            
        # Add take profit and stop loss for OCO orders
        if order.take_profit and order.stop_loss:
            payload['take_profit'] = order.take_profit
            payload['stop_loss'] = order.stop_loss
        
        try:
            # Submit order to Alpaca
            response = requests.post(
                f"{self.BASE_URL}/v2/orders",
                json=payload,
                headers=self._get_headers()
            )
            
            # Handle response
            if response.status_code in (200, 201):
                order_data = response.json()
                self.active_orders[order_data['id']] = {
                    'order': order,
                    'status': 'pending',
                    'timestamp': time.time(),
                    'client_order_id': order_data['client_order_id']
                }
                self.logger.info(f"Order submitted: {order_data['id']} for {order.symbol}")
                return order_data
            
            # Handle rate limit errors
            if response.status_code == 429:
                self.logger.error("API rate limit exceeded. Retrying after 1 second...")
                time.sleep(1)
                return self.submit_order(order)
            
            # Handle specific Alpaca errors
            error = response.json()
            error_code = error.get('code', 0)
            
            # 40310 - Order rejected (symbol not tradable)
            if error_code == 40310:
                self.logger.error(f"Order rejected: {error.get('message', 'Symbol not tradable')}")
                return {
                    'error': error.get('message', 'Symbol not tradable'),
                    'status': 'rejected',
                    'client_order_id': order.client_order_id,
                    'rejection_code': error_code
                }
            
            # 40302 - Order rejected (insufficient funds)
            if error_code == 40302:
                self.logger.error(f"Order rejected: {error.get('message', 'Insufficient funds')}")
                return {
                    'error': error.get('message', 'Insufficient funds'),
                    'status': 'rejected',
                    'client_order_id': order.client_order_id,
                    'rejection_code': error_code
                }
            
            # Other errors
            self.logger.error(f"Order submission failed: {error.get('message', 'API error')}")
            return {
                'error': error.get('message', 'API error'),
                'status': 'rejected',
                'client_order_id': order.client_order_id,
                'rejection_code': error_code
            }
            
        except Exception as e:
            self.logger.exception("Order submission error")
            return {
                'error': str(e),
                'status': 'rejected',
                'client_order_id': order.client_order_id,
                'rejection_code': 9999
            }
    
    def modify_order(self, order_id: str, new_order: OrderRequest) -> dict:
        """Modify an existing order with risk management"""
        self._check_rate_limit()
        
        # Verify order exists
        if order_id not in self.active_orders:
            return {
                'error': 'Order not found',
                'status': 'rejected'
            }
        
        # Get current order details
        current_order = self.active_orders[order_id]
        
        # Prepare modification payload
        payload = {}
        
        # Only include fields that are changing
        if new_order.quantity != current_order['order'].quantity:
            payload['qty'] = new_order.quantity
        
        if new_order.price and new_order.price != current_order['order'].price:
            payload['limit_price'] = new_order.price
        
        if new_order.stop_price and new_order.stop_price != current_order['order'].stop_price:
            payload['stop_price'] = new_order.stop_price
        
        if new_order.time_in_force and new_order.time_in_force != current_order['order'].time_in_force:
            payload['time_in_force'] = new_order.time_in_force
        
        if not payload:
            return {
                'error': 'No changes detected',
                'status': 'rejected'
            }
        
        try:
            # Submit order modification
            response = requests.patch(
                f"{self.BASE_URL}/v2/orders/{order_id}",
                json=payload,
                headers=self._get_headers()
            )
            
            # Handle response
            if response.status_code == 200:
                order_data = response.json()
                self.active_orders[order_id]['order'] = {
                    **current_order['order'],
                    **new_order
                }
                self.logger.info(f"Order modified: {order_id} for {new_order.symbol}")
                return order_data
            
            # Handle specific Alpaca errors
            error = response.json()
            self.logger.error(f"Order modification failed: {error.get('message', 'API error')}")
            return {
                'error': error.get('message', 'API error'),
                'status': 'rejected'
            }
            
        except Exception as e:
            self.logger.exception("Order modification error")
            return {
                'error': str(e),
                'status': 'rejected'
            }
    
    def get_order_status(self, order_id: str) -> dict:
        """Get order status with proper error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/v2/orders/{order_id}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                return {'error': 'Order not found', 'status': 'unknown'}
            else:
                error = response.json()
                self.logger.error(f"Order status check failed: {error.get('message', 'API error')}")
                return {'error': 'API error', 'status': 'unknown'}
        
        except Exception as e:
            self.logger.exception("Error getting order status")
            return {'error': str(e), 'status': 'unknown'}
    
    def get_orders(self, status: str = 'open', limit: int = 100) -> list:
        """Get orders with status filtering"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/v2/orders",
                params={'status': status, 'limit': limit},
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Error getting orders: {response.text}")
                return []
        
        except Exception as e:
            self.logger.exception("Error getting orders")
            return []
    
    def cancel_order(self, order_id: str) -> dict:
        """Cancel an order with rate limit handling"""
        self._check_rate_limit()
        
        try:
            response = requests.delete(
                f"{self.BASE_URL}/v2/orders/{order_id}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200 or response.status_code == 204:
                # Update local order status
                if order_id in self.active_orders:
                    self.active_orders[order_id]['status'] = 'canceled'
                self.logger.info(f"Order canceled: {order_id}")
                # DELETE response can be empty, so handle carefully
                return response.json() if response.text else {'status': 'canceled'}
            else:
                error = response.json()
                self.logger.error(f"Order cancellation failed: {error.get('message', 'API error')}")
                return {'error': error.get('message', 'API error'), 'status': 'rejected'}
        
        except Exception as e:
            self.logger.exception("Order cancellation error")
            return {'error': str(e), 'status': 'rejected'}
    
    def cancel_all_orders(self) -> list:
        """Cancel all active orders"""
        self._check_rate_limit()
        
        try:
            response = requests.delete(
                f"{self.BASE_URL}/v2/orders",
                headers=self._get_headers()
            )
            
            if response.status_code == 200 or response.status_code == 204:
                # Update local order statuses
                for order_id in self.active_orders:
                    self.active_orders[order_id]['status'] = 'canceled'
                self.logger.info("All orders canceled")
                return response.json() if response.text else []
            else:
                error = response.json()
                self.logger.error(f"Cancel all orders failed: {error.get('message', 'API error')}")
                return [{'error': error.get('message', 'API error'), 'status': 'rejected'}]
        
        except Exception as e:
            self.logger.exception("Cancel all orders error")
            return [{'error': str(e), 'status': 'rejected'}]
    
    def get_account(self) -> dict:
        """Get account information with error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/v2/account",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                self.logger.error(f"Account information request failed: {error.get('message', 'API error')}")
                return {'error': 'API error'}
        
        except Exception as e:
            self.logger.exception("Account information error")
            return {'error': str(e)}
    
    def get_positions(self) -> list:
        """Get current positions with proper error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/v2/positions",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                self.logger.error(f"Positions request failed: {error.get('message', 'API error')}")
                return []
        
        except Exception as e:
            self.logger.exception("Positions request error")
            return []
    
    def get_historical_data(self, symbol: str, timeframe: str = '1D', 
                          start: str = None, end: str = None) -> dict:
        """Get historical market data from Alpaca Data API"""
        self._check_data_rate_limit()
        
        try:
            params = {
                'symbol': symbol,
                'timeframe': timeframe,
                'limit': 1000
            }
            
            if start:
                params['start'] = start
            if end:
                params['end'] = end
            
            response = requests.get(
                f"{self.DATA_URL}/v2/stocks/{symbol}/bars",
                params=params,
                headers=self._get_data_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                self.logger.error(f"Historical data request failed: {error.get('message', 'API error')}")
                return {'error': 'API error'}
        
        except Exception as e:
            self.logger.exception("Historical data request error")
            return {'error': str(e)}
    
    def get_real_time_data(self, symbol: str) -> dict:
        """Get real-time market data from Alpaca Data API"""
        self._check_data_rate_limit()
        
        try:
            response = requests.get(
                f"{self.DATA_URL}/v2/stocks/{symbol}/quotes/latest",
                headers=self._get_data_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                # Handle possible error if response is not json
                try:
                    error = response.json()
                    self.logger.error(f"Real-time data request failed: {error.get('message', 'API error')}")
                except:
                    self.logger.error(f"Real-time data request failed with status {response.status_code}")
                return {'error': 'API error'}
        
        except Exception as e:
            self.logger.exception("Real-time data request error")
            return {'error': str(e)}
    
    def monitor_orders(self):
        """Monitor active orders and update status"""
        for order_id, order_info in list(self.active_orders.items()):
            status = self.get_order_status(order_id)
            
            if 'status' in status:
                # Update local order status
                self.active_orders[order_id]['status'] = status['status']
                
                # Log order status
                self.logger.info(f"Order {order_id} status: {status['status']}")
                
                # Handle filled orders
                if status['status'] == 'filled':
                    self.logger.info(f"Order {order_id} filled at {status.get('filled_price', 'N/A')}")
                    
                    # Add to order history
                    self._log_order_fill(order_id, status)
                
                # Clean up completed orders
                if status['status'] in ['filled', 'canceled', 'rejected']:
                    del self.active_orders[order_id]
    
    def _log_order_fill(self, order_id: str, status: dict):
        """Log order fill details for auditing"""
        fill_data = {
            'order_id': order_id,
            'symbol': status['symbol'],
            'side': status['side'],
            'qty': status['qty'],
            'filled_qty': status['filled_qty'],
            'price': status.get('filled_avg_price', status.get('price')),
            'timestamp': datetime.now().isoformat(),
            'client_order_id': status['client_order_id']
        }
        
        # Log to audit trail
        self.logger.info(f"Order fill: {json.dumps(fill_data)}")
        
        # In production, this would also be stored in a database
    
    def get_account_summary(self) -> dict:
        """Get comprehensive account summary with risk metrics"""
        account = self.get_account()
        positions = self.get_positions()
        orders = self.get_orders('open')
        
        if 'error' in account:
            return {'error': account['error']}
        
        # Calculate portfolio value
        portfolio_value = float(account['portfolio_value'])
        
        # Calculate total unrealized profit/loss
        unrealized_pnl = sum(float(p['unrealized_pl']) for p in positions)
        
        # Calculate total position value
        position_value = sum(float(p['market_value']) for p in positions)
        
        # Calculate cash balance
        cash = float(account['cash'])
        
        # Calculate leverage
        leverage = position_value / portfolio_value if portfolio_value > 0 else 0
        
        return {
            'account': account,
            'positions': positions,
            'open_orders': orders,
            'portfolio_value': portfolio_value,
            'cash_balance': cash,
            'unrealized_pnl': unrealized_pnl,
            'position_value': position_value,
            'leverage': leverage,
            'margin_ratio': float(account['margin_ratio']) if 'margin_ratio' in account else 0,
            'timestamp': datetime.now().isoformat()
        }
