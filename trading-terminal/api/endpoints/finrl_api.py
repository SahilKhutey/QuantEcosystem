from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from finrl_clone.env import StockTradingEnv
from finrl_clone.agent import DRLAgent

finrl_bp = Blueprint('finrl_framework', __name__)

@finrl_bp.route('/run', methods=['POST'])
def run_finrl():
    """Simulates the lifecycle of an AI Trading Agent (Train -> Predict)"""
    
    # 1. Generate OOS Testing Data
    np.random.seed(1337)
    periods = 200
    dates = pd.date_range(end=datetime.today(), periods=periods, freq='D')
    
    # Generate mock volatile asset prices to feed the neural network
    df = pd.DataFrame({
         'AAPL': 100 + np.cumsum(np.random.normal(0, 2, periods)),
         'TSLA': 100 + np.cumsum(np.random.normal(0, 4, periods)),
         'BTC':  100 + np.cumsum(np.random.normal(0, 8, periods))
    }, index=dates)
    
    # 2. Build the Gym Environment
    env = StockTradingEnv(df=df, initial_amount=10000.0)
    
    # 3. Create and Train the Agent
    agent = DRLAgent(env=env)
    
    # Generating 25 epochs of "learning" (Proximal Policy Optimization)
    training_metrics = agent.train_model(total_timesteps=25)
    
    # 4. Out of Sample Prediction Backtest
    account_values, test_dates = agent.DRL_prediction(env=env)
    
    # Format Evaluation Metrics
    start_val = account_values[0]
    end_val = account_values[-1]
    total_return = (end_val / start_val) - 1.0
    
    oos_timeseries = []
    for i in range(len(test_dates)):
         oos_timeseries.append({
             'date': test_dates[i].strftime('%Y-%m-%d'),
             'equity': round(account_values[i], 2)
         })

    return jsonify({
        "status": "success",
        "message": "FinRL DRL Agent successfully trained and evaluated.",
        "metrics": {
            "Total Return [%]": round(total_return * 100, 2),
            "Final Equity [$]": round(end_val, 2)
        },
        "training_epochs": training_metrics,
        "evaluation_timeseries": oos_timeseries
    })
