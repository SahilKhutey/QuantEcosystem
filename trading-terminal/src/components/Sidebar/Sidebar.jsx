// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import NavigationMenu from './NavigationMenu';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({
  collapsed = false,
  onCollapse,
  user = { name: 'Sahil Khutey', role: 'Quantitative Trader', avatar: '' },
  systemStatus = { marketStatus: 'open', connectivity: 'connected', version: '2.0.0' }
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleCollapse = (val) => {
    setIsCollapsed(val);
    if (onCollapse) onCollapse(val);
  };

  return (
    <Sider
      collapsible
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      width={240}
      collapsedWidth={64}
      className="app-sidebar"
      id="main-sidebar"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-box">Q</div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <span className="logo-text">QUANTUM</span>
            <span className="logo-subtitle">Institutional Terminal</span>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <div className="sidebar-nav-scroll" style={{ flex: 1, overflow: 'hidden auto' }}>
        <NavigationMenu collapsed={isCollapsed} />
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Market / Network status */}
        {!isCollapsed && (
          <div className="system-tags">
            <div className="market-tag">
              <span className="pulse-dot" />
              {systemStatus.marketStatus === 'open' ? 'MARKET OPEN' : 'MARKET CLOSED'}
            </div>
            <div className="network-tag">
              <span className="pulse-dot" />
              {systemStatus.connectivity === 'connected' ? 'CONNECTED' : 'OFFLINE'}
            </div>
          </div>
        )}

        {/* User bar */}
        <Tooltip title={isCollapsed ? user.name : ''} placement="right">
          <div className="user-profile-bar">
            <div className="user-avatar-wrap">
              <Avatar
                src={user.avatar}
                icon={<UserOutlined />}
                size={32}
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', flexShrink: 0 }}
              />
              <span className="user-online-dot" />
            </div>
            {!isCollapsed && (
              <div className="user-info-text">
                <div className="u-name">{user.name}</div>
                <div className="u-role">{user.role}</div>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default Sidebar;
