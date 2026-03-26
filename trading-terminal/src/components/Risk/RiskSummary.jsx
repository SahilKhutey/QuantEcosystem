// src/components/Risk/RiskSummary.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { FundOutlined } from '@ant-design/icons';

const RiskSummary = ({ 
  data = {},
  loading = false,
  error = null,
  title = "Risk Summary",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  // Prepare risk metrics
  const riskMetrics = [
    {
      title: 'Portfolio Risk Score',
      value: data.portfolioRiskScore,
      suffix: '',
      color: data.portfolioRiskScore > 0.7 ? '#ff4d4f' : data.portfolioRiskScore > 0.5 ? '#faad14' : '#52c41a',
      description: 'Overall risk score for the portfolio'
    },
    {
      title: 'Max Drawdown',
      value: data.maxDrawdown,
      suffix: '%',
      color: data.maxDrawdown > 20 ? '#ff4d4f' : data.maxDrawdown > 15 ? '#faad14' : '#52c41a',
      description: 'Largest peak-to-trough decline'
    },
    {
      title: 'Sharpe Ratio',
      value: data.sharpeRatio,
      suffix: '',
      color: data.sharpeRatio > 1 ? '#52c41a' : data.sharpeRatio > 0.5 ? '#faad14' : '#ff4d4f',
      description: 'Risk-adjusted return metric'
    },
    {
      title: 'Volatility',
      value: data.volatility,
      suffix: '%',
      color: data.volatility > 20 ? '#ff4d4f' : data.volatility > 15 ? '#faad14' : '#52c41a',
      description: 'Standard deviation of returns'
    },
    {
      title: 'Beta',
      value: data.beta,
      suffix: '',
      color: data.beta > 1.2 ? '#ff4d4f' : data.beta > 0.8 ? '#faad14' : '#52c41a',
      description: 'Sensitivity to market movements'
    },
    {
      title: 'VaR (95%)',
      value: data.var95,
      suffix: '%',
      color: data.var95 > 5 ? '#ff4d4f' : data.var95 > 3 ? '#faad14' : '#52c41a',
      description: 'Value at Risk at 95% confidence'
    }
  ];

  return (
    <Card 
      className={`risk-summary ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="summary-header" style={{ marginBottom: '20px' }}>
        <div className="summary-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <FundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="summary-content">
        {loading ? (
          <div className="summary-loading" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner"></div>
            <div>Loading risk summary...</div>
          </div>
        ) : error ? (
          <div className="summary-error" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <div className="summary-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {riskMetrics.map((metric, index) => (
              <div key={index} className="summary-metric" style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div className="metric-title" style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>{metric.title}</div>
                <div className="metric-value" style={{ fontSize: '20px', fontWeight: 600, color: metric.color }}>
                  {metric.value ? `${metric.value.toFixed(2)}${metric.suffix}` : 'N/A'}
                </div>
                <div className="metric-description" style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="risk-rating" style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
          <div className="risk-level" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div className="risk-label" style={{ fontWeight: 600 }}>Risk Level:</div>
            <div className="risk-value" style={{ 
              fontWeight: 700,
              fontSize: '18px',
              color: data.riskLevel === 'high' ? '#ff4d4f' : 
                     data.riskLevel === 'medium' ? '#faad14' : '#52c41a'
            }}>
              {data.riskLevel?.toUpperCase() || 'N/A'}
            </div>
          </div>
          
          <div className="risk-description" style={{ fontSize: '14px', color: '#595959' }}>
            {data.riskDescription || "Overall risk assessment for the portfolio"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RiskSummary;
