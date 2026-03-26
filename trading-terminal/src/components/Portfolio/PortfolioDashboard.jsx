// src/components/Portfolio/PortfolioDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Select } from 'antd';
import { DashboardOutlined, DownloadOutlined } from '@ant-design/icons';
import PositionTable from './PositionTable';
import AllocationChart from './AllocationChart';
import PerformanceChart from './PerformanceChart';
import PortfolioSummary from './PortfolioSummary';
import TransactionHistory from './TransactionHistory';
import './Portfolio.css';

const PortfolioDashboard = ({ 
  portfolio = {},
  positions = [],
  transactions = [],
  loading = false,
  error = null,
  className = '',
  style = {},
  cardStyle = {},
  timeRange = '1y',
  onTimeRangeChange,
  onPositionSelect,
  onPositionAction,
  onTransactionSelect,
  onPerformanceChange
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [timeframe, setTimeframe] = useState(timeRange);
  
  useEffect(() => {
    setTimeframe(timeRange);
  }, [timeRange]);
  
  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    if (onTimeRangeChange) {
      onTimeRangeChange(value);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <PortfolioSummary 
            portfolio={portfolio} 
            loading={loading} 
            error={error}
          />
        );
        
      case 'positions':
        return (
          <PositionTable 
            positions={positions} 
            loading={loading} 
            error={error}
            onPositionSelect={onPositionSelect}
            onPositionAction={onPositionAction}
          />
        );
        
      case 'allocation':
        return (
          <AllocationChart 
            data={portfolio.allocation || []} 
            loading={loading} 
            error={error}
          />
        );
        
      case 'performance':
        return (
          <PerformanceChart 
            data={portfolio.performanceHistory || []} 
            loading={loading} 
            error={error}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            onPerformanceChange={onPerformanceChange}
          />
        );
        
      case 'transactions':
        return (
          <TransactionHistory 
            transactions={transactions} 
            loading={loading} 
            error={error}
            onTransactionSelect={onTransactionSelect}
          />
        );
        
      default:
        return (
          <PortfolioSummary 
            portfolio={portfolio} 
            loading={loading} 
            error={error}
          />
        );
    }
  };

  return (
    <div className={`portfolio-dashboard ${className}`} style={style}>
      <Card className="portfolio-header" style={cardStyle}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="dashboard-title" style={{ display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ marginRight: 8, fontSize: '20px', color: '#1890ff' }} />
            <h2 style={{ margin: 0, fontSize: '20px' }}>Portfolio Dashboard</h2>
          </div>
          
          <div className="dashboard-controls">
            <Space>
              <Select 
                value={timeframe}
                onChange={handleTimeframeChange}
                style={{ width: 150 }}
                options={[
                  { value: '1d', label: '1 Day' },
                  { value: '7d', label: '1 Week' },
                  { value: '1m', label: '1 Month' },
                  { value: '3m', label: '3 Months' },
                  { value: '1y', label: '1 Year' }
                ]}
              />
              
              <Button type="primary" icon={<DownloadOutlined />}>
                Export
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="dashboard-tabs" style={{ marginBottom: 24 }}>
          <div className="tab-buttons">
            <Space>
              <Button 
                type={activeTab === 'summary' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </Button>
              <Button 
                type={activeTab === 'positions' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('positions')}
              >
                Positions
              </Button>
              <Button 
                type={activeTab === 'allocation' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('allocation')}
              >
                Allocation
              </Button>
              <Button 
                type={activeTab === 'performance' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </Button>
              <Button 
                type={activeTab === 'transactions' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default PortfolioDashboard;
