const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/signal-monitor';

export const signalMonitorAPI = {
  // Get real-time signal propagation trace
  getSignalTrace: async () => {
    const response = await fetch(`${API_BASE_URL}/trace`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get anomaly detection logs
  getAnomalies: async () => {
    const response = await fetch(`${API_BASE_URL}/anomalies`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get feature engineering telemetry
  getFeatureStats: async () => {
    const response = await fetch(`${API_BASE_URL}/features`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
