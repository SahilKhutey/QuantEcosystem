import { create } from 'zustand';

const newsDataStore = create((set) => ({
  news: [],
  loading: false,
  error: null,
  
  fetchNews: async (query = 'market', sources = [], from_date = null) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock news data
      const news = [
        {
          id: '1',
          title: 'Tech Giants Report Strong Q2 Earnings',
          description: 'Apple, Microsoft, and Google all exceed earnings expectations',
          url: '#',
          source: 'Bloomberg',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'positive',
          category: 'technology'
        },
        {
          id: '2',
          title: 'Federal Reserve Pauses Rate Hikes',
          description: 'The Federal Reserve has signaled it may pause rate hikes due to cooling inflation',
          url: '#',
          source: 'Financial Times',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'positive',
          category: 'monetary'
        },
        {
          id: '3',
          title: 'Oil Prices Surge on Middle East Tensions',
          description: 'Crude oil prices rise over 4% as geopolitical tensions escalate',
          url: '#',
          source: 'Reuters',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'negative',
          category: 'commodities'
        },
        {
          id: '4',
          title: 'Global Stock Markets Rally',
          description: 'Stock markets around the world show strong gains after positive economic data',
          url: '#',
          source: 'Wall Street Journal',
          published_at: new Date().toISOString(),
          image: 'https://via.placeholder.com/150',
          sentiment: 'positive',
          category: 'markets'
        }
      ];
      
      set({
        news,
        loading: false
      });
      
      return news;
    } catch (error) {
      set({ 
        error: 'Failed to fetch news data. Please check your connection.',
        loading: false 
      });
      throw error;
    }
  },
  
  getNews: () => {
    return newsDataStore.getState().news;
  },
  
  clearNews: () => {
    set({ news: [] });
  },
  
  reset: () => {
    set({
      news: [],
      loading: false,
      error: null
    });
  }
}));

// Initialize with some default news
newsDataStore.setState({
  news: [
    {
      id: '1',
      title: 'Tech Giants Report Strong Q2 Earnings',
      description: 'Apple, Microsoft, and Google all exceed earnings expectations',
      url: '#',
      source: 'Bloomberg',
      published_at: new Date().toISOString(),
      image: 'https://via.placeholder.com/150',
      sentiment: 'positive',
      category: 'technology'
    }
  ]
});

export const useNewsData = () => {
  const { fetchNews, getNews, clearNews } = newsDataStore();
  return {
    fetchNews,
    getNews,
    clearNews
  };
};

export default newsDataStore;
