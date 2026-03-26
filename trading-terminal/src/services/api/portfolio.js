// src/services/api/portfolio.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Portfolio API service for summary, allocation, P&L, and risk metrics.
 */
export const portfolioAPI = {
  /**
   * Fetches a high-level summary of the portfolio.
   */
  getPortfolioSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/summary`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio summary');
    return response.json();
  },

  /**
   * Fetches asset allocation data, grouped by a specific dimension.
   * @param {string} groupBy - The dimension to group by ('asset', 'sector', 'region').
   */
  getAssetAllocation: async (groupBy = 'asset') => {
    const response = await fetch(`${API_BASE_URL}/portfolio/allocation?groupBy=${groupBy}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch asset allocation');
    return response.json();
  },

  /**
   * Fetches P&L analysis over a specific timeframe.
   * @param {string} timeframe - The time period (e.g., '30d', '90d', '1y').
   */
  getPnLAnalysis: async (timeframe = '30d') => {
    const response = await fetch(`${API_BASE_URL}/portfolio/pnl?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch P&L analysis');
    return response.json();
  },

  /**
   * Fetches detailed position information with optional filters.
   * @param {Object} filters - Filtering criteria (symbol, assetClass, etc.).
   */
  getPositions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/portfolio/positions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch positions');
    return response.json();
  },

  /**
   * Fetches transaction history with optional filters.
   * @param {Object} filters - Filtering criteria (startDate, endDate, type).
   */
  getTransactions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/portfolio/transactions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  /**
   * Fetches advanced risk metrics for the portfolio.
   */
  getRiskMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/risk-metrics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch risk metrics');
    return response.json();
  },

  /**
   * Exports portfolio data in a specified format.
   * @param {string} format - The export format ('csv', 'json', 'pdf').
   */
  exportPortfolioData: async (format = 'csv') => {
    const response = await fetch(`${API_BASE_URL}/portfolio/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to export portfolio data');
    return response.blob();
  }
};
