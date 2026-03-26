// src/components/Risk/HazardIndicator.jsx
import React from 'react';
import { Card, Row, Col, Progress } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const HazardIndicator = ({ 
  type,
  data = {},
  title,
  color = '#ff4d4f',
  className = '',
  style = {}
}) => {
  // Determine hazard level
  const getHazardLevel = (value) => {
    if (value > 0.8) return 'critical';
    if (value > 0.6) return 'high';
    if (value > 0.4) return 'medium';
    if (value > 0.2) return 'low';
    return 'none';
  };

  const getHazardColor = (level) => {
    switch (level) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#faad14';
      case 'medium': return '#1890ff';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getHazardIcon = (level) => {
    switch (level) {
      case 'critical': return <CloseCircleOutlined />;
      case 'high': return <WarningOutlined />;
      case 'medium': return <WarningOutlined />;
      case 'low': return <CheckCircleOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  const level = getHazardLevel(data.value || 0);
  const levelColor = getHazardColor(level);
  const levelIcon = getHazardIcon(level);
  const levelText = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <Card 
      className={`hazard-indicator ${className}`} 
      style={{ ...style, borderLeft: `4px solid ${color}`, borderRadius: '8px' }}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="hazard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="hazard-title" style={{ fontSize: '16px', fontWeight: 600 }}>{title}</div>
        <div className="hazard-level" style={{ color: levelColor, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {levelIcon}
          {levelText}
        </div>
      </div>
      
      <div className="hazard-content">
        <div className="hazard-metrics">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <div className="hazard-metric">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Current Level</div>
                <div className="metric-value" style={{ color: levelColor, fontSize: '18px', fontWeight: 600 }}>
                  {data.value ? `${(data.value * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="hazard-metric">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Threshold</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {data.threshold ? `${(data.threshold * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="hazard-progress" style={{ margin: '12px 0' }}>
            <Progress 
              percent={data.value ? data.value * 100 : 0} 
              strokeColor={levelColor} 
              showInfo={false} 
              strokeWidth={8}
            />
          </div>
          
          <div className="hazard-description" style={{ fontSize: '13px', color: '#595959', marginBottom: '12px' }}>
            {data.description || `Risk level for ${title.toLowerCase()}`}
          </div>
          
          {data.metrics && (
            <div className="hazard-metrics-detail" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
              <Row gutter={8}>
                {data.metrics.map((metric, index) => (
                  <Col key={index} span={8}>
                    <div className="hazard-metric-detail">
                      <div className="metric-label" style={{ fontSize: '11px', color: '#8c8c8c' }}>{metric.label}</div>
                      <div className="metric-value" style={{ color: metric.color || '#262626', fontWeight: 500, fontSize: '12px' }}>
                        {metric.value}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default HazardIndicator;
