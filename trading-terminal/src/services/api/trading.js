// src/services/api/trading.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Trading API service for order management, positions, and market data.
 */
export const tradingAPI = {
  /**
   * Submits a new order to the trading system.
   * @param {Object} orderData - The order details (symbol, qty, side, type, etc.).
   */
  placeOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/trading/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to place order');
    return response.json();
  },

  /**
   * Cancels an existing order by its ID.
   * @param {string} orderId - The ID of the order to cancel.
   */
  cancelOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/trading/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to cancel order');
    return response.json();
  },

  /**
   * Fetches the real-time order book for a given symbol.
   * @param {string} symbol - The asset symbol (e.g., 'AAPL').
   */
  getOrderBook: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/trading/orderbook/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch order book');
    return response.json();
  },

  /**
   * Fetches all open orders, optionally filtered by symbol.
   * @param {string} symbol - The symbol to filter by (optional).
   */
  getOpenOrders: async (symbol = '') => {
    const symbolParam = symbol ? `?symbol=${symbol}` : '';
    const response = await fetch(`${API_BASE_URL}/trading/orders/open${symbolParam}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch open orders');
    return response.json();
  },

  /**
   * Fetches current positions, optionally filtered by symbol.
   * @param {string} symbol - The symbol to filter by (optional).
   */
  getPositions: async (symbol = '') => {
    const symbolParam = symbol ? `?symbol=${symbol}` : '';
    const response = await fetch(`${API_BASE_URL}/trading/positions${symbolParam}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch positions');
    return response.json();
  },

  /**
   * Fetches detailed market data for a specific symbol.
   * @param {string} symbol - The asset symbol.
   */
  getMarketData: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/trading/market/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch market data');
    return response.json();
  },

  /**
   * Establishes a WebSocket connection for real-time trading updates.
   * @param {string} symbol - The asset symbol.
   * @param {Function} onMessage - Callback for incoming WebSocket messages.
   */
  connectWebSocket: (symbol, onMessage) => {
    // Replace http with ws for the WebSocket URL
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/trading/${symbol}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
};
