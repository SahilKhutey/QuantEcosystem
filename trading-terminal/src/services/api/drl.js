import { API_BASE_URL } from "./apiConfig";


export const drlAPI = {
  // Get DRL agent training metrics
  getTrainingMetrics: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/training/metrics?agentId=${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Update DRL hyper-parameters
  updateHyperParameters: async (agentId, params) => {
    const response = await fetch(`${API_BASE_URL}/training/params`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId, ...params })
    });
    return response.json();
  },

  // Start/Stop DRL training
  toggleTraining: async (agentId, status) => {
    const response = await fetch(`${API_BASE_URL}/training/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId, status })
    });
    return response.json();
  },

  // Get agent state-action mappings (for visualization)
  getStateActionMappings: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/agent/mappings?agentId=${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
