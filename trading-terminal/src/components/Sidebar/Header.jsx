// src/components/Sidebar/Header.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Typography, Tag, Divider } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SearchOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import UserMenu from './UserMenu';
import SystemStatus from './SystemStatus';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

const { Header: AntdHeader } = Layout;
const { Text } = Typography;

const Header = ({
  collapsed = false,
  onCollapse,
  title = "Dashboard",
  selectedSymbol = 'RELIANCE',
  onSymbolChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [searchToggle, setSearchToggle] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickSymbols = ['RELIANCE', 'TCS', 'AAPL', 'BTCUSD'];

  return (
    <AntdHeader className="app-header" style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
      <Space size={16}>
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            if (onCollapse) onCollapse(next);
          }}
        />
        <Text strong style={{ fontSize: '18px' }}>{title}</Text>
      </Space>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '32px' }}>
        {searchToggle ? (
          <SearchBar
            compact
            style={{ width: 400 }}
            onSearch={(val) => {
              if (onSymbolChange) onSymbolChange(val);
              setSearchToggle(false);
            }}
          />
        ) : (
          <Space size={24}>
            <Space size={8}>
              {quickSymbols.map(sym => (
                <Tag
                  key={sym}
                  color={selectedSymbol === sym ? 'blue' : 'default'}
                  style={{ cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}
                  onClick={() => onSymbolChange && onSymbolChange(sym)}
                >
                  {sym}
                </Tag>
              ))}
              <Button type="text" icon={<SearchOutlined />} onClick={() => setSearchToggle(true)} size="small" />
            </Space>
            <Divider type="vertical" />
            <SystemStatus compact />
          </Space>
        )}
      </div>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} size="small" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</span>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </AntdHeader>
  );
};

export default Header;
