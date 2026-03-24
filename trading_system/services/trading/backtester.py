import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import logging
from datetime import datetime
from typing import Dict, List, Optional
from services.trading.strategy import Strategy

logger = logging.getLogger('Backtester')

class Backtester:
    """
    Robust Backtesting Engine for Strategy Validation
    """
    def __init__(self, initial_capital: float = 100000.0):
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.equity_curve = []
        self.trades = []
        self.positions = {}
        self.logger = logger

    def run(self, strategy: Strategy, data: pd.DataFrame):
        """Run backtest on historical data"""
        self.logger.info(f"Starting backtest for {strategy.name} on {len(data)} bars")
        self.equity_curve = [self.initial_capital]
        
        strategy.on_start()
        
        for i in range(len(data)):
            bar = data.iloc[i].to_dict()
            bar['timestamp'] = data.index[i]
            
            # Execute strategy step
            signal = strategy.on_bar(bar)
            
            if signal:
                self._process_signal(signal, bar)
                
            # Update equity
            self._update_equity(bar)
            
        strategy.on_stop()
        return self._generate_report()

    def _process_signal(self, signal: Dict, bar: Dict):
        """Simple execution simulation for backtesting"""
        symbol = signal['symbol']
        side = signal['type']
        price = bar['close']
        
        if side == "BUY" and symbol not in self.positions:
            # Buy maximum shares with 95% of capital (buffer for fees)
            shares = int((self.capital * 0.95) / price)
            if shares > 0:
                cost = shares * price
                self.capital -= cost
                self.positions[symbol] = {'shares': shares, 'entry_price': price}
                self.trades.append({'type': 'BUY', 'price': price, 'shares': shares, 'time': bar['timestamp']})
                self.logger.info(f"BACKTEST BUY: {shares} {symbol} at {price:.2f}")
                
        elif side == "SELL" and symbol in self.positions:
            # Sell all shares
            pos = self.positions[symbol]
            proceeds = pos['shares'] * price
            self.capital += proceeds
            self.trades.append({'type': 'SELL', 'price': price, 'shares': pos['shares'], 'time': bar['timestamp'], 'pnl': proceeds - (pos['shares'] * pos['entry_price'])})
            self.logger.info(f"BACKTEST SELL: {pos['shares']} {symbol} at {price:.2f}")
            del self.positions[symbol]

    def _update_equity(self, bar: Dict):
        """Update total equity including open positions"""
        equity = self.capital
        for symbol, pos in self.positions.items():
            equity += pos['shares'] * bar['close']
        self.equity_curve.append(equity)

    def _generate_report(self):
        """Generate performance metrics and plots"""
        df_equity = pd.Series(self.equity_curve)
        total_return = (self.equity_curve[-1] - self.initial_capital) / self.initial_capital
        
        # Calculate Drawdown
        rolling_max = df_equity.cummax()
        drawdown = (df_equity - rolling_max) / rolling_max
        max_drawdown = drawdown.min()
        
        # Win Rate
        profits = [t['pnl'] for t in self.trades if 'pnl' in t]
        win_rate = len([p for p in profits if p > 0]) / len(profits) if profits else 0
        
        report = {
            'initial_capital': self.initial_capital,
            'final_equity': self.equity_curve[-1],
            'total_return_pct': total_return * 100,
            'max_drawdown_pct': max_drawdown * 100,
            'total_trades': len(self.trades),
            'win_rate_pct': win_rate * 100
        }
        
        self.logger.info(f"BACKTEST COMPLETE: Return: {report['total_return_pct']:.2f}% | Drawdown: {report['max_drawdown_pct']:.2f}%")
        return report

    def plot_results(self, filename: str = "backtest_results.png"):
        """Plot equity curve"""
        plt.figure(figsize=(12, 6))
        plt.plot(self.equity_curve)
        plt.title("Equity Curve")
        plt.xlabel("Bars")
        plt.ylabel("Equity ($)")
        plt.grid(True)
        plt.savefig(filename)
        self.logger.info(f"Results plot saved to {filename}")
