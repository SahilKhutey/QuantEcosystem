// src/components/News/NewsSourceBadge.jsx
import React from 'react';
import { Tag, Avatar, Space } from 'antd';
import { NewsOutlined } from '@ant-design/icons';

const NewsSourceBadge = ({ 
  source = 'unknown',
  className = '',
  style = {}
}) => {
  const getIcon = () => {
    switch (source.toLowerCase()) {
      case 'bloomberg': return 'B';
      case 'reuters': return 'R';
      case 'cnbc': return 'CNBC';
      case 'ft': return 'FT';
      case 'wsj': return 'WSJ';
      default: return <NewsOutlined />;
    }
  };
  
  const getSourceColor = () => {
    switch (source.toLowerCase()) {
      case 'bloomberg': return '#000000';
      case 'reuters': return '#ff8c00';
      case 'cnbc': return '#e31e25';
      case 'ft': return '#f3e5d8';
      case 'wsj': return '#003366';
      default: return '#1890ff';
    }
  };
  
  const sourceColor = getSourceColor();
  const icon = getIcon();
  
  return (
    <div className={`news-source-badge ${className}`} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {typeof icon === 'string' ? (
        <Tag 
          color={sourceColor}
          style={{ 
            color: source.toLowerCase() === 'ft' ? '#000000' : '#ffffff',
            fontWeight: 700,
            fontSize: '10px',
            padding: '0 6px',
            height: '20px',
            lineHeight: '20px',
            border: 'none',
            margin: 0
          }}
        >
          {icon}
        </Tag>
      ) : (
        <Avatar 
          size={20} 
          style={{ 
            backgroundColor: sourceColor,
            color: '#ffffff',
            fontSize: '10px'
          }}
          icon={icon}
        />
      )}
      <span style={{ marginLeft: 6, fontSize: '11px', fontWeight: 600, color: '#595959', textTransform: 'uppercase' }}>
        {source}
      </span>
    </div>
  );
};

export default NewsSourceBadge;
