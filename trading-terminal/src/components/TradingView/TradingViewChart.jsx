// src/components/TradingView/TradingViewChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Card, Space, Button, Select } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import './TradingView.css';
import TradingViewHeader from './TradingViewHeader';
import TradingViewStudies from './TradingViewStudies';
import TradingViewIndicators from './TradingViewIndicators';
import TradingViewTimeframe from './TradingViewTimeframe';
import TradingViewWidget from './TradingViewWidget';

const TradingViewChart = ({ 
  symbol = "AAPL",
  interval = "15",
  theme = "light",
  chartType = "candles",
  studies = [],
  indicators = [],
  title = "TradingView Chart",
  className = '',
  style = {},
  cardStyle = {},
  onSymbolChange,
  onIntervalChange,
  onChartTypeChange,
  onStudyAdded,
  onIndicatorAdded,
  onFullScreenToggle
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [studyList, setStudyList] = useState(studies);
  const [indicatorList, setIndicatorList] = useState(indicators);

  const symbols = [
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft Corporation' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'AMZN', label: 'Amazon.com Inc.' },
    { value: 'TSLA', label: 'Tesla Inc.' },
    { value: 'NVDA', label: 'NVIDIA Corporation' },
    { value: 'JPM', label: 'JPMorgan Chase & Co.' },
    { value: 'JNJ', label: 'Johnson & Johnson' },
    { value: 'V', label: 'Visa Inc.' },
    { value: 'MA', label: 'Mastercard Incorporated' }
  ];

  const intervals = [
    { value: '1', label: '1 Minute' },
    { value: '5', label: '5 Minutes' },
    { value: '15', label: '15 Minutes' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '1 Hour' },
    { value: '240', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ];

  const chartTypes = [
    { value: 'candles', label: 'Candles' },
    { value: 'line', label: 'Line' },
    { value: 'area', label: 'Area' },
    { value: 'bars', label: 'Bars' },
    { value: 'heikin-ashi', label: 'Heikin Ashi' }
  ];

  const handleSymbolChange = (value) => {
    setCurrentSymbol(value);
    if (onSymbolChange) onSymbolChange(value);
  };

  const handleFullScreenToggle = () => {
    const newFullScreen = !isFullScreen;
    setIsFullScreen(newFullScreen);
    if (onFullScreenToggle) onFullScreenToggle(newFullScreen);
  };

  return (
    <div className={`tradingview-chart ${className}`} style={style}>
      <Card className="tradingview-header" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}>
        <div className="tradingview-container">
          <TradingViewHeader 
            symbol={currentSymbol}
            interval={currentInterval}
            chartType={currentChartType}
            symbols={symbols}
            intervals={intervals}
            chartTypes={chartTypes}
            isFullScreen={isFullScreen}
            onSymbolChange={handleSymbolChange}
            onIntervalChange={(v) => setCurrentInterval(v)}
            onChartTypeChange={(v) => setCurrentChartType(v)}
            onFullScreenToggle={handleFullScreenToggle}
          />
          
          <div className="tradingview-content" style={{ height: '500px', background: '#f0f2f5', borderRadius: '8px', overflow: 'hidden' }}>
            <TradingViewWidget 
              symbol={currentSymbol}
              interval={currentInterval}
              theme={theme}
              chartType={currentChartType}
              studies={studyList}
              indicators={indicatorList}
              onStudyAdded={(s) => setStudyList(s)}
              onIndicatorAdded={(i) => setIndicatorList(i)}
            />
          </div>
          
          <div className="tradingview-footer" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <TradingViewStudies 
              studies={studyList}
              onAddStudy={(s) => setStudyList([...studyList, s])}
            />
            
            <TradingViewIndicators 
              indicators={indicatorList}
              onAddIndicator={(i) => setIndicatorList([...indicatorList, i])}
            />
            
            <TradingViewTimeframe 
              interval={currentInterval}
              onIntervalChange={(v) => setCurrentInterval(v)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradingViewChart;
