import asyncio
import logging
from typing import Dict, Optional, List
from dataclasses import dataclass
import pandas as pd
from services.broker.broker_api import BrokerAPI

@dataclass
class OrderRequest:
    symbol: str
    action: str  # "BUY" or "SELL"
    quantity: int
    order_type: str = "market"
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "day"
    risk_adjusted: bool = False
    confidence: float = 0.0

@dataclass
class OrderExecutionResult:
    success: bool
    order_id: Optional[str] = None
    filled_quantity: int = 0
    avg_price: Optional[float] = None
    error: Optional[str] = None
    timestamp: pd.Timestamp = pd.Timestamp.now()

class OrderExecutionService:
    def __init__(self, broker_api: BrokerAPI):
        self.broker = broker_api
        self.active_orders = {}
        self.execution_history = []
        self.logger = logging.getLogger('OrderExecution')
    
    async def execute_order(self, request: OrderRequest) -> OrderExecutionResult:
        """Execute a trading order"""
        try:
            # Validate order
            validation = await self._validate_order(request)
            if not validation['valid']:
                return OrderExecutionResult(
                    success=False,
                    error=f"Order validation failed: {validation['reason']}"
                )
            
            # Convert to broker order format
            broker_side = "buy" if request.action == "BUY" else "sell"
            
            # Submit order to broker
            if request.order_type == "market":
                order_response = await self.broker.submit_order(
                    symbol=request.symbol,
                    qty=request.quantity,
                    side=broker_side,
                    order_type=request.order_type,
                    time_in_force=request.time_in_force
                )
            elif request.order_type == "limit":
                order_response = await self.broker.submit_order(
                    symbol=request.symbol,
                    qty=request.quantity,
                    side=broker_side,
                    order_type=request.order_type,
                    time_in_force=request.time_in_force
                    # Note: Original code missing limit_price mapping in BrokerAPI.submit_order
                )
            elif request.order_type == "stop":
                order_response = await self.broker.submit_order(
                    symbol=request.symbol,
                    qty=request.quantity,
                    side=broker_side,
                    order_type=request.order_type,
                    time_in_force=request.time_in_force
                    # Note: Original code missing stop_price mapping in BrokerAPI.submit_order
                )
            else:
                return OrderExecutionResult(
                    success=False,
                    error=f"Unsupported order type: {request.order_type}"
                )
            
            # Process response
            if "error" in order_response:
                return OrderExecutionResult(
                    success=False,
                    error=order_response["error"]
                )
            
            # Monitor order execution
            execution = await self._monitor_order_execution(
                order_response["id"],
                request
            )
            
            # Add to execution history
            self.execution_history.append({
                **execution.__dict__,
                "request": request.__dict__
            })
            
            return execution
            
        except Exception as e:
            self.logger.error(f"Order execution failed: {str(e)}")
            return OrderExecutionResult(
                success=False,
                error=str(e)
            )
    
    async def _validate_order(self, request: OrderRequest) -> Dict:
        """Validate order before execution"""
        # Check account status
        account = await self.broker.get_account()
        if not account or account.get('status') != 'ACTIVE':
            return {"valid": False, "reason": "Account not active"}
        
        # Check for sufficient buying power
        if request.action == "BUY":
            if float(account.get('buying_power', 0)) <= 0:
                return {"valid": False, "reason": "Insufficient buying power"}
            
            # Calculate estimated cost
            price = request.price if request.order_type == "limit" else None
            if not price:
                # Get current price
                # (In production, get this from real-time data)
                price = 100.0
                
            estimated_cost = request.quantity * price
            if estimated_cost > float(account['buying_power']):
                return {"valid": False, "reason": "Insufficient funds"}
        
        # Check position limits
        positions = await self.broker.get_positions()
        current_position = next(
            (p for p in positions if p['symbol'] == request.symbol), 
            None
        )
        
        # Validate quantity
        if request.quantity <= 0:
            return {"valid": False, "reason": "Invalid quantity"}
        
        # Risk management checks
        if request.risk_adjusted:
            # Apply risk management rules
            max_position_size = float(account['equity']) * 0.1  # 10% of equity
            if (request.price or 100.0) * request.quantity > max_position_size:
                return {"valid": False, "reason": "Position size exceeds risk limits"}
        
        return {"valid": True}
    
    async def _monitor_order_execution(self, order_id: str, request: OrderRequest) -> OrderExecutionResult:
        """Monitor order until filled or canceled"""
        start_time = pd.Timestamp.now()
        max_wait = 30  # seconds
        
        while pd.Timestamp.now() - start_time < pd.Timedelta(seconds=max_wait):
            order_status = await self.broker.get_order_status(order_id)
            
            if "error" in order_status:
                return OrderExecutionResult(
                    success=False,
                    error=order_status["error"],
                    order_id=order_id
                )
            
            if order_status['status'] == 'filled':
                return OrderExecutionResult(
                    success=True,
                    order_id=order_id,
                    filled_quantity=order_status['filled_qty'],
                    avg_price=float(order_status['filled_avg_price']),
                    timestamp=pd.Timestamp.now()
                )
            
            if order_status['status'] == 'canceled':
                return OrderExecutionResult(
                    success=False,
                    error="Order was canceled",
                    order_id=order_id
                )
            
            if order_status['status'] == 'rejected':
                return OrderExecutionResult(
                    success=False,
                    error=order_status.get('reject_reason', 'Order rejected'),
                    order_id=order_id
                )
            
            await asyncio.sleep(0.5)  # Check every 500ms
        
        # Timeout - attempt to cancel
        await self.broker.cancel_order(order_id)
        return OrderExecutionResult(
            success=False,
            error="Order execution timed out",
            order_id=order_id
        )
    
    async def get_execution_history(self, limit: int = 10) -> List[Dict]:
        """Get recent execution history"""
        return self.execution_history[-limit:] if self.execution_history else []
