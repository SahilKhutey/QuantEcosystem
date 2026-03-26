// src/components/Dashboard/MarketDataWidget.jsx
import React from 'react';
import { Card, Table } from 'antd';
import { StockOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

const MarketDataWidget = ({ 
  title = "Market Data",
  data = [],
  columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol) => <span style={{ fontWeight: 500 }}>{symbol}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price?.toFixed(2)}`,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <span style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
          {Math.abs(change)?.toFixed(2)}%
        </span>
      ),
    },
    {
      title: '24h Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => `$${volume?.toLocaleString()}`,
    }
  ],
  loading = false,
  error = null,
  className = '',
  style = {},
  cardStyle = {},
  tableStyle = {},
  rowKey = 'id',
  pagination = {
    pageSize: 5,
    showSizeChanger: false,
    showQuickJumper: false
  }
}) => {
  return (
    <Card 
      className={`market-data-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
    >
      <div className="market-data-content" style={style}>
        <div className="market-data-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <StockOutlined style={{ marginRight: 8 }} />
          {title}
        </div>
        
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey={rowKey}
          pagination={pagination}
          style={tableStyle}
          size="small"
        />
      </div>
    </Card>
  );
};

export default MarketDataWidget;
