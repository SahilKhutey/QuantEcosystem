// src/components/Trading/PositionSummary.jsx
import React from 'react';
import { Card, Row, Col, Tag, Table, Statistic } from 'antd';
import { FundOutlined } from '@ant-design/icons';

const PositionSummary = ({ 
  positions = [],
  loading = false,
  error = null,
  title = "Position Summary",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  const positionData = positions.map((position, index) => ({
    ...position,
    key: index,
    pnl: (position.currentPrice - position.avgPrice) * position.quantity,
    pnlPercent: ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100,
    currentValue: position.currentPrice * position.quantity
  }));

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol) => <span style={{ fontWeight: 700 }}>{symbol}</span>,
      sorter: (a, b) => a.symbol.localeCompare(b.symbol),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q) => q?.toLocaleString(),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Avg Price',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      render: (p) => `$${p?.toFixed(2)}`,
    },
    {
      title: 'Last Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (p) => `$${p?.toFixed(2)}`,
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {pnl >= 0 ? '+' : ''}${pnl?.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.pnl - b.pnl,
    },
    {
      title: 'Unrealized %',
      dataIndex: 'pnlPercent',
      key: 'pnlPercent',
      render: (pct) => (
        <Tag color={pct >= 0 ? 'green' : 'red'} style={{ minWidth: '60px', textAlign: 'center' }}>
          {pct >= 0 ? '+' : ''}{pct?.toFixed(2)}%
        </Tag>
      ),
      sorter: (a, b) => a.pnlPercent - b.pnlPercent,
    }
  ];

  const totalValue = positionData.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalPnL = positionData.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <Card 
      className={`position-summary ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="position-summary-header" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <FundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
      </div>
      
      <div className="position-summary-content">
        <Row gutter={16} style={{ marginBottom: '24px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
          <Col span={12}>
            <Statistic title="Total Position Value" value={totalValue} precision={2} prefix="$" />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Total Day P&L" 
              value={totalPnL} 
              precision={2} 
              prefix={totalPnL >= 0 ? '+$' : '-$'} 
              valueStyle={{ color: totalPnL >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={positionData}
          pagination={false}
          size="small"
          loading={loading}
        />
      </div>
    </Card>
  );
};

export default PositionSummary;
