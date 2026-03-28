import { API_BASE_URL } from "./apiConfig";


export const riskStressAPI = {
  // Run systemic stress test (Black Swan, etc.)
  runStressTest: async (scenarioId, portfolioId) => {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenarioId, portfolioId })
    });
    return response.json();
  },

  // Calculate dynamic risk budget across strategies
  calculateRiskBudget: async (params) => {
    const response = await fetch(`${API_BASE_URL}/budget`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Get correlation break forensics
  getCorrelationForensics: async (portfolioId) => {
    const response = await fetch(`${API_BASE_URL}/forensics?id=${portfolioId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
