import { API_BASE_URL } from "./apiConfig";


export const sipAPI = {
  // Get SIP accounts
  getSIPAccounts: async () => {
    const response = await fetch(`${API_BASE_URL}/sip/accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP account performance
  getSIPPerformance: async (accountId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/performance?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP contribution history
  getContributionHistory: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/contributions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP portfolio allocation
  getPortfolioAllocation: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/allocation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP performance metrics
  getPerformanceMetrics: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/metrics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Create new SIP account
  createSIPAccount: async (accountData) => {
    const response = await fetch(`${API_BASE_URL}/sip/accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return response.json();
  },

  // Add contribution to SIP
  addContribution: async (accountId, contribution) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/contribute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contribution)
    });
    return response.json();
  },

  // Update SIP account
  updateSIPAccount: async (accountId, accountData) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return response.json();
  },

  // Delete SIP account
  deleteSIPAccount: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SIP projections
  getProjections: async (accountId, period = '5y') => {
    const response = await fetch(`${API_BASE_URL}/sip/account/${accountId}/projections?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to SIP updates
  subscribeToSIPUpdates: (accountId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/sip/${accountId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
