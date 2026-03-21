import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global market endpoints
export const getGlobalMarketView = async () => {
  try {
    const response = await api.get('/market/global');
    return response.data;
  } catch (error) {
    console.error('Error fetching global market view:', error);
    throw error;
  }
};

export const getRegionMarketData = async (region) => {
  try {
    const response = await api.get(`/market/region/${region}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market data for ${region}:`, error);
    throw error;
  }
};

export const getMarketCorrelation = async () => {
  try {
    const response = await api.get('/market/correlation');
    return response.data;
  } catch (error) {
    console.error('Error fetching market correlation:', error);
    throw error;
  }
};

export const getTradeOpportunities = async () => {
  try {
    const response = await api.get('/market/opportunities');
    return response.data;
  } catch (error) {
    console.error('Error fetching trade opportunities:', error);
    throw error;
  }
};

export const getEconomicIndicators = async (region) => {
  try {
    const response = await api.get(`/market/economic/${region}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching economic indicators for ${region}:`, error);
    throw error;
  }
};

// Market data endpoints
export const getHistoricalData = async (symbol, timeframe = '1D', start = null, end = null) => {
  try {
    const params = {
      timeframe,
      ...(start && { start }),
      ...(end && { end })
    };
    
    const response = await api.get(`/data/historical/${symbol}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
};

export const getRealTimeData = async (symbol) => {
  try {
    const response = await api.get(`/data/realtime/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching real-time data for ${symbol}:`, error);
    throw error;
  }
};

// News endpoints
export const getNews = async (query = 'market', sources = [], from_date = null) => {
  try {
    const params = {
      q: query,
      ...(sources.length > 0 && { sources: sources.join(',') }),
      ...(from_date && { from_date })
    };
    
    const response = await api.get('/news', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Broker integration endpoints
export const getAccount = async () => {
  try {
    const response = await api.get('/broker/account');
    return response.data;
  } catch (error) {
    console.error('Error fetching account information:', error);
    throw error;
  }
};

export const getPositions = async () => {
  try {
    const response = await api.get('/broker/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

export const submitOrder = async (order) => {
  try {
    const response = await api.post('/broker/orders', order);
    return response.data;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/broker/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.delete(`/broker/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

// Backtesting endpoints
export const runBacktest = async (strategy, symbol, start, end, initialCapital = 100000) => {
  try {
    const response = await api.post('/backtest', {
      strategy,
      symbol,
      start,
      end,
      initialCapital
    });
    return response.data;
  } catch (error) {
    console.error('Error running backtest:', error);
    throw error;
  }
};

export default api;
