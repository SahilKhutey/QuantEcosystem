// src/api/equityAnalysis.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const equityAnalysisAPI = {
  // Get company fundamentals
  getCompanyFundamentals: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/fundamentals/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get valuation metrics
  getValuationMetrics: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/valuation/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get factor model data
  getFactorModel: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/factors/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical valuation
  getHistoricalValuation: async (symbol, period = '5y') => {
    const response = await fetch(`${API_BASE_URL}/equity/historical/${symbol}?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get peer group analysis
  getPeerGroup: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/peers/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Run custom valuation model
  runCustomValuation: async (modelConfig) => {
    const response = await fetch(`${API_BASE_URL}/equity/valuation/custom`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modelConfig)
    });
    return response.json();
  },

  // Run factor model simulation
  runFactorSimulation: async (simulationConfig) => {
    const response = await fetch(`${API_BASE_URL}/equity/factors/simulation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simulationConfig)
    });
    return response.json();
  },

  // Get factor exposures
  getFactorExposures: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/factors/exposures/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get valuation percentile
  getValuationPercentile: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/equity/valuation/percentile/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get company financials
  getFinancials: async (symbol, period = '10y') => {
    const response = await fetch(`${API_BASE_URL}/equity/financials/${symbol}?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to equity updates
  subscribeToEquityUpdates: (symbol, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/equity/${symbol}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
