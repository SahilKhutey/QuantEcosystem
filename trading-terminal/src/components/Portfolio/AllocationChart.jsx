// src/components/Portfolio/AllocationChart.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Button } from 'antd';
import { PieChartOutlined, DownloadOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

const AllocationChart = ({ 
  title = "Asset Allocation",
  data = [],
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  showChartControls = true,
  showStatistics = true,
  showExport = true,
  onAllocationChange
}) => {
  const [view, setView] = useState('pie'); // pie, donut
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [allocationData, setAllocationData] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
      const processed = data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0
      }));
      setAllocationData(processed);
    }
  }, [data]);

  const pieConfig = {
    data: allocationData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: view === 'donut' ? 0.6 : 0,
    label: {
      type: 'spider',
      content: '{type}: {percentage}',
      offset: '30%',
    },
    legend: {
      position: 'top',
    },
    interactions: [
      { type: 'element-active' },
    ],
    onEvent: (chart, event) => {
      if (event.type === 'element:click') {
        const { data } = event;
        setSelectedSlice(data);
        if (onAllocationChange) {
          onAllocationChange(data);
        }
      }
    },
    statistic: view === 'donut' ? {
      title: {
        formatter: () => 'Total Value',
        style: { fontSize: '14px', color: '#8c8c8c' }
      },
      content: {
        formatter: () => {
          const total = allocationData.reduce((sum, item) => sum + item.value, 0);
          return `$${total?.toLocaleString()}`;
        },
        style: { fontSize: '18px', fontWeight: 600 }
      },
    } : false,
  };

  const renderStatistics = () => {
    if (!showStatistics || !selectedSlice) return null;
    
    return (
      <div className="allocation-statistics" style={{ marginTop: 24, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 16px 0' }}>{selectedSlice.type} Details</h4>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="Value" value={selectedSlice.value} prefix="$" precision={2} valueStyle={{ fontSize: '16px' }} />
          </Col>
          <Col span={6}>
            <Statistic title="Percentage" value={selectedSlice.percentage} suffix="%" precision={2} valueStyle={{ fontSize: '16px' }} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="P&L" 
              value={selectedSlice.pnl} 
              prefix="$" 
              precision={2} 
              valueStyle={{ fontSize: '16px', color: selectedSlice.pnl >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Change" 
              value={selectedSlice.change} 
              suffix="%" 
              precision={2} 
              valueStyle={{ fontSize: '16px', color: selectedSlice.change >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderControls = () => {
    if (!showChartControls) return null;
    
    return (
      <div className="chart-controls">
        <Space>
          <Button 
            type={view === 'pie' ? 'primary' : 'default'}
            size="small"
            onClick={() => setView('pie')}
          >
            Pie
          </Button>
          <Button 
            type={view === 'donut' ? 'primary' : 'default'}
            size="small"
            onClick={() => setView('donut')}
          >
            Donut
          </Button>
          
          {showExport && (
            <Button icon={<DownloadOutlined />} size="small" />
          )}
          
          <Button 
            icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            size="small"
            onClick={() => setIsFullScreen(!isFullScreen)}
          />
        </Space>
      </div>
    );
  };

  return (
    <Card 
      className={`allocation-chart ${className}`} 
      style={cardStyle}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <PieChartOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
          {renderControls()}
        </div>
      }
    >
      <div className="chart-container" style={{ position: 'relative', ...style }}>
        {loading ? (
          <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Loading allocation data...
          </div>
        ) : error ? (
          <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
            {error}
          </div>
        ) : (
          <div className="chart-content">
            <div style={{ height: 400 }}>
              <Pie {...pieConfig} />
            </div>
            {renderStatistics()}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AllocationChart;
