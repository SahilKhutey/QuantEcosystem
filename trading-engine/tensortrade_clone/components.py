import numpy as np
import pandas as pd

class DataFeed:
    """Streams observations chronologically to the Agent."""
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.cursor = 0
        
    def next(self):
        if self.cursor >= len(self.data):
            return None
        obs = self.data.iloc[self.cursor]
        self.cursor += 1
        return obs
        
    def reset(self):
        self.cursor = 0

class Broker:
    """Manages Wallets and Exchanges."""
    def __init__(self, initial_cash=10000.0):
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.holdings = 0.0
        self.net_worth = initial_cash
        
    def evaluate(self, current_price):
        self.net_worth = self.cash + (self.holdings * current_price)
        return self.net_worth
        
    def reset(self):
        self.cash = self.initial_cash
        self.holdings = 0.0
        self.net_worth = self.initial_cash

class ActionScheme:
    """Translates discrete integers [0, 1, 2] from Neural Net into Orders"""
    def __init__(self):
        self.broker = None
        
    def perform(self, action, current_price):
        raise NotImplementedError

class BSH(ActionScheme):
    """Buy (2), Sell (0), Hold (1) Scheme"""
    def perform(self, action, current_price):
        executed_qty = 0.0
        action_type = "HOLD"
        
        # Sell
        if action == 0 and self.broker.holdings > 0:
            qty = self.broker.holdings * 0.5 # Sell half
            revenue = qty * current_price
            self.broker.cash += revenue
            self.broker.holdings -= qty
            action_type = "SELL"
            executed_qty = qty
            
        # Buy
        elif action == 2 and self.broker.cash > current_price:
            afford = self.broker.cash / current_price
            qty = afford * 0.5 # Buy with half cash
            cost = qty * current_price
            self.broker.cash -= cost
            self.broker.holdings += qty
            action_type = "BUY"
            executed_qty = qty
            
        return action_type, executed_qty

class RewardScheme:
    """Calculates episodic step feedback"""
    def __init__(self):
        self.broker = None
        self.history = []
        
    def get_reward(self):
        raise NotImplementedError

class RiskAdjustedReturns(RewardScheme):
    """Sharpe Ratio Approximation"""
    def get_reward(self):
        net_worth = self.broker.net_worth
        self.history.append(net_worth)
        
        if len(self.history) < 2:
            return 0.0
            
        returns = pd.Series(self.history).pct_change().dropna()
        if len(returns) < 5:
            return returns.iloc[-1] * 100 # Flat return until we have enough data
            
        mean_ret = returns.mean()
        std_ret = returns.std()
        
        if std_ret == 0:
             return 0.0
             
        sharpe = (mean_ret / std_ret) * np.sqrt(252)
        return sharpe
