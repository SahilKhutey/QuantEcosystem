import numpy as np
import pandas as pd

def create_drawdowns(pnl_series: pd.Series):
    """
    Calculate the largest peak-to-trough drawdown of the PnL curve
    as well as the duration of the drawdown.
    """
    hwm = [0]
    idx = pnl_series.index
    drawdown = pd.Series(index=idx, dtype=float)
    duration = pd.Series(index=idx, dtype=int)
    
    for t in range(1, len(idx)):
        hwm.append(max(hwm[t-1], pnl_series.iloc[t]))
        drawdown.iloc[t] = hwm[t] - pnl_series.iloc[t]
        duration.iloc[t] = 0 if drawdown.iloc[t] == 0 else duration.iloc[t-1] + 1
        
    return drawdown.max(), duration.max()

def create_sharpe_ratio(returns: pd.Series, periods: int=252, rf: float=0.0):
    """
    Create the Sharpe ratio for the strategy, based on a benchmark of zero (i.e. no risk-free rate information).
    """
    if len(returns) < 2 or returns.std() == 0:
        return 0.0
    return np.sqrt(periods) * ((returns.mean() - rf) / returns.std())

def create_sortino_ratio(returns: pd.Series, periods: int=252, rf: float=0.0):
    """
    Create the Sortino ratio for the strategy. 
    Only penalizes downside volatility.
    """
    if len(returns) < 2:
        return 0.0
    downside_returns = returns[returns < 0]
    if len(downside_returns) > 1 and downside_returns.std() != 0:
        return np.sqrt(periods) * ((returns.mean() - rf) / downside_returns.std())
    return 0.0
