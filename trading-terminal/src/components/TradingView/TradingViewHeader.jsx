// src/components/TradingView/TradingViewHeader.jsx
import React from 'react';
import { Space, Button, Select } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

const TradingViewHeader = ({ 
  title = "TradingView Chart",
  symbol = "AAPL",
  interval = "15",
  chartType = "candles",
  className = '',
  style = {},
  symbols = [],
  intervals = [],
  chartTypes = [],
  onSymbolChange,
  onIntervalChange,
  onChartTypeChange,
  onFullScreenToggle,
  isFullScreen = false
}) => {
  return (
    <div className={`tradingview-header ${className}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', ...style }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="header-title" style={{ fontSize: '18px', fontWeight: 600 }}>{title}</div>
        <Space>
          <Select value={symbol} onChange={onSymbolChange} options={symbols} style={{ width: 150 }} />
          <Select value={interval} onChange={onIntervalChange} options={intervals} style={{ width: 120 }} />
          <Select value={chartType} onChange={onChartTypeChange} options={chartTypes} style={{ width: 120 }} />
        </Space>
      </div>
      
      <div className="header-right">
        <Button 
          icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
          onClick={onFullScreenToggle}
        >
          {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
    </div>
  );
};

export default TradingViewHeader;
