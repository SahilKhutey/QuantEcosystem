const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const optionsAPI = {
  // Get option chain for a symbol
  getOptionChain: async (symbol, expiry = 'current') => {
    const response = await fetch(`${API_BASE_URL}/options/chain/${symbol}?expiry=${expiry}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Calculate Black-Scholes price and Greeks
  calculatePrice: async (params) => {
    const response = await fetch(`${API_BASE_URL}/options/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Get implied volatility surface
  getIVSurface: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/options/iv-surface/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical volatility
  getHistoricalVolatility: async (symbol, period = '30d') => {
    const response = await fetch(`${API_BASE_URL}/options/hv/${symbol}?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
