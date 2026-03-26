// src/components/Dashboard/PerformanceWidget.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const PerformanceWidget = ({ 
  title = "Performance Metrics",
  metrics = [],
  chartData = [],
  columns = 3,
  showChart = true,
  className = '',
  style = {},
  cardStyle = {},
  chartStyle = {},
  loading = false,
  error = null
}) => {
  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    lineStyle: ({ type }) => ({
      lineWidth: type === 'target' ? 1 : 3,
      stroke: type === 'target' ? '#1890ff' : '#52c41a',
      lineDash: type === 'target' ? [5, 5] : [],
    }),
    point: {
      size: 4,
      shape: 'circle',
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.type,
        value: `$${datum.value?.toLocaleString()}`,
      }),
    },
  };

  const renderMetrics = () => (
    <Row gutter={16} style={{ marginTop: showChart ? 24 : 0 }}>
      {metrics.map((metric, index) => (
        <Col key={index} span={24 / columns} style={{ textAlign: 'center' }}>
          <div className="performance-metric">
            <div className="metric-title" style={{ fontWeight: 500, marginBottom: 4 }}>
              {metric.title}
            </div>
            <div className="metric-value" style={{ 
              fontSize: '20px', 
              fontWeight: 600,
              color: metric.isPositive ? '#52c41a' : '#ff4d4f'
            }}>
              {metric.value}{metric.suffix}
            </div>
            {metric.description && (
              <div className="metric-description" style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                {metric.description}
              </div>
            )}
          </div>
        </Col>
      ))}
    </Row>
  );

  return (
    <Card 
      className={`performance-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
      loading={loading}
    >
      <div className="performance-widget-content" style={style}>
        <div className="performance-title" style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ marginRight: 8 }} />
          {title}
        </div>
        
        <div className="performance-content">
          {showChart && (
            <div className="performance-chart" style={{ height: 300, marginTop: 16, ...chartStyle }}>
              <Line {...chartConfig} />
            </div>
          )}
          
          {metrics.length > 0 && renderMetrics()}
        </div>
      </div>
    </Card>
  );
};

export default PerformanceWidget;
