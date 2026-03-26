// src/components/StockAnalysis/IndicatorLibrary.jsx
import React, { useState } from 'react';
import { Card, Space, Button, Select, Input, List } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const IndicatorLibrary = ({ 
  activeIndicators = [],
  onAddIndicator,
  onRemoveIndicator,
  onEditIndicator,
  className = '',
  style = {}
}) => {
  const [searchText, setSearchText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [indicatorType, setIndicatorType] = useState('sma');

  const indicators = [
    { value: 'sma', label: 'Simple Moving Average', category: 'Trend', description: 'Smooths price data to identify trend direction' },
    { value: 'ema', label: 'Exponential Moving Average', category: 'Trend', description: 'Gives more weight to recent prices' },
    { value: 'bollinger', label: 'Bollinger Bands', category: 'Volatility', description: 'Measures volatility and potential overbought/oversold' },
    { value: 'rsi', label: 'Relative Strength Index', category: 'Momentum', description: 'Measures speed and change of price movements' },
    { value: 'macd', label: 'MACD', category: 'Momentum', description: 'Shows trend direction and momentum' }
  ];

  const filteredIndicators = indicators.filter(indicator => 
    indicator.label.toLowerCase().includes(searchText.toLowerCase()) ||
    indicator.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const getIndicatorConfig = (type) => {
    switch (type) {
      case 'sma': return { period: 20 };
      case 'ema': return { period: 50 };
      case 'bollinger': return { period: 20, stdDev: 2 };
      case 'rsi': return { period: 14 };
      case 'macd': return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
      default: return {};
    }
  };

  const handleAddIndicator = (type) => {
    const config = getIndicatorConfig(type);
    onAddIndicator({ ...config, type });
    setIsAdding(false);
  };

  return (
    <Card 
      className={`indicator-library ${className}`} 
      style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}
      title="INDICATOR LIBRARY"
      extra={!isAdding && <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsAdding(true)}>Add</Button>}
      size="small"
    >
      {isAdding ? (
        <div style={{ padding: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '8px' }}>SELECT TYPE</div>
          <Select 
            value={indicatorType} 
            onChange={setIndicatorType}
            style={{ width: '100%', marginBottom: '16px' }}
            options={indicators}
          />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="small" type="primary" onClick={() => handleAddIndicator(indicatorType)}>Add</Button>
          </Space>
        </div>
      ) : (
        <div className="library-content">
          <Input 
            placeholder="Search..." 
            size="small"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ marginBottom: '16px', borderRadius: '4px' }}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '8px' }}>ACTIVE</div>
            <List
              size="small"
              dataSource={activeIndicators}
              renderItem={item => (
                <List.Item
                  style={{ padding: '8px 0' }}
                  actions={[
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEditIndicator(item)} />,
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onRemoveIndicator(item.id)} />
                  ]}
                >
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{item.name || item.type.toUpperCase()}</div>
                    <div style={{ color: '#8c8c8c', fontSize: '10px' }}>{item.period || item.fastPeriod} Period</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ fontSize: '12px', color: '#bfbfbf', padding: '12px 0' }}>No active indicators</div> }}
            />
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '8px' }}>AVAILABLE</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredIndicators.map(ind => (
                <div 
                  key={ind.value} 
                  onClick={() => handleAddIndicator(ind.value)}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{ind.label}</div>
                  <div style={{ fontSize: '10px', color: '#bfbfbf' }}>{ind.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default IndicatorLibrary;
