const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const globalWealthAPI = {
  // Get wealth portfolio overview
  getWealthOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/wealth/overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get asset allocation details
  getAssetAllocation: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/allocation/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP/SWP schedules and tracking
  getSipSwpSchedules: async (clientId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/wealth/sip-swp/${clientId}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get performance analytics
  getPerformanceAnalytics: async (clientId, timeframe = 'ytd') => {
    const response = await fetch(`${API_BASE_URL}/wealth/performance/${clientId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get tax optimization recommendations
  getTaxOptimization: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/tax-optimization/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get estate planning documents
  getEstatePlanning: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/estate-planning/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get risk assessment and insurance coverage
  getRiskAssessment: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/risk-assessment/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get goal-based planning
  getGoalPlanning: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/goal-planning/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get cash flow analysis
  getCashFlowAnalysis: async (clientId, period = 'monthly') => {
    const response = await fetch(`${API_BASE_URL}/wealth/cash-flow/${clientId}?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get investment recommendations
  getInvestmentRecommendations: async (clientId, strategy = 'conservative') => {
    const response = await fetch(`${API_BASE_URL}/wealth/recommendations/${clientId}?strategy=${strategy}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time wealth updates
  subscribeToWealthUpdates: (clientId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/wealth/${clientId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get family office services
  getFamilyOfficeServices: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/family-office/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get philanthropy and charitable giving
  getPhilanthropyData: async (clientId) => {
    const response = await fetch(`${API_BASE_URL}/wealth/philanthropy/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
