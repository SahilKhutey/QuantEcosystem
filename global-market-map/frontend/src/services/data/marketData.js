import { create } from 'zustand';

const marketDataStore = create((set) => ({
  marketData: {},
  newsData: [],
  loading: false,
  error: null,
  
  fetchMarketData: async (symbol) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate realistic price data
      const now = new Date();
      const basePrice = Math.random() * 100 + 50;
      const priceData = [];
      
      // Generate 60 minutes of intraday data
      for (let i = 60; i >= 0; i--) {
        const timestamp = new Date(now - i * 60000);
        const minutesAgo = i;
        const volatility = basePrice * 0.02;
        
        // Create realistic price movements
        const open = basePrice * (1 + (Math.random() * 0.01 - 0.005));
        const high = open * (1 + Math.random() * 0.005);
        const low = open * (1 - Math.random() * 0.005);
        const close = (open + high + low) / 3 + (Math.random() * volatility * 0.5 - volatility * 0.25);
        const volume = Math.floor(Math.random() * 1000000 + 100000);
        
        priceData.push({
          timestamp: timestamp.toISOString(),
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: volume
        });
      }
      
      // Generate some news items
      const news = [
        {
          id: '1',
          title: 'Major Tech Companies Report Strong Q2 Earnings',
          description: 'Apple, Microsoft, and Google all beat earnings estimates',
          url: '#',
          source: 'Bloomberg',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'positive'
        },
        {
          id: '2',
          title: 'Federal Reserve Announces Rate Hike Pause',
          description: 'The Federal Reserve has signaled it may pause rate hikes due to cooling inflation',
          url: '#',
          source: 'Financial Times',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'positive'
        }
      ];
      
      set({
        marketData: {
          [symbol]: {
            priceData,
            latest: priceData[priceData.length - 1],
            symbol,
            lastUpdated: new Date().toISOString()
          }
        },
        newsData: news,
        loading: false
      });
      
      return {
        priceData,
        latest: priceData[priceData.length - 1],
        symbol,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      set({ 
        error: 'Failed to fetch market data. Please check your connection.',
        loading: false 
      });
      throw error;
    }
  },
  
  subscribeToMarketUpdates: (symbol, callback) => {
    // In production, this would connect to a WebSocket
    // For demonstration, simulate real-time updates
    
    const intervalId = setInterval(() => {
      set(state => {
        const currentData = state.marketData[symbol];
        if (!currentData) return {};
        
        // Create a slight price change
        const latest = currentData.priceData[currentData.priceData.length - 1];
        if (!latest) return {};

        const newPrice = latest.close * (1 + (Math.random() * 0.002 - 0.001));
        
        // Add new data point
        const newPoint = {
          timestamp: new Date().toISOString(),
          open: latest.close,
          high: Math.max(latest.high, newPrice),
          low: Math.min(latest.low, newPrice),
          close: newPrice,
          volume: latest.volume + Math.floor(Math.random() * 10000)
        };
        
        const updatedPriceData = [...currentData.priceData, newPoint];
        
        // Keep only last 60 minutes
        const trimmedData = updatedPriceData.slice(-60);
        
        // Update market data
        return {
          marketData: {
            ...state.marketData,
            [symbol]: {
              ...currentData,
              priceData: trimmedData,
              latest: trimmedData[trimmedData.length - 1]
            }
          }
        };
      });
      
      // Get the point we just added 
      const state = marketDataStore.getState();
      const currentData = state.marketData[symbol];
      const newPoint = currentData ? currentData.latest : null;

      // Call the callback with the new data point
      if (callback && newPoint) {
        callback({
          symbol,
          ...newPoint
        });
      }
    }, 5000); // Update every 5 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  },
  
  // Additional utility functions
  getLatestPrice: (symbol) => {
    const state = marketDataStore.getState();
    if (!state.marketData[symbol] || state.marketData[symbol].priceData.length === 0) {
      return null;
    }
    return state.marketData[symbol].latest;
  },
  
  getPriceHistory: (symbol) => {
    const state = marketDataStore.getState();
    return state.marketData[symbol] ? state.marketData[symbol].priceData : [];
  },
  
  getNews: () => {
    return marketDataStore.getState().newsData;
  },
  
  clearData: () => {
    set({
      marketData: {},
      newsData: [],
      loading: false,
      error: null
    });
  },
  
  // Real-time data subscription management
  activeSubscriptions: {},
  
  subscribe: (symbol, callback) => {
    const unsubscribe = marketDataStore.getState().subscribeToMarketUpdates(symbol, callback);
    
    // Track active subscriptions
    set(state => ({
      activeSubscriptions: {
        ...state.activeSubscriptions,
        [symbol]: unsubscribe
      }
    }));
    
    return () => {
      unsubscribe();
      set(state => {
        const { [symbol]: _, ...remaining } = state.activeSubscriptions;
        return { activeSubscriptions: remaining };
      });
    };
  },
  
  unsubscribeAll: () => {
    const state = marketDataStore.getState();
    Object.values(state.activeSubscriptions).forEach(unsubscribe => unsubscribe());
    set({ activeSubscriptions: {} });
  },
  
  // Reset store state
  reset: () => {
    marketDataStore.setState({
      marketData: {},
      newsData: [],
      loading: false,
      error: null,
      activeSubscriptions: {}
    });
  }
}));

// Initialize the store with some default data
marketDataStore.setState({
  marketData: {
    'AAPL': {
      priceData: [],
      latest: null,
      symbol: 'AAPL',
      lastUpdated: null
    },
    'MSFT': {
      priceData: [],
      latest: null,
      symbol: 'MSFT',
      lastUpdated: null
    },
    'EURUSD': {
      priceData: [],
      latest: null,
      symbol: 'EURUSD',
      lastUpdated: null
    }
  }
});

// Example of how to use the store in a component
export const useMarketData = () => {
  const { fetchMarketData, subscribe, getLatestPrice, getPriceHistory, getNews } = marketDataStore();
  return {
    fetchMarketData,
    subscribe,
    getLatestPrice,
    getPriceHistory,
    getNews
  };
};

export default marketDataStore;
