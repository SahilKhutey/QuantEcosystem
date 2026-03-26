// src/components/Signals/SignalHistory.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const SignalHistory = ({ 
  history = [],
  title = "Signal History",
  className = '',
  style = {}
}) => {
  const chartData = history.map((item, index) => ({
    ...item,
    index,
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    strength: item.strength,
    confidence: item.confidence
  }));
  
  const chartConfig = {
    data: chartData,
    xField: 'index',
    yField: 'strength',
    smooth: true,
    lineStyle: {
      lineWidth: 3,
      stroke: '#1890ff'
    },
    point: {
      size: 4,
      shape: 'circle',
      style: { fill: '#1890ff', stroke: '#fff', lineWidth: 1 }
    },
    xAxis: {
      label: {
        formatter: (v) => chartData[v]?.timestamp || v,
        autoRotate: true,
      },
      tickCount: 5
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      min: 0,
      max: 1
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Signal Strength',
        value: `${(datum.strength * 100).toFixed(1)}%`
      })
    }
  };

  return (
    <Card 
      className={`signal-history ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}
    >
      <div className="history-header" style={{ marginBottom: '20px' }}>
        <div className="history-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="history-content">
        <div className="history-chart">
          <Line {...chartConfig} height={300} />
        </div>
        
        <div className="history-metrics" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Current</div>
                <div className="metric-value" style={{ color: '#52c41a', fontSize: '18px', fontWeight: 600 }}>
                  {(history[0]?.strength * 100 || 0).toFixed(1)}%
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Avg Strength</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {history.length > 0 ? (
                    (history.reduce((sum, item) => sum + item.strength, 0) / history.length * 100).toFixed(1)
                  ) : '0.0'}%
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Avg Confidence</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {history.length > 0 ? (
                    (history.reduce((sum, item) => sum + item.confidence, 0) / history.length * 100).toFixed(1)
                  ) : '0.0'}%
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default SignalHistory;
