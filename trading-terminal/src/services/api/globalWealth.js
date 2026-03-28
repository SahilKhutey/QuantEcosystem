import { API_BASE_URL } from "./apiConfig";
// src/api/globalWealth.js


export const globalWealthAPI = {
  // Get global wealth data
  getWealthData: async (region = 'global', timeframe = '2023', metric = 'total_wealth') => {
    const response = await fetch(`${API_BASE_URL}/global-wealth/data?region=${region}&timeframe=${timeframe}&metric=${metric}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get regional wealth breakdown
  getRegionalBreakdown: async (region = 'global', timeframe = '2023') => {
    const response = await fetch(`${API_BASE_URL}/global-wealth/regional?region=${region}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get wealth quintile distribution
  getQuintileDistribution: async (region = 'global', timeframe = '2023') => {
    const response = await fetch(`${API_BASE_URL}/global-wealth/quintile?region=${region}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical wealth data
  getHistoricalWealth: async (region = 'global', metric = 'total_wealth') => {
    const response = await fetch(`${API_BASE_URL}/global-wealth/history?region=${region}&metric=${metric}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
