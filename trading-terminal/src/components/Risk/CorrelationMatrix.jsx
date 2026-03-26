// src/components/Risk/CorrelationMatrix.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { HeatMapOutlined } from '@ant-design/icons';
import { Heatmap } from '@ant-design/plots';

const CorrelationMatrix = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Correlation Matrix",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare data for the correlation matrix
  const matrixData = data.correlations?.map(correlation => ({
    asset1: correlation.asset1,
    asset2: correlation.asset2,
    value: correlation.value
  })) || [];

  const matrixConfig = {
    data: matrixData,
    xField: 'asset1',
    yField: 'asset2',
    colorField: 'value',
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'],
    legend: {
      position: 'right',
    },
    tooltip: {
      formatter: (datum) => ({
        name: `${datum.asset1} vs ${datum.asset2}`,
        value: `Correlation: ${datum.value.toFixed(2)}`
      })
    },
    label: {
      style: {
        fill: '#fff',
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)',
      },
      formatter: (datum) => datum.value.toFixed(1),
    },
    xAxis: {
      label: {
        autoRotate: true,
        style: { fontSize: 11 },
      },
    },
    yAxis: {
      label: {
        style: { fontSize: 11 },
      },
    },
  };

  return (
    <Card 
      className={`correlation-matrix ${className}`} 
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
            <div>Loading correlation data...</div>
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
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Avg Correlation</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {data.averageCorrelation ? data.averageCorrelation.toFixed(2) : '0.00'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Highest</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: '#ff4d4f' }}>
                  {data.highestCorrelation ? data.highestCorrelation.toFixed(2) : '0.00'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Lowest</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
                  {data.lowestCorrelation ? data.lowestCorrelation.toFixed(2) : '0.00'}
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="matrix-description" style={{ marginTop: '16px', fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
            {data.description || "Correlation matrix showing relationships between assets in the portfolio."}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CorrelationMatrix;
