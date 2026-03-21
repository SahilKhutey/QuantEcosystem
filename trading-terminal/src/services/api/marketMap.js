/**
 * Market Map API Service
 * Connects to global-market-map backend
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_MARKET_MAP_URL || 'http://localhost:8004/api';
const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

export const MOCK_GLOBAL_DATA = {
  regions: {
    north_america: {
      id: 'north_america', name: 'North America', lat: 37.09, lng: -95.71,
      index: 'S&P 500', index_value: 5087.32, change: 0.82, change_abs: 41.5,
      status: 'bullish', currency: 'USD', market_hours: '9:30–16:00 ET',
      sentiment: 0.72, geo_risk: 'LOW',
      data: Array.from({ length: 30 }, (_, i) => ({
        name: i + 1, value: 4800 + i * 10 + Math.random() * 50
      })),
    },
    europe: {
      id: 'europe', name: 'Europe', lat: 54.52, lng: 15.25,
      index: 'STOXX 50', index_value: 4987.15, change: 0.34, change_abs: 16.9,
      status: 'moderate', currency: 'EUR', market_hours: '8:00–17:30 CET',
      sentiment: 0.52, geo_risk: 'MEDIUM',
      data: Array.from({ length: 30 }, (_, i) => ({
        name: i + 1, value: 4800 + i * 7 + Math.random() * 40
      })),
    },
    asia_pacific: {
      id: 'asia_pacific', name: 'Asia Pacific', lat: 34.0, lng: 137.0,
      index: 'Nikkei 225', index_value: 38487.24, change: -0.42, change_abs: -162.4,
      status: 'bearish', currency: 'JPY', market_hours: '9:00–15:30 JST',
      sentiment: 0.41, geo_risk: 'MEDIUM',
      data: Array.from({ length: 30 }, (_, i) => ({
        name: i + 1, value: 37000 + i * 50 + Math.random() * 400
      })),
    },
    india: {
      id: 'india', name: 'India', lat: 20.59, lng: 78.96,
      index: 'NIFTY 50', index_value: 22412.40, change: 1.14, change_abs: 253.7,
      status: 'bullish', currency: 'INR', market_hours: '9:15–15:30 IST',
      sentiment: 0.78, geo_risk: 'LOW',
      data: Array.from({ length: 30 }, (_, i) => ({
        name: i + 1, value: 21500 + i * 40 + Math.random() * 200
      })),
    },
    emerging_markets: {
      id: 'emerging_markets', name: 'Emerging Markets', lat: 10.0, lng: 50.0,
      index: 'MSCI EM', index_value: 1047.82, change: -1.12, change_abs: -11.8,
      status: 'bearish', currency: 'Varies', market_hours: 'Varies',
      sentiment: 0.34, geo_risk: 'HIGH',
      data: Array.from({ length: 30 }, (_, i) => ({
        name: i + 1, value: 1100 + i * 2 - Math.random() * 30
      })),
    },
  },
  economic_indicators: {
    gdp:           { name: 'Global GDP Growth', value: 3.1,  change: 0.2,  unit: '%' },
    inflation:     { name: 'US CPI',            value: 3.2,  change: -0.1, unit: '%' },
    unemployment:  { name: 'US Unemployment',   value: 3.7,  change: -0.1, unit: '%' },
    interest_rates:{ name: 'Fed Funds Rate',    value: 5.25, change: 0,    unit: '%' },
    dxy:           { name: 'DXY Index',          value: 104.08, change: -0.3, unit: '' },
    vix:           { name: 'VIX',               value: 14.2, change: -1.1, unit: '' },
  },
  geo_risk_events: [
    { region: 'Middle East', event: 'Geopolitical Tensions', risk: 'HIGH', impact: 'OIL' },
    { region: 'Europe',      event: 'ECB Policy Decision',   risk: 'MEDIUM', impact: 'EUR' },
    { region: 'Asia',        event: 'China PMI Release',      risk: 'MEDIUM', impact: 'COMMODITIES' },
  ],
};

export const getGlobalMarketData = async () => {
  try {
    const res = await client.get('/global');
    return res.data;
  } catch {
    return MOCK_GLOBAL_DATA;
  }
};

export const getRegionData = async (region) => {
  try {
    const res = await client.get(`/region/${region}`);
    return res.data;
  } catch {
    return MOCK_GLOBAL_DATA.regions[region] || null;
  }
};

export const getGeoPoliticalRisk = async () => {
  try {
    const res = await client.get('/geo-risk');
    return res.data;
  } catch {
    return MOCK_GLOBAL_DATA.geo_risk_events;
  }
};
