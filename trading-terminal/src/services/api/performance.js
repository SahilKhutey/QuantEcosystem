const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/performance';

export const performanceAPI = {
  // Get alpha attribution metrics (Sharpe, Sortino, Calmar)
  getAlphaAttribution: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/attribution?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get drawdown forensics and volatility regime analysis
  getDrawdownForensics: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/drawdown?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get real-time anomaly logs (latency spikes, drawdown breaches)
  getPerformanceAnomalies: async () => {
    const response = await fetch(`${API_BASE_URL}/anomalies`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get rolling returns and benchmark comparison
  getBenchmarking: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/benchmarking?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
