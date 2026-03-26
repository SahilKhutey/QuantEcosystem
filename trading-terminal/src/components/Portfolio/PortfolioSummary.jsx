// src/components/Portfolio/PortfolioSummary.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { FundOutlined } from '@ant-design/icons';

const PortfolioSummary = ({ 
  title = "Portfolio Summary",
  portfolio = {},
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  showRiskMetrics = true,
  showAllocation = true,
  showPerformance = true
}) => {
  const {
    totalValue = 0,
    unrealizedPnl = 0,
    dailyChange = 0,
    dailyChangePercent = 0,
    allocation = [],
    maxDrawdown = 0,
    volatility = 0,
    sharpeRatio = 0,
    annualizedReturn = 0,
    winRate = 0,
    profitFactor = 0
  } = portfolio;

  const renderAllocation = () => {
    if (!showAllocation || allocation.length === 0) return null;
    return (
      <div className="allocation-summary" style={{ marginTop: 20 }}>
        <h4 style={{ fontSize: '14px', marginBottom: 12 }}>Asset Allocation</h4>
        {allocation.map((asset, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '12px' }}>{asset.type}</span>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{asset.percentage?.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={asset.percentage} 
              size="small" 
              strokeColor={asset.color || '#1890ff'} 
              showInfo={false} 
            />
          </div>
        ))}
      </div>
    );
  };

  const renderMetrics = (metricsTitle, metrics) => (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: '14px', marginBottom: 12 }}>{metricsTitle}</h4>
      <Row gutter={16}>
        {metrics.map((m, i) => (
          <Col span={8} key={i}>
            <div style={{ background: '#f9f9f9', padding: 8, borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: m.color }}>{m.value}</div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <Card 
      className={`portfolio-summary ${className}`} 
      style={cardStyle}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FundOutlined style={{ marginRight: 8 }} />
          {title}
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading summary...</div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#ff4d4f' }}>{error}</div>
      ) : (
        <div className="summary-content" style={style}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Total Value" value={totalValue} prefix="$" precision={2} valueStyle={{ fontSize: '20px' }} />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Unrealized P&L" 
                value={unrealizedPnl} 
                prefix="$" 
                precision={2} 
                valueStyle={{ fontSize: '20px', color: unrealizedPnl >= 0 ? '#52c41a' : '#ff4d4f' }} 
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={12}>
              <Statistic 
                title="Daily Change" 
                value={dailyChangePercent} 
                suffix="%" 
                precision={2} 
                valueStyle={{ fontSize: '16px', color: dailyChangePercent >= 0 ? '#52c41a' : '#ff4d4f' }} 
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Change Value" 
                value={dailyChange} 
                prefix="$" 
                precision={2} 
                valueStyle={{ fontSize: '16px', color: dailyChange >= 0 ? '#52c41a' : '#ff4d4f' }} 
              />
            </Col>
          </Row>

          {renderAllocation()}
          
          {showRiskMetrics && renderMetrics("Risk Metrics", [
            { label: "Max DD", value: `${maxDrawdown?.toFixed(1)}%`, color: maxDrawdown > 15 ? '#ff4d4f' : '#52c41a' },
            { label: "Volatility", value: `${volatility?.toFixed(1)}%` },
            { label: "Sharpe", value: sharpeRatio?.toFixed(2), color: sharpeRatio > 1 ? '#52c41a' : '#faad14' }
          ])}
          
          {showPerformance && renderMetrics("Performance", [
            { label: "Annualized", value: `${annualizedReturn?.toFixed(1)}%` },
            { label: "Win Rate", value: `${winRate?.toFixed(1)}%` },
            { label: "Profit Fact", value: profitFactor?.toFixed(2) }
          ])}
        </div>
      )}
    </Card>
  );
};

export default PortfolioSummary;
