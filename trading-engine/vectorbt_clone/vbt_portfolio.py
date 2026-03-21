import pandas as pd
import numpy as np
from typing import Dict

class Portfolio:
    """
    Mimics VectorBT's lightning-fast, N-dimensional vectorized array evaluator.
    Computes thousands of simulations simultaneously using purely Pandas/NumPy structures.
    """
    
    @classmethod
    def from_signals(cls, close: pd.DataFrame, entries: pd.DataFrame, exits: pd.DataFrame, 
                     init_cash: float = 10000.0, fees: float = 0.001) -> 'Portfolio':
        """
        Calculates Mark-to-Market equity entirely off boolean masks without python `for` loops.
        `close`, `entries`, and `exits` are highly dimensional DataFrames containing
        all possible permutations of parameters as their column indices.
        """
        # Align indexes
        close, entries, exits = close.align(entries, join='inner')
        close, exits = close.align(exits, join='inner')
        
        # We need a strict toggle to flip between hold=True and hold=False
        # Vectorized signal processing: +1 for enter, -1 for exit, 0 otherwise
        signals = pd.DataFrame(0, index=close.index, columns=close.columns)
        signals[entries & ~exits] = 1
        signals[exits & ~entries] = -1
        
        # Find exactly where position changes (e.g. from 0 to 1, or 1 to 0)
        # Using ffill on non-zeros to carry forward the state
        # 0 = cash, 1 = invested
        pos_str = signals.replace(0, np.nan).ffill().fillna(-1)
        is_invested = (pos_str == 1)
        
        # Returns
        daily_pct = close.pct_change()
        
        # Account for trading fees on entry/exit transitions
        transitions = is_invested.astype(int).diff().abs()
        fee_impact = transitions * fees
        
        # Portfolio Returns calculation
        # If invested, capture close-to-close returns. Apply fees on transitions.
        strat_returns = (daily_pct * is_invested.shift(1).fillna(0)) - fee_impact.fillna(0)
        
        # Cumulative Equity curve calculation
        equity_curves = init_cash * (1 + strat_returns).cumprod()
        
        return cls(equity_curves, strat_returns, is_invested, close)

    def __init__(self, equity: pd.DataFrame, returns: pd.DataFrame, positions: pd.DataFrame, close: pd.DataFrame):
        self.equity = equity
        self.returns = returns
        self.positions = positions
        self.close = close

    def get_stats(self) -> pd.DataFrame:
        """
        Generates robust summary metrics mimicking `vbt.Portfolio.stats()` 
        across the entire sweep space instantly.
        """
        stats = []
        
        for col in self.equity.columns:
            eq = self.equity[col]
            rets = self.returns[col]
            pos = self.positions[col]
            
            total_return = (eq.iloc[-1] / eq.iloc[0]) - 1.0
            ann_return = total_return * (252 / len(eq)) if len(eq) > 0 else 0
            
            # Drawdown
            roll_max = eq.cummax()
            drawdown = (eq / roll_max) - 1.0
            max_drawdown = drawdown.min()
            
            # Volatility & Sharpe
            ann_vol = rets.std() * np.sqrt(252)
            sharpe = (ann_return - 0.02) / ann_vol if ann_vol > 0 else 0
            
            # Win Rate proxy (days up while invested vs total days invested)
            invested_rets = rets[pos.shift(1).fillna(False)]
            wins = len(invested_rets[invested_rets > 0])
            losses = len(invested_rets[invested_rets < 0])
            win_rate = wins / (wins + losses) if (wins + losses) > 0 else 0
            
            stats.append({
                'Combination': col,
                'Total Return [%]': total_return * 100,
                'Ann. Return [%]': ann_return * 100,
                'Max Drawdown [%]': max_drawdown * 100,
                'Sharpe Ratio': sharpe,
                'Win Rate [%]': win_rate * 100,
                'Final Equity [$]': eq.iloc[-1]
            })
            
        return pd.DataFrame(stats)
