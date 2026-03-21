/**
 * Quant Engine API Service
 * Connects to advanced-quant-engine backend
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_QUANT_ENGINE_URL || 'http://localhost:8001/api';
const API_BASE_URL = '/api/quant-engine'; // Standard path for production proxy

const client = axios.create({ baseURL: BASE_URL, timeout: 2000 });

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const MOCK_MODEL_FUSION = {
  fusion_signal: 0.72,
  conviction: 'HIGH',
  models: {
    arima:      { signal: 0.65, weight: 0.20, accuracy: 0.71, status: 'active' },
    lstm:       { signal: 0.80, weight: 0.35, accuracy: 0.78, status: 'active' },
    hmm:        { signal: 0.68, weight: 0.20, accuracy: 0.69, status: 'active' },
    bayesian:   { signal: 0.74, weight: 0.15, accuracy: 0.74, status: 'active' },
    monte_carlo:{ signal: 0.70, weight: 0.10, accuracy: 0.72, status: 'active' },
  },
  last_updated: new Date().toISOString(),
  symbol: 'COMPOSITE',
};

export const MOCK_REGIME = {
  current_regime: 'BULL',
  confidence: 0.84,
  probabilities: { bull: 0.84, bear: 0.09, sideways: 0.07 },
  transition_matrix: [
    [0.75, 0.15, 0.10],
    [0.20, 0.65, 0.15],
    [0.12, 0.18, 0.70],
  ],
  history: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bull: Math.random() * 0.4 + (i > 15 ? 0.5 : 0.3),
    bear: Math.random() * 0.2 + 0.05,
    sideways: Math.random() * 0.2 + 0.05,
  })),
};

export const MOCK_STOCHASTIC = {
  symbol: 'NIFTY50',
  heston: {
    current_vol: 0.187,
    long_term_vol: 0.215,
    mean_reversion: 2.3,
    vol_of_vol: 0.42,
    paths_simulated: 10000,
    confidence_95: { lower: 17420, upper: 19850 },
  },
  gbm: {
    drift: 0.0012,
    volatility: 0.187,
    expected_price: 18640,
    paths: Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
      p10: 16500 + i * 150 + Math.random() * 300,
      p50: 17800 + i * 200 + Math.random() * 400,
      p90: 19200 + i * 250 + Math.random() * 500,
    })),
  },
  monte_carlo: {
    simulations: 50000,
    mean_return: 0.142,
    std_dev: 0.183,
    var_95: -0.089,
    cvar_95: -0.124,
  },
};

// ── API Calls with Mock Fallback ───────────────────────────────────────────────

export const runModelFusion = async (symbol = 'NIFTY50') => {
  try {
    const res = await client.post('/quant/fusion', { symbol });
    return res.data;
  } catch {
    return { ...MOCK_MODEL_FUSION, symbol };
  }
};

export const getRegimeAnalysis = async (symbol = 'NIFTY50') => {
  try {
    const res = await client.get(`/quant/regime/${symbol}`);
    return res.data;
  } catch {
    return MOCK_REGIME;
  }
};

export const getStochasticModels = async (symbol = 'NIFTY50') => {
  try {
    const res = await client.get(`/quant/stochastic/${symbol}`);
    return res.data;
  } catch {
    return { ...MOCK_STOCHASTIC, symbol };
  }
};

export const getModelPerformance = async () => {
  try {
    const res = await client.get('/quant/performance');
    return res.data;
  } catch {
    return {
      backtest_sharpe: 1.87,
      backtest_return: 0.234,
      live_accuracy: 0.71,
      total_signals: 1423,
      profitable_signals: 1011,
    };
  }
};
// ── Production API Endpoints (New) ─────────────────────────────────────────────

export const getModelFusionData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/model-fusion`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model fusion data:', error);
    // Fallback to existing runModelFusion logic/mock
    return runModelFusion();
  }
};

export const getRegimeDetectionData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/regime-detection`);
    return response.data;
  } catch (error) {
    console.error('Error fetching regime detection data:', error);
    return getRegimeAnalysis();
  }
};

export const getStochasticModelData = async (modelType = 'heston') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stochastic-models/${modelType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stochastic model data:', error);
    return getStochasticModels();
  }
};

export const getArbitrageData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/arbitrage`);
    return response.data;
  } catch (error) {
    console.error('Error fetching arbitrage data:', error);
    return {
      opportunities: [],
      status: 'no_data',
    };
  }
};
