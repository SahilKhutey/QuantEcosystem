// src/api/trading.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const tradingAPI = {
  getOrderBook: async (symbol) => {
    const response = await axios.get(`${API_URL}/trading/order-book/${symbol}`);
    return response.data;
  },
  
  getTradeHistory: async (symbol) => {
    const response = await axios.get(`${API_URL}/trading/history/${symbol}`);
    return response.data;
  },
  
  getPositions: async () => {
    const response = await axios.get(`${API_URL}/trading/positions`);
    return response.data;
  },
  
  getMarketData: async (symbol) => {
    const response = await axios.get(`${API_URL}/trading/market-data/${symbol}`);
    return response.data;
  },
  
  placeOrder: async (symbol, orderData) => {
    const response = await axios.post(`${API_URL}/trading/order`, { symbol, ...orderData });
    return response.data;
  },
  
  cancelOrder: async (orderId) => {
    const response = await axios.delete(`${API_URL}/trading/order/${orderId}`);
    return response.data;
  }
};
