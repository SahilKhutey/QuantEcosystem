import numpy as np
import pandas as pd

class StockTradingEnv:
    """
    OpenAI Gym-style Environment mimicking `finrl.meta.env_stock_trading.StockTradingEnv`
    Defines the State, Action Space, and Step Rewards for a Deep Reinforcement Learning Agent.
    """
    def __init__(self, df: pd.DataFrame, initial_amount: float = 1000000.0,
                 trade_cost_pct: float = 0.001):
        self.df = df
        self.initial_amount = initial_amount
        self.trade_cost_pct = trade_cost_pct
        
        # Action Space: [-1, 1] for each stock. 
        # -1 = Sell 100% of holdings, 1 = Buy with 100% of available cash.
        self.action_space_length = len(self.df.columns)
        
        # State Space: [Cash, Holdings... , Prices...]
        self.state_space_length = 1 + (2 * self.action_space_length)

        # Internal tracking
        self.day = 0
        self.state = []
        self.terminal = False
        
        # Account metrics
        self.cash = 0.0
        self.holdings = []
        self.prices = []
        
        # Metrics for reward calculation
        self.asset_memory = []
        self.rewards_memory = []
        self.date_memory = []

    def reset(self):
        """Initializes the environment for Epoch 0"""
        self.day = 0
        self.terminal = False
        self.cash = self.initial_amount
        self.holdings = [0.0] * self.action_space_length
        self.prices = self.df.iloc[self.day].values.tolist()
        
        self.state = [self.cash] + self.holdings + self.prices
        self.asset_memory = [self.initial_amount]
        self.rewards_memory = []
        self.date_memory = [self.df.index[self.day]]
        
        return self.state

    def step(self, actions: list):
        """
        Executes continuous actions [-1, 1] sent by the DRL Agent Policy Network.
        Returns the new state, reward, and terminal boolean.
        """
        self.terminal = self.day >= len(self.df.index) - 1
        
        if self.terminal:
            # End of backtest
            closing_reward = self.asset_memory[-1] - self.asset_memory[0]
            return self.state, closing_reward, self.terminal
            
        else:
            # Execute Actions
            begin_total_asset = self.cash + sum([self.prices[i] * self.holdings[i] for i in range(self.action_space_length)])
            
            # Sort actions: Sells first to free up cash, then Buys
            actions = np.clip(actions, -1, 1) # Force action limits
            sell_indices = np.where(actions < 0)[0]
            buy_indices = np.where(actions > 0)[0]
            
            # Execute Sells
            for idx in sell_indices:
                percent_to_sell = abs(actions[idx])
                qty_to_sell = self.holdings[idx] * percent_to_sell
                if qty_to_sell > 0:
                    revenue = qty_to_sell * self.prices[idx]
                    cost = revenue * self.trade_cost_pct
                    self.cash += (revenue - cost)
                    self.holdings[idx] -= qty_to_sell
                    
            # Execute Buys
            allocated_cash = self.cash / max(len(buy_indices), 1)
            for idx in buy_indices:
                percent_to_buy = actions[idx]
                cash_to_spend = allocated_cash * percent_to_buy
                # Leave room for cost
                qty_to_buy = (cash_to_spend * (1 - self.trade_cost_pct)) / self.prices[idx]
                
                if qty_to_buy > 0 and self.cash >= cash_to_spend:
                    self.cash -= cash_to_spend
                    self.holdings[idx] += qty_to_buy
                    
            # Advance to next day
            self.day += 1
            self.prices = self.df.iloc[self.day].values.tolist()
            
            # Calculate new state
            self.state = [self.cash] + self.holdings + self.prices
            
            # Calculate Reward (Delta Portfolio Value) - Key to FinRL Learning!
            end_total_asset = self.cash + sum([self.prices[i] * self.holdings[i] for i in range(self.action_space_length)])
            reward = (end_total_asset - begin_total_asset) / begin_total_asset
            
            self.asset_memory.append(end_total_asset)
            self.rewards_memory.append(reward)
            self.date_memory.append(self.df.index[self.day])
            
            return self.state, reward, self.terminal
