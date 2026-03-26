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

  // Get multi-strategy performance telemetry
  getStrategyMetrics: async (strategyId = 'all') => {
    const response = await fetch(`${API_BASE_URL}/strategies/metrics?id=${strategyId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get strategy allocation and risk data
  getStrategyAllocation: async () => {
    const response = await fetch(`${API_BASE_URL}/strategies/allocation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Control strategy execution (start/stop)
  toggleStrategy: async (strategyId, action) => {
    const response = await fetch(`${API_BASE_URL}/strategies/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ strategyId, action })
    });
    return response.json();
  },

  // Subscribe to real-time system and strategy updates
  subscribeToUpdates: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/unified-telemetry`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  }
};
