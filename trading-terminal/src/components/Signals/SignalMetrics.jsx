// src/components/Signals/SignalMetrics.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { FundOutlined } from '@ant-design/icons';

const SignalMetrics = ({ 
  metrics = {},
  title = "Signal Performance",
  className = '',
  style = {}
}) => {
  const defaultMetrics = {
    accuracy: 0.75,
    winRate: 0.65,
    avgHoldingPeriod: 5.2,
    sharpeRatio: 1.8,
    profitFactor: 1.5
  };
  
  const actualMetrics = { ...defaultMetrics, ...metrics };

  return (
    <Card 
      className={`signal-metrics ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}
    >
      <div className="metrics-header" style={{ marginBottom: '20px' }}>
        <div className="metrics-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <FundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="metrics-content">
        <Row gutter={[16, 16]}>
          {[
            { label: 'Accuracy', value: `${(actualMetrics.accuracy * 100).toFixed(1)}%`, color: actualMetrics.accuracy > 0.75 ? '#52c41a' : '#faad14' },
            { label: 'Win Rate', value: `${(actualMetrics.winRate * 100).toFixed(1)}%`, color: actualMetrics.winRate > 0.65 ? '#52c41a' : '#faad14' },
            { label: 'Avg. Holding', value: `${actualMetrics.avgHoldingPeriod.toFixed(1)}d`, color: '#262626' },
            { label: 'Sharpe', value: actualMetrics.sharpeRatio.toFixed(2), color: actualMetrics.sharpeRatio > 1.5 ? '#52c41a' : '#262626' }
          ].map((m, i) => (
            <Col span={12} key={i}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '11px', color: '#8c8c8c' }}>{m.label}</div>
                <div className="metric-value" style={{ fontSize: '16px', fontWeight: 600, color: m.color }}>{m.value}</div>
              </div>
            </Col>
          ))}
        </Row>
        
        <div className="metrics-description" style={{ marginTop: '16px', fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
          {metrics.description || "Key performance metrics for the active signal generator."}
        </div>
      </div>
    </Card>
  );
};

export default SignalMetrics;
