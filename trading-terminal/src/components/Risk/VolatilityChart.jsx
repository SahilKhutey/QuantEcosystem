// src/components/Risk/VolatilityChart.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const VolatilityChart = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Volatility Analysis",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare data for the volatility chart
  const volatilityData = data.historical?.map(item => ({
    date: item.date,
    value: item.value,
    category: 'Volatility'
  })) || [];

  const volatilityConfig = {
    data: volatilityData,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    lineStyle: {
      lineWidth: 3,
      stroke: '#1890ff'
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#1890ff',
        stroke: '#fff',
        lineWidth: 1
      }
    },
    xAxis: {
      type: 'time',
      mask: 'YYYY-MM-DD'
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v * 100).toFixed(1)}%`
      }
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.category,
        value: `${(datum.value * 100).toFixed(2)}%`
      })
    }
  };

  return (
    <Card 
      className={`volatility-chart ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="volatility-header" style={{ marginBottom: '20px' }}>
        <div className="volatility-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="volatility-content">
        {loading ? (
          <div className="chart-loading" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner"></div>
            <div>Loading volatility data...</div>
          </div>
        ) : error ? (
          <div className="chart-error" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <div className="volatility-visualization">
            <Line {...volatilityConfig} height={300} />
          </div>
        )}
        
        <div className="volatility-metrics" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Current Volatility</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: data.currentVolatility > 0.3 ? '#ff4d4f' : data.currentVolatility > 0.15 ? '#faad14' : '#52c41a' }}>
                  {data.currentVolatility ? `${(data.currentVolatility * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>30-Day Avg</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {data.thirtyDayAvg ? `${(data.thirtyDayAvg * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Annualized</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {data.annualizedVolatility ? `${(data.annualizedVolatility * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="volatility-description" style={{ marginTop: '16px', fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
            {data.description || "Volatility measures the degree of variation of a trading price series over time."}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VolatilityChart;
