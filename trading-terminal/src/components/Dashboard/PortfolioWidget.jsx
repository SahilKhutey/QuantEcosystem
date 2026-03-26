// src/components/Dashboard/PortfolioWidget.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

const PortfolioWidget = ({ 
  title = "Portfolio Allocation",
  data = [],
  totalValue = 0,
  showStats = true,
  className = '',
  style = {},
  cardStyle = {},
  chartStyle = {},
  loading = false,
  error = null
}) => {
  const chartConfig = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      content: '{type}: {percentage}',
      offset: '30%',
    },
    legend: {
      position: 'top',
    },
    statistic: {
      title: {
        formatter: () => 'Portfolio Allocation',
      },
      content: {
        formatter: () => `${totalValue?.toLocaleString()} Total Value`,
      },
    },
  };

  const renderStats = () => {
    if (!showStats) return null;
    
    return (
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Statistic title="Total Value" value={totalValue} prefix="$" />
        </Col>
        <Col span={12}>
          <Statistic title="Positions" value={data.length} />
        </Col>
      </Row>
    );
  };

  return (
    <Card 
      className={`portfolio-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
      loading={loading}
    >
      <div className="portfolio-widget-content" style={style}>
        <div className="portfolio-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <PieChartOutlined style={{ marginRight: 8 }} />
          {title}
        </div>
        
        <div className="portfolio-content">
          <div className="portfolio-chart" style={{ height: 300, ...chartStyle }}>
            <Pie {...chartConfig} />
          </div>
          
          {renderStats()}
        </div>
      </div>
    </Card>
  );
};

export default PortfolioWidget;
