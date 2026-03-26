const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/devops';

export const devopsAPI = {
  // Get infrastructure health status
  getClusterHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/cluster/health`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get deployment orchestration logs
  getDeploymentLogs: async (deployId) => {
    const response = await fetch(`${API_BASE_URL}/deploy/logs?id=${deployId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Trigger a strategy engine deployment
  triggerDeployment: async (params) => {
    const response = await fetch(`${API_BASE_URL}/deploy/trigger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  },

  // Rollback a deployment
  rollbackDeployment: async (deployId) => {
    const response = await fetch(`${API_BASE_URL}/deploy/rollback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deployId })
    });
    return response.json();
  }
};
