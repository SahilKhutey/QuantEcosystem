/**
 * AI Trading Agent API Service
 * Connects to ai-trading-agent backend
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_AI_AGENT_URL || 'http://localhost:8002/api';
const client = axios.create({ baseURL: BASE_URL, timeout: 2000 });

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const MOCK_NEWS = [
  {
    id: 1, title: 'RBI Holds Rates Steady Amid Inflation Concerns',
    source: 'Economic Times', sentiment: 0.65, sentiment_label: 'POSITIVE',
    entities: ['RBI', 'INFLATION', 'INTEREST RATES'],
    impact: 'HIGH', symbol_tags: ['BANKNIFTY', 'HDFCBANK', 'ICICIBANK'],
    summary: 'Reserve Bank of India keeps repo rate unchanged at 6.5%, signaling a cautious approach to monetary policy.',
    published_at: new Date(Date.now() - 3600000).toISOString(), url: '#',
  },
  {
    id: 2, title: 'IT Sector Rallies on Strong US Deal Wins',
    source: 'Mint', sentiment: 0.78, sentiment_label: 'POSITIVE',
    entities: ['IT SECTOR', 'TCS', 'INFOSYS', 'USD'],
    impact: 'MEDIUM', symbol_tags: ['NIFTYIT', 'TCS', 'INFY'],
    summary: 'Indian IT majors report strong deal wins from US clients, boosting sector outlook amid global uncertainty.',
    published_at: new Date(Date.now() - 7200000).toISOString(), url: '#',
  },
  {
    id: 3, title: 'FII Outflows Accelerate; Markets Under Pressure',
    source: 'Business Standard', sentiment: -0.52, sentiment_label: 'NEGATIVE',
    entities: ['FII', 'NIFTY', 'SENSEX', 'DOLLAR'],
    impact: 'HIGH', symbol_tags: ['NIFTY50', 'SENSEX'],
    summary: 'Foreign institutional investors pulled out Rs 8,400 crore from equities in the last three sessions.',
    published_at: new Date(Date.now() - 10800000).toISOString(), url: '#',
  },
  {
    id: 4, title: 'Crude Oil Dips Below $78; Energy Stocks Mixed',
    source: 'Reuters', sentiment: 0.12, sentiment_label: 'NEUTRAL',
    entities: ['CRUDE OIL', 'OPEC', 'ENERGY'],
    impact: 'MEDIUM', symbol_tags: ['ONGC', 'BPCL', 'RELIANCE'],
    summary: 'Brent crude edges lower on demand uncertainty, with mixed reactions in Indian energy stocks.',
    published_at: new Date(Date.now() - 14400000).toISOString(), url: '#',
  },
  {
    id: 5, title: 'Auto Sales Hit Record High in February',
    source: 'Moneycontrol', sentiment: 0.82, sentiment_label: 'POSITIVE',
    entities: ['AUTO', 'MARUTI', 'TATAMOTORS', 'EV'],
    impact: 'MEDIUM', symbol_tags: ['NIFTYAUTO', 'MARUTI', 'M&M'],
    summary: 'Passenger vehicle sales surged 18% YoY in February, led by SUV demand and EV adoption.',
    published_at: new Date(Date.now() - 18000000).toISOString(), url: '#',
  },
];

export const MOCK_ANALYST = {
  overall_bias: 'MODERATELY_BULLISH',
  conviction_score: 72,
  target_horizon: '2-4 weeks',
  thesis: 'Domestic macros remain supportive with declining inflation and strong GST collections. FII headwinds are a near-term drag but DII flows continue to absorb selling. IT sector offers selective opportunities on US deal momentum.',
  key_catalysts: [
    { event: 'Q4 Earnings Season', timing: '2-3 weeks', impact: 'HIGH', direction: 'POSITIVE' },
    { event: 'US Fed Meeting', timing: '1 week', impact: 'HIGH', direction: 'UNCERTAIN' },
    { event: 'India CPI Data', timing: '5 days', impact: 'MEDIUM', direction: 'POSITIVE' },
    { event: 'FII Flow Reversal', timing: 'Ongoing', impact: 'HIGH', direction: 'WATCH' },
  ],
  risk_factors: [
    'Persistent FII selling pressure',
    'Global recession fears dampening risk appetite',
    'Crude oil volatility impacting CAD',
    'INR weakness vs USD could accelerate',
  ],
  watchlist: [
    { symbol: 'HDFCBANK', action: 'BUY', confidence: 0.81, target: 1720, cmp: 1598 },
    { symbol: 'TCS',      action: 'BUY', confidence: 0.74, target: 4100, cmp: 3876 },
    { symbol: 'RELIANCE', action: 'HOLD', confidence: 0.62, target: 2950, cmp: 2871 },
    { symbol: 'ZOMATO',   action: 'BUY', confidence: 0.77, target: 245, cmp: 218 },
  ],
  market_sentiment: {
    fear_greed_index: 58,
    put_call_ratio: 0.88,
    advance_decline: 1.42,
    vix: 14.2,
  },
};

// ── API Calls ─────────────────────────────────────────────────────────────────

export const getNewsIntelligence = async (query = 'market', limit = 10) => {
  try {
    const res = await client.get('/agent/news', { params: { query, limit } });
    return res.data;
  } catch {
    return MOCK_NEWS;
  }
};

export const getMarketAnalysis = async () => {
  try {
    const res = await client.get('/agent/analysis');
    return res.data;
  } catch {
    return MOCK_ANALYST;
  }
};

export const getSentimentScore = async (text) => {
  try {
    const res = await client.post('/agent/sentiment', { text });
    return res.data;
  } catch {
    return { score: Math.random() * 2 - 1, label: 'NEUTRAL' };
  }
};

export const getAgentSignals = async () => {
  try {
    const res = await client.get('/agent/signals');
    return res.data;
  } catch {
    return MOCK_ANALYST.watchlist;
  }
};
