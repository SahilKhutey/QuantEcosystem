// src/components/Analytics/AnalyticsDashboard.jsx
import React from 'react';
import { Row, Col } from 'antd';
import MetricCard from './MetricCard';

const AnalyticsDashboard = ({ 
  metrics = [],
  columns = 4,
  style = {},
  className = ''
}) => {
  return (
    <div className={`analytics-dashboard ${className}`} style={style}>
      <Row gutter={[16, 16]}>
        {metrics.map((metric, index) => (
          <Col key={index} span={24 / columns}>
            <MetricCard 
              title={metric.title}
              value={metric.value}
              prefix={metric.prefix}
              suffix={metric.suffix}
              color={metric.color}
              valueStyle={metric.valueStyle}
              description={metric.description}
              isPositive={metric.isPositive}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
