// src/components/Sidebar/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Button, List, Avatar, Space, Tag, Dropdown } from 'antd';
import { NotificationOutlined, BellOutlined, CheckCircleOutlined } from '@ant-design/icons';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);
  
  const mockNotifications = [
    { id: 1, title: 'Market Alert', description: 'S&P 500 dropped 2%', type: 'alert', time: '5m ago', read: false },
    { id: 2, title: 'Trade Execution', description: 'AAPL buy order executed', type: 'trade', time: '15m ago', read: false },
    { id: 3, title: 'Position Update', description: 'Portfolio up 1.5%', type: 'position', time: '30m ago', read: true }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);
  
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  const menu = (
    <div style={{ width: 320, background: '#fff', borderRadius: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>Notifications</span>
        <Button type="link" size="small" onClick={handleMarkAllRead}>Mark all read</Button>
      </div>
      <List
        size="small"
        dataSource={notifications}
        renderItem={item => (
          <List.Item 
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              background: item.read ? 'transparent' : '#f6ffed',
              transition: 'background 0.2s'
            }}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<NotificationOutlined />} style={{ background: item.type === 'alert' ? '#fff1f0' : '#e6f7ff', color: item.type === 'alert' ? '#f5222d' : '#1890ff' }} size="small" />}
              title={<span style={{ fontSize: '13px', fontWeight: item.read ? 500 : 700 }}>{item.title}</span>}
              description={<div style={{ fontSize: '11px', color: '#8c8c8c' }}>{item.description} • {item.time}</div>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" visible={visible} onVisibleChange={setVisible}>
      <Badge count={unreadCount} offset={[-2, 6]}>
        <Button type="text" icon={<BellOutlined />} style={{ color: '#8c8c8c', fontSize: '18px' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
