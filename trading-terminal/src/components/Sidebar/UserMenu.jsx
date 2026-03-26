// src/components/Sidebar/UserMenu.jsx
import React from 'react';
import { Menu, Avatar, Divider } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  WalletOutlined,
  TeamOutlined
} from '@ant-design/icons';

const UserMenu = ({ 
  user = {
    name: 'Sahil Khutey',
    avatar: '',
    role: 'Quant',
    status: 'online'
  },
  onLogout
}) => {
  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'My Wallet' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: 'team', icon: <TeamOutlined />, label: 'Team' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: onLogout }
  ];

  return (
    <div className="user-menu-dropdown" style={{ minWidth: '220px', background: '#fff', borderRadius: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <div style={{ padding: '16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar src={user.avatar} icon={<UserOutlined />} size={48} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#262626' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user.role}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52c41a' }} />
              <span style={{ fontSize: '10px', color: '#52c41a', fontWeight: 600 }}>{user.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
      <Menu items={menuItems} style={{ border: 'none', padding: '8px' }} />
    </div>
  );
};

export default UserMenu;
