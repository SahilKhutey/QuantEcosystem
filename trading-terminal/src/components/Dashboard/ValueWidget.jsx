// src/components/Dashboard/ValueWidget.jsx
import React from 'react';
import { Card, Statistic, Space, Tag, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

const ValueWidget = ({ 
  title,
  value,
  prefix,
  suffix,
  change,
  changePrefix,
  changeSuffix,
  description,
  trend,
  isPositive,
  showChange = true,
  showTrend = true,
  tooltip,
  className = '',
  style = {},
  cardStyle = {},
  titleStyle = {},
  valueStyle = {},
  changeStyle = {},
  descriptionStyle = {},
  positiveColor = '#52c41a',
  negativeColor = '#ff4d4f',
  loading = false,
  error = null
}) => {
  const renderChange = () => {
    if (!showChange || change === null || change === undefined) return null;
    
    const displayValue = change >= 0 ? change : -change;
    const isPositiveChange = change >= 0;
    const color = isPositiveChange ? positiveColor : negativeColor;
    
    return (
      <div className="value-change" style={{ ...changeStyle, color, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
        {isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {displayValue?.toFixed(2)}{changeSuffix || ''}
      </div>
    );
  };

  const renderTrend = () => {
    if (!showTrend || !trend) return null;
    
    return (
      <div className="value-trend" style={{ marginTop: 8 }}>
        <Space>
          <span>Trend: {trend?.toFixed(2)}%</span>
          <Tag color={trend > 0 ? 'green' : trend < 0 ? 'red' : 'blue'}>
            {trend >= 0 ? 'Upward' : 'Downward'}
          </Tag>
        </Space>
      </div>
    );
  };

  const renderDescription = () => {
    if (!description) return null;
    
    return (
      <div className="value-description" style={{ color: '#666', marginTop: 8, fontSize: '0.9rem', ...descriptionStyle }}>
        {description}
      </div>
    );
  };

  const renderTooltip = () => {
    if (!tooltip) return null;
    
    return (
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
      </Tooltip>
    );
  };

  return (
    <Card 
      className={`value-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
    >
      <div className="value-widget-content" style={style}>
        <div className="value-title" style={{ fontSize: '1rem', fontWeight: 500, color: '#333', marginBottom: 8, display: 'flex', alignItems: 'center', ...titleStyle }}>
          {title}
          {renderTooltip()}
        </div>
        
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            fontSize: '24px',
            fontWeight: 600,
            color: isPositive ? positiveColor : negativeColor,
            ...valueStyle
          }}
          loading={loading}
        />
        
        {renderChange()}
        {renderTrend()}
        {renderDescription()}
      </div>
    </Card>
  );
};

export default ValueWidget;
