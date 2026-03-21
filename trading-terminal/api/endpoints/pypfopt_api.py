from flask import Blueprint, jsonify, request
import sys
import os
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from pypfopt_clone.efficient_frontier import EfficientFrontier

pypfopt_bp = Blueprint('pypfopt_framework', __name__)

@pypfopt_bp.route('/run', methods=['POST'])
def run_pypfopt():
    """Calculate the Markowitz Mean-Variance Frontier utilizing PyPortfolioOpt Logic."""
    try:
        # 1. Define typical Tech / Crypto Assets
        assets = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOG']
        num_assets = len(assets)
        
        # 2. Mock Expected Returns (ranging from 8% to 25% annualized)
        np.random.seed(42)  # Fixed for consistent UI demo
        expected_returns = np.random.uniform(0.08, 0.25, num_assets)
        
        # 3. Mock Covariance Matrix (positive semi-definite)
        A = np.random.rand(num_assets, num_assets)
        cov_matrix = np.dot(A, A.transpose()) * 0.05
        
        # 4. Instantiate the PyPortfolioOpt Engine
        ef = EfficientFrontier(expected_returns, cov_matrix)
        
        # 5. Optimize weights to Maximize the Sharpe Ratio
        raw_weights = ef.max_sharpe()
        performance = ef.portfolio_performance()
        
        # Construct the exact weight dictionary map
        optimal_weights = []
        for i, w in raw_weights.items():
            if w > 0.01: # Filter tiny fractional dust out if below 1% target allocation
                 optimal_weights.append({'asset': assets[i], 'weight': float(w)})
                 
        # 6. Generate the Random Portfolio Cloud (To chart the Efficient Frontier Parabola)
        cloud_df = ef.generate_efficient_frontier_curve(points=300)
        cloud_points = []
        for _, row in cloud_df.iterrows():
            cloud_points.append({
                'volatility': float(row['Volatility']),
                'return': float(row['Return'])
            })
            
        return jsonify({
            "status": "success",
            "message": "Calculated Max Sharpe Portfolio Asset Weights.",
            "metrics": {
                "Expected Annual Return": f"{performance['expected_return']*100:.2f}%",
                "Annual Volatility": f"{performance['volatility']*100:.2f}%",
                "Sharpe Ratio": f"{performance['sharpe_ratio']:.3f}"
            },
            "optimal_weights": optimal_weights,
            "frontier_curve": cloud_points
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
