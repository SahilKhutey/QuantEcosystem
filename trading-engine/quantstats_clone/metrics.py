import pandas as pd
import numpy as np
from datetime import timedelta

def calculate_quant_metrics(equity_curve: pd.Series):
    """
    Simulates QuantStats tearing capabilities calculating complex absolute performance metadata.
    Calculates CAGR, Max Drawdown, Sharpe, Sortino relative to Risk-Free rate.
    """
    metrics = {}
    
    # CAGR
    total_days = (equity_curve.index[-1] - equity_curve.index[0]).days
    total_return = (equity_curve.iloc[-1] / equity_curve.iloc[0]) - 1
    cagr = (((1 + total_return) ** (365.25 / total_days)) - 1) if total_days > 0 else 0
    metrics['CAGR'] = f"{cagr * 100:.2f}%"
    
    # Daily Returns array
    daily_returns = equity_curve.pct_change().dropna()
    
    # Sharpe & Sortino
    risk_free = 0.02
    excess_dr = daily_returns - (risk_free / 252)
    sharpe = np.sqrt(252) * excess_dr.mean() / daily_returns.std()
    
    downside_returns = excess_dr[excess_dr < 0]
    sortino = np.sqrt(252) * excess_dr.mean() / downside_returns.std() if len(downside_returns) > 0 else 0
    
    metrics['Sharpe'] = f"{sharpe:.2f}"
    metrics['Sortino'] = f"{sortino:.2f}"
    
    # Calculate Drawdowns array (Underwater plot data)
    rolling_max = equity_curve.expanding().max()
    drawdowns = (equity_curve / rolling_max) - 1.0
    
    max_dd = drawdowns.min()
    metrics['Max Drawdown'] = f"{max_dd * 100:.2f}%"
    
    return metrics, drawdowns

def generate_monthly_heatmap(equity_curve: pd.Series):
    """
    Mock QuantStats Monthly Return Heatmap.
    """
    # Simply mapping a standard positive skewed return array
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    years = [2022, 2023, 2024]
    
    heatmap = []
    np.random.seed(123)
    for year in years:
        row = {'Year': year}
        annual_acc = 1.0
        for m in months:
            # Positive bias for visual
            ret = np.random.normal(0.015, 0.04)
            row[m] = ret
            annual_acc *= (1 + ret)
        row['YTD'] = annual_acc - 1.0
        heatmap.append(row)
        
    return heatmap
