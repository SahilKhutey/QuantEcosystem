import { API_BASE_URL } from "./apiConfig";


export const aiAgentAPI = {
  // Get agent configurations
  getAgentConfigs: async () => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/configs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get agent status
  getAgentStatus: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/status/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Start/stop agent
  toggleAgent: async (agentId, action) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/${agentId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Update agent configuration
  updateAgentConfig: async (agentId, config) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/config/${agentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Get agent logs
  getAgentLogs: async (agentId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/ai-agent/logs/${agentId}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get agent performance
  getAgentPerformance: async (agentId, timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/performance/${agentId}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get trading signals
  getTradingSignals: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/signals/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get risk metrics
  getRiskMetrics: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/risk/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get agent positions
  getAgentPositions: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/positions/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get agent orders
  getAgentOrders: async (agentId, status = 'all') => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/orders/${agentId}?status=${status}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time agent updates
  subscribeToAgentUpdates: (agentId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/ai-agent/${agentId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get agent statistics
  getAgentStatistics: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/statistics/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get agent alerts
  getAgentAlerts: async (agentId) => {
    const response = await fetch(`${API_BASE_URL}/ai-agent/alerts/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
