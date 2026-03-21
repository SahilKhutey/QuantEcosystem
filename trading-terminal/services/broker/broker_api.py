import aiohttp
import asyncio
import logging
from typing import Dict, List, Optional

class BrokerAPI:
    def __init__(self, api_key: str, api_secret: str, base_url: str = "https://api.alpaca.markets"):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url
        self.session = None
        self.logger = logging.getLogger('BrokerAPI')
        
    async def _create_session(self):
        """Create HTTP session if not exists"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    'APCA-API-KEY-ID': self.api_key,
                    'APCA-API-SECRET-KEY': self.api_secret
                }
            )
    
    async def get_account(self) -> Dict:
        """Get account information"""
        await self._create_session()
        
        try:
            async with self.session.get(f"{self.base_url}/v2/account") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.json()
                    self.logger.error(f"Failed to get account: {error}")
                    return None
        except Exception as e:
            self.logger.error(f"Error getting account: {str(e)}")
            return None
    
    async def get_positions(self) -> List[Dict]:
        """Get current positions"""
        await self._create_session()
        
        try:
            async with self.session.get(f"{self.base_url}/v2/positions") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.json()
                    self.logger.error(f"Failed to get positions: {error}")
                    return []
        except Exception as e:
            self.logger.error(f"Error getting positions: {str(e)}")
            return []
    
    async def submit_order(self, symbol: str, qty: int, side: str, 
                         order_type: str = "market", 
                         time_in_force: str = "day") -> Dict:
        """Submit a new order"""
        await self._create_session()
        
        payload = {
            "symbol": symbol,
            "qty": qty,
            "side": side,
            "type": order_type,
            "time_in_force": time_in_force
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/v2/orders", 
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.json()
                    self.logger.error(f"Failed to submit order: {error}")
                    return {"error": error}
        except Exception as e:
            self.logger.error(f"Error submitting order: {str(e)}")
            return {"error": str(e)}
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an existing order"""
        await self._create_session()
        
        try:
            async with self.session.delete(
                f"{self.base_url}/v2/orders/{order_id}"
            ) as response:
                return response.status == 204
        except Exception as e:
            self.logger.error(f"Error canceling order: {str(e)}")
            return False
    
    async def close_position(self, symbol: str) -> bool:
        """Close a position for a symbol"""
        await self._create_session()
        
        try:
            async with self.session.delete(
                f"{self.base_url}/v2/positions/{symbol}"
            ) as response:
                return response.status == 200
        except Exception as e:
            self.logger.error(f"Error closing position: {str(e)}")
            return False
    
    async def get_order_status(self, order_id: str) -> Dict:
        """Get status of an order"""
        await self._create_session()
        
        try:
            async with self.session.get(
                f"{self.base_url}/v2/orders/{order_id}"
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.json()
                    self.logger.error(f"Failed to get order status: {error}")
                    return {"error": error}
        except Exception as e:
            self.logger.error(f"Error getting order status: {str(e)}")
            return {"error": str(e)}
    
    async def close(self):
        """Close the HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None
