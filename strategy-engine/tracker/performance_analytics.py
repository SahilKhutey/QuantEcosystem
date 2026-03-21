import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

class PerformanceTracker:
    def __init__(self):
        self.performance_history = {}
        
    def track_portfolio_performance(self, portfolio_id: str,
                                  portfolio_values: List[Dict],
                                  benchmark_values: List[Dict] = None) -> Dict:
        """Track and analyze portfolio performance"""
        
        # Convert to DataFrame
        df = pd.DataFrame(portfolio_values)
        df.set_index('date', inplace=True)
        
        # Calculate returns
        df['returns'] = df['value'].pct_change()
        df['cumulative_returns'] = (1 + df['returns']).cumprod() - 1
        
        # Calculate metrics
        metrics = self._calculate_portfolio_metrics(df)
        
        # Compare with benchmark if available
        benchmark_comparison = None
        if benchmark_values:
            benchmark_df = pd.DataFrame(benchmark_values)
            benchmark_df.set_index('date', inplace=True)
            benchmark_comparison = self._compare_with_benchmark(df, benchmark_df)
        
        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(df)
        
        # Calculate attribution
        attribution = self._calculate_performance_attribution(df)
        
        # Store in history
        self.performance_history[portfolio_id] = {
            'data': df,
            'metrics': metrics,
            'risk_metrics': risk_metrics,
            'benchmark_comparison': benchmark_comparison,
            'attribution': attribution,
            'last_updated': datetime.utcnow()
        }
        
        return {
            'portfolio_id': portfolio_id,
            'current_value': df['value'].iloc[-1] if len(df) > 0 else 0,
            'metrics': metrics,
            'risk_metrics': risk_metrics,
            'benchmark_comparison': benchmark_comparison,
            'attribution': attribution,
            'period_returns': self._calculate_period_returns(df),
            'drawdown_analysis': self._analyze_drawdowns(df)
        }
    
    def _calculate_portfolio_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate portfolio performance metrics"""
        if len(df) < 2:
            return {}
        
        returns = df['returns'].dropna()
        
        # Basic metrics
        total_return = (df['value'].iloc[-1] / df['value'].iloc[0] - 1) * 100
        
        # CAGR
        days = (df.index[-1] - df.index[0]).days
        years = days / 365
        cagr = (df['value'].iloc[-1] / df['value'].iloc[0]) ** (1 / years) - 1 if years > 0 else 0
        
        # Annualized volatility
        volatility = returns.std() * np.sqrt(252)
        
        # Sharpe ratio (assuming 4% risk-free rate)
        risk_free_rate = 0.04 / 252
        excess_returns = returns - risk_free_rate
        sharpe = excess_returns.mean() / excess_returns.std() * np.sqrt(252) if excess_returns.std() > 0 else 0
        
        # Sortino ratio
        downside_returns = returns[returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(252) if len(downside_returns) > 0 else 0
        sortino = (returns.mean() * 252 - 0.04) / downside_deviation if downside_deviation > 0 else 0
        
        # Max drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Calmar ratio
        calmar = cagr / abs(max_drawdown) if max_drawdown != 0 else 0
        
        # Win rate
        positive_days = (returns > 0).sum()
        total_days = len(returns)
        win_rate = (positive_days / total_days) * 100 if total_days > 0 else 0
        
        # Profit factor
        gross_profit = returns[returns > 0].sum()
        gross_loss = abs(returns[returns < 0].sum())
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
        
        return {
            'total_return': total_return,
            'cagr': cagr * 100,
            'volatility': volatility * 100,
            'sharpe_ratio': sharpe,
            'sortino_ratio': sortino,
            'max_drawdown': max_drawdown * 100,
            'calmar_ratio': calmar,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'positive_days': int(positive_days),
            'total_days': int(total_days),
            'best_day': returns.max() * 100,
            'worst_day': returns.min() * 100,
            'avg_win': returns[returns > 0].mean() * 100 if len(returns[returns > 0]) > 0 else 0,
            'avg_loss': returns[returns < 0].mean() * 100 if len(returns[returns < 0]) > 0 else 0
        }
    
    def _calculate_risk_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate risk metrics"""
        returns = df['returns'].dropna()
        
        if len(returns) < 2:
            return {}
        
        # Value at Risk (VaR)
        var_95 = np.percentile(returns, 5) * 100  # 95% confidence
        var_99 = np.percentile(returns, 1) * 100  # 99% confidence
        
        # Conditional VaR (Expected Shortfall)
        cvar_95 = returns[returns <= np.percentile(returns, 5)].mean() * 100
        cvar_99 = returns[returns <= np.percentile(returns, 1)].mean() * 100
        
        # Beta (if benchmark provided)
        beta = 1.0  # Default, would calculate with benchmark
        
        # Alpha (if benchmark provided)
        alpha = 0.0  # Default
        
        # Tracking error (if benchmark provided)
        tracking_error = 0.0  # Default
        
        # Skewness and Kurtosis
        skewness = stats.skew(returns)
        kurtosis = stats.kurtosis(returns)
        
        # Downside risk measures
        mar = 0.0  # Minimum Acceptable Return
        downside_risk = np.sqrt(((returns[returns < mar] - mar) ** 2).mean()) * np.sqrt(252) * 100
        
        # Upside potential
        upside_potential = returns[returns > mar].mean() * 252 * 100 if len(returns[returns > mar]) > 0 else 0
        
        # Omega ratio
        omega = upside_potential / abs(downside_risk) if downside_risk > 0 else float('inf')
        
        return {
            'var_95': var_95,
            'var_99': var_99,
            'cvar_95': cvar_95,
            'cvar_99': cvar_99,
            'beta': beta,
            'alpha': alpha,
            'tracking_error': tracking_error,
            'skewness': skewness,
            'kurtosis': kurtosis,
            'downside_risk': downside_risk,
            'upside_potential': upside_potential,
            'omega_ratio': omega,
            'sharpe_ratio': self._calculate_portfolio_metrics(df)['sharpe_ratio'],
            'sortino_ratio': self._calculate_portfolio_metrics(df)['sortino_ratio']
        }
    
    def _compare_with_benchmark(self, portfolio_df: pd.DataFrame,
                              benchmark_df: pd.DataFrame) -> Dict:
        """Compare portfolio performance with benchmark"""
        # Align dates
        common_dates = portfolio_df.index.intersection(benchmark_df.index)
        
        if len(common_dates) < 2:
            return None
        
        portfolio_returns = portfolio_df.loc[common_dates, 'returns']
        benchmark_returns = benchmark_df.loc[common_dates, 'returns']
        
        # Calculate alpha and beta
        covariance = np.cov(portfolio_returns, benchmark_returns)[0, 1]
        benchmark_variance = np.var(benchmark_returns)
        
        beta = covariance / benchmark_variance if benchmark_variance > 0 else 1
        
        # Calculate alpha (Jensen's Alpha)
        risk_free_rate = 0.04 / 252
        portfolio_excess = portfolio_returns.mean() - risk_free_rate
        benchmark_excess = benchmark_returns.mean() - risk_free_rate
        alpha = (portfolio_excess - beta * benchmark_excess) * 252 * 100
        
        # Tracking error
        active_returns = portfolio_returns - benchmark_returns
        tracking_error = active_returns.std() * np.sqrt(252) * 100
        
        # Information ratio
        information_ratio = active_returns.mean() / active_returns.std() * np.sqrt(252) if active_returns.std() > 0 else 0
        
        # Up/down capture ratios
        up_market = benchmark_returns > 0
        down_market = benchmark_returns < 0
        
        up_capture = (portfolio_returns[up_market].mean() / 
                     benchmark_returns[up_market].mean() * 100) if len(benchmark_returns[up_market]) > 0 else 0
        
        down_capture = (portfolio_returns[down_market].mean() / 
                       benchmark_returns[down_market].mean() * 100) if len(benchmark_returns[down_market]) > 0 else 0
        
        # Relative returns
        portfolio_cumulative = (1 + portfolio_returns).cumprod().iloc[-1] - 1
        benchmark_cumulative = (1 + benchmark_returns).cumprod().iloc[-1] - 1
        relative_return = (portfolio_cumulative - benchmark_cumulative) * 100
        
        return {
            'beta': beta,
            'alpha': alpha,
            'tracking_error': tracking_error,
            'information_ratio': information_ratio,
            'up_capture': up_capture,
            'down_capture': down_capture,
            'relative_return': relative_return,
            'outperformance': relative_return > 0,
            'correlation': np.corrcoef(portfolio_returns, benchmark_returns)[0, 1],
            'common_period_days': len(common_dates)
        }
    
    def _calculate_performance_attribution(self, df: pd.DataFrame) -> Dict:
        """Calculate performance attribution"""
        # Simplified attribution - in production, use Brinson model
        attribution = {
            'asset_allocation': 0.6,  # 60% from asset allocation
            'security_selection': 0.3,  # 30% from security selection
            'market_timing': 0.1,  # 10% from market timing
            'currency_effects': 0.0,  # 0% from currency (for Indian portfolio)
            'other_factors': 0.0
        }
        
        return attribution
    
    def _calculate_period_returns(self, df: pd.DataFrame) -> Dict:
        """Calculate returns for different periods"""
        if len(df) < 2:
            return {}
        
        returns = df['returns']
        
        # Calculate rolling returns
        rolling_1y = (1 + returns).rolling(window=252).apply(np.prod, raw=True) - 1
        rolling_3y = (1 + returns).rolling(window=756).apply(np.prod, raw=True) - 1
        
        # Current period returns
        current_1y = rolling_1y.iloc[-1] * 100 if len(rolling_1y) > 0 else 0
        current_3y = rolling_3y.iloc[-1] * 100 if len(rolling_3y) > 0 else 0
        
        # Historical period returns
        periods = {
            '1d': returns.iloc[-1] * 100 if len(returns) > 0 else 0,
            '1w': ((1 + returns.tail(5)).prod() - 1) * 100 if len(returns) >= 5 else 0,
            '1m': ((1 + returns.tail(21)).prod() - 1) * 100 if len(returns) >= 21 else 0,
            '3m': ((1 + returns.tail(63)).prod() - 1) * 100 if len(returns) >= 63 else 0,
            '6m': ((1 + returns.tail(126)).prod() - 1) * 100 if len(returns) >= 126 else 0,
            '1y': current_1y,
            '3y': current_3y,
            'ytd': self._calculate_ytd_return(df),
            'since_inception': (df['value'].iloc[-1] / df['value'].iloc[0] - 1) * 100
        }
        
        return periods
    
    def _calculate_ytd_return(self, df: pd.DataFrame) -> float:
        """Calculate Year-to-Date return"""
        current_year = df.index[-1].year
        ytd_start = df[df.index.year == current_year].index.min()
        
        if ytd_start is not None:
            ytd_value_start = df.loc[ytd_start, 'value']
            ytd_value_end = df['value'].iloc[-1]
            return (ytd_value_end / ytd_value_start - 1) * 100
        
        return 0
    
    def _analyze_drawdowns(self, df: pd.DataFrame) -> Dict:
        """Analyze drawdown periods"""
        returns = df['returns']
        cumulative = (1 + returns).cumprod()
        
        # Calculate drawdowns
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        
        # Find drawdown periods
        drawdown_periods = []
        in_drawdown = False
        start_date = None
        trough_date = None
        recovery_date = None
        
        for i in range(1, len(drawdown)):
            if drawdown.iloc[i] < 0 and not in_drawdown:
                # Start of drawdown
                in_drawdown = True
                start_date = drawdown.index[i-1]
                trough_value = drawdown.iloc[i]
                trough_date = drawdown.index[i]
                
            elif drawdown.iloc[i] >= 0 and in_drawdown:
                # End of drawdown
                in_drawdown = False
                recovery_date = drawdown.index[i]
                
                drawdown_periods.append({
                    'start_date': start_date,
                    'trough_date': trough_date,
                    'recovery_date': recovery_date,
                    'depth': trough_value * 100,
                    'duration_days': (recovery_date - start_date).days,
                    'recovery_days': (recovery_date - trough_date).days
                })
        
        # Current drawdown if any
        current_drawdown = None
        if drawdown.iloc[-1] < 0:
            current_start = drawdown[drawdown == 0].last_valid_index()
            if current_start is not None:
                current_drawdown = {
                    'start_date': current_start,
                    'current_depth': drawdown.iloc[-1] * 100,
                    'duration_days': (drawdown.index[-1] - current_start).days,
                    'still_active': True
                }
        
        # Statistics
        if drawdown_periods:
            depths = [p['depth'] for p in drawdown_periods]
            durations = [p['duration_days'] for p in drawdown_periods]
            
            stats = {
                'count': len(drawdown_periods),
                'max_depth': min(depths),
                'avg_depth': np.mean(depths),
                'max_duration': max(durations),
                'avg_duration': np.mean(durations),
                'worst_period': drawdown_periods[np.argmin(depths)]
            }
        else:
            stats = {
                'count': 0,
                'max_depth': 0,
                'avg_depth': 0,
                'max_duration': 0,
                'avg_duration': 0,
                'worst_period': None
            }
        
        return {
            'current_drawdown': current_drawdown,
            'historical_drawdowns': drawdown_periods,
            'statistics': stats,
            'drawdown_series': drawdown.tolist()
        }
