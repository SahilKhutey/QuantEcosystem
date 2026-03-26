// src/api/news.js

export const newsAPI = {
  getNews: async ({ source, sentiment, timeframe } = {}) => {
    // Mock data for news
    const news = [
      {
        id: '1',
        title: 'Fed Signals Potential Rate Cut in Upcoming Meeting',
        summary: 'Economic indicators suggest a softening inflation trend, leading analysts to predict a policy shift.',
        source: 'bloomberg',
        sentiment: 0.85,
        urgency: 'high',
        tags: ['FED', 'Interest Rates', 'Economy'],
        timestamp: new Date().toISOString(),
        url: '#'
      },
      {
        id: '2',
        title: 'Tech Giants Face New Antitrust Scrutiny in EU',
        summary: 'Regulators are investigating data privacy and market dominance concerns among major software providers.',
        source: 'reuters',
        sentiment: 0.15,
        urgency: 'medium',
        tags: ['Tech', 'EU', 'Regulation'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        url: '#'
      },
      {
        id: '3',
        title: 'Global Manufacturing Output Hits 2-Year High',
        summary: 'Supply chain stabilization and increased demand drive growth across major industrial hubs.',
        source: 'wsj',
        sentiment: 0.72,
        urgency: 'low',
        tags: ['Manufacturing', 'Growth', 'GDP'],
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        url: '#'
      },
      {
        id: '4',
        title: 'Oil Prices Stabilize After Brief Volatility',
        summary: 'Geopolitical tensions and OPEC production targets keep energy markets in a narrow range.',
        source: 'cnbc',
        sentiment: 0.52,
        urgency: 'low',
        tags: ['Energy', 'Oil', 'Commodities'],
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        url: '#'
      }
    ];

    let filteredNews = [...news];
    if (source && source !== 'all') {
      filteredNews = filteredNews.filter(n => n.source === source);
    }
    if (sentiment && sentiment !== 'all') {
      if (sentiment === 'positive') filteredNews = filteredNews.filter(n => n.sentiment > 0.6);
      else if (sentiment === 'neutral') filteredNews = filteredNews.filter(n => n.sentiment >= 0.4 && n.sentiment <= 0.6);
      else if (sentiment === 'negative') filteredNews = filteredNews.filter(n => n.sentiment < 0.4);
    }

    return { data: filteredNews };
  }
};
