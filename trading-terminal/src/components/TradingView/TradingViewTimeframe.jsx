// src/components/TradingView/TradingViewTimeframe.jsx
import React, { useState } from 'react';
import { Space, Button, Select, InputNumber } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const TradingViewTimeframe = ({ 
  interval = "15",
  onIntervalChange,
  className = '',
  style = {}
}) => {
  const [isCustomTimeframe, setIsCustomTimeframe] = useState(false);
  const [customTimeframe, setCustomTimeframe] = useState(15);

  const intervals = [
    { value: '1', label: '1 Minute' },
    { value: '5', label: '5 Minutes' },
    { value: '15', label: '15 Minutes' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '1 Hour' },
    { value: '240', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ];

  const handleTimeframeChange = (value) => {
    if (value === 'custom') {
      setIsCustomTimeframe(true);
    } else {
      onIntervalChange(value);
    }
  };

  return (
    <div className={`tradingview-timeframe ${className}`} style={{ marginLeft: 'auto', ...style }}>
      <Space>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>
          <ClockCircleOutlined style={{ marginRight: 6 }} />
          TF:
        </div>
        {isCustomTimeframe ? (
          <Space>
            <InputNumber
              min={1}
              max={1440}
              size="small"
              value={customTimeframe}
              onChange={(v) => setCustomTimeframe(v)}
              style={{ width: 70 }}
            />
            <Button 
              type="primary" 
              size="small"
              onClick={() => {
                onIntervalChange(customTimeframe.toString());
                setIsCustomTimeframe(false);
              }}
            >
              Apply
            </Button>
            <Button size="small" onClick={() => setIsCustomTimeframe(false)}>Cancel</Button>
          </Space>
        ) : (
          <Select
            value={interval}
            size="small"
            onChange={handleTimeframeChange}
            options={[
              ...intervals,
              { value: 'custom', label: 'Custom...' }
            ]}
            style={{ width: 110 }}
          />
        )}
      </Space>
    </div>
  );
};

export default TradingViewTimeframe;
