const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/sovereign-risk';

export const sovereignRiskAPI = {
  // Get HHI concentration matrix
  getHHIConcentration: async () => {
    const response = await fetch(`${API_BASE_URL}/hhi-matrix`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get liquidity stress surface data
  getLiquidityStress: async (stressLevel = 1.0) => {
    const response = await fetch(`${API_BASE_URL}/liquidity-stress?level=${stressLevel}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get counterparty exposure matrix
  getCounterpartyExposure: async () => {
    const response = await fetch(`${API_BASE_URL}/counterparty`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
