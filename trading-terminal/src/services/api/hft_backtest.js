import { API_BASE_URL } from "./apiConfig";


export const hftBacktestAPI = {
  // Trigger L2 order book replay
  runL2Replay: async (config) => {
    const response = await fetch(`${API_BASE_URL}/run-l2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Get slippage sensitivity surface
  getSlippageSurface: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/slippage?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get walk-forward stability matrix
  getStabilityMatrix: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/stability?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
