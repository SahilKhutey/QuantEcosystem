// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  GlobalOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  MessageOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import UserMenu from './UserMenu';
import SystemStatus from './SystemStatus';
import NotificationBell from './NotificationBell';
import NavigationMenu from './NavigationMenu';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ 
  collapsed = false,
  onCollapse,
  selectedKey = 'dashboard',
  user = {
    name: 'Sahil Khutey',
    avatar: '',
    role: 'Quantitative Trader',
    status: 'online'
  },
  systemStatus = {
    marketStatus: 'open',
    connectivity: 'connected',
    version: '1.2.0'
  }
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  return (
    <Sider 
      collapsible 
      collapsed={isCollapsed} 
      onCollapse={(val) => {
        setIsCollapsed(val);
        if (onCollapse) onCollapse(val);
      }}
      width={250}
      className="app-sidebar"
      id="main-sidebar"
    >
      <div className="sidebar-logo">
        <div className="logo-box">Q</div>
        {!isCollapsed && <span className="logo-text">QUANTUM</span>}
      </div>

      <NavigationMenu selectedKey={selectedKey} className="nav-menu" />

      <div className="sidebar-footer">
        <SystemStatus status={systemStatus} collapsed={isCollapsed} />
        
        <div className="user-profile">
          <Dropdown overlay={<UserMenu user={user} />} placement="topRight">
            <div className="user-info-trigger">
              <Avatar src={user.avatar} icon={<UserOutlined />} className="avatar-small" />
              {!isCollapsed && (
                <div className="user-label">
                  <div className="u-name">{user.name}</div>
                  <div className="u-role">{user.role}</div>
                </div>
              )}
            </div>
          </Dropdown>
          {!isCollapsed && <NotificationBell />}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
