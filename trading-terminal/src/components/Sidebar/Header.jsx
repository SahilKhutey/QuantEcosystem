// src/components/Sidebar/Header.jsx
import React, { useState, useEffect } from 'react';
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
  BellOutlined, SearchOutlined, UserOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Avatar } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import useAppStore from '../../services/store/appStore';
import './Sidebar.css';

const QUICK_SYMBOLS = ['RELIANCE', 'TCS', 'NIFTY', 'AAPL', 'BTC'];

/* Map path segments to human-readable labels */
const PATH_MAP = {
  'trading': 'Order Desk', 'signals': 'Signals', 'portfolio': 'Portfolio',
  'risk': 'Risk', 'news': 'News', 'analytics': 'Analytics', 'settings': 'Settings',
  'global-market': 'Global Market', 'stock-analysis': 'Stock Analysis',
  'quant-engine': 'Quant Engine', 'ai-agent': 'AI Agent',
  'trading-engine': 'Trading Engine', 'wealth': 'Wealth', 'sip': 'SIP',
  'swp': 'SWP', 'equity': 'Equity', 'multi-strategy': 'Multi-Strategy',
  'options': 'Derivatives', 'developer': 'Developer', 'system-health': 'System Health',
  'optimization': 'Optimization', 'drl-studio': 'DRL Studio',
  'advanced-eval': 'Evaluation', 'commodities': 'Commodities', 'macro': 'Macro',
  'devops': 'DevOps', 'performance-audit': 'Audit', 'pipeline': 'Pipeline',
  'backtest-studio': 'Backtest', 'allocator': 'Allocator',
  'orchestrator': 'Orchestrator', 'stress-test': 'Stress Test',
  'commodity-alpha': 'Commodity Alpha', 'model-zoo': 'Model Zoo',
  'sentiment-topology': 'Sentiment', 'rl-agent-studio': 'RL Studio',
  'hft-backtest-lab': 'HFT Lab', 'ai-research': 'AI Research',
  'asset-allocation-lab': 'Asset Alloc', 'signal-monitor': 'Signal Monitor',
  'macro-hub': 'Macro Hub', 'sovereign-risk': 'Sovereign Risk',
  'infrastructure': 'Infrastructure',
};

const Header = ({ collapsed, onCollapse }) => {
  const { selectedSymbol, setSelectedSymbol } = useAppStore();
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="app-header-bar">
      {/* Left: collapse + breadcrumb */}
      <div className="header-left-zone">
        <div
          className="collapse-btn"
          onClick={() => onCollapse && onCollapse(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>

        <div className="breadcrumb-trail">
          <Link to="/" className="breadcrumb-link">Terminal</Link>
          {pathParts.map((seg, i) => {
            const isLast = i === pathParts.length - 1;
            const label = PATH_MAP[seg] || seg.replace(/-/g, ' ');
            const href = '/' + pathParts.slice(0, i + 1).join('/');
            return (
              <React.Fragment key={seg}>
                <span className="breadcrumb-sep">›</span>
                {isLast ? (
                  <span className="breadcrumb-current">{label}</span>
                ) : (
                  <Link to={href} className="breadcrumb-link">{label}</Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Center: quick symbol selector */}
      <div className="header-center-zone">
        {QUICK_SYMBOLS.map(sym => (
          <div
            key={sym}
            className={`sym-chip ${selectedSymbol === sym ? 'active' : ''}`}
            onClick={() => setSelectedSymbol(sym)}
          >
            {sym}
          </div>
        ))}
      </div>

      {/* Right: live badge, clock, notifications, user */}
      <div className="header-right-zone">
        <div className="live-badge">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          LIVE
        </div>
        <div className="clock-display">
          {time.toLocaleTimeString('en-IN', { hour12: false })}
        </div>
        <div className="header-icon-btn" title="Notifications">
          <BellOutlined />
        </div>
        <div className="header-user-btn">
          <Avatar
            icon={<UserOutlined />}
            size={22}
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', flexShrink: 0 }}
          />
          <span className="header-user-name">Trader #001</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
