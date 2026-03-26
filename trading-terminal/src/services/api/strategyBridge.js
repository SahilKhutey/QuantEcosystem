// src/services/api/strategyBridge.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_STRATEGY_ENGINE_URL || 'http://localhost:8000';

export const strategyBridge = {
  /**
   * Run a simulation on the Python backend
   * @param {string} type - 'sip' or 'swp'
   * @param {Object} params - Strategy parameters
   */
  runSimulation: async (type, params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/simulate/${type}`, params);
      return response.data;
    } catch (error) {
      console.error(`Simulation error (${type}):`, error);
      throw error;
    }
  },

  /**
   * Get real-time telemetry from the strategy engine
   * @param {string} strategyId - ID of the active strategy
   */
  getTelemetry: async (strategyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/telemetry/${strategyId}`);
      return response.data;
    } catch (error) {
      console.error('Telemetry error:', error);
      throw error;
    }
  },

  /**
   * Sync local configuration with the Python strategy logic
   * @param {Object} config - Strategy configuration
   */
  syncConfig: async (config) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/config`, config);
      return response.data;
    } catch (error) {
      console.error('Config sync error:', error);
      throw error;
    }
  }
};
