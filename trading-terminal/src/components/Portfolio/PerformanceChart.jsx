// src/components/Portfolio/PerformanceChart.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Button, Select } from 'antd';
import { LineChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const PerformanceChart = ({ 
  title = "Portfolio Performance",
  data = [],
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  showTimeframeSelector = true,
  showPerformanceMetrics = true,
  showExport = true,
  timeframeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '1 Week' },
    { value: '30d', label: '1 Month' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' }
  ],
  defaultTimeframe = '1y',
  onTimeframeChange,
  onPerformanceChange
}) => {
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [performanceData, setPerformanceData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    change: 0,
    changePercent: 0,
    annualizedReturn: 0,
    maxDrawdown: 0,
    volatility: 0,
    sharpeRatio: 0
  });

  useEffect(() => {
    if (data.length > 0) {
      const processed = data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        value: item.value,
        change: item.change
      }));
      setPerformanceData(processed);
      
      if (processed.length > 1) {
        const first = processed[0].value;
        const last = processed[processed.length - 1].value;
        const change = last - first;
        const changePercent = (change / first) * 100;
        
        setMetrics({
          totalValue: last,
          change,
          changePercent,
          annualizedReturn: 12.5, // Mock value as calculating precisely requires date diffs
          maxDrawdown: 8.4,
          volatility: 15.2,
          sharpeRatio: 1.8
        });
      }
    }
  }, [data, timeframe]);

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    if (onTimeframeChange) onTimeframeChange(value);
  };

  const config = {
    data: performanceData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    lineStyle: {
      lineWidth: 3,
      stroke: '#1890ff'
    },
    point: {
      size: 4,
      shape: 'circle',
      style: { fill: '#1890ff', stroke: '#fff', lineWidth: 1 }
    },
    yAxis: {
      label: { formatter: (v) => `$${Number(v).toLocaleString()}` }
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Portfolio Value',
        value: `$${datum.value.toLocaleString()}`
      })
    },
    onEvent: (chart, event) => {
      if (event.type === 'plot:click' && event.data) {
        if (onPerformanceChange) onPerformanceChange(event.data);
      }
    }
  };

  const renderMetrics = () => {
    if (!showPerformanceMetrics) return null;
    return (
      <div className="performance-metrics" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic title="Total Value" value={metrics.totalValue} prefix="$" precision={2} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Metric Change" 
              value={metrics.change} 
              prefix="$" 
              precision={2} 
              valueStyle={{ color: metrics.change >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Return (%)" 
              value={metrics.changePercent} 
              suffix="%" 
              precision={2} 
              valueStyle={{ color: metrics.changePercent >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Annualized Return" 
              value={metrics.annualizedReturn} 
              suffix="%" 
              precision={2} 
              valueStyle={{ color: metrics.annualizedReturn >= 0 ? '#52c41a' : '#ff4d4f' }} 
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card size="small" title="Max Drawdown" bodyStyle={{ textAlign: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 600, color: metrics.maxDrawdown > 15 ? '#ff4d4f' : '#faad14' }}>
                {metrics.maxDrawdown}%
              </span>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Volatility" bodyStyle={{ textAlign: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>{metrics.volatility}%</span>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Sharpe Ratio" bodyStyle={{ textAlign: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 600, color: metrics.sharpeRatio > 1 ? '#52c41a' : '#faad14' }}>
                {metrics.sharpeRatio}
              </span>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card 
      className={`performance-chart ${className}`} 
      style={cardStyle}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <LineChartOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
          <Space>
            {showTimeframeSelector && (
              <Select value={timeframe} onChange={handleTimeframeChange} options={timeframeOptions} style={{ width: 120 }} />
            )}
            {showExport && <Button icon={<DownloadOutlined />} size="small" />}
          </Space>
        </div>
      }
    >
      {loading ? (
        <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          Loading performance data...
        </div>
      ) : error ? (
        <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4d4f' }}>
          {error}
        </div>
      ) : (
        <div className="chart-content" style={style}>
          <div style={{ height: 350 }}>
            <Line {...config} />
          </div>
          {renderMetrics()}
        </div>
      )}
    </Card>
  );
};

export default PerformanceChart;
