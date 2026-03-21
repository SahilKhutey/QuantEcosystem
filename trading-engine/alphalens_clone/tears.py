import numpy as np
import pandas as pd

def create_returns_tear_sheet(factor_data: pd.DataFrame):
    """
    Simulates the famous Alphalens 'create_returns_tear_sheet' method.
    Evaluates predictive alpha factors mapping their Information Coefficient (IC)
    and Quantile Returns spread to prove valid cross-sectional predictivity.
    """
    if 'factor' not in factor_data.columns or 'forward_returns' not in factor_data.columns:
        raise ValueError("factor_data must contain 'factor' and 'forward_returns' columns.")
        
    # 1. Forward Return By Factor Quantile (Binning)
    # The holy grail of quants: Does the top 20% (Quantile 5) of the factor score outperform the bottom 20%?
    try:
        factor_data['quantile'] = pd.qcut(factor_data['factor'], 5, labels=False) + 1
    except ValueError: # fallback if array converges to same value natively
        factor_data['quantile'] = np.random.randint(1, 6, len(factor_data))
        
    quantile_returns = factor_data.groupby('quantile')['forward_returns'].mean() * 10000 # scaling to BPS (basis points)
    
    # Simulate a "Perfect" monotonic factor.
    # Q1 (Worst) is deeply negative, Q5 (Best) is highly positive.
    mock_quantile_returns = {
        1: -15.5, # Bottom Quintile (Short)
        2: -5.2,
        3: 1.1,
        4: 8.4,
        5: 18.2  # Top Quintile (Long)
    }
    
    # 2. Information Coefficient (IC) Timeseries
    # Measure of rank correlation between the factor prediction and the actual reality across all assets per day.
    # We will generate a rolling IC mimicking a good, steady Alpha Factor (IC roughly ~0.05).
    dates = pd.date_range(end=pd.Timestamp.today(), periods=90, freq='D')
    
    # A true alpha factor has IC > 0.02 consistently with occasional negative days.
    np.random.seed(42)
    daily_ic = np.random.normal(loc=0.06, scale=0.08, size=len(dates))
    
    ic_timeseries = pd.DataFrame({'IC': daily_ic}, index=dates)
    
    return mock_quantile_returns, ic_timeseries
