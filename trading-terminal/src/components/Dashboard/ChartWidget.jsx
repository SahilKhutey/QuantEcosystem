// src/components/Dashboard/ChartWidget.jsx
import React, { useState } from 'react';
import { Button, Space, Select } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import ChartContainer from '../Analytics/ChartContainer';

const ChartWidget = ({ 
  title,
  children,
  extra,
  timeRange,
  onTimeRangeChange,
  timeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '1 Week' },
    { value: '30d', label: '1 Month' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ],
  fullScreen = false,
  onFullScreenToggle,
  className = '',
  style = {},
  cardStyle = {},
  chartStyle = {},
  loading = false,
  error = null
}) => {
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);
  
  const handleFullScreenToggle = () => {
    const newFullScreen = !isFullScreen;
    setIsFullScreen(newFullScreen);
    if (onFullScreenToggle) {
      onFullScreenToggle(newFullScreen);
    }
  };

  const chartExtra = (
    <Space>
      {timeOptions.length > 1 && onTimeRangeChange && (
        <Select
          defaultValue="7d"
          onChange={onTimeRangeChange}
          options={timeOptions}
          style={{ width: 120 }}
        />
      )}
      {extra}
      <Button 
        icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
        onClick={handleFullScreenToggle}
      />
    </Space>
  );

  return (
    <ChartContainer
      title={title}
      extra={chartExtra}
      style={{ ...cardStyle, ...style }}
      chartStyle={chartStyle}
      loading={loading}
      error={error}
      className={className}
    >
      {children}
    </ChartContainer>
  );
};

export default ChartWidget;
