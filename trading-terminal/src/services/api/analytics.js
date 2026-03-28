import { API_BASE_URL } from "./apiConfig";


export const analyticsAPI = {
  // Get performance attribution analysis
  getPerformanceAttribution: async (portfolioId, timeframe = 'ytd') => {
    const response = await fetch(`${API_BASE_URL}/analytics/attribution/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Run Monte Carlo simulation
  runMonteCarloSimulation: async (portfolioId, params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/monte-carlo/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Get factor analysis
  getFactorAnalysis: async (portfolioId, factors = ['market', 'size', 'value']) => {
    const queryParams = new URLSearchParams({ factors: factors.join(',') }).toString();
    const response = await fetch(`${API_BASE_URL}/analytics/factor-analysis/${portfolioId}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get stress testing scenarios
  getStressTesting: async (portfolioId, scenarios = []) => {
    const response = await fetch(`${API_BASE_URL}/analytics/stress-testing/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenarios })
    });
    return response.json();
  },

  // Get risk decomposition
  getRiskDecomposition: async (portfolioId) => {
    const response = await fetch(`${API_BASE_URL}/analytics/risk-decomposition/${portfolioId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get scenario analysis
  getScenarioAnalysis: async (portfolioId, customScenario = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/scenario-analysis/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customScenario)
    });
    return response.json();
  },

  // Get attribution tree
  getAttributionTree: async (portfolioId, breakdown = 'sector') => {
    const response = await fetch(`${API_BASE_URL}/analytics-tree/${portfolioId}?breakdown=${breakdown}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get performance persistence analysis
  getPerformancePersistence: async (portfolioId, lookbackPeriods = [12, 24, 36]) => {
    const response = await fetch(`${API_BASE_URL}/analytics/performance-persistence/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lookbackPeriods })
    });
    return response.json();
  },

  // Get correlation analysis
  getCorrelationAnalysis: async (portfolioId, assets = []) => {
    const response = await fetch(`${API_BASE_URL}/analytics/correlation-analysis/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assets })
    });
    return response.json();
  },

  // Subscribe to real-time analytics updates
  subscribeToAnalyticsUpdates: (portfolioId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/analytics/${portfolioId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get optimization recommendations
  getOptimizationRecommendations: async (portfolioId, constraints = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/optimization/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(constraints)
    });
    return response.json();
  },

  // Get tail risk analysis
  getTailRiskAnalysis: async (portfolioId, confidenceLevels = [95, 99]) => {
    const response = await fetch(`${API_BASE_URL}/analytics/tail-risk/${portfolioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ confidenceLevels })
    });
    return response.json();
  }
};
