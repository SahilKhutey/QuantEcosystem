// src/components/Trading/OrderBook.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Space, Table } from 'antd';

const OrderBook = ({ 
  orderBook = { bids: [], asks: [], lastPrice: 0, changePercent: 0, volume: 0 },
  loading = false,
  error = null,
  title = "Order Book",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  const bids = (orderBook.bids || []).map((bid, index) => ({
    key: `bid-${index}`,
    price: bid.price,
    size: bid.size,
    total: bid.price * bid.size
  })).slice(0, 15);
  
  const asks = (orderBook.asks || []).map((ask, index) => ({
    key: `ask-${index}`,
    price: ask.price,
    size: ask.size,
    total: ask.price * ask.size
  })).slice(0, 15);
  
  const columns = [
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <span style={{ color: record.key.startsWith('bid') ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          ${price?.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => size?.toLocaleString(),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }
  ];

  return (
    <Card 
      className={`order-book ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="order-book-container" style={style}>
        <div className="order-book-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="order-book-title" style={{ fontSize: '18px', fontWeight: 600 }}>{title}</div>
          <div className="order-book-stats">
            <Space size="large">
              <Statistic 
                title="Last Price" 
                value={orderBook.lastPrice} 
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: '16px' }}
              />
              <Statistic 
                title="24h Change" 
                value={orderBook.changePercent} 
                precision={2}
                suffix="%" 
                valueStyle={{ color: (orderBook.changePercent || 0) >= 0 ? '#52c41a' : '#ff4d4f', fontSize: '16px' }}
              />
              <Statistic 
                title="24h Volume" 
                value={orderBook.volume} 
                precision={0}
                suffix="M"
                valueStyle={{ fontSize: '16px' }}
              />
            </Space>
          </div>
        </div>
        
        <div className="order-book-content">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading order book...</div>
          ) : error ? (
            <div style={{ color: '#ff4d4f', padding: '40px', textAlign: 'center' }}>{error}</div>
          ) : (
            <div className="order-book-grid">
              <Row gutter={24}>
                <Col span={12}>
                  <div className="bids-section">
                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#52c41a' }}>Bids</div>
                    <Table
                      columns={columns}
                      dataSource={bids}
                      pagination={false}
                      size="small"
                      rowClassName="order-book-row"
                    />
                  </div>
                </Col>
                
                <Col span={12}>
                  <div className="asks-section">
                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#ff4d4f' }}>Asks</div>
                    <Table
                      columns={columns}
                      dataSource={asks}
                      pagination={false}
                      size="small"
                      rowClassName="order-book-row"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OrderBook;
