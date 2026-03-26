// src/components/Risk/RiskTrendChart.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import { DualAxes } from '@ant-design/plots';

const RiskTrendChart = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Risk Trend Analysis",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare data for the risk trend chart
  // DualAxes needs separate arrays for different scales if used, 
  // but here we can combine them or use different series.
  const trendData = data.historical?.map(item => ({
    date: item.date,
    portfolioRisk: item.portfolioRisk,
    marketRisk: item.marketRisk,
    volatility: item.volatility
  })) || [];

  const trendConfig = {
    data: [trendData, trendData],
    xField: 'date',
    yField: ['portfolioRisk', 'volatility'],
    geometryOptions: [
      {
        geometry: 'line',
        color: '#1890ff',
        lineStyle: { lineWidth: 2 }
      },
      {
        geometry: 'area',
        color: '#faad14',
        opacity: 0.3,
        line: { style: { lineWidth: 0 } }
      }
    ],
    xAxis: {
      type: 'time',
      mask: 'YYYY-MM-DD'
    },
    yAxis: {
      portfolioRisk: {
        label: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
        title: { text: 'Risk Score' }
      },
      volatility: {
        label: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
        title: { text: 'Volatility' }
      }
    },
    legend: { position: 'top' },
    tooltip: { showMarkers: true, shared: true }
  };

  return (
    <Card 
      className={`risk-trend-chart ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="trend-header" style={{ marginBottom: '20px' }}>
        <div className="trend-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <AreaChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="trend-content">
        {loading ? (
          <div className="chart-loading" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner"></div>
            <div>Loading risk trend...</div>
          </div>
        ) : error ? (
          <div className="chart-error" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <div className="trend-visualization">
            <DualAxes {...trendConfig} height={300} />
          </div>
        )}
        
        <div className="trend-metrics" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Risk Score</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: data.currentRiskScore > 0.7 ? '#ff4d4f' : data.currentRiskScore > 0.5 ? '#faad14' : '#52c41a' }}>
                  {data.currentRiskScore ? `${(data.currentRiskScore * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Trend</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: data.riskTrend === 'increasing' ? '#ff4d4f' : data.riskTrend === 'decreasing' ? '#52c41a' : '#faad14' }}>
                  {data.riskTrend?.toUpperCase() || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item" style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Current Rating</div>
                <div className="metric-value" style={{ fontSize: '18px', fontWeight: 600, color: data.riskRating === 'high' ? '#ff4d4f' : data.riskRating === 'medium' ? '#faad14' : '#52c41a' }}>
                  {data.riskRating?.toUpperCase() || 'N/A'}
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="trend-description" style={{ marginTop: '16px', fontSize: '13px', color: '#8c8c8c', fontStyle: 'italic' }}>
            {data.description || "Historical risk trend analysis showing portfolio risk, market risk, and volatility over time."}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RiskTrendChart;
