// src/components/GlobalWealthMap/WealthDistributionChart.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { Line } from '@ant-design/plots';
import { HeatMapOutlined } from '@ant-design/icons';

const WealthDistributionChart = ({ 
  title = "Wealth Distribution Analysis",
  distribution = {},
  className = '',
  style = {},
  loading = false,
  error = null
}) => {
  // Data for the chart
  const chartData = [
    { year: '2010', value: distribution['2010'] || 0 },
    { year: '2015', value: distribution['2015'] || 0 },
    { year: '2020', value: distribution['2020'] || 0 },
    { year: '2023', value: distribution['2023'] || 0 },
    { year: '2025', value: distribution['2025'] || 0 }
  ];

  const chartConfig = {
    data: chartData,
    xField: 'year',
    yField: 'value',
    smooth: true,
    lineStyle: {
      lineWidth: 3,
      stroke: '#1890ff'
    },
    point: {
      size: 5,
      shape: 'circle'
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.year,
          value: `$${datum.value?.toFixed(2)} Trillion`
        };
      }
    }
  };

  return (
    <Card 
      className={`wealth-distribution-chart ${className}`} 
      style={style}
    >
      <div className="distribution-chart-container">
        <div className="chart-header">
          <div className="chart-title">
            <HeatMapOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
        </div>
        
        <div className="chart-content">
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
            <div className="chart-visualization">
              <Line {...chartConfig} height={300} />
            </div>
          )}
        </div>
        
        <div className="chart-metrics" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div className="metric-item">
                <Statistic 
                  title="Current Value" 
                  value={distribution['2023'] || 0} 
                  prefix="$" 
                  suffix="T" 
                  precision={2}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="metric-item">
                <Statistic 
                  title="Growth Since 2010" 
                  value={distribution['2010'] && distribution['2023'] ? ((distribution['2023'] - distribution['2010']) / distribution['2010']) * 100 : 0}
                  prefix={distribution['2023'] > distribution['2010'] ? '+' : ''}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: distribution['2023'] > distribution['2010'] ? '#52c41a' : '#ff4d4f' }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default WealthDistributionChart;
