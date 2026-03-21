import numpy as np
import pandas as pd

class PerformanceAttribution:
    """
    Calculates key performance metrics for a trading strategy.
    Includes Sharpe Ratio, Sortino Ratio, Max Drawdown, and Alpha/Beta.
    """
    def __init__(self, risk_free_rate=0.02, frequency=252):
        self.risk_free_rate = risk_free_rate
        self.frequency = frequency

    def calculate_metrics(self, returns: pd.Series, benchmark_returns: pd.Series = None):
        """
        Computes various performance ratios.
        """
        # 1. Total Return
        total_return = (1 + returns).prod() - 1
        
        # 2. Sharpe Ratio (Annualized)
        excess_returns = returns - (self.risk_free_rate / self.frequency)
        sharpe = np.sqrt(self.frequency) * excess_returns.mean() / returns.std()
        
        # 3. Sortino Ratio
        downside_returns = returns[returns < 0]
        sortino = np.sqrt(self.frequency) * excess_returns.mean() / downside_returns.std()
        
        # 4. Max Drawdown
        cum_returns = (1 + returns).cumprod()
        peak = cum_returns.cummax()
        drawdown = (cum_returns - peak) / peak
        max_dd = drawdown.min()
        
        metrics = {
            'Total Return': total_return,
            'Sharpe Ratio': sharpe,
            'Sortino Ratio': sortino,
            'Max Drawdown': max_dd
        }
        
        # 5. Alpha/Beta
        if benchmark_returns is not None:
             # beta = cov(ra, rb) / var(rb)
             cov = np.cov(returns, benchmark_returns)[0, 1]
             beta = cov / np.var(benchmark_returns)
             alpha = returns.mean() - beta * benchmark_returns.mean()
             metrics['Alpha'] = alpha * self.frequency
             metrics['Beta'] = beta
             
        return metrics

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    strategy_returns = pd.Series(np.random.normal(0.001, 0.015, 252))
    market_returns = pd.Series(np.random.normal(0.0005, 0.02, 252))
    
    pa = PerformanceAttribution()
    stats = pa.calculate_metrics(strategy_returns, market_returns)
    print("Strategy performance statistics:")
    for k, v in stats.items():
        print(f"{k}: {v:.4f}")
