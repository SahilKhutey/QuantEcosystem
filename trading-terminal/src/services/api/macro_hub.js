import { API_BASE_URL } from "./apiConfig";


export const macroHubAPI = {
  // Get interest rate probability curve
  getRateProbabilities: async () => {
    const response = await fetch(`${API_BASE_URL}/rate-probs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get global inflation heatmap data
  getInflationHeatmap: async () => {
    const response = await fetch(`${API_BASE_URL}/inflation-map`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get economic calendar events
  getCalendar: async (start, end) => {
    const response = await fetch(`${API_BASE_URL}/calendar?start=${start}&end=${end}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
