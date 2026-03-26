from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/attribution/<portfolio_id>', methods=['GET'])
def get_performance_attribution(portfolio_id):
    # Simulated Performance Attribution Data
    attribution_data = {
        'total_return': 18.5,
        'benchmark_return': 12.2,
        'selection_effect': 4.2,
        'allocation_effect': 2.1,
        'interaction_effect': 0.0,
        'sector_attribution': [
            {'sector': 'Technology', 'allocation': 5.2, 'selection': 3.1, 'total': 8.3},
            {'sector': 'Healthcare', 'allocation': -1.2, 'selection': 1.5, 'total': 0.3},
            {'sector': 'Financials', 'allocation': 0.8, 'selection': -0.4, 'total': 0.4},
            {'sector': 'Energy', 'allocation': 2.5, 'selection': 1.2, 'total': 3.7}
        ]
    }
    return jsonify({'status': 'success', 'data': attribution_data})

@analytics_bp.route('/analytics/monte-carlo/<portfolio_id>', methods=['POST'])
def run_monte_carlo(portfolio_id):
    params = request.json
    simulations = params.get('simulations', 1000)
    horizon = params.get('horizon', 252) # 1 year
    
    # Simple Geometric Brownian Motion Simulation
    mu = 0.0005 # Daily drift
    sigma = 0.01 # Daily vol
    S0 = 10000000 # Starting value
    
    results = []
    for _ in range(simulations):
        prices = [S0]
        for _ in range(horizon):
            prices.append(prices[-1] * np.exp((mu - 0.5 * sigma**2) + sigma * np.random.normal()))
        results.append(prices[-1])
    
    results = np.array(results)
    
    monte_carlo_data = {
        'mean_ending_value': float(np.mean(results)),
        'median_ending_value': float(np.median(results)),
        'std_ending_value': float(np.std(results)),
        'var_95': float(np.percentile(results, 5)),
        'cvar_95': float(results[results <= np.percentile(results, 5)].mean()),
        'max_value': float(np.max(results)),
        'min_value': float(np.min(results)),
        'confidence_intervals': {
            '95': [float(np.percentile(results, 2.5)), float(np.percentile(results, 97.5))],
            '99': [float(np.percentile(results, 0.5)), float(np.percentile(results, 99.5))]
        },
        'simulated_paths': simulations # In production, return a subset of paths
    }
    return jsonify({'status': 'success', 'data': monte_carlo_data})

@analytics_bp.route('/analytics/factor-analysis/<portfolio_id>', methods=['GET'])
def get_factor_analysis(portfolio_id):
    # Simulated Factor Loadings (Fama-French 3 Factor Model)
    factor_data = {
        'market_beta': 1.15,
        'smb_loading': 0.25, # Small minus Big
        'hml_loading': -0.15, # High minus Low (Value)
        'r_squared': 0.88,
        'alpha': 0.02, # Annualized alpha
        'factor_contributions': [
            {'factor': 'Market', 'contribution': 14.2},
            {'factor': 'Size', 'contribution': 2.1},
            {'factor': 'Value', 'contribution': -1.2},
            {'factor': 'Alpha', 'contribution': 3.4}
        ]
    }
    return jsonify({'status': 'success', 'data': factor_data})

@analytics_bp.route('/analytics/stress-testing/<portfolio_id>', methods=['POST'])
def run_stress_testing(portfolio_id):
    # Simulated Stress Scenarios
    scenarios = [
        {'name': '2008 Financial Crisis', 'impact': -35.2, 'probability': 'Low'},
        {'name': 'COVID-19 Crash', 'impact': -28.4, 'probability': 'Low'},
        {'name': 'Tech Bubble Burst', 'impact': -15.8, 'probability': 'Medium'},
        {'name': 'Interest Rate Hike (+1%)', 'impact': -4.2, 'probability': 'High'},
        {'name': 'Oil Price Shock', 'impact': -2.5, 'probability': 'Medium'}
    ]
    return jsonify({'status': 'success', 'data': scenarios})

@analytics_bp.route('/analytics/risk-decomposition/<portfolio_id>', methods=['GET'])
def get_risk_decomposition(portfolio_id):
    # Simulated Risk Decomposition
    risk_data = {
        'total_risk': 12.5,
        'systematic_risk': 8.2,
        'idiosyncratic_risk': 4.3,
        'decomposition': [
            {'source': 'Country', 'value': 1.2},
            {'source': 'Sector', 'value': 2.5},
            {'source': 'Style', 'value': 1.8},
            {'source': 'Currency', 'value': 0.5},
            {'source': 'Specific', 'value': 6.5}
        ]
    }
    return jsonify({'status': 'success', 'data': risk_data})
