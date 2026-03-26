// src/components/StockAnalysis/TechnicalIndicator.jsx
import React from 'react';
import { Card, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const TechnicalIndicator = ({ 
  indicator = {},
  isActive = false,
  onEdit,
  onRemove,
  className = '',
  style = {}
}) => {
  const getIndicatorConfig = (type) => {
    switch (type) {
      case 'sma':
        return { name: 'Simple Moving Average', color: '#1890ff', parameters: { period: 20 } };
      case 'ema':
        return { name: 'Exponential Moving Average', color: '#52c41a', parameters: { period: 50 } };
      case 'bollinger':
        return { name: 'Bollinger Bands', color: '#faad14', parameters: { period: 20, stdDev: 2 } };
      case 'rsi':
        return { name: 'Relative Strength Index', color: '#ff4d4f', parameters: { period: 14 } };
      case 'macd':
        return { name: 'MACD', color: '#722ed1', parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } };
      default:
        return { name: type, color: '#1890ff', parameters: {} };
    }
  };

  const config = getIndicatorConfig(indicator.type || 'sma');
  const displayName = indicator.name || config.name;
  const color = indicator.color || config.color;
  const params = { ...config.parameters, ...indicator };

  return (
    <Card 
      className={`technical-indicator ${className} ${isActive ? 'active' : ''}`} 
      style={{ ...style, borderLeft: `6px solid ${color}`, borderRadius: '8px', marginBottom: '12px' }}
      hoverable
      onClick={() => onEdit && onEdit(indicator)}
      size="small"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600 }}>{displayName}</div>
        <Button 
          type="text" 
          danger
          size="small"
          icon={<DeleteOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            if (onRemove) onRemove(indicator.id);
          }} 
        />
      </div>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
        {params.period && <span>Period: {params.period} </span>}
        {params.stdDev && <span>SD: {params.stdDev} </span>}
        {params.fastPeriod && <span>F: {params.fastPeriod} S: {params.slowPeriod} Sig: {params.signalPeriod}</span>}
      </div>
    </Card>
  );
};

export default TechnicalIndicator;
