import React, { useEffect, useRef } from 'react';
import { FiActivity } from 'react-icons/fi';

let tvScriptLoadingPromise;

const TradingViewWidget = () => {
  const onLoadScriptRef = useRef();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview_advanced_chart') && 'TradingView' in window) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "1",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "#0d1117",
          gridColor: "#161b22",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_advanced_chart"
        });
      }
    }
  }, []);

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #2962FF', borderColor: '#2962FF' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiActivity color="#2962FF" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>TradingView Pro Terminal (Native WS)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(41, 98, 255, 0.1)', color: '#2962FF' }}>Live Streaming</span>
      </div>
      
      <div className="card-body" style={{ padding: '0 16px 16px 16px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', marginTop: '16px' }}>
          This component hooks directly into <strong>TradingView's native external WebSocket networks</strong>, rendering lightning-fast institutional candlesticks. Combined with our backend `/webhook` API, any algorithmic PineScript signal triggered on TradingView will instantly execute on this ecosystem.
        </p>

        <div className='tradingview-widget-container' style={{ height: "500px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)"}}>
          <div id='tradingview_advanced_chart' style={{ height: "100%", width: "100%" }} />
        </div>
        
      </div>
    </div>
  );
};

export default TradingViewWidget;
