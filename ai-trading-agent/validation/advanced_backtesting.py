import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
import warnings
from loguru import logger
warnings.filterwarnings('ignore')

class AdvancedBacktestingEngine:
    def __init__(self, initial_capital: float = 100000):
        self.initial_capital = initial_capital
        self.transaction_cost = 0.001  # 0.1%
        self.slippage = 0.002  # 0.2%
        self.results = {}
        logger.info(f"AdvancedBacktestingEngine initialized with ${initial_capital:,} capital.")
    
    async def backtest_strategy(self, historical_data: pd.DataFrame, 
                               signals: List[Dict], strategy_name: str) -> Dict:
        """Comprehensive strategy backtesting with advanced metrics"""
        logger.info(f"Starting backtest for strategy: {strategy_name}")
        
        portfolio_value = self.initial_capital
        positions = {}
        trades = []
        portfolio_values = [portfolio_value]
        
        # Ensure data index is datetime
        if not isinstance(historical_data.index, pd.DatetimeIndex):
            historical_data.index = pd.to_datetime(historical_data.index)

        for i, signal in enumerate(signals):
            if i >= len(historical_data) - 1:
                break
                
            current_data = historical_data.iloc[i]
            # Execute trades based on signals
            trade_result = await self._execute_trade(signal, positions, current_data, portfolio_value)
            
            if trade_result['executed']:
                positions = trade_result['updated_positions']
                portfolio_value = trade_result['updated_portfolio']
                trades.append(trade_result['trade_record'])
            
            # Simple mark-to-market for portfolio tracking (not accounting for mid-bar fluctuations)
            portfolio_values.append(portfolio_value)
        
        # Calculate performance metrics
        performance = self._calculate_performance_metrics(portfolio_values, trades, historical_data)
        risk_metrics = self._calculate_risk_metrics(portfolio_values, trades)
        
        self.results[strategy_name] = {
            'performance': performance,
            'risk_metrics': risk_metrics,
            'trades': trades,
            'final_portfolio': portfolio_value
        }
        
        logger.info(f"Backtest complete. Final Value: ${portfolio_value:,.2f} | Returns: {performance['total_return_pct']:.2f}%")
        return self.results[strategy_name]
    
    async def _execute_trade(self, signal: Dict, positions: Dict, 
                           current_data: pd.Series, portfolio_value: float) -> Dict:
        """Execute a single trade with realistic market conditions"""
        
        symbol = signal.get('symbol', 'ASSET')
        current_price = current_data['close']
        
        # Calculate position size with risk management (e.g., 10% of portfolio)
        position_size = self._calculate_position_size(signal, portfolio_value, current_price)
        
        rec = signal.get('recommendation', 'HOLD').upper()
        
        if rec in ['BUY', 'STRONG_BUY']:
            # Buy logic
            execution_price = current_price * (1 + self.slippage)
            cost = position_size * execution_price * (1 + self.transaction_cost)
            
            if portfolio_value >= cost and position_size > 0:
                positions[symbol] = {
                    'size': position_size,
                    'entry_price': execution_price,
                    'entry_timestamp': current_data.name
                }
                
                trade_record = {
                    'symbol': symbol,
                    'action': 'BUY',
                    'size': position_size,
                    'price': execution_price,
                    'cost': cost,
                    'timestamp': current_data.name
                }
                
                return {
                    'executed': True,
                    'updated_positions': positions,
                    'updated_portfolio': portfolio_value - cost,
                    'trade_record': trade_record
                }
        
        elif rec in ['SELL', 'STRONG_SELL'] and symbol in positions:
            # Sell logic
            position = positions.pop(symbol)
            execution_price = current_price * (1 - self.slippage)
            revenue = position['size'] * execution_price * (1 - self.transaction_cost)
            
            trade_record = {
                'symbol': symbol,
                'action': 'SELL',
                'size': position['size'],
                'price': execution_price,
                'revenue': revenue,
                'pnl': revenue - (position['size'] * position['entry_price']),
                'holding_period': (current_data.name - position['entry_timestamp']).days if hasattr(current_data.name, 'days') else 1,
                'timestamp': current_data.name
            }
            
            return {
                'executed': True,
                'updated_positions': positions,
                'updated_portfolio': portfolio_value + revenue,
                'trade_record': trade_record
            }
        
        return {'executed': False, 'updated_positions': positions, 'updated_portfolio': portfolio_value}

    def _calculate_position_size(self, signal: Dict, portfolio: float, price: float) -> float:
        """Calculate recommended position size (10% standard)"""
        if price <= 0: return 0
        target_allocation = portfolio * 0.1
        return target_allocation / price
    
    def _calculate_performance_metrics(self, portfolio_values: List[float], 
                                     trades: List[Dict], historical_data: pd.DataFrame) -> Dict:
        """Calculate comprehensive performance metrics"""
        
        returns = pd.Series(portfolio_values).pct_change().dropna()
        
        # Basic metrics
        total_return = (portfolio_values[-1] / portfolio_values[0] - 1) * 100
        # Annualized return assuming daily data (252 days)
        ann_factor = 252 / len(returns) if len(returns) > 0 else 1
        annualized_return = ((portfolio_values[-1] / portfolio_values[0]) ** ann_factor) - 1
        
        volatility = returns.std() * np.sqrt(252) if len(returns) > 1 else 0
        sharpe_ratio = (annualized_return - 0.02) / volatility if volatility > 0 else 0
        
        # Advanced metrics
        max_drawdown = self._calculate_max_drawdown(portfolio_values)
        calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown != 0 else 0
        sortino_ratio = self._calculate_sortino_ratio(returns)
        
        # Trade analysis
        winning_trades = [t for t in trades if t.get('pnl', 0) > 0]
        win_rate = len(winning_trades) / len(trades) if trades else 0
        avg_win = np.mean([t['pnl'] for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t['pnl'] for t in trades if t.get('pnl', 0) < 0]) if any(t.get('pnl', 0) < 0 for t in trades) else 0
        profit_factor = abs(avg_win / avg_loss) if avg_loss != 0 else float('inf')
        
        return {
            'total_return_pct': total_return,
            'annualized_return': annualized_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown_pct': max_drawdown * 100,
            'calmar_ratio': calmar_ratio,
            'sortino_ratio': sortino_ratio,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'total_trades': len(trades),
            'winning_trades': len(winning_trades),
            'avg_trade_return': np.mean([t.get('pnl', 0) for t in trades]) if trades else 0
        }

    def _calculate_max_drawdown(self, values: List[float]) -> float:
        v = np.array(values)
        i = np.argmax(np.maximum.accumulate(v) - v) # index of end of drawdown
        if len(v) == 0: return 0
        peak = np.max(v[:i+1])
        return (v[i] - peak) / peak if peak != 0 else 0

    def _calculate_sortino_ratio(self, returns: pd.Series, target: float = 0) -> float:
        downside_returns = returns[returns < target]
        if len(downside_returns) < 2: return 0
        downside_std = downside_returns.std() * np.sqrt(252)
        ann_return = returns.mean() * 252
        return (ann_return - target) / downside_std if downside_std > 0 else 0

    def _calculate_risk_metrics(self, portfolio_values: List[float], trades: List[Dict]) -> Dict:
        """Calculate supplementary risk metrics"""
        return {
            "final_value": portfolio_values[-1],
            "max_exposure": 0.1 # Static for this simple implementation
        }
