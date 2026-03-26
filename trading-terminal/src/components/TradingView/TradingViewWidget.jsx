// src/components/TradingView/TradingViewWidget.jsx
import React, { useRef, useEffect, useState } from 'react';

const TradingViewWidget = ({ 
  symbol = "AAPL",
  interval = "15",
  theme = "light",
  chartType = "candles",
  studies = [],
  indicators = [],
  className = '',
  style = {},
  onStudyAdded,
  onIndicatorAdded
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Initialize TradingView widget
  useEffect(() => {
    if (containerRef.current) {
      setLoading(true);
      setError(null);
      
      const initTradingView = async () => {
        try {
          if (!window.TradingView) {
            setError('TradingView library not loaded');
            setLoading(false);
            return;
          }
          
          const widgetConfig = {
            container_id: containerRef.current.id,
            symbol: symbol,
            interval: interval,
            style: chartType === 'candles' ? 1 : 2, // Simplified for placeholder
            timezone: 'Etc/UTC',
            theme: theme,
            toolbar_bg: '#f0f2f5',
            library_path: '/tradingview/',
            locale: 'en',
            disabled_features: ['left_toolbar', 'header_symbol_search'],
            enabled_features: ['study_templates'],
            autosize: true,
            container: containerRef.current,
          };
          
          const chart = new window.TradingView.widget(widgetConfig);
          
          chart.onChartReady(() => {
            setLoading(false);
          });
          
          return () => {
            if (chart) chart.remove();
          };
        } catch (err) {
          setError('Failed to initialize TradingView widget');
          setLoading(false);
        }
      };
      
      initTradingView();
    }
  }, [symbol, interval, chartType, theme]);

  return (
    <div className={`tradingview-widget ${className}`} style={{ width: '100%', height: '100%', ...style }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="loading-spinner"></div>
          <div>Loading chart data...</div>
        </div>
      ) : error ? (
        <div style={{ color: '#ff4d4f', padding: '20px', textAlign: 'center' }}>{error}</div>
      ) : (
        <div id="tradingview-widget-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default TradingViewWidget;
