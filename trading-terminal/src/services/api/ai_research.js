const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/ai-research';

export const aiResearchAPI = {
  // Generate executive stock analysis
  analyzeStock: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/analyze?symbol=${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get thematic asset clusters
  getThematicClusters: async () => {
    const response = await fetch(`${API_BASE_URL}/themes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Simulate market scenario impact
  simulateScenario: async (scenario, portfolio) => {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenario, portfolio })
    });
    return response.json();
  }
};
