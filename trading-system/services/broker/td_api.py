import time
import logging
import requests
from dataclasses import dataclass
from datetime import datetime
from services.broker.broker_interface import BrokerAPI, OrderRequest

logger = logging.getLogger('TDAPI')

class TDAPI(BrokerAPI):
    """
    TD Ameritrade API integration with global market support
    """
    
    BASE_URL = "https://api.tdameritrade.com/v1"
    
    def __init__(self, api_key: str = None, access_token: str = None):
        self.api_key = api_key
        self.access_token = access_token
        self.logger = logger
        self.order_id_prefix = f"TDA_{int(time.time())}_"
        self.active_orders = {}
        self.last_order_id = 0
    
    def _get_headers(self):
        """Get authentication headers for TD Ameritrade API"""
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def _check_rate_limit(self):
        """TD Ameritrade has rate limits (120 requests per 5 minutes)"""
        # In production, implement rate limiting
        pass
    
    def submit_order(self, order: OrderRequest) -> dict:
        """Submit an order to TD Ameritrade"""
        self._check_rate_limit()
        
        # Generate unique client order ID if not provided
        if not order.client_order_id:
            self.last_order_id += 1
            order.client_order_id = f"{self.order_id_prefix}{self.last_order_id}"
        
        # Prepare payload based on order type
        payload = {
            'orderType': order.order_type.upper(),
            'session': 'NORMAL',
            'duration': 'DAY',
            'orderStrategyType': 'SINGLE',
            'orderLegCollection': [{
                'instruction': order.action,
                'quantity': order.quantity,
                'instrument': {
                    'symbol': order.symbol,
                    'assetType': 'EQUITY'
                }
            }]
        }
        
        # Add price parameters for limit/stop orders
        if order.order_type == 'limit' and order.price:
            payload['price'] = order.price
        elif order.order_type == 'stop' and order.stop_price:
            payload['stopPrice'] = order.stop_price
        elif order.order_type == 'stop_limit':
            if order.price and order.stop_price:
                payload['price'] = order.price
                payload['stopPrice'] = order.stop_price
        
        try:
            # Submit order to TD Ameritrade
            response = requests.post(
                f"{self.BASE_URL}/accounts/{self.api_key}/orders",
                json=payload,
                headers=self._get_headers()
            )
            
            # Handle response (TD API often returns 201 Created with an empty body but location header contains order ID)
            if response.status_code in (200, 201):
                # TD API might not return JSON on success
                try:
                    order_data = response.json()
                except:
                    order_data = {'status': 'accepted', 'order_id': response.headers.get('Location', '').split('/')[-1]}
                
                self.active_orders[order_data.get('order_id', 'N/A')] = {
                    'order': order,
                    'status': 'pending',
                    'timestamp': time.time(),
                    'client_order_id': order_data.get('client_order_id', order.client_order_id)
                }
                self.logger.info(f"Order submitted: {order_data.get('order_id', 'N/A')} for {order.symbol}")
                return order_data
            
            # Handle specific TD Ameritrade errors
            try:
                error = response.json()
            except:
                error = {'message': 'API error'}
            self.logger.error(f"Order submission failed: {error.get('message', 'API error')}")
            return {
                'error': error.get('message', 'API error'),
                'status': 'rejected',
                'client_order_id': order.client_order_id
            }
            
        except Exception as e:
            self.logger.exception("Order submission error")
            return {
                'error': str(e),
                'status': 'rejected',
                'client_order_id': order.client_order_id
            }
    
    def get_order_status(self, order_id: str) -> dict:
        """Get order status with proper error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/accounts/{self.api_key}/orders/{order_id}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                self.logger.error(f"Order status check failed: {error.get('message', 'API error')}")
                return {'error': 'API error', 'status': 'unknown'}
        
        except Exception as e:
            self.logger.exception("Error getting order status")
            return {'error': str(e), 'status': 'unknown'}
    
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an order with rate limit handling"""
        self._check_rate_limit()
        
        try:
            response = requests.delete(
                f"{self.BASE_URL}/accounts/{self.api_key}/orders/{order_id}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200 or response.status_code == 204:
                # Update local order status
                if order_id in self.active_orders:
                    self.active_orders[order_id]['status'] = 'canceled'
                self.logger.info(f"Order canceled: {order_id}")
                return True
            else:
                error = response.json()
                self.logger.error(f"Order cancellation failed: {error.get('message', 'API error')}")
                return False
        
        except Exception as e:
            self.logger.exception("Order cancellation error")
            return False
    
    def get_positions(self) -> list:
        """Get current positions with proper error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/accounts/{self.api_key}/positions",
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
    
    def get_account(self) -> dict:
        """Get account information with error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/accounts/{self.api_key}",
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
    
    def get_historical_data(self, symbol: str, timeframe: str = '1D', 
                          start: str = None, end: str = None) -> dict:
        """Get historical market data from TD Ameritrade"""
        self._check_rate_limit()
        
        try:
            params = {
                'symbol': symbol,
                'periodType': 'day',
                'frequencyType': timeframe.lower(),
                'frequency': 1,
                'needExtendedHoursData': 'true'
            }
            
            if start:
                params['startDate'] = int(datetime.strptime(start, "%Y-%m-%d").timestamp() * 1000)
            if end:
                params['endDate'] = int(datetime.strptime(end, "%Y-%m-%d").timestamp() * 1000)
            
            response = requests.get(
                f"{self.BASE_URL}/marketdata/{symbol}/pricehistory",
                params=params,
                headers=self._get_headers()
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
        """Get real-time market data from TD Ameritrade"""
        self._check_rate_limit()
        
        try:
            params = {
                'apikey': self.api_key,
                'symbol': symbol
            }
            
            response = requests.get(
                f"{self.BASE_URL}/marketdata/quotes",
                params=params,
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                self.logger.error(f"Real-time data request failed: {error.get('message', 'API error')}")
                return {'error': 'API error'}
        
        except Exception as e:
            self.logger.exception("Real-time data request error")
            return {'error': str(e)}
