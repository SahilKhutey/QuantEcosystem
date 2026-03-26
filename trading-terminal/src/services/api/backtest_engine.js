const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/backtest';

export const backtestEngineAPI = {
  // Backtest SIP strategy with historical data
  backtestSIP: async (params) => {
    const response = await fetch(`${API_BASE_URL}/sip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Compare SIP vs Lump Sum
  compareStrategies: async (params) => {
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Run Monte Carlo simulation
  runMonteCarlo: async (params) => {
    const response = await fetch(`${API_BASE_URL}/monte-carlo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Scenario analysis for portfolio
  analyzeScenarios: async (params) => {
    const response = await fetch(`${API_BASE_URL}/scenarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  }
};
