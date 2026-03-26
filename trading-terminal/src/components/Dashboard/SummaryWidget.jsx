// src/components/Dashboard/SummaryWidget.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const SummaryWidget = ({ 
  title,
  metrics = [],
  columns = 3,
  className = '',
  style = {},
  cardStyle = {},
  metricStyle = {},
  titleStyle = {},
  metricTitleStyle = {},
  metricValueStyle = {},
  positiveColor = '#52c41a',
  negativeColor = '#ff4d4f',
  loading = false,
  error = null
}) => {
  const renderMetric = (metric, index) => {
    const isPositive = metric.isPositive !== false;
    const color = isPositive ? positiveColor : negativeColor;
    
    return (
      <Col key={index} span={24 / columns} style={{ padding: '0 12px' }}>
        <div className="summary-metric" style={{ ...metricStyle, textAlign: 'center' }}>
          {metric.icon || (isPositive ? <CheckCircleOutlined style={{ color: positiveColor, marginRight: 8 }} /> : <CloseCircleOutlined style={{ color: negativeColor, marginRight: 8 }} />)}
          <div className="metric-title" style={{ fontSize: '0.9rem', color: '#666', marginBottom: 4, ...metricTitleStyle }}>
            {metric.title}
          </div>
          <Statistic
            value={metric.value}
            prefix={metric.prefix}
            suffix={metric.suffix}
            valueStyle={{ 
              color: color,
              fontSize: '18px',
              fontWeight: 600,
              ...metricValueStyle
            }}
          />
          {metric.description && (
            <div className="metric-description" style={{ color: '#8c8c8c', fontSize: '12px', marginTop: 4 }}>
              {metric.description}
            </div>
          )}
        </div>
      </Col>
    );
  };

  return (
    <Card 
      className={`summary-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
      loading={loading}
    >
      <div className="summary-widget-content" style={style}>
        {title && (
          <div className="summary-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, ...titleStyle }}>
            {title}
          </div>
        )}
        
        <Row gutter={16} style={{ marginTop: title ? 16 : 0 }}>
          {metrics.map((metric, index) => renderMetric(metric, index))}
        </Row>
      </div>
    </Card>
  );
};

export default SummaryWidget;
