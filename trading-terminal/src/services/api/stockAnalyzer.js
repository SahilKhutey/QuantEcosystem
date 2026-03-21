/**
 * Stock Analyzer Pro API Service
 * Connects to stock-analyzer-pro backend
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_STOCK_ANALYZER_URL || 'http://localhost:8003/api';
const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const MOCK_STOCK = {
  symbol: 'HDFCBANK',
  name: 'HDFC Bank Ltd.',
  exchange: 'NSE',
  cmp: 1598.45,
  change: 24.30,
  change_pct: 1.54,
  volume: 8234567,
  avg_volume: 6789000,
  day_high: 1612.80,
  day_low: 1581.20,
  week_52_high: 1757.80,
  week_52_low: 1363.45,
  market_cap: '12.2T',
  sector: 'Financial Services',
  price_history: Array.from({ length: 90 }, (_, i) => ({
    date: new Date(Date.now() - (89 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    open:  1520 + Math.sin(i * 0.2) * 60 + Math.random() * 30,
    close: 1530 + Math.sin(i * 0.2) * 65 + Math.random() * 30,
    high:  1550 + Math.sin(i * 0.2) * 70 + Math.random() * 30,
    low:   1510 + Math.sin(i * 0.2) * 55 + Math.random() * 30,
    volume: 5000000 + Math.random() * 5000000,
  })),
};

export const MOCK_TECHNICALS = {
  rsi: { value: 58.4, signal: 'NEUTRAL', overbought: 70, oversold: 30 },
  macd: { value: 12.3, signal_line: 8.7, histogram: 3.6, trend: 'BULLISH' },
  bollinger: {
    upper: 1642.30,
    middle: 1598.45,
    lower: 1554.60,
    bandwidth: 5.5,
    pct_b: 0.55,
  },
  ema: { ema_20: 1581.2, ema_50: 1548.7, ema_200: 1489.3, signal: 'BULLISH' },
  atr: { value: 24.8, volatility: 'MODERATE' },
  stochastic: { k: 64.2, d: 58.7, signal: 'NEUTRAL' },
  adx: { value: 28.4, trend_strength: 'MODERATE', plus_di: 24.1, minus_di: 16.3 },
  volume_profile: { trend: 'INCREASING', relative: 1.21 },
  overall_signal: 'BUY',
  signal_strength: 72,
};

export const MOCK_FUNDAMENTALS = {
  valuation: {
    pe_ratio: 18.4,
    pb_ratio: 2.8,
    ev_ebitda: 11.2,
    peg_ratio: 1.1,
    price_to_sales: 3.6,
    dcf_value: 1820,
    dcf_upside: 13.9,
  },
  profitability: {
    roe: 16.8,
    roa: 1.9,
    net_margin: 21.4,
    operating_margin: 28.9,
    gross_margin: 47.3,
  },
  growth: {
    revenue_yoy: 24.1,
    earnings_yoy: 18.7,
    book_value_yoy: 16.2,
    loan_growth: 21.4,
  },
  strength: {
    debt_to_equity: 0.08,
    current_ratio: 1.18,
    interest_coverage: 3.8,
    npa_gross: 1.24,
    npa_net: 0.33,
    car: 18.1,
  },
  quality_score: 82,
  growth_score: 74,
  value_score: 68,
  momentum_score: 71,
};

// ── API Calls ─────────────────────────────────────────────────────────────────

export const analyzeStock = async (symbol = 'HDFCBANK') => {
  try {
    const res = await client.get(`/analyze/${symbol}`);
    return res.data;
  } catch {
    return { ...MOCK_STOCK, symbol };
  }
};

export const getTechnicalIndicators = async (symbol = 'HDFCBANK') => {
  try {
    const res = await client.get(`/technical/${symbol}`);
    return res.data;
  } catch {
    return MOCK_TECHNICALS;
  }
};

export const getFundamentals = async (symbol = 'HDFCBANK') => {
  try {
    const res = await client.get(`/fundamentals/${symbol}`);
    return res.data;
  } catch {
    return MOCK_FUNDAMENTALS;
  }
};

export const getScreeningResults = async (filters = {}) => {
  try {
    const res = await client.post('/screen', filters);
    return res.data;
  } catch {
    return [
      { symbol: 'TCS',      score: 88, signal: 'BUY',  sector: 'IT',       cmp: 3876, change_pct: 1.2 },
      { symbol: 'HDFCBANK', score: 82, signal: 'BUY',  sector: 'Finance',  cmp: 1598, change_pct: 1.5 },
      { symbol: 'RELIANCE', score: 74, signal: 'HOLD', sector: 'Energy',   cmp: 2871, change_pct: 0.3 },
      { symbol: 'INFY',     score: 79, signal: 'BUY',  sector: 'IT',       cmp: 1876, change_pct: 0.8 },
      { symbol: 'MARUTI',   score: 76, signal: 'BUY',  sector: 'Auto',     cmp: 11240, change_pct: 2.1 },
    ];
  }
};
