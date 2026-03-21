import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Callable
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

class BacktestEngine:
    def __init__(self):
        self.results_cache = {}
        
    def backtest_sip(self, monthly_amount: float,
                    start_date: datetime,
                    end_date: datetime,
                    asset_returns: pd.Series,
                    step_up: float = 0.0) -> Dict:
        """Backtest SIP strategy with historical data"""
        
        # Generate investment dates
        investment_dates = pd.date_range(start=start_date, end=end_date, freq='M')
        
        portfolio_value = 0
        investments = []
        total_invested = 0
        current_amount = monthly_amount
        
        for i, inv_date in enumerate(investment_dates):
            # Apply step-up
            if step_up > 0 and i > 0 and i % 12 == 0:
                current_amount *= (1 + step_up)
            
            # Find return for this period
            if inv_date in asset_returns.index:
                period_return = asset_returns[inv_date]
            else:
                # Find nearest date
                nearest_idx = asset_returns.index.get_indexer([inv_date], method='nearest')[0]
                period_return = asset_returns.iloc[nearest_idx]
            
            # Calculate portfolio value
            portfolio_value = (portfolio_value + current_amount) * (1 + period_return)
            total_invested += current_amount
            
            investments.append({
                'date': inv_date,
                'amount': current_amount,
                'return': period_return,
                'portfolio_value': portfolio_value,
                'total_invested': total_invested
            })
        
        # Calculate metrics
        returns_series = pd.Series([inv['portfolio_value'] for inv in investments], 
                                 index=[inv['date'] for inv in investments])
        
        metrics = self._calculate_performance_metrics(
            returns_series, total_invested, portfolio_value
        )
        
        return {
            'final_value': portfolio_value,
            'total_invested': total_invested,
            'absolute_return': portfolio_value - total_invested,
            'investments': investments,
            'metrics': metrics,
            'step_up_applied': step_up > 0,
            'final_monthly_investment': current_amount
        }
    
    def compare_sip_vs_lumpsum(self, total_amount: float,
                              start_date: datetime,
                              end_date: datetime,
                              asset_returns: pd.Series) -> Dict:
        """Compare SIP vs Lump Sum investment"""
        
        # SIP scenario
        months = (end_date.year - start_date.year) * 12 + \
                (end_date.month - start_date.month)
        monthly_amount = total_amount / months
        
        sip_result = self.backtest_sip(
            monthly_amount, start_date, end_date, asset_returns
        )
        
        # Lump Sum scenario
        if start_date in asset_returns.index:
            initial_return = asset_returns[start_date]
        else:
            nearest_idx = asset_returns.index.get_indexer([start_date], method='nearest')[0]
            initial_return = asset_returns.iloc[nearest_idx]
        
        # Calculate lump sum growth
        lump_sum_value = total_amount
        for date in pd.date_range(start=start_date, end=end_date, freq='M'):
            if date in asset_returns.index:
                lump_sum_value *= (1 + asset_returns[date])
        
        lump_sum_return = (lump_sum_value / total_amount - 1) * 100
        
        # Calculate metrics
        sip_metrics = sip_result['metrics']
        
        return {
            'sip': {
                'final_value': sip_result['final_value'],
                'total_invested': sip_result['total_invested'],
                'absolute_return': sip_result['absolute_return'],
                'cagr': sip_metrics['cagr'],
                'max_drawdown': sip_metrics['max_drawdown']
            },
            'lump_sum': {
                'final_value': lump_sum_value,
                'total_invested': total_amount,
                'absolute_return': lump_sum_value - total_amount,
                'cagr': ((lump_sum_value / total_amount) ** (12/months) - 1) * 100,
                'max_drawdown': self._calculate_max_drawdown_single(
                    total_amount, lump_sum_value, asset_returns
                )
            },
            'comparison': {
                'sip_outperformance': sip_result['final_value'] - lump_sum_value,
                'sip_outperformance_pct': ((sip_result['final_value'] / lump_sum_value) - 1) * 100,
                'better_strategy': 'SIP' if sip_result['final_value'] > lump_sum_value else 'Lump Sum',
                'volatility_reduction': self._calculate_volatility_reduction(
                    sip_result, lump_sum_value, asset_returns
                )
            }
        }
    
    def monte_carlo_simulation(self, initial_amount: float,
                             monthly_investment: float,
                             years: int,
                             expected_return: float = 0.12,
                             volatility: float = 0.18,
                             simulations: int = 10000) -> Dict:
        """Monte Carlo simulation for portfolio returns"""
        
        results = []
        final_values = []
        
        for _ in range(simulations):
            portfolio_value = initial_amount
            monthly_return = expected_return / 12
            monthly_vol = volatility / np.sqrt(12)
            
            for month in range(years * 12):
                # Generate random return
                random_return = np.random.normal(monthly_return, monthly_vol)
                
                # Add monthly investment
                portfolio_value += monthly_investment
                
                # Apply return
                portfolio_value *= (1 + random_return)
            
            final_values.append(portfolio_value)
            
            # Calculate metrics for this simulation
            total_invested = initial_amount + (monthly_investment * years * 12)
            cagr = (portfolio_value / total_invested) ** (1 / years) - 1
            
            results.append({
                'final_value': portfolio_value,
                'cagr': cagr,
                'total_invested': total_invested
            })
        
        # Calculate percentiles
        final_values_sorted = np.sort(final_values)
        
        percentiles = {
            '5th': np.percentile(final_values, 5),
            '25th': np.percentile(final_values, 25),
            '50th': np.percentile(final_values, 50),
            '75th': np.percentile(final_values, 75),
            '95th': np.percentile(final_values, 95)
        }
        
        # Calculate probability of success
        target_amount = initial_amount * (1 + expected_return) ** years
        success_prob = sum(1 for v in final_values if v >= target_amount) / simulations
        
        # Calculate risk metrics
        returns_array = np.array([r['cagr'] for r in results])
        
        return {
            'expected_value': np.mean(final_values),
            'median_value': np.median(final_values),
            'std_deviation': np.std(final_values),
            'percentiles': percentiles,
            'success_probability': success_prob * 100,
            'expected_cagr': np.mean(returns_array) * 100,
            'cagr_std': np.std(returns_array) * 100,
            'worst_case': final_values_sorted[int(0.05 * len(final_values_sorted))],
            'best_case': final_values_sorted[int(0.95 * len(final_values_sorted))],
            'simulation_count': simulations,
            'results_sample': results[:10]  # First 10 simulations
        }
    
    def scenario_analysis(self, portfolio: Dict[str, float],
                         scenarios: List[Dict]) -> Dict:
        """Analyze portfolio under different market scenarios"""
        
        scenario_results = []
        
        for scenario in scenarios:
            scenario_name = scenario['name']
            market_conditions = scenario['conditions']
            
            # Calculate portfolio return under scenario
            portfolio_return = 0
            portfolio_risk = 0
            
            for asset, allocation in portfolio.items():
                if asset in market_conditions:
                    asset_return = market_conditions[asset]['return']
                    asset_risk = market_conditions[asset]['risk']
                    
                    weight = allocation / 100
                    portfolio_return += weight * asset_return
                    portfolio_risk += (weight * asset_risk) ** 2
            
            portfolio_risk = np.sqrt(portfolio_risk)
            
            # Calculate Sharpe ratio
            risk_free_rate = 0.04
            sharpe = (portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0
            
            scenario_results.append({
                'scenario': scenario_name,
                'portfolio_return': portfolio_return * 100,
                'portfolio_risk': portfolio_risk * 100,
                'sharpe_ratio': sharpe,
                'conditions': market_conditions
            })
        
        # Find best and worst scenarios
        best_scenario = max(scenario_results, key=lambda x: x['sharpe_ratio'])
        worst_scenario = min(scenario_results, key=lambda x: x['sharpe_ratio'])
        
        return {
            'scenarios': scenario_results,
            'best_scenario': best_scenario,
            'worst_scenario': worst_scenario,
            'scenario_range': {
                'max_return': max(r['portfolio_return'] for r in scenario_results),
                'min_return': min(r['portfolio_return'] for r in scenario_results),
                'max_risk': max(r['portfolio_risk'] for r in scenario_results),
                'min_risk': min(r['portfolio_risk'] for r in scenario_results)
            }
        }
    
    def _calculate_performance_metrics(self, returns_series: pd.Series,
                                     total_invested: float,
                                     final_value: float) -> Dict:
        """Calculate comprehensive performance metrics"""
        
        # Calculate returns
        returns = returns_series.pct_change().dropna()
        
        if len(returns) == 0:
            return {
                'cagr': 0,
                'volatility': 0,
                'sharpe_ratio': 0,
                'max_drawdown': 0,
                'sortino_ratio': 0,
                'calmar_ratio': 0
            }
        
        # CAGR
        months = len(returns_series)
        cagr = (final_value / total_invested) ** (12 / months) - 1 if months > 0 else 0
        
        # Annualized volatility
        volatility = returns.std() * np.sqrt(12)
        
        # Sharpe ratio (assuming 4% risk-free rate)
        risk_free_rate = 0.04 / 12
        excess_returns = returns - risk_free_rate
        sharpe = excess_returns.mean() / excess_returns.std() * np.sqrt(12) if excess_returns.std() > 0 else 0
        
        # Max drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Sortino ratio (downside risk)
        downside_returns = returns[returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(12) if len(downside_returns) > 0 else 0
        sortino = (returns.mean() * 12 - 0.04) / downside_deviation if downside_deviation > 0 else 0
        
        # Calmar ratio
        calmar = cagr / abs(max_drawdown) if max_drawdown != 0 else 0
        
        return {
            'cagr': cagr * 100,
            'volatility': volatility * 100,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_drawdown * 100,
            'sortino_ratio': sortino,
            'calmar_ratio': calmar,
            'positive_months': (returns > 0).sum(),
            'negative_months': (returns < 0).sum(),
            'best_month': returns.max() * 100,
            'worst_month': returns.min() * 100
        }
    
    def _calculate_max_drawdown_single(self, initial: float,
                                     final: float,
                                     returns: pd.Series) -> float:
        """Calculate max drawdown for single investment"""
        if len(returns) == 0:
            return 0
        
        cumulative = (1 + returns).cumprod() * initial
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        
        return drawdown.min() * 100
    
    def _calculate_volatility_reduction(self, sip_result: Dict,
                                      lump_sum_value: float,
                                      returns: pd.Series) -> float:
        """Calculate volatility reduction of SIP vs Lump Sum"""
        # Simplified calculation
        sip_volatility = sip_result['metrics']['volatility']
        
        # Lump sum volatility (approximate)
        lump_sum_volatility = returns.std() * np.sqrt(12) * 100
        
        reduction = (lump_sum_volatility - sip_volatility) / lump_sum_volatility * 100
        
        return max(0, reduction)
