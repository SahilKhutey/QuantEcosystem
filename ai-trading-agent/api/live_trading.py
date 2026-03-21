import pandas as pd
from typing import Dict, List, Optional, Any
from loguru import logger

class LiveTradingInterface:
    def __init__(self, broker_api=None):
        self.broker = broker_api
        self.order_history = []
        logger.info("LiveTradingInterface initialized")
        
    async def execute_trade(self, signal: Dict, risk_approval: Dict):
        """Execute trade through broker API"""
        if not risk_approval.get('is_valid', False):
            logger.warning(f"Trade rejected by risk manager: {risk_approval.get('violations')}")
            return {'error': 'Risk validation failed', 'violations': risk_approval.get('violations')}
        
        try:
            symbol = signal.get('symbol')
            price = signal.get('price', 1.0) # Fallback to 1.0 for dummy math
            recommendation = signal.get('recommendation', 'HOLD')
            quantity = risk_approval['allowed_position_size'] / price
            
            logger.info(f"Executing {recommendation} order for {symbol} | Quantity: {quantity:.4f}")

            # Simulated broker interaction
            if self.broker:
                order_result = await self.broker.place_order(
                    symbol=symbol,
                    quantity=quantity,
                    order_type='MARKET',
                    side='BUY' if recommendation in ['BUY', 'STRONG_BUY'] else 'SELL'
                )
            else:
                # Mock order result
                order_result = {
                    'order_id': f"ord_{pd.Timestamp.now().timestamp()}",
                    'status': 'FILLED',
                    'symbol': symbol,
                    'quantity': quantity,
                    'price': price,
                    'timestamp': str(pd.Timestamp.now())
                }
            
            self.order_history.append({
                'timestamp': pd.Timestamp.now(),
                'signal': signal,
                'order_result': order_result,
                'risk_approval': risk_approval
            })
            
            return order_result
            
        except Exception as e:
            logger.error(f"Execution failed: {e}")
            return {'error': str(e)}

    def get_order_history(self) -> List[Dict]:
        return self.order_history
