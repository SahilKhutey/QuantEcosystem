import { API_BASE_URL } from "./apiConfig";


export const modelZooAPI = {
  // Build and compile LSTM/Neural models
  compileModel: async (config) => {
    const response = await fetch(`${API_BASE_URL}/compile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Calculate GARCH volatility surface
  getGarchSurface: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/garch?symbol=${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get Black-Scholes Greeks sensitivity
  getGreekSensitivity: async (params) => {
    const response = await fetch(`${API_BASE_URL}/greeks`, {
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
