// src/components/Analytics/AnalyticsTable.jsx
import React, { useState } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const AnalyticsTable = ({ 
  title,
  columns,
  data,
  loading = false,
  error = null,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true
  },
  extra,
  style = {},
  className = '',
  searchPlaceholder = 'Search...',
  onSearch = () => {},
  rowKey = 'id',
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${searchPlaceholder}`}
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
        : '',
    render: text =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>
          {text}
        </span>
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    onSearch(selectedKeys[0], dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const columnsWithSearch = columns.map(col => {
    if (col.searchable) {
      return {
        ...col,
        ...getColumnSearchProps(col.dataIndex)
      };
    }
    return col;
  });

  return (
    <div className={`analytics-table-container ${className}`} style={style}>
      {title && (
        <div className="table-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {extra && <div className="table-header-extra">{extra}</div>}
        </div>
      )}
      <Table
        columns={columnsWithSearch}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        {...rest}
      />
    </div>
  );
};

export default AnalyticsTable;
