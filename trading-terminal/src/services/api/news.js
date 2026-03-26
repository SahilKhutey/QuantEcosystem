const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const newsAPI = {
  // Get sentiment-analyzed news feed
  getNewsFeed: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/news/feed?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get social media trends
  getSocialTrends: async (platform = 'all', timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/news/social-trends?platform=${platform}&timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get sentiment analysis for specific assets
  getAssetSentiment: async (symbols = []) => {
    const response = await fetch(`${API_BASE_URL}/news/asset-sentiment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbols })
    });
    return response.json();
  },

  // Get market-moving news
  getMarketMovingNews: async (impact = 'high') => {
    const response = await fetch(`${API_BASE_URL}/news/market-moving?impact=${impact}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get news sentiment timeline
  getSentimentTimeline: async (symbol, timeframe = '7d') => {
    const response = await fetch(`${API_BASE_URL}/news/sentiment-timeline/${symbol}?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get news sources and credibility scores
  getNewsSources: async () => {
    const response = await fetch(`${API_BASE_URL}/news/sources`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Search news articles
  searchNews: async (query, filters = {}) => {
    const queryParams = new URLSearchParams({ q: query, ...filters }).toString();
    const response = await fetch(`${API_BASE_URL}/news/search?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get news categories
  getNewsCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/news/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Subscribe to real-time news updates
  subscribeToNewsUpdates: (onUpdate) => {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/news`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return ws;
  },

  // Get trending topics
  getTrendingTopics: async (timeframe = '24h') => {
    const response = await fetch(`${API_BASE_URL}/news/trending-topics?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get news impact analysis
  getNewsImpact: async (newsId) => {
    const response = await fetch(`${API_BASE_URL}/news/impact/${newsId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
