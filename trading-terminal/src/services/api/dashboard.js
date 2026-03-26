// src/services/api/dashboard.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Dashboard API service for fetching portfolio, performance, and market data.
 */
export const dashboardAPI = {
  /**
   * Fetches the overall portfolio summary, including equity, balance, and P&L.
   */
  getPortfolioOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/portfolio`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio overview');
    return response.json();
  },

  /**
   * Fetches asset performance metrics over a specific timeframe.
   * @param {string} timeframe - The time period (e.g., '24h', '7d', '1m').
   */
  getAssetPerformance: async (timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/performance?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch asset performance');
    return response.json();
  },

  /**
   * Fetches a high-level overview of global market conditions.
   */
  getMarketOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/market-overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch market overview');
    return response.json();
  },

  /**
   * Fetches a list of the most recent trades executed.
   * @param {number} limit - Maximum number of trades to retrieve.
   */
  getRecentTrades: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-trades?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch recent trades');
    return response.json();
  }
};
