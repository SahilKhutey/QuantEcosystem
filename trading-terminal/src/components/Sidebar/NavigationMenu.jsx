// src/components/Sidebar/NavigationMenu.jsx
import React from 'react';
import { Menu } from 'antd';
import { 
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FundOutlined,
  PieChartOutlined,
  GlobalOutlined,
  MessageOutlined,
  NotificationOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const NavigationMenu = ({ 
  selectedKey = 'dashboard',
  mode = 'inline',
  className = '',
  style = {},
  // Navigation Menu for Institutional Trading Terminal
  // Consolidates all execution and analysis modules
}) => {
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    {
      key: 'trading',
      icon: <BarChartOutlined />,
      label: 'Trading',
      children: [
        { key: 'trading-order', label: <Link to="/trading/order">Order Entry</Link> },
        { key: 'trading-book', label: <Link to="/trading/book">Order Book</Link> },
        { key: 'trading-history', label: <Link to="/trading/history">Trade History</Link> }
      ]
    },
    {
      key: 'analysis',
      icon: <LineChartOutlined />,
      label: 'Analysis',
      children: [
        { key: 'analysis-technical', label: <Link to="/analysis/technical">Technical Analysis</Link> },
        { key: 'analysis-portfolio', label: <Link to="/analysis/portfolio">Portfolio Analysis</Link> },
        { key: 'analysis-equity', label: <Link to="/analysis/equity">Equity Analysis</Link> },
        { key: 'analysis-audit', label: <Link to="/performance-audit">Performance Audit Hub</Link> },
        { key: 'analysis-backtest', label: <Link to="/backtest-studio">Backtest Simulation Studio</Link> },
        { key: 'analysis-hft', label: <Link to="/hft-backtest-lab">HFT Microstructure Lab</Link> },
        { key: 'analysis-signal', label: <Link to="/signal-monitor">HFT Signal Trace Monitor</Link> },
        { key: 'analysis-allocator', label: <Link to="/allocator">Institutional Portfolio Architect</Link> },
        { key: 'analysis-asset-alloc', label: <Link to="/asset-allocation-lab">Bayesian Asset Allocation Lab</Link> }
      ]
    },
    { key: 'risk', icon: <FundOutlined />, label: <Link to="/risk">Risk Management</Link>,
      children: [
        { key: 'risk-dashboard', label: <Link to="/risk">Risk Dashboard</Link> },
        { key: 'risk-stress', label: <Link to="/stress-test">Systemic Stress Lab</Link> },
        { key: 'risk-soverign', label: <Link to="/sovereign-risk">Sovereign & HHI Dashboard</Link> }
      ]
    },
    { key: 'wealth', icon: <PieChartOutlined />, label: <Link to="/wealth">Wealth Management</Link> },
    {
      key: 'market-intel',
      icon: <GlobalOutlined />,
      label: 'Market Intelligence',
      children: [
        { key: 'mi-global', label: <Link to="/global-market">Global Market Intelligence</Link> },
        { key: 'mi-wealth', label: <Link to="/wealth-map">Global Wealth Heatmap</Link> },
        { key: 'mi-commodities', label: <Link to="/commodities">Global Commodities</Link> },
        { key: 'mi-commodity-alpha', label: <Link to="/commodity-alpha">Commodity Alpha Hub</Link> },
        { key: 'mi-macro', label: <Link to="/macro">Macro Intelligence</Link> },
        { key: 'mi-signals', label: <Link to="/news">News & Neural Signals</Link> },
        { key: 'mi-topology', label: <Link to="/sentiment-topology">NLP Sentiment Topology</Link> },
        { key: 'mi-ai-research', label: <Link to="/ai-research">Institutional AI Research</Link> },
        { key: 'mi-macro-hub', label: <Link to="/macro-hub">Global Macro Intelligence</Link> }
      ]
    },
    { 
      key: 'quant', 
      icon: <DeploymentUnitOutlined />, 
      label: 'Quant Desk', 
      children: [
        { key: 'quant-engine', label: <Link to="/quant-engine">Institutional Quant Engine</Link> },
        { key: 'quant-eval', label: <Link to="/advanced-eval">Advanced Evaluation Hub</Link> },
        { key: 'quant-zoo', label: <Link to="/model-zoo">Neural Model Zoo Studio</Link> },
        { key: 'quant-rl-studio', label: <Link to="/rl-agent-studio">Adaptive RL Agent Studio</Link> },
        { key: 'quant-drl', label: <Link to="/drl-studio">DRL Studio Page</Link> }
      ]
    },
    { 
      key: 'execution-engine', 
      icon: <ThunderboltOutlined />, 
      label: 'Execution Engine',
      children: [
        { key: 'ee-multi', label: <Link to="/multi-strategy">Multi-Strategy Command</Link> },
        { key: 'ee-options', label: <Link to="/options">Derivatives Workbench</Link> },
        { key: 'ee-drl', label: <Link to="/drl-studio">DRL Training Studio</Link> },
        { key: 'ee-opt', label: <Link to="/optimization">Optimization Workbench</Link> },
        { key: 'ee-eval', label: <Link to="/advanced-eval">Advanced Evaluation Hub</Link> },
        { key: 'ee-health', label: <Link to="/system-health">System Health & Deploy</Link> },
        { key: 'ee-devops', label: <Link to="/devops">Infrastructure DevOps</Link> },
        { key: 'ee-pipeline', label: <Link to="/pipeline">Strat-Ops Pipeline Hub</Link> },
        { key: 'ee-orchestrator', label: <Link to="/orchestrator">Strategy Docker Orchestrator</Link> },
        { key: 'ee-dev', label: <Link to="/developer">Developer Portal</Link> },
        { key: 'ee-engine', label: <Link to="/trading-engine">Trading Engine Monitor</Link> }
      ]
    },
    { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> }
  ];

  return (
    <Menu
      theme="dark"
      mode={mode}
      selectedKeys={[selectedKey]}
      items={menuItems}
      className={className}
      style={style}
    />
  );
};

export default NavigationMenu;
