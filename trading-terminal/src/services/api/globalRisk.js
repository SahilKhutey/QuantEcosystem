import { API_BASE_URL } from "./apiConfig";
// src/api/globalRisk.js


export const globalRiskAPI = {
  // Get portfolio risk summary
  getPortfolioRisk: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/portfolio/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get hazard indicators (market, credit, liquidity, volatility)
  getHazardIndicators: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/hazards/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get exposure levels across various categories
  getExposureLevels: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/exposure/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get risk matrix data (impact vs probability)
  getRiskMatrix: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/matrix/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get volatility metrics (VaR, Expected Shortfall, etc.)
  getVolatilityMetrics: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/volatility/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get asset correlation matrix
  getCorrelationMatrix: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/correlation/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical risk trend data
  getRiskTrend: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/trend/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get active risk alerts
  getRiskAlerts: async (portfolioId, timeframe = '1y') => {
    const response = await fetch(`${API_BASE_URL}/risk/alerts/${portfolioId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
