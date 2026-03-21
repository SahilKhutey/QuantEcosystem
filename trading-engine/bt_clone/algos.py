import pandas as pd

class Algo:
    """Base algorithm node."""
    def __call__(self, target):
        return True

class RunMonthly(Algo):
    """
    Only permits the execution chain to continue if the month has changed.
    In practice, halts the chain and prevents daily rebalancing overhead.
    """
    def __init__(self):
        self.last_month = None

    def __call__(self, target):
        current_month = target.now.month
        if self.last_month is None or current_month != self.last_month:
            self.last_month = current_month
            return True
        return False

class SelectAll(Algo):
    """
    Selects all available assets in the DataFrame for target consideration.
    """
    def __call__(self, target):
        target.selected = list(target.data.columns)
        return True

class SelectTopN(Algo):
    """Mock structural filtering algo."""
    def __init__(self, n: int):
        self.n = n
        
    def __call__(self, target):
        target.selected = target.selected[:self.n]
        return True

class WeighEqually(Algo):
    """
    Assigns an exactly equal fractional target weight to all currently selected assets.
    """
    def __call__(self, target):
        n = len(target.selected)
        if n > 0:
            weight = 1.0 / n
            for asset in target.selected:
                target.weights[asset] = weight
        return True

class Rebalance(Algo):
    """
    The mathematical allocator.
    Executes buys/sells to force current `target.positions` to perfectly align 
    with the predefined `target.weights`.
    """
    def __call__(self, target):
        current_prices = target.data.iloc[target.now_idx]
        
        # Calculate current total mark-to-market portfolio value
        holdings_value = sum([target.positions[asset] * current_prices[asset] for asset in target.data.columns])
        total_equity = target.cash + holdings_value
        
        # 1. Sell-offs: Adjust assets to their target value
        for asset in target.data.columns:
             current_qty = target.positions[asset]
             current_val = current_qty * current_prices[asset]
             
             target_weight = target.weights.get(asset, 0.0)
             target_val = total_equity * target_weight
             
             # Overweight? Sell.
             if current_val > target_val:
                  diff_val = current_val - target_val
                  qty_to_sell = diff_val / current_prices[asset]
                  
                  # Actually execute sell
                  target.positions[asset] -= qty_to_sell
                  target.cash += diff_val
                  
        # 2. Buy-ins: Use liberated cash to buy assets below target weight
        for asset, target_weight in target.weights.items():
             target_val = total_equity * target_weight
             
             current_qty = target.positions[asset]
             current_val = current_qty * current_prices[asset]
             
             # Underweight? Buy.
             if current_val < target_val:
                  diff_val = target_val - current_val
                  # Only buy what we can afford with cash
                  buy_val = min(diff_val, target.cash)
                  qty_to_buy = buy_val / current_prices[asset]
                  
                  target.positions[asset] += qty_to_buy
                  target.cash -= buy_val
                  
        return True
