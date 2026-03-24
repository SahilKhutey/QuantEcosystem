import pandas as pd
import numpy as np
import logging
from datetime import datetime
from trading_system.config.settings import settings

logger = logging.getLogger("AnalyticsEngine")

class AnalyticsEngine:
    """Advanced performance attribution and analytics engine"""
    
    def __init__(self):
        self.logger = logger
        
    def get_performance_attribution(self, trades_df):
        """Break down performance by strategy and sector"""
        if trades_df.empty:
            return {}
            
        # Strategy Attribution
        strategy_perf = trades_df.groupby('strategy')['pnl'].sum().to_dict()
        
        # Sector Attribution (assuming sector data is available or mapped)
        # For mock/demo, we'll map common symbols to sectors
        sector_map = {
            'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
            'JPM': 'Financials', 'GS': 'Financials', 'BAC': 'Financials',
            'XOM': 'Energy', 'CVX': 'Energy',
            'JNJ': 'Healthcare', 'PFE': 'Healthcare'
        }
        trades_df['sector'] = trades_df['symbol'].map(sector_map).fillna('Other')
        sector_perf = trades_df.groupby('sector')['pnl'].sum().to_dict()
        
        return {
            'by_strategy': strategy_perf,
            'by_sector': sector_perf,
            'total_pnl': trades_df['pnl'].sum()
        }
        
    def compare_to_benchmark(self, portfolio_returns, benchmark_symbol='SPY'):
        """Compare portfolio returns against a benchmark index"""
        # In production, fetch benchmark data via yfinance or similar
        # Mocking benchmark returns for now
        mock_benchmark_returns = np.random.normal(0.0002, 0.01, len(portfolio_returns))
        
        alpha = np.mean(portfolio_returns) - np.mean(mock_benchmark_returns)
        beta = np.cov(portfolio_returns, mock_benchmark_returns)[0, 1] / np.var(mock_benchmark_returns)
        
        return {
            'benchmark': benchmark_symbol,
            'alpha': float(alpha),
            'beta': float(beta),
            'correlation': float(np.corrcoef(portfolio_returns, mock_benchmark_returns)[0, 1])
        }
