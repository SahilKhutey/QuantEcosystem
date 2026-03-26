const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/macro';

export const macroAPI = {
  // Get economic indicators (FED, CPI, GDP)
  getEconomicIndicators: async () => {
    const response = await fetch(`${API_BASE_URL}/indicators`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get risk-on/off composite score
  getRiskSentiment: async () => {
    const response = await fetch(`${API_BASE_URL}/sentiment/risk`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get sector rotation momentum
  getSectorRotation: async () => {
    const response = await fetch(`${API_BASE_URL}/sector-rotation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get economic calendar events
  getEconomicCalendar: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/calendar?start=${startDate}&end=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
