import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from loguru import logger

class AdvancedBacktestingEngine:
    def __init__(self, initial_capital: float = 100000.0):
        self.initial_capital = initial_capital
        self.transaction_cost = 0.001  # 0.1%
        self.slippage = 0.002  # 0.2%
        
    async def backtest_agent_strategy(self, historical_data: pd.DataFrame,
                                    agent_decisions: List[Dict]) -> Dict:
        """Backtest the AI agent's trading strategy"""
        
        portfolio_value = self.initial_capital
        positions = {}
        trades = []
        equity_curve = [portfolio_value]
        
        logger.info(f"Starting backtest with {len(agent_decisions)} decisions...")

        for i, decision in enumerate(agent_decisions):
            # Map index if historical data is longer
            if i >= len(historical_data) - 1:
                break
                
            current_price = historical_data.iloc[i]['close']
            symbol = decision.get('symbol', 'UNKNOWN')
            signal = decision.get('signal', 'HOLD')
            confidence = decision.get('confidence', 0.5)
            
            # Execute trades with transaction costs
            if signal in ['BUY', 'STRONG_BUY']:
                if symbol not in positions:
                    # Calculate position size based on confidence
                    position_size = self._calculate_position_size(portfolio_value, confidence, current_price)
                    
                    # Execute buy with slippage
                    execution_price = current_price * (1 + self.slippage)
                    cost = position_size * execution_price * (1 + self.transaction_cost)
                    
                    if portfolio_value >= cost:
                        positions[symbol] = {
                            'size': position_size,
                            'entry_price': execution_price,
                            'entry_time': historical_data.index[i]
                        }
                        portfolio_value -= cost
                        logger.debug(f"BUY {symbol} at {execution_price:.2f}")
                    
            elif signal in ['SELL', 'STRONG_SELL'] and symbol in positions:
                # Execute sell
                position = positions.pop(symbol)
                execution_price = current_price * (1 - self.slippage)
                revenue = position['size'] * execution_price * (1 - self.transaction_cost)
                portfolio_value += revenue
                
                # Record trade
                trade_return = (execution_price - position['entry_price']) / position['entry_price']
                trades.append({
                    'symbol': symbol,
                    'action': 'SELL',
                    'entry_price': position['entry_price'],
                    'exit_price': execution_price,
                    'return_pct': trade_return,
                    'holding_period': (historical_data.index[i] - position['entry_time']).total_seconds() / 3600 # hours
                })
                logger.debug(f"SELL {symbol} at {execution_price:.2f} | Return: {trade_return:.2%}")

            equity_curve.append(portfolio_value + sum(p['size'] * current_price for p in positions.values()))
        
        # Calculate performance metrics
        performance = self._calculate_performance_metrics(trades, portfolio_value, equity_curve)
        return performance

    def _calculate_position_size(self, capital: float, confidence: float, price: float) -> float:
        """Calculate position size using a fraction of capital based on confidence."""
        risk_fraction = 0.1 * confidence # Max 10% of capital per trade
        amount_to_risk = capital * risk_fraction
        return amount_to_risk / price if price > 0 else 0

    def _calculate_performance_metrics(self, trades: List[Dict], final_value: float, equity_curve: List[float]) -> Dict:
        """Calculate key performance indicators."""
        if not trades:
            return {
                'total_return': (final_value / self.initial_capital) - 1,
                'win_rate': 0,
                'sharpe_ratio': 0,
                'max_drawdown': self._calculate_max_drawdown(equity_curve),
                'trade_count': 0
            }

        returns = [t['return_pct'] for t in trades]
        win_rate = len([r for r in returns if r > 0]) / len(returns)
        total_return = (final_value / self.initial_capital) - 1
        
        # Simple Sharpe (ignoring risk-free rate for now)
        avg_return = np.mean(returns)
        std_return = np.std(returns) if len(returns) > 1 else 0
        sharpe = (avg_return / std_return * np.sqrt(252)) if std_return > 0 else 0

        return {
            'total_return': total_return,
            'win_rate': win_rate,
            'sharpe_ratio': sharpe,
            'max_drawdown': self._calculate_max_drawdown(equity_curve),
            'trade_count': len(trades),
            'avg_trade_return': avg_return,
            'final_portfolio_value': final_value
        }

    def _calculate_max_drawdown(self, equity_curve: List[float]) -> float:
        """Calculate maximum drawdown from equity curve."""
        equity = np.array(equity_curve)
        peak = np.maximum.accumulate(equity)
        drawdown = (equity - peak) / peak
        return float(np.min(drawdown))
