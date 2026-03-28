import { API_BASE_URL } from "./apiConfig";


export const assetAllocationAPI = {
  // Get Black-Litterman allocation
  getBlackLitterman: async (views) => {
    const response = await fetch(`${API_BASE_URL}/black-litterman`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ views })
    });
    return response.json();
  },

  // Get regime-switching efficient frontier
  getEfficientFrontier: async (regime = 'normal') => {
    const response = await fetch(`${API_BASE_URL}/frontier?regime=${regime}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get utility sensitivity map
  getUtilityMap: async (riskAversion = 2.0) => {
    const response = await fetch(`${API_BASE_URL}/utility?risk_aversion=${riskAversion}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
