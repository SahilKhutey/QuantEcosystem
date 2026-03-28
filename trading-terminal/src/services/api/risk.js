import { API_BASE_URL } from "./apiConfig";
// src/services/api/risk.js


/**
 * Risk Management API service for exposure, Greeks, VaR, and stress testing.
 */
export const riskAPI = {
  /**
   * Fetches real-time risk exposure data.
   */
  getRiskExposure: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/risk/exposure?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch risk exposure');
    return response.json();
  },

  /**
   * Fetches Greeks analysis for a specific symbol.
   */
  getGreeks: async (symbol, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/risk/greeks/${symbol}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch Greeks analysis');
    return response.json();
  },

  /**
   * Fetches Value at Risk (VaR) analysis.
   */
  getValueAtRisk: async (method = 'historical', confidence = 95, timeframe = '1d') => {
    const response = await fetch(`${API_BASE_URL}/risk/var?method=${method}&confidence=${confidence}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch VaR analysis');
    return response.json();
  },

  /**
   * Fetches Conditional Value at Risk (CVaR / Expected Shortfall).
   */
  getCVaR: async (method = 'historical', confidence = 95, timeframe = '1d') => {
    const response = await fetch(`${API_BASE_URL}/risk/cvar?method=${method}&confidence=${confidence}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch CVaR analysis');
    return response.json();
  },

  /**
   * Fetches current market risk regime (Risk-On/Risk-Off).
   */
  getRiskRegime: async () => {
    const response = await fetch(`${API_BASE_URL}/risk/regime`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch risk regime');
    return response.json();
  },

  /**
   * Fetches stress testing scenarios and results.
   */
  getStressTests: async (scenario = 'all') => {
    const response = await fetch(`${API_BASE_URL}/risk/stress-tests?scenario=${scenario}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch stress tests');
    return response.json();
  },

  /**
   * Fetches the correlation matrix for a set of assets.
   */
  getCorrelationMatrix: async (assets = []) => {
    const response = await fetch(`${API_BASE_URL}/risk/correlation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assets })
    });
    if (!response.ok) throw new Error('Failed to fetch correlation matrix');
    return response.json();
  },

  /**
   * Runs scenario analysis with custom parameters.
   */
  runScenarioAnalysis: async (scenarioData) => {
    const response = await fetch(`${API_BASE_URL}/risk/scenario-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scenarioData)
    });
    if (!response.ok) throw new Error('Failed to run scenario analysis');
    return response.json();
  },

  /**
   * Subscribes to real-time risk updates via WebSocket.
   */
  subscribeToRiskUpdates: (onUpdate) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${API_BASE_URL.replace(/^http/, protocol)}/ws/risk`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (err) {
        console.error('WebSocket risk update parse error:', err);
      }
    };

    ws.onerror = (err) => console.error('WebSocket risk error:', err);
    return ws;
  },

  /**
   * Fetches current risk limits and status.
   */
  getRiskLimits: async () => {
    const response = await fetch(`${API_BASE_URL}/risk/limits`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch risk limits');
    return response.json();
  },

  /**
   * Fetches compliance reports for a specific period.
   */
  getComplianceReport: async (period = '30d') => {
    const response = await fetch(`${API_BASE_URL}/risk/compliance?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch compliance report');
    return response.json();
  }
};
