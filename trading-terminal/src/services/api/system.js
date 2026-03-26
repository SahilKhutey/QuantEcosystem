const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/system';

export const systemAPI = {
  // Get health status of all core services
  getServiceStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get deployment timeline and history
  getDeploymentHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/deployments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Trigger a new deployment for a specific engine
  triggerDeployment: async (engineId) => {
    const response = await fetch(`${API_BASE_URL}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ engineId })
    });
    return response.json();
  },

  // Get real-time system resource metrics
  getResourceMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get operational logs for auditing
  getSystemLogs: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/logs?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
