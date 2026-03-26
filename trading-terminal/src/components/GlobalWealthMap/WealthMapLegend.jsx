// src/components/GlobalWealthMap/WealthMapLegend.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { HeatMapOutlined } from '@ant-design/icons';

const WealthMapLegend = ({ 
  metric = 'total_wealth',
  region = 'global',
  timeframe = '2023',
  className = '',
  style = {}
}) => {
  const getLegendTitle = () => {
    switch (metric) {
      case 'total_wealth':
        return 'Total Wealth ($ Trillion)';
      case 'per_capita_wealth':
        return 'Wealth Per Capita ($)';
      case 'wealth_inequality':
        return 'Wealth Inequality (Gini Index)';
      case 'top_1_percent':
        return 'Top 1% Wealth Share (%)';
      case 'top_10_percent':
        return 'Top 10% Wealth Share (%)';
      default:
        return 'Wealth Distribution';
    }
  };

  const getLegendData = () => {
    if (metric === 'wealth_inequality') {
      return [
        { value: 0.2, label: 'Very Equal', color: '#52c41a' },
        { value: 0.4, label: 'Equal', color: '#1890ff' },
        { value: 0.6, label: 'Moderate', color: '#faad14' },
        { value: 0.8, label: 'Unequal', color: '#ff4d4f' },
        { value: 1.0, label: 'Highly Unequal', color: '#722ed1' }
      ];
    } else {
      return [
        { value: 'Low', label: 'Low', color: '#52c41a' },
        { value: 'Medium-Low', label: 'Medium-Low', color: '#1890ff' },
        { value: 'Medium', label: 'Medium', color: '#faad14' },
        { value: 'Medium-High', label: 'Medium-High', color: '#ff4d4f' },
        { value: 'High', label: 'High', color: '#722ed1' }
      ];
    }
  };

  const getLegendDescription = () => {
    switch (metric) {
      case 'total_wealth':
        return 'Total wealth distribution across countries';
      case 'per_capita_wealth':
        return 'Wealth per adult, in USD';
      case 'wealth_inequality':
        return 'Gini index where 0 = perfect equality, 1 = perfect inequality';
      case 'top_1_percent':
        return 'Wealth held by the top 1% of adults';
      case 'top_10_percent':
        return 'Wealth held by the top 10% of adults';
      default:
        return 'Global wealth distribution map';
    }
  };

  return (
    <Card 
      className={`wealth-map-legend ${className}`} 
      style={{ borderRadius: 8, ...style }}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HeatMapOutlined style={{ marginRight: 8 }} />
          {getLegendTitle()}
        </div>
      }
    >
      <div className="legend-content">
        <div className="legend-description" style={{ color: '#666', fontSize: '13px', marginBottom: 16 }}>
          {getLegendDescription()}
        </div>
        
        <div className="legend-scale">
          <Row gutter={[8, 8]}>
            {getLegendData().map((item, index) => (
              <Col key={index} span={24}>
                <div className="legend-scale-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="legend-color" style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: item.color }}></div>
                  <div className="legend-label" style={{ fontSize: '12px' }}>{item.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
        
        <div className="legend-metadata" style={{ marginTop: 24 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Statistic title="Region" value={region.replace('_', ' ').toUpperCase()} valueStyle={{ fontSize: '14px' }} />
            </Col>
            <Col span={12}>
              <Statistic title="Period" value={timeframe} valueStyle={{ fontSize: '14px' }} />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default WealthMapLegend;
