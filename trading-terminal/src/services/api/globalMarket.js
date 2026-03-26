// src/api/globalMarket.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const globalMarketAPI = {
  // Get global market data
  getGlobalMarketData: async (timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/global-market/data?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get market sentiment by region
  getMarketSentiment: async (region = 'global', timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/global-market/sentiment?region=${region}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical market data
  getHistoricalData: async (region = 'global', timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/global-market/history?region=${region}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get market correlations
  getMarketCorrelations: async (region = 'global') => {
    const response = await fetch(`${API_BASE_URL}/global-market/correlations?region=${region}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time market updates
  subscribeToMarketUpdates: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/global-market`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
