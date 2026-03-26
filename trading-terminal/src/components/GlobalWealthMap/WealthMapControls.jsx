// src/components/GlobalWealthMap/WealthMapControls.jsx
import React from 'react';
import { Select, Space } from 'antd';

const WealthMapControls = ({ 
  region,
  timeframe,
  metric,
  onRegionChange,
  onTimeframeChange,
  onMetricChange,
  regions = [],
  timeframes = [],
  metrics = []
}) => {
  return (
    <Space className="wealth-map-controls">
      <Select
        value={region}
        onChange={onRegionChange}
        options={regions}
        style={{ width: 160 }}
        placeholder="Select Region"
      />
      
      <Select
        value={timeframe}
        onChange={onTimeframeChange}
        options={timeframes}
        style={{ width: 120 }}
        placeholder="Select Year"
      />
      
      <Select
        value={metric}
        onChange={onMetricChange}
        options={metrics}
        style={{ width: 220 }}
        placeholder="Select Metric"
      />
    </Space>
  );
};

export default WealthMapControls;
