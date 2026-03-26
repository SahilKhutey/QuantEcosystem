const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/rl-agent';

export const rlAgentStudioAPI = {
  // Get PPO reward surface
  getRewardSurface: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/reward-surface?agent_id=${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get action-space probability distribution
  getActionProbs: async (agentId, marketState) => {
    const response = await fetch(`${API_BASE_URL}/action-probs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId, marketState })
    });
    return response.json();
  },

  // Get training convergence logs
  getTrainingLogs: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/logs?agent_id=${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
