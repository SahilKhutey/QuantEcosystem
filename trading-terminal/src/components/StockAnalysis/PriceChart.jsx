// src/components/StockAnalysis/PriceChart.jsx
import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { Chart as AntdChart } from '@ant-design/plots';

const PriceChart = ({ 
  symbol,
  timeframe,
  chartType,
  indicators = [],
  className = '',
  style = {}
}) => {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const generateMockData = () => {
      const data = [];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      let basePrice = 150;
      for (let i = 0; i < 100; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 3);
        basePrice += (Math.random() - 0.5) * 5;
        data.push({
          date: date.toISOString().split('T')[0],
          open: basePrice - Math.random() * 2,
          high: basePrice + Math.random() * 4,
          low: basePrice - Math.random() * 4,
          close: basePrice,
          volume: Math.random() * 1000000
        });
      }
      setPriceData(data);
      setLoading(false);
    };
    generateMockData();
  }, [symbol, timeframe]);

  const getChartConfig = () => {
    const isCandle = chartType === 'candlestick' || chartType === 'heikin-ashi';
    
    return {
      data: priceData,
      xField: 'date',
      yField: isCandle ? ['open', 'high', 'low', 'close'] : 'close',
      seriesField: isCandle ? undefined : 'symbol',
      height: 400,
      padding: 'auto',
      appendPadding: [10, 0, 0, 0],
      loading: loading,
      xAxis: { type: 'time', mask: 'YYYY-MM-DD' },
      yAxis: { label: { formatter: (v) => `$${v.toFixed(0)}` } },
      tooltip: { showMarkers: false, shared: true },
      interactions: [{ type: 'brush' }, { type: 'tooltip' }],
      ...(isCandle ? { type: 'stock' } : { type: 'line', smooth: true })
    };
  };

  return (
    <Card 
      className={`price-chart ${className}`} 
      style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}
      size="small"
    >
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AntdChart {...getChartConfig()} style={{ width: '100%' }} />
      </div>
    </Card>
  );
};

export default PriceChart;
