import { create } from 'zustand';

const geoDataStore = create((set) => ({
  marketEvents: [],
  loading: false,
  error: null,
  
  fetchMarketEvents: async () => {
    set({ loading: true, error: null });
    try {
      // In production, this would call the global-market-map API
      const response = await fetch('/api/global-market-map/events');
      const events = await response.json();
      
      set({
        marketEvents: events,
        loading: false
      });
      
      return events;
    } catch (error) {
      set({ 
        error: 'Failed to fetch market events',
        loading: false 
      });
      // Return mock data on failure to keep UI working
      return geoDataStore.getState().marketEvents;
    }
  },
  
  getMarketEvents: () => {
    return geoDataStore.getState().marketEvents;
  },
  
  // Real-time event subscription
  subscribeToEvents: (callback) => {
    // In production, this would connect to a WebSocket
    const intervalId = setInterval(() => {
      // Simulate real-time updates
      set(state => {
        const newEvent = {
          id: `event-${Date.now()}`,
          title: `New market event: ${['Market Volatility Spike', 'Central Bank Announcement', 'Geopolitical Event'][Math.floor(Math.random() * 3)]}`,
          description: 'Description of the market event',
          lat: 37.0902 + (Math.random() * 5 - 2.5),
          lng: -95.7129 + (Math.random() * 5 - 2.5),
          impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          timestamp: new Date().toISOString()
        };
        
        const updatedEvents = [...state.marketEvents, newEvent].slice(-50);
        return { marketEvents: updatedEvents };
      });
      
      // Call the callback with the latest event
      if (callback) {
        const state = geoDataStore.getState();
        callback(state.marketEvents[state.marketEvents.length - 1]);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }
}));

// Initialize with some default data
geoDataStore.setState({
  marketEvents: [
    {
      id: 'event-1',
      title: 'US Federal Reserve Rate Decision',
      description: 'The Federal Reserve has announced a rate hike',
      lat: 38.8951,
      lng: -77.0364,
      impact: 'high',
      timestamp: new Date().toISOString()
    },
    {
      id: 'event-2',
      title: 'Oil Production Cuts',
      description: 'OPEC+ announces production cuts',
      lat: 25.2861,
      lng: 55.9064,
      impact: 'medium',
      timestamp: new Date().toISOString()
    }
  ]
});

export const useGeoData = () => {
  const { fetchMarketEvents, getMarketEvents, subscribeToEvents } = geoDataStore();
  return {
    fetchMarketEvents,
    getMarketEvents,
    subscribeToEvents
  };
};

export default geoDataStore;
