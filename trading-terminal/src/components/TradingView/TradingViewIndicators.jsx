// src/components/TradingView/TradingViewIndicators.jsx
import React, { useState } from 'react';
import { Space, Button, Select, Tag, Input, Modal } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';

const TradingViewIndicators = ({ 
  indicators = [],
  onAddIndicator,
  className = '',
  style = {}
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [searchText, setSearchText] = useState('');

  const indicatorsList = [
    { value: 'volume', label: 'Volume', category: 'Volume' },
    { value: 'vwap', label: 'VWAP', category: 'Volume' },
    { value: 'money-flow', label: 'Money Flow', category: 'Momentum' },
    { value: 'on-balance', label: 'On-Balance Volume', category: 'Volume' },
    { value: 'keltner', label: 'Keltner Channels', category: 'Volatility' },
    { value: 'donchian', label: 'Donchian Channels', category: 'Volatility' },
    { value: 'atr', label: 'Average True Range', category: 'Volatility' }
  ];

  const filteredIndicators = indicatorsList.filter(indicator => 
    indicator.label.toLowerCase().includes(searchText.toLowerCase()) ||
    indicator.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddIndicator = (indicator) => {
    if (onAddIndicator && indicator) {
      onAddIndicator(indicator.value);
    }
    setIsModalVisible(false);
    setSelectedIndicator(null);
  };

  return (
    <div className={`tradingview-indicators ${className}`} style={style}>
      <Space wrap>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>Indicators:</div>
        {indicators.map((indicator, index) => (
          <Tag key={index} color="purple" closable style={{ borderRadius: '4px' }}>
            {indicatorsList.find(i => i.value === indicator)?.label || indicator}
          </Tag>
        ))}
        <Button 
          type="dashed" 
          size="small" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          style={{ borderRadius: '4px' }}
        >
          Add Indicator
        </Button>
      </Space>
      
      <Modal
        title="Add Technical Indicator"
        open={isModalVisible}
        onOk={() => handleAddIndicator(selectedIndicator)}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ disabled: !selectedIndicator }}
        width={400}
      >
        <Input 
          placeholder="Search indicators..." 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <div className="indicators-grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredIndicators.map((indicator, index) => (
            <div 
              key={index} 
              className="indicator-card"
              onClick={() => setSelectedIndicator(indicator)}
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                background: selectedIndicator?.value === indicator.value ? '#f9f0ff' : '#fff',
                borderColor: selectedIndicator?.value === indicator.value ? '#722ed1' : '#f0f0f0'
              }}
            >
              <div style={{ fontWeight: 600 }}>{indicator.label}</div>
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{indicator.category}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TradingViewIndicators;
