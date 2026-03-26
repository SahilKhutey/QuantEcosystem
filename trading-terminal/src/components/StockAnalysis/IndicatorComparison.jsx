// src/components/StockAnalysis/IndicatorComparison.jsx
import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Space, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

const { Text } = Typography;

const IndicatorComparison = ({ 
  symbol,
  timeframe,
  indicators = [],
  className = '',
  style = {}
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    const mockData = Array.from({ length: 50 }).flatMap((_, i) => {
      const date = new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return indicators.map(ind => ({
        date,
        value: 50 + Math.random() * 50,
        indicator: ind.name || ind.type.toUpperCase()
      }));
    });
    setData(mockData);
    setLoading(false);
  }, [symbol, timeframe, indicators]);

  const config = {
    data,
    xField: 'date',
    yField: 'value',
    seriesField: 'indicator',
    xAxis: { type: 'time' },
    yAxis: { label: { formatter: (v) => `${v.toFixed(0)}%` } },
    smooth: true,
    animation: {
      appear: { animation: 'path-in', duration: 1000 },
    },
    legend: { position: 'top-left' },
  };

  return (
    <Card 
      className={`indicator-comparison ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', ...style }}
      title={<Space><LineChartOutlined /><span>INDICATOR PERFORMANCE COMPARISON</span></Space>}
      size="small"
    >
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '8px' }}>
        <Space direction="vertical" size={4}>
          <Text strong>Consensus Analysis for {symbol}</Text>
          <Space>
            <Tag color="success">BULLISH CONFIRMATION</Tag>
            <Text type="secondary" style={{ fontSize: '12px' }}>74% cross-indicator strength</Text>
          </Space>
        </Space>
      </div>

      <div style={{ height: '350px' }}>
        {indicators.length > 0 ? (
          <Line {...config} height={350} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf' }}>
            Add indicators to view comparison
          </div>
        )}
      </div>
    </Card>
  );
};

export default IndicatorComparison;
