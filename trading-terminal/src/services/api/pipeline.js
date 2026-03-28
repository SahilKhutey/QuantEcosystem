import { API_BASE_URL } from "./apiConfig";


export const pipelineAPI = {
  // Get GitHub Actions build status
  getBuildStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/github/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get test coverage historical trends
  getCoverageTrends: async () => {
    const response = await fetch(`${API_BASE_URL}/tests/coverage`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get Kubernetes rollout status
  getRolloutStatus: async (deploymentName) => {
    const response = await fetch(`${API_BASE_URL}/k8s/rollout?name=${deploymentName}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get infrastructure environment status (Staging vs Prod)
  getEnvironmentRegistry: async () => {
    const response = await fetch(`${API_BASE_URL}/env/registry`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
