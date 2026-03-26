// src/components/GlobalWealthMap/WealthQuintileBreakdown.jsx
import React from 'react';
import { Card, Row, Col, Spin, Alert, Statistic } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

const WealthQuintileBreakdown = ({ 
  title = "Wealth Distribution by Quintile",
  quintiles = [],
  className = '',
  style = {},
  loading = false,
  error = null
}) => {
  // Aggregate data for the pie chart if quintiles is an array
  const pieData = Array.isArray(quintiles) ? quintiles.map(q => ({
    type: q.name,
    value: q.share || 0
  })) : [];

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      content: '{type}: {percentage}',
      offset: '30%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        formatter: () => 'Wealth Share',
        style: { fontSize: '14px', color: '#8c8c8c' }
      },
      content: {
        formatter: () => 'Distribution',
        style: { fontSize: '16px', fontWeight: 600 }
      },
    },
  };

  const renderQuintileItem = (quintile, index) => (
    <div key={index} className="quintile-item" style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div className="quintile-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="quintile-name" style={{ fontWeight: 600 }}>{quintile.name}</div>
        <div className="quintile-value" style={{ fontWeight: 700, color: quintile.share > 50 ? '#52c41a' : quintile.share > 20 ? '#faad14' : '#ff4d4f' }}>
          {quintile.share?.toFixed(1)}%
        </div>
      </div>
      <div className="quintile-description" style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 8 }}>
        {quintile.description}
      </div>
      <Row gutter={8}>
        <Col span={12}>
          <Statistic 
            title="Gini Index" 
            value={quintile.gini} 
            precision={2}
            valueStyle={{ fontSize: '13px', color: quintile.gini > 0.6 ? '#ff4d4f' : quintile.gini > 0.4 ? '#faad14' : '#52c41a' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Avg Wealth" 
            value={quintile.averageWealth} 
            prefix="$" 
            precision={0}
            valueStyle={{ fontSize: '13px' }}
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <Card 
      className={`wealth-quintile-breakdown ${className}`} 
      style={style}
    >
      <div className="quintile-container">
        <div className="quintile-header" style={{ marginBottom: 20 }}>
          <div className="quintile-title" style={{ fontSize: '16px', fontWeight: 600 }}>
            <PieChartOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
        </div>
        
        <div className="quintile-content">
          {loading ? (
            <div className="chart-loading" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Spin />
            </div>
          ) : error ? (
            <div className="chart-error">
              <Alert 
                message="Error" 
                description={error} 
                type="error" 
                showIcon 
              />
            </div>
          ) : (
            <div className="quintile-visualization">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                  <div className="quintile-pie-chart">
                    <Pie {...pieConfig} height={350} />
                  </div>
                </Col>
                
                <Col xs={24} lg={10}>
                  <div className="quintile-list" style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                    {Array.isArray(quintiles) ? quintiles.map(renderQuintileItem) : null}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WealthQuintileBreakdown;
