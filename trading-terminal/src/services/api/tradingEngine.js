const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const tradingEngineAPI = {
  // Get system status
  getSystemStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get latency metrics
  getLatencyMetrics: async (timeframe = '1h') => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/latency?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get order execution statistics
  getOrderExecutionStats: async (timeframe = '1d') => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/orders?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get system health metrics
  getSystemHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/health`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get order routing statistics
  getOrderRouting: async (timeframe = '1d') => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/routing?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get historical latency trends
  getLatencyTrends: async (period = '7d') => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/latency-trends?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get error rates
  getErrorRates: async (timeframe = '1h') => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/errors?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get system resource metrics
  getResourceMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/resources`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get trade settlement status
  getSettlementStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/settlement`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get system alerts
  getSystemAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/trading-engine/alerts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time system updates
  subscribeToSystemUpdates: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/trading-engine`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
