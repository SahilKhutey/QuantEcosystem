// src/components/Trading/MarketDepthChart.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/plots';

const MarketDepthChart = ({ 
  orderBook = { bids: [], asks: [], lastPrice: 0 },
  loading = false,
  error = null,
  title = "Market Depth",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  const prepareDepthData = () => {
    const sortedBids = [...(orderBook.bids || [])].sort((a, b) => b.price - a.price);
    const sortedAsks = [...(orderBook.asks || [])].sort((a, b) => a.price - b.price);
    
    let cumulativeBidsVolume = 0;
    let cumulativeAsksVolume = 0;
    
    const depthData = [];
    
    sortedBids.forEach(bid => {
      cumulativeBidsVolume += bid.size;
      depthData.push({
        price: bid.price,
        volume: cumulativeBidsVolume,
        type: 'bids'
      });
    });
    
    sortedAsks.forEach(ask => {
      cumulativeAsksVolume += ask.size;
      depthData.push({
        price: ask.price,
        volume: cumulativeAsksVolume,
        type: 'asks'
      });
    });
    
    return depthData;
  };
  
  const depthData = prepareDepthData();
  
  const chartConfig = {
    data: depthData,
    xField: 'price',
    yField: 'volume',
    seriesField: 'type',
    stepType: 'hvh',
    areaStyle: (datum) => {
      return {
        fill: datum.type === 'bids' ? 'l(90) 0:rgba(82, 196, 26, 0.4) 1:rgba(82, 196, 26, 0.05)' : 'l(90) 0:rgba(255, 77, 79, 0.4) 1:rgba(255, 77, 79, 0.05)'
      };
    },
    color: (datum) => datum.type === 'bids' ? '#52c41a' : '#ff4d4f',
    xAxis: {
      label: {
        formatter: (v) => `$${Number(v).toFixed(2)}`
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${Number(v).toLocaleString()}`
      }
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.type === 'bids' ? 'Bid Depth' : 'Ask Depth',
        value: `${datum.volume.toLocaleString()} units`
      })
    },
    legend: {
      position: 'top-right'
    }
  };

  const bestBid = orderBook.bids?.[0]?.price || 0;
  const bestAsk = orderBook.asks?.[0]?.price || 0;
  const spread = bestAsk - bestBid;

  return (
    <Card 
      className={`market-depth-chart ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="depth-chart-container" style={style}>
        <div className="depth-chart-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {title}
          </div>
        </div>
        
        <div className="depth-chart-content">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading depth map...</div>
          ) : error ? (
            <div style={{ color: '#ff4d4f', padding: '40px', textAlign: 'center' }}>{error}</div>
          ) : (
            <div className="depth-chart-visualization">
              <Area {...chartConfig} height={250} />
            </div>
          )}
          
          <div className="depth-chart-metrics" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Mid Price" value={(bestBid + bestAsk) / 2} precision={2} prefix="$" valueStyle={{ fontSize: '16px' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Bid-Ask Spread" value={spread} precision={2} prefix="$" valueStyle={{ fontSize: '16px' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Spread BPS" value={(spread / ((bestBid + bestAsk) / 2)) * 10000} precision={1} suffix="bps" valueStyle={{ fontSize: '16px' }} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketDepthChart;
