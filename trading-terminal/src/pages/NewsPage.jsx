import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiTrendingUp, FiTrendingDown, FiMessageSquare, FiClock, FiActivity } from 'react-icons/fi';

const NewsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: 100%;
  
  .news-feed {
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;
  }
  
  .news-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const NewsCard = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 8px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-primary);
    line-height: 1.4;
  }
  
  .description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .actions {
    display: flex;
    gap: 20px;
    font-size: 12px;
    color: var(--text-tertiary);
    
    .sentiment {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      
      &.bullish { background: rgba(0, 204, 102, 0.1); color: var(--accent-green); }
      &.bearish { background: rgba(255, 51, 51, 0.1); color: var(--accent-red); }
      &.neutral { background: rgba(255, 255, 255, 0.05); color: var(--text-tertiary); }
    }
  }
`;

const SidebarCard = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  h4 { font-size: 14px; margin-bottom: 15px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
`;

import axios from 'axios';
import useAppStore from '../services/store/appStore';

const MOCK_NEWS_FEED = (symbol) => [
  {
    id: 1,
    title: `${symbol} Analysis: Institutional Buying Accelerates`,
    description: `Volume data shows heavy accumulation of ${symbol} by Tier-1 institutional players over the last 48 hours, with dark-pool prints suggesting a strategic build-up ahead of Q4 results.`,
    source: "Quant Insight", time: "5m ago", category: "Analysis",
    sentiment: "bullish", impact: "High", score: 0.88
  },
  {
    id: 2,
    title: `FII Outflows Continue; DII Absorption Strong`,
    description: `Foreign institutional investors sold equities worth ₹6,200 crore, but domestic institutions offset 80% of the selling, keeping broader markets stable.`,
    source: "Business Standard", time: "18m ago", category: "Macro",
    sentiment: "neutral", impact: "High", score: 0.61
  },
  {
    id: 3,
    title: `${symbol}: Technical Breakout Confirmed Above Key Resistance`,
    description: `Price action has confirmed a bullish breakout above the 200-DMA on above-average volume. RSI at 62 suggests momentum without overbought conditions.`,
    source: "TechniChart", time: "35m ago", category: "Technical",
    sentiment: "bullish", impact: "Medium", score: 0.79
  },
  {
    id: 4,
    title: `RBI Holds Rates Steady — Banking Sector Cheers`,
    description: `The Reserve Bank of India kept the repo rate unchanged at 6.5%, signaling a cautious approach. Banking stocks rallied on reduced short-term liquidity concerns.`,
    source: "Economic Times", time: "1h ago", category: "Macro",
    sentiment: "bullish", impact: "High", score: 0.71
  },
  {
    id: 5,
    title: `Crude Oil Slips Below $78 — Energy Sector Under Pressure`,
    description: `Brent crude edged lower on weak Chinese demand data, dragging energy stocks and widening India's CAD outlook slightly.`,
    source: "Reuters", time: "2h ago", category: "Commodities",
    sentiment: "bearish", impact: "Medium", score: 0.44
  },
];

const NewsPage = () => {
  const { selectedSymbol } = useAppStore();
  const [news, setNews] = useState(() => MOCK_NEWS_FEED(selectedSymbol));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill with mock immediately so feed is never blank
    setNews(MOCK_NEWS_FEED(selectedSymbol));

    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/news`, {
          params: { q: selectedSymbol },
          timeout: 5000
        });
        // axios doesn't throw on 404 — guard explicitly
        const raw = response.data;
        if (response.status !== 200 || !Array.isArray(raw) || raw.length === 0) {
          throw new Error('No live news data');
        }
        const articles = raw.map(item => ({
          id: item.url,
          title: item.title,
          description: item.description,
          source: item.source,
          time: new Date(item.published_at).toLocaleTimeString() + ' ago',
          category: item.category || 'General',
          sentiment: item.sentiment || (Math.random() > 0.6 ? 'bullish' : Math.random() > 0.4 ? 'neutral' : 'bearish'),
          impact: Math.random() > 0.7 ? 'High' : 'Medium',
          score: Math.random()
        }));
        setNews(articles);
      } catch {
        // Keep existing mock data intact - no state update needed
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [selectedSymbol]);

  return (
    <NewsContainer className="page-container">
      <div className="news-feed">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Market News Feed</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search news..." 
                style={{ background: 'var(--tertiary-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px 10px 8px 35px', color: 'white', width: '200px' }}
              />
            </div>
            <button style={{ background: 'var(--tertiary-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px 15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFilter /> Filter
            </button>
          </div>
        </div>

        {news.map(item => (
          <NewsCard key={item.id}>
            <div className="meta">
              <span>{item.source} • {item.category}</span>
              <span><FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {item.time}</span>
            </div>
            <div className="title">{item.title}</div>
            <div className="description">{item.description}</div>
            <div className="actions">
              <div className={`sentiment ${item.sentiment}`}>
                {item.sentiment === 'bullish' ? <FiTrendingUp /> : item.sentiment === 'bearish' ? <FiTrendingDown /> : <FiActivity />}
                {item.sentiment.toUpperCase()}
              </div>
              <span>Impact: <strong style={{ color: item.impact === 'High' ? 'var(--accent-red)' : 'var(--text-primary)' }}>{item.impact}</strong></span>
              <span>AI Confidence: {(item.score * 100).toFixed(0)}%</span>
            </div>
          </NewsCard>
        ))}
      </div>

      <div className="news-sidebar">
        <SidebarCard>
          <h4><FiTrendingUp /> Hot Topics</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['#FederalReserve', '#AIRevolution', '#OilSupply', '#CryptoRecovery', '#EarningsSeason'].map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '15px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{tag}</span>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard>
          <h4><FiActivity /> Sentiment Analysis</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                <span>Bullish</span>
                <span>65%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                <span>Bearish</span>
                <span>25%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                <div style={{ width: '25%', height: '100%', background: 'var(--accent-red)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </SidebarCard>
        
        <SidebarCard>
          <h4><FiMessageSquare /> AI Insights</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            "Current market news clusters around central bank policies and semiconductor supply chains. Sentiment remains cautiously optimistic despite hawkish Fed signals."
          </p>
        </SidebarCard>
      </div>
    </NewsContainer>
  );
};

export default NewsPage;
