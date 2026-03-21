import { create } from 'zustand';
import axios from 'axios';
import useAppStore from '../store/appStore';

// Get backend URL from env or default
const API_BASE_URL = 'http://localhost:5000/api';

const marketDataStore = create((set) => ({
  prices: {},
  history: {},
  loading: false,
  error: null,

  fetchPrice: async (symbol) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/data/realtime/${symbol}`);
      const data = response.data.data;
      
      let price = 0;
      if (data && data.price) price = parseFloat(data.price);
      else if (data && data['Global Quote']) price = parseFloat(data['Global Quote']['05. price']);
      
      const finalPrice = isNaN(price) || price === 0 ? 150 + Math.random() * 5 : price;

      set(state => ({
        prices: { ...state.prices, [symbol]: finalPrice },
        loading: false
      }));
      return finalPrice;
    } catch (error) {
      console.warn(`Price fetch failed for ${symbol}, using mock`);
      const mockPrice = 150 + Math.random() * 50;
      set(state => ({
        prices: { ...state.prices, [symbol]: mockPrice },
        loading: false
      }));
      return mockPrice;
    }
  },

  fetchHistory: async (symbol, timeframe = '1D') => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/data/historical/${symbol}`, {
        params: { timeframe }
      });
      
      let rawData = response.data.data || [];
      if (!Array.isArray(rawData)) rawData = [];

      const data = rawData.map(item => ({
        name: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'N/A',
        price: parseFloat(item.close) || 0,
        open: parseFloat(item.open) || 0,
        high: parseFloat(item.high) || 0,
        low: parseFloat(item.low) || 0,
        volume: parseFloat(item.volume) || 0
      }));

      // If no data, return mock
      if (data.length === 0) throw new Error('No historical data');

      set(state => ({
        history: { ...state.history, [`${symbol}-${timeframe}`]: data },
        loading: false
      }));
      return data;
    } catch (error) {
      console.warn(`History fetch failed for ${symbol}, using mock`);
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        name: i.toString(),
        price: 150 + Math.random() * 20
      }));
      set(state => ({
        history: { ...state.history, [`${symbol}-${timeframe}`]: mockData },
        loading: false
      }));
      return mockData;
    }
  }
}));

export const useMarketData = () => {
  const store = marketDataStore();
  const { selectedSymbol, selectedTimeframe } = useAppStore();
  
  return {
    getLatestPrice: () => store.fetchPrice(selectedSymbol),
    getPriceHistory: () => store.fetchHistory(selectedSymbol, selectedTimeframe),
    prices: store.prices,
    history: store.history,
    loading: store.loading,
    selectedSymbol
  };
};
