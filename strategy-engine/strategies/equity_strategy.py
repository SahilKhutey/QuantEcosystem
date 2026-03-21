import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
from enum import Enum
import talib

class StrategyType(Enum):
    MOMENTUM = "momentum"
    VALUE = "value"
    GROWTH = "growth"
    SWING = "swing"
    MEAN_REVERSION = "mean_reversion"
    BREAKOUT = "breakout"

class EquityStrategy:
    def __init__(self):
        self.strategies = {
            StrategyType.MOMENTUM: self.momentum_strategy,
            StrategyType.VALUE: self.value_strategy,
            StrategyType.GROWTH: self.growth_strategy,
            StrategyType.SWING: self.swing_strategy,
            StrategyType.MEAN_REVERSION: self.mean_reversion_strategy,
            StrategyType.BREAKOUT: self.breakout_strategy
        }
        
    def momentum_strategy(self, df: pd.DataFrame, 
                         lookback: int = 20,
                         threshold: float = 0.05) -> pd.Series:
        """Momentum trading strategy"""
        # Calculate returns
        returns = df['close'].pct_change(lookback)
        
        # Calculate volume momentum
        volume_sma = df['volume'].rolling(window=lookback).mean()
        volume_ratio = df['volume'] / volume_sma
        
        # Generate signals
        signals = pd.Series(0, index=df.index)
        
        # Buy when price momentum is positive and volume confirms
        buy_condition = (returns > threshold) & (volume_ratio > 1.5)
        signals[buy_condition] = 1
        
        # Sell when momentum reverses
        sell_condition = (returns < -threshold) & (volume_ratio > 1.2)
        signals[sell_condition] = -1
        
        return signals
    
    def value_strategy(self, df: pd.DataFrame,
                      pe_threshold: float = 15,
                      pb_threshold: float = 2,
                      dividend_yield_threshold: float = 0.03) -> pd.Series:
        """Value investing strategy"""
        signals = pd.Series(0, index=df.index)
        
        # Check if fundamental data is available
        if 'pe_ratio' in df.columns and 'pb_ratio' in df.columns:
            # Buy undervalued stocks
            undervalued = (df['pe_ratio'] < pe_threshold) & \
                         (df['pb_ratio'] < pb_threshold)
            
            if 'dividend_yield' in df.columns:
                undervalued = undervalued & (df['dividend_yield'] > dividend_yield_threshold)
            
            signals[undervalued] = 1
            
            # Sell overvalued stocks
            overvalued = (df['pe_ratio'] > pe_threshold * 1.5) | \
                        (df['pb_ratio'] > pb_threshold * 1.5)
            signals[overvalued] = -1
        
        return signals
    
    def growth_strategy(self, df: pd.DataFrame,
                       revenue_growth_threshold: float = 0.15,
                       eps_growth_threshold: float = 0.10) -> pd.Series:
        """Growth investing strategy"""
        signals = pd.Series(0, index=df.index)
        
        if 'revenue_growth' in df.columns and 'eps_growth' in df.columns:
            # Buy high-growth companies
            high_growth = (df['revenue_growth'] > revenue_growth_threshold) & \
                         (df['eps_growth'] > eps_growth_threshold)
            signals[high_growth] = 1
            
            # Sell when growth slows
            slowing_growth = (df['revenue_growth'] < revenue_growth_threshold/2) | \
                            (df['eps_growth'] < eps_growth_threshold/2)
            signals[slowing_growth] = -1
        
        return signals
    
    def swing_strategy(self, df: pd.DataFrame,
                      swing_period: int = 5,
                      stop_loss: float = 0.05,
                      take_profit: float = 0.10) -> pd.Series:
        """Swing trading strategy"""
        signals = pd.Series(0, index=df.index)
        
        # Calculate swing highs and lows
        swing_high = df['high'].rolling(window=swing_period).max()
        swing_low = df['low'].rolling(window=swing_period).min()
        
        # Buy on breakout above swing high
        breakout = df['close'] > swing_high.shift(1)
        signals[breakout] = 1
        
        # Sell on breakdown below swing low
        breakdown = df['close'] < swing_low.shift(1)
        signals[breakdown] = -1
        
        return signals
    
    def mean_reversion_strategy(self, df: pd.DataFrame,
                               lookback: int = 20,
                               std_dev: int = 2) -> pd.Series:
        """Mean reversion strategy using Bollinger Bands"""
        signals = pd.Series(0, index=df.index)
        
        # Calculate Bollinger Bands
        sma = df['close'].rolling(window=lookback).mean()
        std = df['close'].rolling(window=lookback).std()
        
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        # Buy when price hits lower band (oversold)
        oversold = df['close'] <= lower_band
        signals[oversold] = 1
        
        # Sell when price hits upper band (overbought)
        overbought = df['close'] >= upper_band
        signals[overbought] = -1
        
        return signals
    
    def breakout_strategy(self, df: pd.DataFrame,
                         resistance_levels: List[float],
                         support_levels: List[float]) -> pd.Series:
        """Breakout trading strategy"""
        signals = pd.Series(0, index=df.index)
        
        current_price = df['close'].iloc[-1] if len(df) > 0 else 0
        
        # Check for resistance breakout
        for resistance in resistance_levels:
            if current_price > resistance and df['close'].iloc[-2] <= resistance:
                signals.iloc[-1] = 1  # Buy on breakout
                break
        
        # Check for support breakdown
        for support in support_levels:
            if current_price < support and df['close'].iloc[-2] >= support:
                signals.iloc[-1] = -1  # Sell on breakdown
                break
        
        return signals
    
    def generate_signals(self, strategy_type: StrategyType,
                        df: pd.DataFrame,
                        **params) -> pd.Series:
        """Generate trading signals for given strategy"""
        strategy_func = self.strategies.get(strategy_type)
        if not strategy_func:
            raise ValueError(f"Strategy {strategy_type} not supported")
        
        return strategy_func(df, **params)
    
    def backtest_strategy(self, strategy_type: StrategyType,
                         df: pd.DataFrame,
                         initial_capital: float = 100000,
                         commission: float = 0.001,
                         **params) -> Dict:
        """Backtest equity strategy"""
        signals = self.generate_signals(strategy_type, df, **params)
        
        # Initialize positions
        positions = pd.Series(0, index=df.index)
        portfolio = pd.DataFrame(index=df.index)
        portfolio['signal'] = signals
        portfolio['price'] = df['close']
        
        # Calculate positions (1 = full position, 0 = no position)
        positions = (signals != 0).astype(int)
        
        # Calculate returns
        portfolio['returns'] = df['close'].pct_change()
        portfolio['strategy_returns'] = positions.shift(1) * portfolio['returns']
        
        # Account for commissions
        trade_changes = positions.diff().abs()
        portfolio['commission'] = trade_changes * commission
        portfolio['net_returns'] = portfolio['strategy_returns'] - portfolio['commission']
        
        # Calculate equity curve
        portfolio['equity'] = (1 + portfolio['net_returns']).cumprod() * initial_capital
        
        # Calculate metrics
        total_return = (portfolio['equity'].iloc[-1] / initial_capital) - 1
        sharpe_ratio = self._calculate_sharpe(portfolio['net_returns'])
        max_drawdown = self._calculate_max_drawdown(portfolio['equity'])
        
        # Trade analysis
        trades = self._analyze_trades(positions, df['close'])
        
        return {
            'strategy': strategy_type.value,
            'equity_curve': portfolio['equity'].tolist(),
            'total_return': total_return * 100,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown * 100,
            'num_trades': len(trades),
            'win_rate': self._calculate_win_rate(trades) * 100,
            'profit_factor': self._calculate_profit_factor(trades),
            'trades': trades,
            'signals': signals.tolist()
        }
    
    def _calculate_sharpe(self, returns: pd.Series) -> float:
        """Calculate Sharpe ratio"""
        if returns.std() == 0:
            return 0
        return returns.mean() / returns.std() * np.sqrt(252)
    
    def _calculate_max_drawdown(self, equity: pd.Series) -> float:
        """Calculate maximum drawdown"""
        running_max = equity.expanding().max()
        drawdown = (equity - running_max) / running_max
        return drawdown.min()
    
    def _analyze_trades(self, positions: pd.Series, prices: pd.Series) -> List[Dict]:
        """Analyze individual trades"""
        trades = []
        in_trade = False
        entry_price = 0
        entry_index = 0
        
        for i in range(1, len(positions)):
            if positions.iloc[i] != positions.iloc[i-1]:
                if not in_trade and positions.iloc[i] == 1:
                    # Entry
                    in_trade = True
                    entry_price = prices.iloc[i]
                    entry_index = i
                elif in_trade and positions.iloc[i] == 0:
                    # Exit
                    exit_price = prices.iloc[i]
                    exit_index = i
                    
                    trade_return = (exit_price - entry_price) / entry_price
                    trade_duration = exit_index - entry_index
                    
                    trades.append({
                        'entry_index': entry_index,
                        'exit_index': exit_index,
                        'entry_price': entry_price,
                        'exit_price': exit_price,
                        'return': trade_return,
                        'duration': trade_duration,
                        'is_winning': trade_return > 0
                    })
                    
                    in_trade = False
        
        return trades
    
    def _calculate_win_rate(self, trades: List[Dict]) -> float:
        """Calculate win rate"""
        if not trades:
            return 0
        winning_trades = sum(1 for trade in trades if trade['is_winning'])
        return winning_trades / len(trades)
    
    def _calculate_profit_factor(self, trades: List[Dict]) -> float:
        """Calculate profit factor"""
        gross_profit = sum(trade['return'] for trade in trades if trade['return'] > 0)
        gross_loss = abs(sum(trade['return'] for trade in trades if trade['return'] < 0))
        
        if gross_loss == 0:
            return float('inf')
        
        return gross_profit / gross_loss
