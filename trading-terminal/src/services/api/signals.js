import { API_BASE_URL } from "./apiConfig";


export const signalsAPI = {
  // Get AI-generated signals
  getSignals: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/signals?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get signal details and analysis
  getSignalDetails: async (signalId) => {
    const response = await fetch(`${API_BASE_URL}/signals/${signalId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get model performance metrics
  getModelPerformance: async (modelType = 'lstm') => {
    const response = await fetch(`${API_BASE_URL}/signals/performance?model=${modelType}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get feature importance for explainability
  getFeatureImportance: async (signalId) => {
    const response = await fetch(`${API_BASE_URL}/signals/${signalId}/features`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get backtesting results
  getBacktestingResults: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/signals/backtesting?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get technical indicators used in signals
  getTechnicalIndicators: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/signals/indicators/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time signal updates
  subscribeToSignals: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/signals`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get model confidence scores
  getModelConfidence: async (signalId) => {
    const response = await fetch(`${API_BASE_URL}/signals/${signalId}/confidence`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get ensemble predictions
  getEnsemblePredictions: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/signals/ensemble/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
