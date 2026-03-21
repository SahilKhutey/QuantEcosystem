import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styled from 'styled-components';

// Fix for Leaflet default icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapWrapper = styled.div`
  height: 100%;
  width: 100%;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: #0b0e11;
  }
`;

const GlobalMarketMap = () => {
  const markers = [
    { id: 1, position: [37.09, -95.71], title: "North America", status: "Bullish", change: "+1.2%" },
    { id: 2, position: [54.52, 15.25], title: "Europe", status: "Moderate", change: "+0.5%" },
    { id: 3, position: [34.04, 100.61], title: "Asia", status: "Bearish", change: "-0.2%" },
    { id: 4, position: [20.59, 78.96], title: "India", status: "Strong Bull", change: "+1.8%" },
    { id: 5, position: [-25.27, 133.77], title: "Australia", status: "Neutral", change: "0.0%" },
    { id: 6, position: [-14.23, -51.92], title: "South America", status: "Bearish", change: "-1.5%" }
  ];

  return (
    <MapWrapper>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div style={{ color: '#000' }}>
                <strong style={{ fontSize: '14px' }}>{marker.title}</strong><br />
                <span style={{ 
                  color: marker.status.includes('Bull') ? '#00cc66' : marker.status.includes('Bear') ? '#ff3333' : '#666'
                }}>
                  Status: {marker.status} ({marker.change})
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

export default GlobalMarketMap;
