import { API_BASE_URL } from "./apiConfig";


export const quantEngineAPI = {
  // Get strategy templates
  getStrategyTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/templates`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get backtesting results
  getBacktestingResults: async (strategyId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/quant-engine/backtesting/${strategyId}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Run backtesting
  runBacktesting: async (strategyConfig) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/backtesting/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(strategyConfig)
    });
    return response.json();
  },

  // Get optimization results
  getOptimizationResults: async (strategyId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/quant-engine/optimization/${strategyId}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Run optimization
  runOptimization: async (strategyId, optimizationConfig) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/optimization/${strategyId}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(optimizationConfig)
    });
    return response.json();
  },

  // Get strategy parameters
  getStrategyParameters: async (strategyId) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/strategies/${strategyId}/parameters`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Update strategy parameters
  updateStrategyParameters: async (strategyId, parameters) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/strategies/${strategyId}/parameters`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    });
    return response.json();
  },

  // Get market data for backtesting
  getMarketData: async (symbol, timeframe, startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/data/${symbol}?timeframe=${timeframe}&start=${startDate}&end=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get performance metrics
  getPerformanceMetrics: async (backtestId) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/performance/${backtestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get risk metrics
  getRiskMetrics: async (backtestId) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/risk/${backtestId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Save strategy
  saveStrategy: async (strategyData) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/strategies/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(strategyData)
    });
    return response.json();
  },

  // Get saved strategies
  getSavedStrategies: async () => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/strategies`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get RL training metrics
  getRLTrainingMetrics: async (agentId = 'default') => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/rl/metrics/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get signal convergence (multi-modal fusion)
  getSignalConvergence: async (symbol) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/signals/convergence?symbol=${symbol}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get Monte Carlo simulation results
  getMonteCarloResults: async (backtestId) => {
    const response = await fetch(`${API_BASE_URL}/quant-engine/backtesting/${backtestId}/monte-carlo`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time backtesting updates
  subscribeToBacktestingUpdates: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/quant-engine`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Subscribe to real-time RL training updates
  subscribeToRLUpdates: (agentId, onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/rl-training/${agentId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Run model fusion
  runModelFusion: async (config) => {
    const symbol = typeof config === 'string' ? config : config?.symbol || 'RELIANCE';
    const response = await fetch(`${API_BASE_URL}/quant-engine/signals/fusion/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbol })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fusion API error (${response.status}):`, errorText);
      throw new Error(`Fusion API failed with status ${response.status}`);
    }
    
    return response.json();
  }
};

export const runModelFusion = quantEngineAPI.runModelFusion;
