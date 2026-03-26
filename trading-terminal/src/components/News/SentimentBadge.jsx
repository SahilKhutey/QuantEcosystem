// src/components/News/SentimentBadge.jsx
import React from 'react';
import { Tag, Progress, Space } from 'antd';
import { LikeOutlined, DislikeOutlined, MehOutlined } from '@ant-design/icons';

const SentimentBadge = ({ 
  sentiment = 0.5,
  size = 'default',
  className = '',
  style = {}
}) => {
  const getSentimentCategory = (value) => {
    if (value > 0.6) return { category: 'positive', color: '#52c41a', icon: <LikeOutlined /> };
    if (value > 0.4) return { category: 'neutral', color: '#1890ff', icon: <MehOutlined /> };
    return { category: 'negative', color: '#ff4d4f', icon: <DislikeOutlined /> };
  };
  
  const category = getSentimentCategory(sentiment);
  const score = Math.round(sentiment * 100);
  
  return (
    <div className={`sentiment-badge ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
      <Tag 
        color={category.color} 
        icon={category.icon}
        style={{ 
          margin: 0,
          fontSize: size === 'small' ? '10px' : '12px',
          fontWeight: 600
        }}
      >
        {category.category.toUpperCase()}
      </Tag>
      
      <div style={{ width: size === 'small' ? '40px' : '60px' }}>
        <Progress 
          percent={score} 
          size="small"
          showInfo={false} 
          strokeColor={category.color}
          trailColor="#f0f0f0"
          strokeWidth={4}
        />
      </div>
      <span style={{ fontSize: size === 'small' ? '10px' : '12px', fontWeight: 600, color: category.color }}>
        {score}%
      </span>
    </div>
  );
};

export default SentimentBadge;
