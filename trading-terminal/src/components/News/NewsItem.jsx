// src/components/News/NewsItem.jsx
import React from 'react';
import { Card, Space, Tag, Button } from 'antd';
import { ClockCircleOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import SentimentBadge from './SentimentBadge';
import NewsSourceBadge from './NewsSourceBadge';

const NewsItem = ({ 
  newsItem,
  onClick,
  className = '',
  style = {}
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getUrgencyLevel = (urgency) => {
    switch (urgency) {
      case 'high': return { color: '#ff4d4f', icon: <ThunderboltOutlined /> };
      case 'medium': return { color: '#faad14', icon: <FireOutlined /> };
      default: return { color: '#1890ff', icon: <ClockCircleOutlined /> };
    }
  };

  const urgency = getUrgencyLevel(newsItem.urgency || 'low');

  return (
    <Card 
      className={`news-item ${className}`} 
      style={{ ...style, borderLeft: `4px solid ${urgency.color}`, marginBottom: '16px', borderRadius: '8px' }}
      hoverable
      onClick={onClick}
      size="small"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Space>
          <NewsSourceBadge source={newsItem.source} />
          <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {formatTime(newsItem.timestamp)}
          </span>
          <span style={{ color: urgency.color, fontSize: '11px', fontWeight: 600 }}>
            {urgency.icon}
            <span style={{ marginLeft: 4 }}>{(newsItem.urgency || 'low').toUpperCase()}</span>
          </span>
        </Space>
        <SentimentBadge sentiment={newsItem.sentiment} size="small" />
      </div>

      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{newsItem.title}</div>
      <div style={{ fontSize: '13px', color: '#595959', marginBottom: '12px' }}>
        {newsItem.summary || (newsItem.content?.substring(0, 150) + '...')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={4}>
          {(newsItem.tags || []).map(tag => (
            <Tag key={tag} color="blue" style={{ fontSize: '10px' }}>{tag}</Tag>
          ))}
        </Space>
        <Button type="link" size="small" style={{ padding: 0 }}>Read More</Button>
      </div>
    </Card>
  );
};

export default NewsItem;
