// src/components/Portfolio/PositionTable.jsx
import React, { useState } from 'react';
import { Table, Input, Space, Button, Dropdown, Menu, Checkbox } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

const PositionTable = ({ 
  positions = [],
  loading = false,
  title = "Portfolio Positions",
  className = '',
  style = {},
  cardStyle = {},
  searchPlaceholder = 'Search positions...',
  onPositionAction,
  showActions = true,
  showFilters = true,
  showExport = true,
  columns = []
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(
    columns.length > 0 ? columns.map(col => col.key) : ['symbol', 'quantity', 'price', 'value', 'change', 'pnl', 'allocation']
  );

  // Default columns if none are provided
  const defaultColumns = [
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
      title: 'Current Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${value?.toLocaleString()}`,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <span style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
          {Math.abs(change).toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => a.change - b.change,
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ${pnl?.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.pnl - b.pnl,
    },
    {
      title: 'Allocation',
      dataIndex: 'allocation',
      key: 'allocation',
      render: (allocation) => `${(allocation * 100).toFixed(1)}%`,
      sorter: (a, b) => a.allocation - b.allocation,
    }
  ];

  const getColumns = () => {
    const availableColumns = columns.length > 0 ? columns : defaultColumns;
    return availableColumns.filter(col => visibleColumns.includes(col.key));
  };

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
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
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

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  const renderColumnMenu = () => {
    const availableColumns = columns.length > 0 ? columns : defaultColumns;
    return (
      <Menu>
        {availableColumns.map(col => (
          <Menu.Item key={col.key} onClick={() => handleColumnToggle(col.key)}>
            <Checkbox checked={visibleColumns.includes(col.key)} style={{ marginRight: 8 }} />
            {col.title}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const renderAction = (text, record) => {
    if (!onPositionAction) return null;
    return (
      <Button type="primary" size="small" onClick={() => onPositionAction(record)}>
        Manage
      </Button>
    );
  };

  const renderColumns = () => {
    let cols = getColumns();
    
    cols = cols.map(col => {
      let column = { ...col };
      if (col.key === 'symbol') {
        column = { ...column, ...getColumnSearchProps('symbol') };
      }
      return column;
    });

    if (showActions && onPositionAction) {
      cols.push({
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        render: renderAction
      });
    }
    
    return cols;
  };

  return (
    <div className={`portfolio-position-table ${className}`} style={style}>
      <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div className="table-header-controls">
          <Space>
            {showFilters && (
              <Dropdown overlay={renderColumnMenu()} trigger={['click']}>
                <Button icon={<FilterOutlined />}>
                  Columns
                </Button>
              </Dropdown>
            )}
            {showExport && (
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
            )}
          </Space>
        </div>
      </div>
      
      <Table
        columns={renderColumns()}
        dataSource={positions}
        loading={loading}
        rowKey="id"
        className="position-table"
        style={cardStyle}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PositionTable;
