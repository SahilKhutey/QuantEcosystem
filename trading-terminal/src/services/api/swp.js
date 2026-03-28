import { API_BASE_URL } from "./apiConfig";
// src/api/swp.js


export const swpAPI = {
  // Get SWP accounts
  getSWPAccounts: async () => {
    const response = await fetch(`${API_BASE_URL}/swp/accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SWP account performance
  getSWPPerformance: async (accountId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/performance?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get withdrawal history
  getWithdrawalHistory: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/withdrawals`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get portfolio allocation
  getPortfolioAllocation: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/allocation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get performance metrics
  getPerformanceMetrics: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/metrics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Create new SWP account
  createSWPAccount: async (accountData) => {
    const response = await fetch(`${API_BASE_URL}/swp/accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return response.json();
  },

  // Add withdrawal
  addWithdrawal: async (accountId, withdrawal) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(withdrawal)
    });
    return response.json();
  },

  // Update SWP account
  updateSWPAccount: async (accountId, accountData) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return response.json();
  },

  // Delete SWP account
  deleteSWPAccount: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SWP projections
  getProjections: async (accountId, period = '5y') => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/projections?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get SWP sustainability analysis
  getSustainabilityAnalysis: async (accountId, strategy = '4% rule') => {
    const response = await fetch(`${API_BASE_URL}/swp/account/${accountId}/sustainability?strategy=${strategy}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to SWP updates
  subscribeToSWPUpdates: (accountId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/swp/${accountId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
