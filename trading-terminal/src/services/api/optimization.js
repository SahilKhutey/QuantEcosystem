import { API_BASE_URL } from "./apiConfig";


export const optimizationAPI = {
  // Get HFT pipeline performance metrics
  getHFTPipelineStats: async () => {
    const response = await fetch(`${API_BASE_URL}/hft/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get current portfolio allocation recommendations
  getAllocationRecommendations: async (portfolioValue, riskTolerance = 0.5) => {
    const response = await fetch(`${API_BASE_URL}/allocation/recommendations?value=${portfolioValue}&risk=${riskTolerance}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Trigger a portfolio rebalancing optimization
  runOptimization: async (params) => {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Get slippage simulation results
  getSlippageSimulation: async (symbol, size) => {
    const response = await fetch(`${API_BASE_URL}/slippage/simulate?symbol=${symbol}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical rebalancing suggestions
  getRebalancingHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/rebalancing/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
