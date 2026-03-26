// src/components/Trading/TradingControls.jsx
import React from 'react';
import { Card, Row, Col, Space, Button, Statistic } from 'antd';
import { SignalOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const TradingControls = ({ 
  marketData = {},
  loading = false,
  error = null,
  title = "Market Controls",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  return (
    <Card 
      className={`trading-controls ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px', ...cardStyle }}
    >
      <div className="trading-controls-container" style={style}>
        <div className="trading-controls-header" style={{ marginBottom: '16px' }}>
          <div className="trading-controls-title" style={{ fontSize: '16px', fontWeight: 600 }}>
            {title}
          </div>
        </div>
        
        <div className="trading-controls-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : error ? (
            <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</div>
          ) : (
            <div className="trading-controls-metrics">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic title="Last" value={marketData.lastPrice} precision={2} prefix="$" valueStyle={{ fontSize: '14px' }} />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Change" 
                    value={marketData.change} 
                    precision={2} 
                    valueStyle={{ color: (marketData.change || 0) >= 0 ? '#52c41a' : '#ff4d4f', fontSize: '14px' }} 
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Var %" 
                    value={marketData.changePercent} 
                    precision={2} 
                    suffix="%" 
                    valueStyle={{ color: (marketData.changePercent || 0) >= 0 ? '#52c41a' : '#ff4d4f', fontSize: '14px' }} 
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: '12px' }}>
                <Col span={12}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Day Range</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    ${marketData.low?.toFixed(2)} - ${marketData.high?.toFixed(2)}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Volume</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {marketData.volume?.toLocaleString()}M
                  </div>
                </Col>
              </Row>
              
              <div className="trading-controls-actions" style={{ marginTop: 24 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button type="primary" icon={<CheckCircleOutlined />} style={{ flex: 1, height: '36px', background: '#52c41a', borderColor: '#52c41a' }}>
                      BUY
                    </Button>
                    <Button type="primary" icon={<CloseCircleOutlined />} danger style={{ flex: 1, height: '36px' }}>
                      SELL
                    </Button>
                  </div>
                  <Button icon={<SignalOutlined />} style={{ width: '100%', height: '36px' }}>
                    ANALYZE SIGNALS
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TradingControls;
