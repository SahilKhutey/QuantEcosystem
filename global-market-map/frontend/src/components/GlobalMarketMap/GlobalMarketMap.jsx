import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import L from 'leaflet';

// Fixed MarketMarker using L.divIcon for custom marker style
const createMarketIcon = (status) => {
  const color = status === 'Bullish' ? '#00cc66' : status === 'Bearish' ? '#ff3333' : '#007acc';
  const icon = status === 'Bullish' ? '↑' : status === 'Bearish' ? '↓' : '=';
  
  return L.divIcon({
    className: 'custom-market-marker',
    html: `<div style="background: var(--secondary-dark); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 8px; font-weight: bold; color: ${color}; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const MapWrapper = styled.div`
  height: 100%;
  width: 100%;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: var(--secondary-dark);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    
    .leaflet-tile,
    .leaflet-marker-icon {
      filter: invert(1) hue-rotate(180deg) brightness(1.2);
    }
    
    .leaflet-control {
      background: var(--tertiary-dark) !important;
      border: 1px solid var(--border-color) !important;
      color: var(--text-primary) !important;
      
      a {
        color: var(--text-primary) !important;
        &:hover {
          background: var(--secondary-dark) !important;
        }
      }
    }
  }
`;

const GlobalMarketMap = () => {
  const [regions] = useState([
    {
      id: 'north_america',
      name: 'North America',
      lat: 37.0902,
      lng: -95.7129,
      index: 'S&P 500',
      change: 1.2,
      status: 'Bullish'
    },
    {
      id: 'europe',
      name: 'Europe',
      lat: 54.5260,
      lng: 15.2551,
      index: 'STOXX 50',
      change: 0.5,
      status: 'Moderate'
    },
    {
      id: 'asia',
      name: 'Asia',
      lat: 33.9992,
      lng: 136.5985,
      index: 'Nikkei 225',
      change: -0.2,
      status: 'Bearish'
    },
    {
      id: 'emerging_markets',
      name: 'Emerging Markets',
      lat: 20.5937,
      lng: 78.9629,
      index: 'MSCI Emerging',
      change: -1.5,
      status: 'Weak'
    }
  ]);
  
  return (
    <MapWrapper>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {regions.map(region => (
          <Marker 
            key={region.id}
            position={[region.lat, region.lng]}
            icon={createMarketIcon(region.status)}
          >
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{region.name}</h3>
                <p style={{ margin: '3px 0' }}>Index: <strong>{region.index}</strong></p>
                <p style={{ margin: '3px 0', color: region.change >= 0 ? '#00cc66' : '#ff3333' }}>
                  Change: <strong>{region.change}%</strong>
                </p>
                <p style={{ margin: '3px 0' }}>Status: <strong>{region.status}</strong></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

export default GlobalMarketMap;
