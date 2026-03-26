const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/orchestrator';

export const orchestratorAPI = {
  // Get docker service status
  getServiceStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Scale service containers
  scaleService: async (serviceName, replicas) => {
    const response = await fetch(`${API_BASE_URL}/scale`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ serviceName, replicas })
    });
    return response.json();
  },

  // Get resource logs for a service
  getServiceLogs: async (serviceId) => {
    const response = await fetch(`${API_BASE_URL}/logs?id=${serviceId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
