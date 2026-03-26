// src/components/StockAnalysis/StockAnalysisDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Space, Button, Select } from 'antd';
import { LineChartOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import './StockAnalysis.css';
import TechnicalIndicator from './TechnicalIndicator';
import { calculateSMA, calculateEMA } from '../../utils/indicators';
import IndicatorSettings from './IndicatorSettings';
import IndicatorLibrary from './IndicatorLibrary';
import PriceChart from './PriceChart';
import IndicatorComparison from './IndicatorComparison';

const { TabPane } = Tabs;

const StockAnalysisDashboard = ({ 
  symbol = "AAPL",
  title = "Stock Analysis",
  className = '',
  style = {},
  cardStyle = {},
  onSymbolChange
}) => {
  const [activeTab, setActiveTab] = useState('technical');
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [indicators, setIndicators] = useState([
    { id: 1, type: 'sma', name: 'SMA', period: 20, color: '#1890ff' },
    { id: 2, type: 'ema', name: 'EMA', period: 50, color: '#52c41a' }
  ]);
  const [activeIndicator, setActiveIndicator] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeframe, setTimeframe] = useState('1y');
  const [chartType, setChartType] = useState('candlestick');

  const symbols = [
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft Corporation' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'TSLA', label: 'Tesla Inc.' }
  ];

  const timeframes = [
    { value: '1d', label: '1 Day' },
    { value: '1m', label: '1 Month' },
    { value: '1y', label: '1 Year' }
  ];

  const chartTypes = [
    { value: 'line', label: 'Line' },
    { value: 'candlestick', label: 'Candlestick' }
  ];

  useEffect(() => {
    if (onSymbolChange) onSymbolChange(currentSymbol);
  }, [currentSymbol]);

  const handleAddIndicator = (indicator) => {
    setIndicators([...indicators, { id: Date.now(), ...indicator }]);
  };

  const handleRemoveIndicator = (id) => {
    setIndicators(indicators.filter(i => i.id !== id));
  };

  return (
    <div className={`stock-analysis-dashboard ${className}`} style={style}>
      <Card title={<><LineChartOutlined style={{ marginRight: 8 }} />{title}</>} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...cardStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Space>
            <Select value={currentSymbol} onChange={setCurrentSymbol} options={symbols} style={{ width: 150 }} />
            <Select value={timeframe} onChange={setTimeframe} options={timeframes} style={{ width: 120 }} />
            <Select value={chartType} onChange={setChartType} options={chartTypes} style={{ width: 150 }} />
            <Button icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={() => setIsFullScreen(!isFullScreen)} />
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Technical Analysis" key="technical">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <PriceChart symbol={currentSymbol} timeframe={timeframe} chartType={chartType} indicators={indicators} style={{ height: isFullScreen ? '70vh' : '500px' }} />
              </Col>
              <Col xs={24} lg={8}>
                <IndicatorLibrary activeIndicators={indicators} onAddIndicator={handleAddIndicator} onRemoveIndicator={handleRemoveIndicator} onEditIndicator={setActiveIndicator} />
                {activeIndicator && <IndicatorSettings indicator={activeIndicator} onSettingsChange={(id, up) => setIndicators(indicators.map(i => i.id === id ? {...i, ...up} : i))} onClose={() => setActiveIndicator(null)} />}
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Signals" key="signals">
             <div style={{ padding: '24px' }}>Technical Signal integration in progress...</div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StockAnalysisDashboard;
