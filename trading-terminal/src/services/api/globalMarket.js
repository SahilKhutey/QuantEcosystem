const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const globalMarketAPI = {
  // Get global market overview
  getGlobalOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/global-market/overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get asset correlations
  getAssetCorrelations: async (assets = [], timeframe = '30d') => {
    const queryParams = new URLSearchParams({
      assets: assets.join(','),
      timeframe
    }).toString();
    const response = await fetch(`${API_BASE_URL}/global-market/correlations?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get macroeconomic indicators
  getMacroeconomicData: async (countries = ['US', 'EU', 'JP', 'CN']) => {
    const queryParams = new URLSearchParams({ countries: countries.join(',') }).toString();
    const response = await fetch(`${API_BASE_URL}/global-market/macroeconomic?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get market sentiment
  getMarketSentiment: async (assets = []) => {
    const queryParams = new URLSearchParams({ assets: assets.join(',') }).toString();
    const response = await fetch(`${API_BASE_URL}/global-market/sentiment?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get economic calendar
  getEconomicCalendar: async (dateRange = 'week') => {
    const response = await fetch(`${API_BASE_URL}/global-market/economic-calendar?range=${dateRange}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get sector performance
  getSectorPerformance: async (region = 'global') => {
    const response = await fetch(`${API_BASE_URL}/global-market/sectors?region=${region}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get commodity prices
  getCommodityPrices: async () => {
    const response = await fetch(`${API_BASE_URL}/global-market/commodities`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get currency data
  getCurrencyData: async () => {
    const response = await fetch(`${API_BASE_URL}/global-market/currencies`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get bond yields
  getBondYields: async (countries = ['US', 'DE', 'JP', 'GB']) => {
    const queryParams = new URLSearchParams({ countries: countries.join(',') }).toString();
    const response = await fetch(`${API_BASE_URL}/global-market/bonds?${queryParams}`, {
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
  },

  // Get volatility surface data
  getVolatilitySurface: async (asset = 'SPY') => {
    const response = await fetch(`${API_BASE_URL}/global-market/volatility/${asset}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get central bank policies
  getCentralBankPolicies: async () => {
    const response = await fetch(`${API_BASE_URL}/global-market/central-banks`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
