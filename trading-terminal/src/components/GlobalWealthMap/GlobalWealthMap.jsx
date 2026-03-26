// src/components/GlobalWealthMap/GlobalWealthMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Spin, Alert } from 'antd';
import { GlobalOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { globalWealthAPI } from '../../api/globalWealth';
import WealthMapLegend from './WealthMapLegend';
import WealthMapControls from './WealthMapControls';
import './GlobalWealthMap.css';

const GlobalWealthMap = ({ 
  title = "Global Wealth Distribution",
  region = "global",
  timeframe = "2023",
  metric = "total_wealth",
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  onRegionChange,
  onTimeframeChange,
  onMetricChange,
  fullScreen = false,
  onFullScreenToggle
}) => {
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);
  const [mapData, setMapData] = useState([]);
  const [loadingState, setLoadingState] = useState(loading);
  const [errorState, setErrorState] = useState(error);
  const [regionState, setRegionState] = useState(region);
  const [timeframeState, setTimeframeState] = useState(timeframe);
  const [metricState, setMetricState] = useState(metric);
  const containerRef = useRef(null);

  // Available regions
  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'north_america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia_pacific', label: 'Asia Pacific' },
    { value: 'latin_america', label: 'Latin America' },
    { value: 'middle_east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' }
  ];

  // Timeframe options
  const timeframes = [
    { value: '2010', label: '2010' },
    { value: '2015', label: '2015' },
    { value: '2020', label: '2020' },
    { value: '2023', label: '2023' },
    { value: '2025', label: '2025 (Projected)' }
  ];

  // Metric options
  const metrics = [
    { value: 'total_wealth', label: 'Total Wealth' },
    { value: 'per_capita_wealth', label: 'Wealth Per Capita' },
    { value: 'wealth_inequality', label: 'Wealth Inequality (Gini)' },
    { value: 'top_1_percent', label: 'Top 1% Share' },
    { value: 'top_10_percent', label: 'Top 10% Share' }
  ];

  // Fetch data on component mount and parameter changes
  useEffect(() => {
    fetchData();
  }, [regionState, timeframeState, metricState]);

  const fetchData = async () => {
    setLoadingState(true);
    setErrorState(null);
    
    try {
      const response = await globalWealthAPI.getWealthData(regionState, timeframeState, metricState);
      setMapData(response.data.mapData);
      setLoadingState(false);
    } catch (err) {
      setErrorState('Failed to load global wealth data');
      setLoadingState(false);
    }
  };

  const handleRegionChange = (value) => {
    setRegionState(value);
    if (onRegionChange) onRegionChange(value);
  };

  const handleTimeframeChange = (value) => {
    setTimeframeState(value);
    if (onTimeframeChange) onTimeframeChange(value);
  };

  const handleMetricChange = (value) => {
    setMetricState(value);
    if (onMetricChange) onMetricChange(value);
  };

  const handleFullScreenToggle = () => {
    const newFullScreen = !isFullScreen;
    setIsFullScreen(newFullScreen);
    if (onFullScreenToggle) {
      onFullScreenToggle(newFullScreen);
    }
  };

  // Render map
  const renderMap = () => {
    return (
      <div className="wealth-map-container" ref={containerRef}>
        {loadingState ? (
          <div className="map-loading">
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading wealth map data...</div>
          </div>
        ) : errorState ? (
          <div className="map-error">
            <Alert message="Error" description={errorState} type="error" showIcon />
          </div>
        ) : (
          <div className="map-content">
            <div className="map-placeholder">
              <div className="map-legend-container">
                <WealthMapLegend 
                  metric={metricState}
                  region={regionState}
                  timeframe={timeframeState}
                />
              </div>
              <div className="map-visualization" style={{ height: 500, background: '#f0f2f5', borderRadius: 8 }}>
                {/* Visual implementation would follow */}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      className={`global-wealth-map ${className}`} 
      style={cardStyle}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <GlobalOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
          <div className="map-header-controls">
            <WealthMapControls
              region={regionState}
              timeframe={timeframeState}
              metric={metricState}
              onRegionChange={handleRegionChange}
              onTimeframeChange={handleTimeframeChange}
              onMetricChange={handleMetricChange}
              regions={regions}
              timeframes={timeframes}
              metrics={metrics}
            />
            <Button 
              icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={handleFullScreenToggle}
              style={{ marginLeft: 8 }}
            />
          </div>
        </div>
      }
    >
      <div className="wealth-map-content" style={style}>
        {renderMap()}
      </div>
    </Card>
  );
};

export default GlobalWealthMap;
