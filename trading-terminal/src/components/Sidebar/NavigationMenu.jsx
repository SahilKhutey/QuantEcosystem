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
  SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const NavigationMenu = ({ 
  selectedKey = 'dashboard',
  mode = 'inline',
  className = '',
  style = {}
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
        { key: 'analysis-equity', label: <Link to="/analysis/equity">Equity Analysis</Link> }
      ]
    },
    { key: 'risk', icon: <FundOutlined />, label: <Link to="/risk">Risk Management</Link> },
    { key: 'wealth', icon: <PieChartOutlined />, label: <Link to="/wealth">Wealth Management</Link> },
    { key: 'global', icon: <GlobalOutlined />, label: <Link to="/global">Global Markets</Link> },
    { key: 'news', icon: <MessageOutlined />, label: <Link to="/news">News & Signals</Link> },
    { key: 'ai', icon: <NotificationOutlined />, label: <Link to="/ai">AI Agent</Link> },
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
