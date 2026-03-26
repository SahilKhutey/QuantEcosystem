// src/components/GlobalWealthMap/RegionalWealthBreakdown.jsx
import React from 'react';
import { Card, Row, Col, Spin, Alert, Statistic } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

const RegionalWealthBreakdown = ({ 
  title = "Regional Wealth Breakdown",
  regions = [],
  className = '',
  style = {},
  loading = false,
  error = null
}) => {
  // Calculate total wealth
  const totalWealth = regions.reduce((sum, region) => sum + (region.wealth || 0), 0);
  
  // Add percentage to each region
  const regionsWithPercentage = regions.map(region => ({
    ...region,
    percentage: totalWealth ? (region.wealth / totalWealth) * 100 : 0
  }));

  const renderRegion = (region) => (
    <Col key={region.name} xs={24} sm={12} md={8}>
      <Card size="small" className="region-item" style={{ marginBottom: 16 }}>
        <div className="region-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="region-name" style={{ fontWeight: 600 }}>{region.name}</div>
          <div className="region-percentage" style={{ color: '#52c41a', fontWeight: 600 }}>
            {region.percentage?.toFixed(1)}%
          </div>
        </div>
        <div className="region-wealth" style={{ fontSize: '18px', fontWeight: 700, marginBottom: 12 }}>
          ${region.wealth?.toFixed(2)} Trillion
        </div>
        <Row gutter={8}>
          <Col span={12}>
            <Statistic 
              title="Gini Index" 
              value={region.gini} 
              precision={2}
              valueStyle={{ fontSize: '14px', color: region.gini > 0.6 ? '#ff4d4f' : region.gini > 0.4 ? '#faad14' : '#52c41a' }}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Top 1%" 
              value={region.top1Percent} 
              suffix="%" 
              precision={1}
              valueStyle={{ fontSize: '14px' }}
            />
          </Col>
        </Row>
      </Card>
    </Col>
  );

  return (
    <Card 
      className={`regional-wealth-breakdown ${className}`} 
      style={style}
    >
      <div className="breakdown-container">
        <div className="breakdown-header" style={{ marginBottom: 24 }}>
          <div className="breakdown-title" style={{ fontSize: '16px', fontWeight: 600 }}>
            <PieChartOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
        </div>
        
        <div className="breakdown-content">
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
          ) : regions.length === 0 ? (
            <div className="no-data" style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
              <div>No regional data available</div>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {regionsWithPercentage.map(renderRegion)}
            </Row>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RegionalWealthBreakdown;
