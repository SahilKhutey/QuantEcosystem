// src/components/Analytics/MetricCard.jsx
import React from 'react';
import { Card, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const MetricCard = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  color, 
  valueStyle, 
  description,
  isPositive = true,
  style = {},
  className = '',
  icon = true
}) => {
  return (
    <Card className={`metric-card ${className}`} style={style}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          color: color || (isPositive ? '#52c41a' : '#ff4d4f'),
          ...valueStyle
        }}
      />
      {description && (
        <div className="metric-description" style={{ color: '#666', marginTop: 8 }}>
          {icon && (isPositive ? <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />)}
          {description}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
