import pandas as pd
import numpy as np

class TopKPortfolioExecution:
    """
    Qlib's default Backtest Executor.
    Does not use generic rules. It purely ranks the N-assets by the ML's Alpha Predictions,
    Buys the Top-K %, Sells the Bottom-K %.
    """
    def __init__(self, top_k=5, initial_cash=100000.0):
        self.top_k = top_k
        self.initial_cash = initial_cash

    def run_backtest(self, alpha_scores: pd.DataFrame, pricing_data: pd.DataFrame):
        """
        Matches standard Qlib backtesting constraints.
        """
        # Align indexes
        alpha_scores, pricing_data = alpha_scores.align(pricing_data, join='inner')
        
        daily_returns = pricing_data.pct_change().shift(-1) # The actual return executed on next day
        
        portfolio_curve = []
        ic_curve = [] # Information Coefficient (Correlation of predicted vs actual)
        
        net_worth = self.initial_cash
        
        for idx in range(len(alpha_scores) - 1): # Skip last row because we don't have forward returns
            date = alpha_scores.index[idx]
            predictions = alpha_scores.iloc[idx]
            actuals = daily_returns.iloc[idx]
            
            # 1. Calculate Information Coefficient (IC)
            # Pearson correlation spanning the cross-section
            valid_mask = predictions.notna() & actuals.notna()
            if valid_mask.sum() > 2:
                ic = predictions[valid_mask].corr(actuals[valid_mask])
            else:
                ic = 0.0
                
            ic_curve.append(ic if not np.isnan(ic) else 0)
            
            # 2. Rank Assets for Execution
            # Drop NaNs, sort descending
            ranked_assets = predictions.dropna().sort_values(ascending=False)
            
            if len(ranked_assets) < self.top_k * 2: # Need enough assets to form Long/Short
                portfolio_curve.append({'date': date, 'equity': net_worth, 'ic': ic})
                continue
                
            # Execute Longs: Top K assets
            long_targets = ranked_assets.head(self.top_k).index
            
            # Execute Shorts: Bottom K assets
            short_targets = ranked_assets.tail(self.top_k).index
            
            # Simplistic Equal Weighting
            long_weight = 1.0 / self.top_k
            short_weight = -1.0 / self.top_k
            
            # Calculate PnL for the holding period (t to t+1)
            long_pnl = sum([actuals.get(asset, 0) * long_weight for asset in long_targets])
            short_pnl = sum([actuals.get(asset, 0) * short_weight for asset in short_targets])
            
            total_strat_return = long_pnl + short_pnl
            
            # Advance Equity
            net_worth = net_worth * (1 + total_strat_return)
            
            portfolio_curve.append({
                 'date': date, 
                 'equity': net_worth, 
                 'ic': float(ic) if not np.isnan(ic) else 0.0
            })
            
        # Return dataframe
        results = pd.DataFrame(portfolio_curve).set_index('date')
        return results
