import { API_BASE_URL } from "./apiConfig";


export const deploymentControlAPI = {
  // Get Docker container topology
  getContainerTopology: async () => {
    const response = await fetch(`${API_BASE_URL}/topology`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get CI/CD pipeline telemetry
  getPipelineStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/pipeline`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get cluster resource pressure
  getResourcePressure: async () => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
