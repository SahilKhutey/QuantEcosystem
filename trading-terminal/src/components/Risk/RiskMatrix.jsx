// src/components/Risk/RiskMatrix.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { HeatMapOutlined } from '@ant-design/icons';
import { Heatmap } from '@ant-design/plots';

const RiskMatrix = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Risk Matrix",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare data for the risk matrix
  const matrixData = data.risks?.map(risk => ({
    risk: risk.name,
    likelihood: risk.likelihood,
    impact: risk.impact,
    value: risk.value,
    category: risk.category
  })) || [];

  const matrixConfig = {
    data: matrixData,
    xField: 'likelihood',
    yField: 'impact',
    colorField: 'value',
    sizeField: 'value',
    size: [20, 80],
    color: ({ value }) => {
      return value > 0.8 ? '#ff4d4f' :
             value > 0.6 ? '#faad14' :
             value > 0.4 ? '#1890ff' : '#52c41a';
    },
    legend: {
      position: 'right',
    },
    xAxis: {
      label: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
        autoRotate: false,
      },
      title: {
        text: 'Likelihood',
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
        autoRotate: false,
      },
      title: {
        text: 'Impact',
      }
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.risk,
        value: `Risk Level: ${(datum.value * 100).toFixed(1)}%`,
      }),
    },
    meta: {
      likelihood: { min: 0, max: 1, nice: true },
      impact: { min: 0, max: 1, nice: true },
    },
  };

  return (
    <Card 
      className={`risk-matrix ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="matrix-header" style={{ marginBottom: '20px' }}>
        <div className="matrix-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <HeatMapOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="matrix-content">
        {loading ? (
          <div className="chart-loading" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner"></div>
            <div>Loading risk matrix...</div>
          </div>
        ) : error ? (
          <div className="chart-error" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <div className="matrix-visualization">
            <Heatmap {...matrixConfig} height={400} />
          </div>
        )}
        
        <div className="matrix-metrics" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '8px' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#cf1322' }}>Critical</div>
                <div className="metric-value" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {data.criticalRisks || 0}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#d48806' }}>High</div>
                <div className="metric-value" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {data.highPriorityRisks || 0}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '8px' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#096dd9' }}>Medium</div>
                <div className="metric-value" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {data.mediumPriorityRisks || 0}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default RiskMatrix;
