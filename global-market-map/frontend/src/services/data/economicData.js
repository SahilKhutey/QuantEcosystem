import { create } from 'zustand';

const economicDataStore = create((set) => ({
  indicators: {
    gdp: {
      name: 'GDP Growth',
      value: 2.5,
      change: 0.2,
      lastUpdated: new Date().toISOString()
    },
    inflation: {
      name: 'Inflation',
      value: 3.2,
      change: 0.5,
      lastUpdated: new Date().toISOString()
    },
    unemployment: {
      name: 'Unemployment',
      value: 3.8,
      change: -0.1,
      lastUpdated: new Date().toISOString()
    },
    interest_rates: {
      name: 'Interest Rates',
      value: 5.25,
      change: 0.25,
      lastUpdated: new Date().toISOString()
    }
  },
  loading: false,
  error: null,
  
  fetchEconomicData: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock economic data
      const indicators = {
        gdp: {
          name: 'GDP Growth',
          value: 2.5 + (Math.random() * 0.2 - 0.1),
          change: 0.2 + (Math.random() * 0.05 - 0.025),
          lastUpdated: new Date().toISOString()
        },
        inflation: {
          name: 'Inflation',
          value: 3.2 + (Math.random() * 0.2 - 0.1),
          change: 0.5 + (Math.random() * 0.1 - 0.05),
          lastUpdated: new Date().toISOString()
        },
        unemployment: {
          name: 'Unemployment',
          value: 3.8 + (Math.random() * 0.1 - 0.05),
          change: -0.1 + (Math.random() * 0.05 - 0.025),
          lastUpdated: new Date().toISOString()
        },
        interest_rates: {
          name: 'Interest Rates',
          value: 5.25 + (Math.random() * 0.05 - 0.025),
          change: 0.25 + (Math.random() * 0.05 - 0.025),
          lastUpdated: new Date().toISOString()
        }
      };
      
      set({
        indicators,
        loading: false
      });
      
      return indicators;
    } catch (error) {
      set({ 
        error: 'Failed to fetch economic data. Please check your connection.',
        loading: false 
      });
      throw error;
    }
  },
  
  getIndicators: () => {
    return economicDataStore.getState().indicators;
  },
  
  getIndicator: (id) => {
    return economicDataStore.getState().indicators[id];
  },
  
  clearData: () => {
    set({
      indicators: {},
      loading: false,
      error: null
    });
  },
  
  reset: () => {
    set({
      indicators: {
        gdp: {
          name: 'GDP Growth',
          value: 2.5,
          change: 0.2,
          lastUpdated: new Date().toISOString()
        },
        inflation: {
          name: 'Inflation',
          value: 3.2,
          change: 0.5,
          lastUpdated: new Date().toISOString()
        },
        unemployment: {
          name: 'Unemployment',
          value: 3.8,
          change: -0.1,
          lastUpdated: new Date().toISOString()
        },
        interest_rates: {
          name: 'Interest Rates',
          value: 5.25,
          change: 0.25,
          lastUpdated: new Date().toISOString()
        }
      },
      loading: false,
      error: null
    });
  }
}));

// Initialize with some default economic data
economicDataStore.setState({
  indicators: {
    gdp: {
      name: 'GDP Growth',
      value: 2.5,
      change: 0.2,
      lastUpdated: new Date().toISOString()
    },
    inflation: {
      name: 'Inflation',
      value: 3.2,
      change: 0.5,
      lastUpdated: new Date().toISOString()
    },
    unemployment: {
      name: 'Unemployment',
      value: 3.8,
      change: -0.1,
      lastUpdated: new Date().toISOString()
    },
    interest_rates: {
      name: 'Interest Rates',
      value: 5.25,
      change: 0.25,
      lastUpdated: new Date().toISOString()
    }
  }
});

export const useEconomicData = () => {
  const { fetchEconomicData, getIndicators, getIndicator } = economicDataStore();
  return {
    fetchEconomicData,
    getIndicators,
    getIndicator
  };
};

export default economicDataStore;
