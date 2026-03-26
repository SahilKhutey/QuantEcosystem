const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/sentiment-topology';

export const sentimentTopologyAPI = {
  // Get NLP entity-impact map
  getEntityImpactMap: async (timerange = '1d') => {
    const response = await fetch(`${API_BASE_URL}/entity-map?range=${timerange}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get signal-to-trade attribution forensics
  getSignalAttribution: async (tradeId) => {
    const response = await fetch(`${API_BASE_URL}/attribution?trade_id=${tradeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get cross-asset sentiment correlation
  getSentimentCorrelation: async () => {
    const response = await fetch(`${API_BASE_URL}/correlation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
