import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass
from services.data.market_data_service import MarketDataService

@dataclass
class BacktestResult:
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    total_trades: int
    winning_trades: int
    trades: List[Dict]
    equity_curve: pd.Series
    metrics: Dict

class AdvancedBacktester:
    def __init__(self, market_data: MarketDataService):
        self.market_data = market_data
        self.logger = logging.getLogger('Backtester')
    
    async def backtest_strategy(self, 
                              strategy, 
                              symbol: str,
                              start_date: str,
                              end_date: str,
                              initial_capital: float = 100000) -> BacktestResult:
        """Run a comprehensive backtest for a trading strategy"""
        # Get historical data
        historical_data = await self.market_data.get_historical_data(
            symbol=symbol,
            start=start_date,
            end=end_date
        )
        
        if historical_data.empty:
            raise ValueError("No historical data available for backtesting")
        
        # Initialize backtest parameters
        portfolio_value = initial_capital
        positions = {}
        trades = []
        equity_curve = [initial_capital]
        current_date = historical_data.index[0]
        
        # Run strategy on historical data
        for i in range(len(historical_data)):
            current_data = historical_data.iloc[i]
            current_date = historical_data.index[i]
            
            # Generate signal
            # Note: Strategy should have a generate_signal method
            signal = strategy.generate_signal(
                historical_data[:i+1], 
                current_data
            )
            
            # Execute trades based on signal
            if signal['action'] in ['BUY', 'SELL'] and 'quantity' in signal:
                trade = self._execute_trade(
                    signal, 
                    current_data, 
                    portfolio_value, 
                    positions,
                    current_date
                )
                
                if trade:
                    trades.append(trade)
                    
                    # Update portfolio value
                    # In a simple backtest, we might calculate profit on close
                    if signal['action'] == 'SELL' and 'profit' in trade:
                         portfolio_value += trade['profit']
                    
                    # Update positions
                    # positions = trade.get('updated_positions', positions) # Handled in _execute_trade
            
            # Update equity curve
            equity_curve.append(portfolio_value)
        
        # Calculate performance metrics
        metrics = self._calculate_performance_metrics(
            equity_curve, 
            trades, 
            initial_capital
        )
        
        return BacktestResult(
            total_return=metrics['total_return'],
            annualized_return=metrics['annualized_return'],
            volatility=metrics['volatility'],
            sharpe_ratio=metrics['sharpe_ratio'],
            max_drawdown=metrics['max_drawdown'],
            win_rate=metrics['win_rate'],
            profit_factor=metrics['profit_factor'],
            total_trades=metrics['total_trades'],
            winning_trades=metrics['winning_trades'],
            trades=trades,
            equity_curve=pd.Series(equity_curve[1:], index=historical_data.index),
            metrics=metrics
        )
    
    def _execute_trade(self, signal: Dict, current_data: pd.Series, 
                      portfolio_value: float, positions: Dict, 
                      current_date: pd.Timestamp) -> Optional[Dict]:
        """Execute a trade based on signal"""
        if signal['action'] == 'BUY':
            # Calculate position size (simplified)
            position_size = self._calculate_position_size(
                portfolio_value, 
                signal.get('confidence', 1.0)
            )
            
            # Execute trade
            trade = {
                'symbol': signal['symbol'],
                'action': 'BUY',
                'quantity': position_size,
                'entry_price': current_data['close'],
                'entry_date': current_date,
                'confidence': signal.get('confidence', 1.0)
            }
            
            # Update positions
            if signal['symbol'] in positions:
                # Average styling
                old_qty = positions[signal['symbol']]['quantity']
                old_price = positions[signal['symbol']]['entry_price']
                new_qty = old_qty + position_size
                new_price = ((old_qty * old_price) + (position_size * current_data['close'])) / new_qty
                positions[signal['symbol']] = {'quantity': new_qty, 'entry_price': new_price}
            else:
                positions[signal['symbol']] = {'quantity': position_size, 'entry_price': current_data['close']}
            
            return trade
        
        elif signal['action'] == 'SELL' and signal['symbol'] in positions:
            # Calculate position to close
            quantity = positions[signal['symbol']]['quantity']
            entry_price = positions[signal['symbol']]['entry_price']
            exit_price = current_data['close']
            
            # Calculate profit
            profit = (exit_price - entry_price) * quantity
            
            # Execute trade
            trade = {
                'symbol': signal['symbol'],
                'action': 'SELL',
                'quantity': quantity,
                'entry_price': entry_price,
                'exit_price': exit_price,
                'entry_date': None, # In a real backtester, track entry date
                'exit_date': current_date,
                'profit': profit,
                'confidence': signal.get('confidence', 1.0)
            }
            
            # Update positions
            del positions[signal['symbol']]
            
            return trade
        
        return None
    
    def _calculate_position_size(self, portfolio_value: float, confidence: float) -> int:
        """Calculate position size based on portfolio value and confidence"""
        # Simplified position sizing
        risk_per_trade = 0.01 * portfolio_value  # 1% risk per trade
        # Assuming 2% stop loss for size calculation
        position_size = int(risk_per_trade / (0.02 * (portfolio_value/1000 or 1)) * confidence)
        
        # Ensure minimum trade size
        return max(1, position_size)
    
    def _calculate_performance_metrics(self, 
                                     equity_curve: List[float], 
                                     trades: List[Dict],
                                     initial_capital: float) -> Dict:
        """Calculate comprehensive performance metrics"""
        # Convert to Series for easier calculations
        equity = pd.Series(equity_curve)
        
        # Basic metrics
        total_return = (equity.iloc[-1] - initial_capital) / initial_capital
        n_days = len(equity)
        annualized_return = (1 + total_return) ** (365 / max(1, n_days)) - 1
        
        # Risk metrics
        returns = equity.pct_change().dropna()
        volatility = returns.std() * np.sqrt(252)  # Annualized volatility
        sharpe_ratio = (annualized_return - 0.02) / volatility if volatility > 0 else 0
        
        # Drawdown calculation
        cumulative_max = equity.cummax()
        drawdown = (cumulative_max - equity) / cumulative_max
        max_drawdown = drawdown.max()
        
        # Trade statistics
        winning_trades = [t for t in trades if t.get('profit', 0) > 0]
        win_rate = len(winning_trades) / len(trades) if len(trades) > 0 else 0
        profit_factor = self._calculate_profit_factor(trades)
        
        return {
            'total_return': total_return,
            'annualized_return': annualized_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'total_trades': len(trades),
            'winning_trades': len(winning_trades),
            'total_profit': equity.iloc[-1] - initial_capital
        }
    
    def _calculate_profit_factor(self, trades: List[Dict]) -> float:
        """Calculate profit factor (total gains / total losses)"""
        gains = [t.get('profit', 0) for t in trades if t.get('profit', 0) > 0]
        losses = [-t.get('profit', 0) for t in trades if t.get('profit', 0) < 0]
        
        if not gains or not losses:
            return float('inf') if gains else 0
        
        return sum(gains) / sum(losses)
