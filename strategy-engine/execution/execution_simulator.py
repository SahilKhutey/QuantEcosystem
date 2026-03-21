import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import asyncio
from dataclasses import dataclass
from enum import Enum

class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderStatus(Enum):
    PENDING = "pending"
    EXECUTED = "executed"
    PARTIALLY_EXECUTED = "partially_executed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

@dataclass
class Order:
    order_id: str
    symbol: str
    order_type: OrderType
    side: str  # Added: "buy" or "sell"
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    limit_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = None
    executed_at: Optional[datetime] = None
    executed_price: Optional[float] = None
    executed_quantity: float = 0

class ExecutionSimulator:
    def __init__(self):
        self.orders = {}
        self.positions = {}
        self.cash_balance = 1000000  # Starting cash
        self.transaction_history = []
        
    def place_order(self, order: Order) -> str:
        """Place a new order"""
        if order.created_at is None:
            order.created_at = datetime.utcnow()
        
        self.orders[order.order_id] = order
        return order.order_id
    
    async def execute_orders(self, market_prices: Dict[str, float]):
        """Execute pending orders based on market prices"""
        executed_orders = []
        
        for order_id, order in list(self.orders.items()):
            if order.status != OrderStatus.PENDING:
                continue
            
            symbol = order.symbol
            if symbol not in market_prices:
                continue
            
            current_price = market_prices[symbol]
            executed = False
            
            if order.order_type == OrderType.MARKET:
                # Market order executes immediately
                executed_price = current_price
                executed = True
                
            elif order.order_type == OrderType.LIMIT:
                # Limit order executes if price is better
                if order.side == "buy" and current_price <= order.limit_price:
                    executed_price = min(current_price, order.limit_price)
                    executed = True
                elif order.side == "sell" and current_price >= order.limit_price:
                    executed_price = max(current_price, order.limit_price)
                    executed = True
                    
            elif order.order_type == OrderType.STOP:
                # Stop order becomes market order when triggered
                if order.side == "buy" and current_price >= order.stop_price:
                    executed_price = current_price
                    executed = True
                elif order.side == "sell" and current_price <= order.stop_price:
                    executed_price = current_price
                    executed = True
            
            if executed:
                # Update order status
                order.status = OrderStatus.EXECUTED
                order.executed_at = datetime.utcnow()
                order.executed_price = executed_price
                order.executed_quantity = order.quantity
                
                # Update positions
                self._update_positions(order, executed_price)
                
                # Update cash balance
                self._update_cash_balance(order, executed_price)
                
                # Record transaction
                self._record_transaction(order, executed_price)
                
                executed_orders.append(order_id)
        
        return executed_orders
    
    def _update_positions(self, order: Order, executed_price: float):
        """Update portfolio positions"""
        symbol = order.symbol
        
        if symbol not in self.positions:
            self.positions[symbol] = {
                'quantity': 0,
                'avg_price': 0,
                'total_cost': 0,
                'current_value': 0
            }
        
        position = self.positions[symbol]
        
        if order.side == "buy":
            # Calculate new average price
            total_quantity = position['quantity'] + order.quantity
            total_cost = position['total_cost'] + (order.quantity * executed_price)
            
            position['quantity'] = total_quantity
            position['avg_price'] = total_cost / total_quantity if total_quantity > 0 else 0
            position['total_cost'] = total_cost
            
        elif order.side == "sell":
            # Reduce position
            if position['quantity'] >= order.quantity:
                position['quantity'] -= order.quantity
                
                # Update average price using FIFO
                if position['quantity'] == 0:
                    position['avg_price'] = 0
                    position['total_cost'] = 0
                else:
                    # Simplified: reduce cost proportionally
                    position['total_cost'] *= (position['quantity'] / 
                                             (position['quantity'] + order.quantity))
        
        # Update current value
        position['current_value'] = position['quantity'] * executed_price
    
    def _update_cash_balance(self, order: Order, executed_price: float):
        """Update cash balance after order execution"""
        transaction_value = order.quantity * executed_price
        
        if order.side == "buy":
            self.cash_balance -= transaction_value
        elif order.side == "sell":
            self.cash_balance += transaction_value
        
        # Apply commission (0.1%)
        commission = transaction_value * 0.001
        self.cash_balance -= commission
    
    def _record_transaction(self, order: Order, executed_price: float):
        """Record transaction in history"""
        transaction = {
            'transaction_id': f"txn_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}",
            'order_id': order.order_id,
            'symbol': order.symbol,
            'side': order.side,
            'quantity': order.quantity,
            'price': executed_price,
            'value': order.quantity * executed_price,
            'commission': order.quantity * executed_price * 0.001,
            'timestamp': datetime.utcnow(),
            'order_type': order.order_type.value
        }
        
        self.transaction_history.append(transaction)
    
    def get_portfolio_summary(self, market_prices: Dict[str, float]) -> Dict:
        """Get current portfolio summary"""
        total_value = self.cash_balance
        positions_value = 0
        positions = []
        
        for symbol, position in self.positions.items():
            if symbol in market_prices:
                current_price = market_prices[symbol]
                position_value = position['quantity'] * current_price
                
                # Calculate P&L
                cost_basis = position['total_cost']
                unrealized_pnl = position_value - cost_basis
                unrealized_pnl_pct = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0
                
                positions.append({
                    'symbol': symbol,
                    'quantity': position['quantity'],
                    'avg_price': position['avg_price'],
                    'current_price': current_price,
                    'position_value': position_value,
                    'unrealized_pnl': unrealized_pnl,
                    'unrealized_pnl_pct': unrealized_pnl_pct,
                    'weight': 0  # Will calculate below
                })
                
                positions_value += position_value
                total_value += position_value
        
        # Calculate weights
        for position in positions:
            if positions_value > 0:
                position['weight'] = (position['position_value'] / positions_value) * 100
        
        # Calculate overall metrics
        total_invested = sum(p['avg_price'] * p['quantity'] for p in positions)
        total_pnl = sum(p['unrealized_pnl'] for p in positions)
        total_pnl_pct = (total_pnl / total_invested * 100) if total_invested > 0 else 0
        
        return {
            'cash_balance': self.cash_balance,
            'positions_value': positions_value,
            'total_value': total_value,
            'total_invested': total_invested,
            'total_unrealized_pnl': total_pnl,
            'total_unrealized_pnl_pct': total_pnl_pct,
            'positions': positions,
            'position_count': len(positions),
            'cash_percentage': (self.cash_balance / total_value * 100) if total_value > 0 else 100,
            'invested_percentage': (positions_value / total_value * 100) if total_value > 0 else 0
        }
    
    def simulate_strategy_execution(self, strategy_signals: pd.Series,
                                  initial_capital: float,
                                  symbol: str,
                                  prices: pd.Series) -> Dict:
        """Simulate execution of trading strategy"""
        self.cash_balance = initial_capital
        self.positions = {}
        self.orders = {}
        self.transaction_history = []
        
        portfolio_values = []
        trades = []
        
        for i in range(1, len(strategy_signals)):
            current_signal = strategy_signals.iloc[i]
            prev_signal = strategy_signals.iloc[i-1]
            current_price = prices.iloc[i]
            date = prices.index[i]
            
            # Check for signal change
            if current_signal != prev_signal:
                if current_signal == 1:  # Buy signal
                    # Calculate position size (use all cash)
                    if self.cash_balance > 0:
                        quantity = self.cash_balance / current_price
                        
                        order = Order(
                            order_id=f"order_{date.strftime('%Y%m%d%H%M%S')}",
                            symbol=symbol,
                            order_type=OrderType.MARKET,
                            side="buy",
                            quantity=quantity,
                            price=current_price
                        )
                        
                        self.place_order(order)
                        self._simulate_order_execution(order, current_price)
                        
                        trades.append({
                            'date': date,
                            'action': 'BUY',
                            'price': current_price,
                            'quantity': quantity,
                            'value': quantity * current_price
                        })
                        
                elif current_signal == -1:  # Sell signal
                    if symbol in self.positions and self.positions[symbol]['quantity'] > 0:
                        quantity = self.positions[symbol]['quantity']
                        
                        order = Order(
                            order_id=f"order_{date.strftime('%Y%m%d%H%M%S')}",
                            symbol=symbol,
                            order_type=OrderType.MARKET,
                            side="sell",
                            quantity=quantity,
                            price=current_price
                        )
                        
                        self.place_order(order)
                        self._simulate_order_execution(order, current_price)
                        
                        trades.append({
                            'date': date,
                            'action': 'SELL',
                            'price': current_price,
                            'quantity': quantity,
                            'value': quantity * current_price
                        })
            
            # Calculate portfolio value
            portfolio_value = self.cash_balance
            if symbol in self.positions:
                portfolio_value += self.positions[symbol]['quantity'] * current_price
            
            portfolio_values.append({
                'date': date,
                'value': portfolio_value,
                'cash': self.cash_balance,
                'position': self.positions.get(symbol, {}).get('quantity', 0)
            })
        
        # Calculate performance metrics
        final_value = portfolio_values[-1]['value'] if portfolio_values else initial_capital
        total_return = (final_value / initial_capital - 1) * 100
        
        # Calculate trade metrics
        if trades:
            winning_trades = sum(1 for trade in trades if trade['action'] == 'SELL')
            total_trades = len([t for t in trades if t['action'] == 'SELL'])
            win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        else:
            win_rate = 0
        
        return {
            'initial_capital': initial_capital,
            'final_value': final_value,
            'total_return': total_return,
            'total_trades': len(trades),
            'win_rate': win_rate,
            'trades': trades,
            'portfolio_values': portfolio_values,
            'cash_balance': self.cash_balance,
            'positions': self.positions
        }
    
    def _simulate_order_execution(self, order: Order, price: float):
        """Simulate order execution"""
        order.status = OrderStatus.EXECUTED
        order.executed_at = datetime.utcnow()
        order.executed_price = price
        order.executed_quantity = order.quantity
        
        self._update_positions(order, price)
        self._update_cash_balance(order, price)
        self._record_transaction(order, price)
