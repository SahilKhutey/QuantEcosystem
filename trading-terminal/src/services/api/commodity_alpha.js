import { API_BASE_URL } from "./apiConfig";


export const commodityAlphaAPI = {
  // Optimize gold-equity hedge ratio
  optimizeHedge: async (portfolioData) => {
    const response = await fetch(`${API_BASE_URL}/optimize-hedge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(portfolioData)
    });
    return response.json();
  },

  // Comparative analysis for gold instruments (SGB, ETF, Physical)
  analyzeInstruments: async (amount) => {
    const response = await fetch(`${API_BASE_URL}/analyze-instruments?amount=${amount}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Gold SIP simulation with inflation adjusting
  simulateSIP: async (params) => {
    const response = await fetch(`${API_BASE_URL}/sip-sim`, {
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
