import { API_BASE_URL } from "./apiConfig";


export const commoditiesAPI = {
  // Get commodity market data (Gold, Silver, Oil)
  getCommodityData: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/market/data?symbol=${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Calculate optimal gold hedge ratio
  getGoldHedgeRatio: async (portfolioValue, equityValue, riskLevel) => {
    const response = await fetch(`${API_BASE_URL}/gold/hedge-ratio?portfolio=${portfolioValue}&equity=${equityValue}&risk=${riskLevel}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get comparison between gold types (Physical, Digital, ETF, SGB)
  compareGoldTypes: async () => {
    const response = await fetch(`${API_BASE_URL}/gold/compare-types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Run Gold SIP simulation
  simulateGoldSIP: async (params) => {
    const response = await fetch(`${API_BASE_URL}/gold/simulate-sip`, {
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
