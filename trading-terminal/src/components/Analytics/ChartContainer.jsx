// src/components/Analytics/ChartContainer.jsx
import React from 'react';
import { Card } from 'antd';

const ChartContainer = ({ 
  title, 
  children, 
  extra,
  style = {},
  chartStyle = {},
  loading = false,
  error = null,
  className = ''
}) => {
  return (
    <Card 
      title={title}
      extra={extra}
      className={`analytics-chart-container ${className}`}
      style={style}
      loading={loading}
    >
      {error ? (
        <div className="chart-error">
          <div className="error-message">{error}</div>
        </div>
      ) : (
        <div className="chart-content" style={chartStyle}>
          {children}
        </div>
      )}
    </Card>
  );
};

export default ChartContainer;
