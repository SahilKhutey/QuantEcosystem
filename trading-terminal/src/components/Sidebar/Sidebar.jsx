// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import NavigationMenu from './NavigationMenu';
import './Sidebar.css';

const { Sider } = Layout;

// Detect mobile breakpoint
const MOBILE_BP = 768;
const TABLET_BP = 1024;

const Sidebar = ({
  collapsed = false,
  mobileOpen = false,       // controlled by App on mobile
  onCollapse,
  onMobileClose,            // called when backdrop/link clicked on mobile
  user = { name: 'Sahil Khutey', role: 'Quantitative Trader', avatar: '' },
  systemStatus = { marketStatus: 'open', connectivity: 'connected', version: '2.0.0' },
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Track window width for responsive mode
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-collapse on tablet
  useEffect(() => {
    if (windowWidth <= TABLET_BP && windowWidth > MOBILE_BP) {
      setIsCollapsed(true);
      if (onCollapse) onCollapse(true);
    } else if (windowWidth > TABLET_BP) {
      setIsCollapsed(false);
      if (onCollapse) onCollapse(false);
    }
  }, [windowWidth]);

  useEffect(() => setIsCollapsed(collapsed), [collapsed]);

  const isMobile = windowWidth <= MOBILE_BP;

  const handleCollapse = (val) => {
    setIsCollapsed(val);
    if (onCollapse) onCollapse(val);
  };

  // On mobile: close drawer when a nav item is clicked
  const handleNavClick = useCallback(() => {
    if (isMobile && onMobileClose) onMobileClose();
  }, [isMobile, onMobileClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
          onClick={onMobileClose}
        />
      )}

      <Sider
        collapsible={!isMobile}
        collapsed={isMobile ? false : isCollapsed}
        onCollapse={handleCollapse}
        width={240}
        collapsedWidth={64}
        className={`app-sidebar${isMobile && mobileOpen ? ' mobile-open' : ''}`}
        id="main-sidebar"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-box">Q</div>
          {(!isCollapsed || isMobile) && (
            <div style={{ overflow: 'hidden' }}>
              <span className="logo-text">QUANTUM</span>
              <span className="logo-subtitle">Institutional Terminal</span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <div
          className="sidebar-nav-scroll"
          style={{ flex: 1, overflow: 'hidden auto' }}
          onClick={handleNavClick}
        >
          <NavigationMenu collapsed={isMobile ? false : isCollapsed} />
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Market / Network status */}
          {(!isCollapsed || isMobile) && (
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
          <Tooltip title={(isCollapsed && !isMobile) ? user.name : ''} placement="right">
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
              {(!isCollapsed || isMobile) && (
                <div className="user-info-text">
                  <div className="u-name">{user.name}</div>
                  <div className="u-role">{user.role}</div>
                </div>
              )}
            </div>
          </Tooltip>
        </div>
      </Sider>
    </>
  );
};

export default Sidebar;
