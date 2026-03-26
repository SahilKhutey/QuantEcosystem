// src/components/Trading/TradeHistory.jsx
import React, { useState } from 'react';
import { Card, Tag, Table, Input } from 'antd';
import { HistoryOutlined, SearchOutlined } from '@ant-design/icons';

const TradeHistory = ({ 
  tradeHistory = [],
  symbol = "AAPL",
  loading = false,
  error = null,
  title = "Trade History",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  const [searchText, setSearchText] = useState('');
  
  const filteredHistory = tradeHistory.filter(trade => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      trade.side.toLowerCase().includes(searchLower) ||
      trade.price?.toString().includes(searchLower) ||
      trade.quantity?.toString().includes(searchLower)
    );
  });
  
  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleTimeString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      render: (side) => (
        <Tag color={side === 'buy' ? '#52c41a' : '#ff4d4f'} style={{ fontWeight: 600 }}>
          {side.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Buy', value: 'buy' },
        { text: 'Sell', value: 'sell' }
      ],
      onFilter: (value, record) => record.side === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price?.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => quantity?.toLocaleString(),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => a.total - b.total,
    }
  ];

  return (
    <Card 
      className={`trade-history ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="trade-history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <HistoryOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title} - {symbol}
        </div>
        <Input 
          placeholder="Search trades..." 
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 220, borderRadius: '6px' }}
        />
      </div>
      
      <div className="trade-history-content">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading history...</div>
        ) : error ? (
          <div style={{ color: '#ff4d4f', padding: '40px', textAlign: 'center' }}>{error}</div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredHistory}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            size="middle"
          />
        )}
      </div>
    </Card>
  );
};

export default TradeHistory;
