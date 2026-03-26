// src/components/Risk/ExposureBar.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/plots';

const ExposureBar = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Exposure Levels",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare data for the bar chart
  const barData = data.sectors?.map(sector => ({
    sector: sector.name,
    exposure: sector.exposure,
    risk: sector.risk,
    value: sector.value
  })) || [];

  const barConfig = {
    data: barData,
    xField: 'exposure',
    yField: 'sector',
    seriesField: 'sector',
    color: ({ sector }) => {
      const sectorData = data.sectors.find(s => s.name === sector);
      return sectorData?.exposure > 0.6 ? '#ff4d4f' :
             sectorData?.exposure > 0.4 ? '#faad14' :
             sectorData?.exposure > 0.2 ? '#1890ff' : '#52c41a';
    },
    label: {
      position: 'right',
      formatter: (datum) => `${(datum.exposure * 100).toFixed(1)}%`,
      style: {
        fill: '#8c8c8c',
      }
    },
    xAxis: {
      label: {
        formatter: (v) => `${v * 100}%`,
      },
    },
    legend: false,
    tooltip: {
      formatter: (datum) => ({
        name: datum.sector,
        value: `${(datum.exposure * 100).toFixed(1)}%`
      }),
    },
  };

  return (
    <Card 
      className={`exposure-bar ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="exposure-header" style={{ marginBottom: '20px' }}>
        <div className="exposure-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="exposure-content">
        {loading ? (
          <div className="chart-loading" style={{ height: '344px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#8c8c8c' }}>
            <div className="loading-spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #1890ff', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 2s linear infinite', marginBottom: '12px' }}></div>
            <div>Loading exposure data...</div>
          </div>
        ) : error ? (
          <div className="chart-error" style={{ height: '344px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <div className="exposure-chart">
            <Bar {...barConfig} height={300} />
          </div>
        )}
        
        <div className="exposure-metrics" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Total Exposure</div>
                <div className="metric-value" style={{ fontSize: '16px', fontWeight: 600, color: data.totalExposure > 0.6 ? '#ff4d4f' : data.totalExposure > 0.4 ? '#faad14' : '#1890ff' }}>
                  {data.totalExposure ? `${(data.totalExposure * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Riskiest Sector</div>
                <div className="metric-value" style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                  {data.riskiestSector || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Safest Sector</div>
                <div className="metric-value" style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                  {data.safestSector || 'N/A'}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default ExposureBar;
