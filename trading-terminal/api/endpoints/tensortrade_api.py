from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from tensortrade_clone.components import DataFeed, Broker, BSH, RiskAdjustedReturns
from tensortrade_clone.env import TradingEnv

tensortrade_bp = Blueprint('tensortrade_framework', __name__)

@tensortrade_bp.route('/run', methods=['POST'])
def run_tensortrade():
    """Builds the modular TensorTrade environment and runs a simulated RL Agent"""
    
    # 1. Mock Data Source Layer
    np.random.seed(42)
    periods = 100
    dates = pd.date_range(end=datetime.today(), periods=periods, freq='D')
    
    df = pd.DataFrame({
         'close': 100 + np.cumsum(np.random.normal(0.05, 3.5, periods)),
    }, index=dates)
    
    # 2. Build the TensorTrade Sub-Modules
    feed = DataFeed(df)
    broker = Broker(initial_cash=50000.0)
    action_scheme = BSH()  # Buy/Sell/Hold discrete mapping
    reward_scheme = RiskAdjustedReturns() # Sharpe Ratio Feedback
    
    # 3. Compile the Environment
    env = TradingEnv(action_scheme=action_scheme, 
                     reward_scheme=reward_scheme, 
                     broker=broker, 
                     feed=feed)
                     
    obs = env.reset()
    done = False
    
    # 4. Simulate an Agent executing [0, 1, 2] actions natively
    while not done:
        # Mock policy generating an integer action
        if obs is not None:
             price = obs['close']
             if price < 90:
                 action = 2 # Buy
             elif price > 115:
                 action = 0 # Sell
             else:
                 action = 1 # Hold
        else:
             action = 1
             
        obs, reward, done, info = env.step(action)
        
    # 5. Extract Ledger and History
    history = env.history
    
    # Format Response Layer
    timeseries = []
    actions_ledger = []
    
    for i, date in enumerate(df.index):
        if i < len(history):
            h = history[i]
            timeseries.append({
                'date': date.strftime('%Y-%m-%d'),
                'equity': h['net_worth'],
                'reward': h['reward']
            })
            if h['action'] != 'HOLD':
                 actions_ledger.append({
                     'date': date.strftime('%Y-%m-%d'),
                     'action': h['action'],
                     'qty': h['qty'],
                     'price': h['price'],
                     'reward': h['reward']
                 })

    # Summary
    total_return = (history[-1]['net_worth'] / 50000.0) - 1.0

    return jsonify({
        "status": "success",
        "message": "TensorTrade modular environment logic executed.",
        "config": {
            "ActionScheme": "BSH (Buy/Sell/Hold)",
            "RewardScheme": "RiskAdjustedReturns (Sharpe Ratio)",
            "Broker": "SimulatedExchange"
        },
        "metrics": {
            "Total Return [%]": round(total_return * 100, 2),
            "Final Equity [$]": round(history[-1]['net_worth'], 2),
            "Total Trades": len(actions_ledger)
        },
        "ledger": actions_ledger[-10:], # Return last 10 actions
        "timeseries": timeseries
    })
