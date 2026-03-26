const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/backtest';

export const backtestAPI = {
  // Run advanced comprehensive backtest (WF/MC)
  runComprehensiveBacktest: async (params) => {
    const response = await fetch(`${API_BASE_URL}/run/comprehensive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Get Walk-Forward Optimization matrix
  getWalkForwardMatrix: async (backtestId) => {
    const response = await fetch(`${API_BASE_URL}/results/walk-forward?id=${backtestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get Monte Carlo simulation paths
  getMonteCarloPaths: async (backtestId) => {
    const response = await fetch(`${API_BASE_URL}/results/monte-carlo?id=${backtestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get strategy compare metadata (Alpha/Beta)
  getStrategyComparison: async (strategyIds, benchmarkId) => {
    const response = await fetch(`${API_BASE_URL}/compare?strategies=${strategyIds.join(',')}&benchmark=${benchmarkId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
