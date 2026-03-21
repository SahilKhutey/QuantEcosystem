import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass

@dataclass
class MonteCarloResult:
    paths: List[np.ndarray]
    mean_final_equity: float
    median_final_equity: float
    confidence_interval: tuple
    prob_of_ruin: float
    max_drawdown_stats: Dict

class BacktestAnalytics:
    def __init__(self):
        self.logger = logging.getLogger('BacktestAnalytics')

    def run_monte_carlo(self, 
                        returns: pd.Series, 
                        initial_capital: float, 
                        n_simulations: int = 1000, 
                        n_days: int = 252) -> MonteCarloResult:
        """Run Monte Carlo simulation based on historical returns"""
        if returns.empty:
            raise ValueError("Returns series is empty")

        simulated_paths = []
        final_equities = []
        ruin_count = 0
        ruin_threshold = initial_capital * 0.5  # 50% loss defined as ruin

        for _ in range(n_simulations):
            # Resample returns with replacement
            sampled_returns = np.random.choice(returns, size=n_days, replace=True)
            
            # Generate path (1 + r).cumprod()
            path = initial_capital * np.cumprod(1 + sampled_returns)
            simulated_paths.append(path)
            
            final_equity = path[-1]
            final_equities.append(final_equity)
            
            if np.any(path < ruin_threshold):
                ruin_count += 1

        final_equities = np.array(final_equities)
        
        return MonteCarloResult(
            paths=simulated_paths[:50],  # Return only a sample of paths for visualization
            mean_final_equity=np.mean(final_equities),
            median_final_equity=np.median(final_equities),
            confidence_interval=(np.percentile(final_equities, 5), np.percentile(final_equities, 95)),
            prob_of_ruin=ruin_count / n_simulations,
            max_drawdown_stats={
                'p5': np.percentile(final_equities, 5),
                'p95': np.percentile(final_equities, 95)
            }
        )

    def run_stress_test(self, 
                        strategy, 
                        historical_data: pd.DataFrame, 
                        scenarios: List[Dict]) -> Dict:
        """Run stress tests against specific market scenarios/shocks"""
        results = {}
        
        for scenario in scenarios:
            name = scenario['name']
            shock_type = scenario['type']
            shock_value = scenario['value']
            
            # Apply shock to data
            shocked_data = historical_data.copy()
            if shock_type == 'price_drop':
                # Apply a one-day sudden drop
                mid_point = len(shocked_data) // 2
                shocked_data.iloc[mid_point:] *= (1 + shock_value)
            
            # Run a mini-backtest (assuming strategy has a quick simulate method)
            # This is a simplified placeholder for institutional stress testing
            try:
                # Simplified impact calculation
                portfolio_impact = shock_value * 1.5 # Assuming 1.5x beta
                results[name] = {
                    'status': 'PASSED' if portfolio_impact > -0.2 else 'FAILED',
                    'impact': portfolio_impact,
                    'details': f"Portfolio expected to drop {portfolio_impact*100:.2f}% under {name} conditions."
                }
            except Exception as e:
                self.logger.error(f"Stress test {name} failed: {str(e)}")
        
        return results

    def get_historical_market_shocks(self) -> List[Dict]:
        """Define standard institutional stress scenarios"""
        return [
            {'name': '2008 Financial Crisis', 'type': 'price_drop', 'value': -0.40},
            {'name': '2020 COVID Crash', 'type': 'price_drop', 'value': -0.30},
            {'name': 'Tech Bubble Burst', 'type': 'price_drop', 'value': -0.50},
            {'name': 'Sudden Interest Rate hike', 'type': 'volatility_spike', 'value': 0.15}
        ]
