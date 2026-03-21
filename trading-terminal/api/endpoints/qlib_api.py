from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from qlib_clone.data import DatasetZoo
from qlib_clone.model import LightGBMRegressorModel
from qlib_clone.backtest import TopKPortfolioExecution

qlib_bp = Blueprint('qlib_framework', __name__)

@qlib_bp.route('/run', methods=['POST'])
def run_qlib():
    """Simulates the 5-stage ML Microsoft pipeline execution over an HTTP interface."""
    
    start_time = time.time()
    
    # 1. Init Data
    dataset = DatasetZoo(start_date='2018-01-01', periods=800, n_stocks=50) # Matrix of 40,000 data points
    raw_pricing = dataset.init_data()
    
    # 2. Feature Generation
    features, labels = dataset.create_features()
    
    # 3. Model Training
    ml_model = LightGBMRegressorModel()
    ml_model.fit(features, labels)
    
    # 4. Predict Alpha
    alpha_scores = ml_model.predict(features)
    
    # 5. Backtest Execution (Top 5 Long / Bottom 5 Short)
    executor = TopKPortfolioExecution(top_k=5, initial_cash=100000.0)
    results_df = executor.run_backtest(alpha_scores, raw_pricing)
    
    end_time = time.time()
    execution_time = round(end_time - start_time, 2)
    
    # Calculate global ML Metrics
    avg_ic = results_df['ic'].mean()
    total_return = (results_df['equity'].iloc[-1] / 100000.0) - 1.0
    
    # Format timeseries specifically for UI Downsampling to display quickly
    graph_data = results_df.resample('W').last().dropna()
    timeseries = []
    
    for date, row in graph_data.iterrows():
         timeseries.append({
              'date': date.strftime('%Y-%m-%d'),
              'equity': round(row['equity'], 2),
              'ic': round(row['ic'], 4)
         })

    return jsonify({
        "status": "success",
        "message": "Qlib end-to-end ML pipeline complete.",
        "metrics": {
            "Total Return [%]": round(total_return * 100, 2),
            "Final Equity [$]": round(results_df['equity'].iloc[-1], 2),
            "Average IC (Information Coefficient)": round(avg_ic, 4),
            "Execution Time [s]": execution_time
        },
        "timeseries": timeseries
    })
