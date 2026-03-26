const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/developer';

export const developerAPI = {
  // Get all API keys for the current user
  getAPIKeys: async () => {
    const response = await fetch(`${API_BASE_URL}/keys`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Generate a new API key
  createAPIKey: async (name, permissions = []) => {
    const response = await fetch(`${API_BASE_URL}/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, permissions })
    });
    return response.json();
  },

  // Delete an API key
  deleteAPIKey: async (keyId) => {
    const response = await fetch(`${API_BASE_URL}/keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get webhook configurations
  getWebhooks: async () => {
    const response = await fetch(`${API_BASE_URL}/webhooks`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Register a new webhook
  createWebhook: async (config) => {
    const response = await fetch(`${API_BASE_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Get signal fusion audit data
  getSignalFusionAudit: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/signals/fusion-audit/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
