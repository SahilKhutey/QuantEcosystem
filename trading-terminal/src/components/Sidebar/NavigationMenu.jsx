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
  DeploymentUnitOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  RocketOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  ApiOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: <Link to="/">Dashboard</Link>,
    title: 'Dashboard',
  },
  {
    key: 'trading-group',
    icon: <BarChartOutlined />,
    label: 'Trading',
    children: [
      { key: '/trading',    label: <Link to="/trading">Order Desk</Link> },
      { key: '/signals',    label: <Link to="/signals">Signals Monitor</Link> },
      { key: '/options',    label: <Link to="/options">Derivatives Workbench</Link> },
      { key: '/multi-strategy', label: <Link to="/multi-strategy">Multi-Strategy Command</Link> },
    ],
  },
  {
    key: 'portfolio-group',
    icon: <PieChartOutlined />,
    label: 'Portfolio',
    children: [
      { key: '/portfolio',           label: <Link to="/portfolio">Portfolio Overview</Link> },
      { key: '/risk',                label: <Link to="/risk">Risk Dashboard</Link> },
      { key: '/allocator',           label: <Link to="/allocator">Portfolio Architect</Link> },
      { key: '/asset-allocation-lab',label: <Link to="/asset-allocation-lab">Asset Allocation Lab</Link> },
      { key: '/stress-test',         label: <Link to="/stress-test">Stress Testing Lab</Link> },
      { key: '/sovereign-risk',      label: <Link to="/sovereign-risk">Sovereign Risk</Link> },
    ],
  },
  {
    key: 'intelligence-group',
    icon: <GlobalOutlined />,
    label: 'Market Intelligence',
    children: [
      { key: '/global-market',      label: <Link to="/global-market">Global Market Map</Link> },
      { key: '/commodities',        label: <Link to="/commodities">Commodities</Link> },
      { key: '/commodity-alpha',    label: <Link to="/commodity-alpha">Commodity Alpha Hub</Link> },
      { key: '/macro',              label: <Link to="/macro">Macro Intelligence</Link> },
      { key: '/macro-hub',          label: <Link to="/macro-hub">Global Macro Hub</Link> },
      { key: '/news',               label: <Link to="/news">News & Neural Signals</Link> },
      { key: '/sentiment-topology', label: <Link to="/sentiment-topology">NLP Sentiment Topology</Link> },
      { key: '/ai-research',        label: <Link to="/ai-research">AI Research Engine</Link> },
    ],
  },
  {
    key: 'quant-group',
    icon: <DeploymentUnitOutlined />,
    label: 'Quant Desk',
    children: [
      { key: '/quant-engine',     label: <Link to="/quant-engine">Quant Engine</Link> },
      { key: '/backtest-studio',  label: <Link to="/backtest-studio">Backtest Studio</Link> },
      { key: '/hft-backtest-lab', label: <Link to="/hft-backtest-lab">HFT Microstructure Lab</Link> },
      { key: '/signal-monitor',   label: <Link to="/signal-monitor">Signal Monitor</Link> },
      { key: '/performance-audit',label: <Link to="/performance-audit">Performance Audit</Link> },
      { key: '/advanced-eval',    label: <Link to="/advanced-eval">Advanced Evaluation</Link> },
      { key: '/optimization',     label: <Link to="/optimization">Optimization Workbench</Link> },
      { key: '/model-zoo',        label: <Link to="/model-zoo">Neural Model Zoo</Link> },
    ],
  },
  {
    key: 'ai-group',
    icon: <ExperimentOutlined />,
    label: 'AI / RL Studio',
    children: [
      { key: '/ai-agent',        label: <Link to="/ai-agent">AI Agent</Link> },
      { key: '/drl-studio',      label: <Link to="/drl-studio">DRL Training Studio</Link> },
      { key: '/rl-agent-studio', label: <Link to="/rl-agent-studio">Adaptive RL Agent Studio</Link> },
    ],
  },
  {
    key: 'wealth-group',
    icon: <FundOutlined />,
    label: 'Wealth Management',
    children: [
      { key: '/wealth',        label: <Link to="/wealth">Wealth Overview</Link> },
      { key: '/wealth/sip',    label: <Link to="/wealth/sip">SIP Dashboard</Link> },
      { key: '/wealth/swp',    label: <Link to="/wealth/swp">SWP Dashboard</Link> },
      { key: '/wealth/equity', label: <Link to="/wealth/equity">Equity Analysis</Link> },
    ],
  },
  {
    key: 'infra-group',
    icon: <ClusterOutlined />,
    label: 'Infrastructure',
    children: [
      { key: '/system-health',  label: <Link to="/system-health">System Health</Link> },
      { key: '/devops',         label: <Link to="/devops">DevOps Console</Link> },
      { key: '/pipeline',       label: <Link to="/pipeline">Pipeline Hub</Link> },
      { key: '/orchestrator',   label: <Link to="/orchestrator">Orchestrator</Link> },
      { key: '/infrastructure', label: <Link to="/infrastructure">Infrastructure</Link> },
    ],
  },
  {
    key: '/developer',
    icon: <ApiOutlined />,
    label: <Link to="/developer">Developer Portal</Link>,
    title: 'Developer Portal',
  },
  {
    key: '/analytics',
    icon: <LineChartOutlined />,
    label: <Link to="/analytics">Analytics</Link>,
    title: 'Analytics',
  },
  {
    key: '/stock-analysis',
    icon: <SafetyCertificateOutlined />,
    label: <Link to="/stock-analysis">Stock Analysis</Link>,
    title: 'Stock Analysis',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">Settings</Link>,
    title: 'Settings',
  },
];

const NavigationMenu = ({ collapsed = false }) => {
  const location = useLocation();

  // Find the selected key from the current path
  const getSelectedKey = () => {
    const path = location.pathname;
    // Exact root match
    if (path === '/') return ['/'];
    // Check children first (more specific)
    for (const item of NAV_ITEMS) {
      if (item.children) {
        for (const child of item.children) {
          if (path.startsWith(child.key)) return [child.key];
        }
      }
      if (item.key !== '/' && path.startsWith(item.key)) return [item.key];
    }
    return [path];
  };

  // Find open submenu keys based on current path
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys = [];
    for (const item of NAV_ITEMS) {
      if (item.children) {
        for (const child of item.children) {
          if (path.startsWith(child.key)) {
            openKeys.push(item.key);
            break;
          }
        }
      }
    }
    return openKeys;
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={getSelectedKey()}
      defaultOpenKeys={collapsed ? [] : getOpenKeys()}
      items={NAV_ITEMS}
      className="sidebar-nav-scroll"
      inlineCollapsed={collapsed}
      style={{
        background: 'transparent',
        border: 'none',
        flex: 1,
        overflow: 'hidden auto',
        fontFamily: "'Inter', sans-serif",
      }}
    />
  );
};

export default NavigationMenu;
