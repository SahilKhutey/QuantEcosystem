import React from 'react';
import { FiShield } from 'react-icons/fi';
import PortfolioOptimization from '../components/dashboard/TradingEngine/PortfolioOptimization';
import RiskManagement from '../components/dashboard/TradingEngine/RiskManagement';

const TradingEnginePage = () => (
  <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
    <div className="page-header">
      <div>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiShield color="var(--accent-amber)" size={22} />
          Trading Engine
        </div>
        <div className="page-subtitle">
          Portfolio optimization · Risk metrics · VaR/CVaR · Stress testing
        </div>
      </div>
      <span className="badge badge-amber">
        <span className="status-dot live" /> Position Monitor Active
      </span>
    </div>

    {/* Portfolio + Risk side by side */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <PortfolioOptimization />
      <RiskManagement />
    </div>
  </div>
);

export default TradingEnginePage;
