import { API_BASE_URL } from "./apiConfig";


export const allocatorAPI = {
  // Create comprehensive portfolio plan
  createPlan: async (userProfile, investableAmount) => {
    const response = await fetch(`${API_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userProfile, investableAmount })
    });
    return response.json();
  },

  // Get current risk capacity assessment
  getRiskAssessment: async (profile) => {
    const response = await fetch(`${API_BASE_URL}/risk-assessment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });
    return response.json();
  },

  // Recalculate allocation for goal adjustments
  recalculateAllocation: async (params) => {
    const response = await fetch(`${API_BASE_URL}/recalculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  }
};
