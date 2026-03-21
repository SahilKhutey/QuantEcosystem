import React, { useState, useEffect } from 'react';
import { 
  FiGlobe, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiBarChart2, 
  FiMap,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React/Webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DashboardContainer = styled.div`
  .global-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      
      button {
        background: var(--tertiary-dark);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
      }
    }
  }
  
  .market-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .region-card {
    background: var(--secondary-dark);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    padding: 20px;
    
    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        font-size: 16px;
        font-weight: 600;
      }
      
      .region-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        
        &.bullish { color: var(--accent-green); }
        &.bearish { color: var(--accent-red); }
      }
    }
    
    .region-data {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
      
      .data-item {
        display: flex;
        flex-direction: column;
        
        .data-value {
          font-size: 18px;
          font-weight: 600;
          &.positive { color: var(--accent-green); }
          &.negative { color: var(--accent-red); }
        }
        
        .data-label {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }
      }
    }
  }
  
  .global-map {
    background: var(--secondary-dark);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    padding: 20px;
    margin-bottom: 20px;
    
    .map-container {
      height: 400px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 15px;
      border: 1px solid var(--border-color);
    }
  }
  
  .correlation-matrix {
    background: var(--secondary-dark);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    padding: 20px;
    
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-top: 20px;
      
      .matrix-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        border-radius: 2px;
        color: white;
      }
    }
  }
`;

import { getGlobalMarketView } from '../../services/api';

const GlobalMarketDashboard = () => {
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getGlobalMarketView();
        setGlobalData(data);
        setError(null);
      } catch (err) {
        console.error("Error loading global market data:", err);
        setError("Failed to load live global data. Using offline mode.");
        // Fallback to mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (value) => {
    const intensity = Math.abs(value);
    if (value > 0) return `rgba(0, 204, 102, ${0.3 + intensity * 0.7})`;
    if (value < 0) return `rgba(255, 51, 51, ${0.3 + intensity * 0.7})`;
    return 'var(--tertiary-dark)';
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Global Market Radar</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary"><FiRefreshCw /> Pulse Refresh</button>
          <button className="btn-primary"><FiGlobe /> Macro View</button>
        </div>
      </div>

      <DashboardContainer>
        <div className="market-grid">
          {Object.entries(mockGlobalData.regions).map(([key, region]) => (
            <div key={key} className="region-card">
              <div className="region-header">
                <h3>{region.region}</h3>
                <div className={`region-status ${region.sentiment.sentiment.toLowerCase().includes('bullish') ? 'bullish' : 'bearish'}`}>
                  {region.sentiment.sentiment}
                </div>
              </div>
              <div className="region-data">
                <div className="data-item">
                  <span className={`data-value ${region.market_data.change >= 0 ? 'positive' : 'negative'}`}>
                    {region.market_data.close.toLocaleString()}
                  </span>
                  <span className="data-label">Primary Index</span>
                </div>
                <div className="data-item">
                  <span className={`data-value ${region.market_data.change >= 0 ? 'positive' : 'negative'}`}>
                    {region.market_data.change > 0 ? '+' : ''}{region.market_data.change}%
                  </span>
                  <span className="data-label">Daily Delta</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="global-map">
          <div className="global-header">
            <h2>Institutional Macro Heatmap</h2>
            <div className="controls">
              <button><FiMap /> Overlay: Sentiment</button>
            </div>
          </div>
          <div className="map-container">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[37.09, -95.71]}><Popup>US Market: Bullish</Popup></Marker>
              <Marker position={[51.5, -0.11]}><Popup>UK Market: Neutral</Popup></Marker>
              <Marker position={[35.67, 139.65]}><Popup>JP Market: Positive</Popup></Marker>
              <Marker position={[20.59, 78.96]}><Popup>IN Market: Strong Bullish</Popup></Marker>
            </MapContainer>
          </div>
        </div>

        <div className="correlation-matrix">
          <div className="global-header">
            <h2>Correlation Alpha Matrix (30D)</h2>
          </div>
          <div className="matrix-grid">
            {Object.keys(mockGlobalData.correlation_matrix.matrix).map(row => (
              Object.entries(mockGlobalData.correlation_matrix.matrix[row]).map(([col, val]) => (
                <div 
                  key={`${row}-${col}`} 
                  className="matrix-cell"
                  style={{ backgroundColor: getColor(val) }}
                  title={`${row} vs ${col}: ${val}`}
                >
                  {val.toFixed(2)}
                </div>
              ))
            ))}
          </div>
        </div>
      </DashboardContainer>
    </div>
  );
};

export default GlobalMarketDashboard;
