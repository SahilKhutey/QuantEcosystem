const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const settingsAPI = {
  // API Keys
  getAPIKeys: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/api-keys`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  createAPIKey: async (keyData) => {
    const response = await fetch(`${API_BASE_URL}/settings/api-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(keyData)
    });
    return response.json();
  },
  
  deleteAPIKey: async (keyId) => {
    const response = await fetch(`${API_BASE_URL}/settings/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Alert Management
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/alerts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  createAlert: async (alertData) => {
    const response = await fetch(`${API_BASE_URL}/settings/alerts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alertData)
    });
    return response.json();
  },
  
  deleteAlert: async (alertId) => {
    const response = await fetch(`${API_BASE_URL}/settings/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // System Configuration
  getSystemConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/system`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  updateSystemConfig: async (configData) => {
    const response = await fetch(`${API_BASE_URL}/settings/system`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(configData)
    });
    return response.json();
  },

  // User Management
  getUserProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  updateUserProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    return response.json();
  },
  
  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/settings/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });
    return response.json();
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  updateNotificationPreferences: async (prefs) => {
    const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prefs)
    });
    return response.json();
  }
};
