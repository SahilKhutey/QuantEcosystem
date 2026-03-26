// src/components/Portfolio/TransactionHistory.jsx
import React, { useState } from 'react';
import { Table, Input, Space, Button, Tag, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const TransactionHistory = ({ 
  transactions = [],
  loading = false,
  title = "Transaction History",
  className = '',
  style = {},
  cardStyle = {},
  searchPlaceholder = 'Search transactions...',
  showExport = true
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  // Default columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Asset',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol, record) => (
        <div className="asset-info">
          <div className="asset-symbol" style={{ fontWeight: 600 }}>{symbol}</div>
          <div className="asset-name" style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.name || ''}</div>
        </div>
      ),
      sorter: (a, b) => a.symbol.localeCompare(b.symbol),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'buy' ? 'green' : 'red'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Buy', value: 'buy' },
        { text: 'Sell', value: 'sell' }
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => quantity?.toLocaleString(),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price?.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total?.toLocaleString()}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Fees',
      dataIndex: 'fees',
      key: 'fees',
      render: (fees) => `$${fees?.toFixed(2)}`,
      sorter: (a, b) => a.fees - b.fees,
    }
  ];

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : false,
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const renderSummaryCards = () => {
    const totalBuy = transactions
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + (t.total || 0), 0);
    
    const totalSell = transactions
      .filter(t => t.type === 'sell')
      .reduce((sum, t) => sum + (t.total || 0), 0);
    
    const totalFees = transactions.reduce((sum, t) => sum + (t.fees || 0), 0);
    
    return (
      <div className="transaction-summary" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div className="summary-card" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '12px 16px', borderRadius: 8 }}>
              <div style={{ fontSize: '12px', color: '#52c41a', marginBottom: 4 }}>Total Buy Volume</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>$ {totalBuy?.toLocaleString()}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="summary-card" style={{ background: '#fff1f0', border: '1px solid #ffa39e', padding: '12px 16px', borderRadius: 8 }}>
              <div style={{ fontSize: '12px', color: '#f5222d', marginBottom: 4 }}>Total Sell Volume</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>$ {totalSell?.toLocaleString()}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="summary-card" style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', padding: '12px 16px', borderRadius: 8 }}>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>Total Fees</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#f5222d' }}>$ {totalFees?.toLocaleString()}</div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const searchableColumns = columns.map(col => {
    if (col.key === 'symbol') {
      return { ...col, ...getColumnSearchProps('symbol') };
    }
    return col;
  });

  return (
    <div className={`transaction-history ${className}`} style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', ...style }}>
      <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>
        {showExport && (
          <Button icon={<DownloadOutlined />} size="small">
            Export CSV
          </Button>
        )}
      </div>
      
      {transactions.length > 0 && renderSummaryCards()}
      
      <Table
        columns={searchableColumns}
        dataSource={transactions}
        loading={loading}
        rowKey="id"
        className="transaction-table"
        style={cardStyle}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        scroll={{ x: 'max-content' }}
        summary={pageData => {
          const totalBuy = pageData
            .filter(item => item.type === 'buy')
            .reduce((sum, item) => sum + (item.total || 0), 0);
          
          const totalSell = pageData
            .filter(item => item.type === 'sell')
            .reduce((sum, item) => sum + (item.total || 0), 0);
          
          const totalFees = pageData.reduce((sum, item) => sum + (item.fees || 0), 0);
          
          return (
            <Table.Summary.Row style={{ background: '#fafafa' }}>
              <Table.Summary.Cell index={0} colSpan={5}>
                <span style={{ fontWeight: 600 }}>Page Total</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <span style={{ fontWeight: 600 }}>${totalBuy?.toLocaleString()}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                <span style={{ fontWeight: 600 }}>${totalSell?.toLocaleString()}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <span style={{ fontWeight: 600, color: '#f5222d' }}>${totalFees?.toLocaleString()}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </div>
  );
};

export default TransactionHistory;
