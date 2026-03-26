const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const stockAnalysisAPI = {
  // Get basic stock information
  getStockInfo: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/info`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical price data
  getHistoricalData: async (symbol, timeframe = '1d', period = '1y') => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/history?timeframe=${timeframe}&period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get technical indicators
  getTechnicalIndicators: async (symbol, indicators = ['rsi', 'macd', 'bollinger']) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/technical`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ indicators })
    });
    return response.json();
  },

  // Get fundamental data
  getFundamentals: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/fundamentals`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get news and sentiment
  getNewsSentiment: async (symbol, timeframe = '30d') => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/news-sentiment?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get options chain
  getOptionsChain: async (symbol, expiration = 'all') => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/options?expiration=${expiration}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get analyst ratings
  getAnalystRatings: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/analyst-ratings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get ownership structure
  getOwnership: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/ownership`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get peer comparison
  getPeerComparison: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/peers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get earnings data
  getEarningsData: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/earnings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time stock updates
  subscribeToStockUpdates: (symbol, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/stocks/${symbol}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get institutional holdings
  getInstitutionalHoldings: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/institutional-holdings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get dividend information
  getDividendInfo: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/dividend`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
