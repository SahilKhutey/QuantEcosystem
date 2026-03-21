import pandas as pd
import numpy as np

class Context:
    """
    The state container that is passed sequentially through every Algo in the tree.
    """
    def __init__(self, data: pd.DataFrame, cash: float = 10000.0):
        self.data = data
        self.cash = cash
        self.initial_cash = cash
        self.now = None
        self.now_idx = 0
        
        # State mutated by Algos
        self.selected = []       # Assets selected for play
        self.weights = {}        # Target weights for selected assets
        self.positions = {col: 0.0 for col in data.columns} # Current absolute allocations
        
        # Tracking curves
        self.history = []

class Strategy:
    """
    Represents a sequence of algorithmic actions.
    """
    def __init__(self, name: str, algos: list):
        self.name = name
        self.algos = algos

    def setup(self, data: pd.DataFrame, cash: float = 10000.0) -> Context:
        return Context(data, cash)

class Backtest:
    """
    Glues the Strategy to the Data and oversees the execution.
    """
    def __init__(self, strategy: Strategy, data: pd.DataFrame, initial_capital=10000.0):
        self.strategy = strategy
        self.data = data
        self.initial_capital = initial_capital

    def run(self):
        ctx = self.strategy.setup(self.data, self.initial_capital)
        
        # Iteration Loop
        dates = self.data.index
        for i in range(len(dates)):
            ctx.now = dates[i]
            ctx.now_idx = i
            
            # Reset ephemeral weights
            ctx.selected = []
            ctx.weights = {}
            
            # Step through the tree sequentially
            # If any algo returns False, the chain halts for this timestep
            for algo in self.strategy.algos:
                if not algo(ctx):
                    break
                    
            # Compute current MTM Equity
            current_prices = self.data.iloc[i]
            holdings_value = sum([ctx.positions[asset] * current_prices[asset] for asset in self.data.columns])
            equity = ctx.cash + holdings_value
            
            ctx.history.append({
                'date': ctx.now,
                'equity': equity,
                'cash': ctx.cash,
                **{f"{asset}_weight": (ctx.positions[asset] * current_prices[asset]) / equity if equity > 0 else 0 
                   for asset in self.data.columns}
            })
            
        return pd.DataFrame(ctx.history).set_index('date')

def run(*backtests):
    """Execution wrapper taking multiple concurrent backtests"""
    results = {}
    for bt in backtests:
         results[bt.strategy.name] = bt.run()
    return results
