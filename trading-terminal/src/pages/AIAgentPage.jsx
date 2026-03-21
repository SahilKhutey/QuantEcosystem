import React from 'react';
import { FiBriefcase } from 'react-icons/fi';
import NewsIntelligence from '../components/dashboard/AIAgent/NewsIntelligence';
import MarketAnalyst from '../components/dashboard/AIAgent/MarketAnalyst';

const AIAgentPage = () => (
  <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
    <div className="page-header">
      <div>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiBriefcase color="var(--accent-blue)" size={22} />
          AI Trading Agent
        </div>
        <div className="page-subtitle">
          NLP-powered news intelligence · Sentiment analysis · AI market analyst
        </div>
      </div>
      <span className="badge badge-blue">
        <span className="status-dot live" /> AI Active
      </span>
    </div>

    {/* News top — full width */}
    <div style={{ marginBottom: 16, height: 540 }}>
      <NewsIntelligence />
    </div>

    {/* Analyst below */}
    <MarketAnalyst />
  </div>
);

export default AIAgentPage;
