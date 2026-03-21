import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBarChart, FiTrendingUp, FiActivity, FiMap, FiLayers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';

const AnalyticsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  height: 100%;
  
  .card {
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
  }
  
  .full-width {
    grid-column: 1 / span 2;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  
  svg { color: var(--accent-blue); }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  
  .metric {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 15px;
    
    .label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 5px; }
    .value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .note { font-size: 11px; color: var(--accent-green); margin-top: 5px; }
  }
`;

import useAppStore from '../services/store/appStore';

const AnalyticsPage = () => {
  const { selectedSymbol } = useAppStore();
  const attributionData = [
    { name: 'Alpha', value: 12.5 },
    { name: 'Beta', value: 4.2 },
    { name: 'Momentum', value: 3.8 },
    { name: 'Value', value: -1.2 },
    { name: 'Volatility', value: 2.1 },
  ];

  const correlationMatrix = [
    { x: 'NIFTY', y: 'BANKNIFTY', z: 0.92 },
    { x: 'NIFTY', y: 'GOLD', z: -0.15 },
    { x: 'NIFTY', y: 'USDINR', z: -0.42 },
    { x: 'BANKNIFTY', y: 'GOLD', z: -0.08 },
    { x: 'BANKNIFTY', y: 'USDINR', z: -0.38 },
    { x: 'GOLD', y: 'USDINR', z: 0.12 },
  ];

  return (
    <AnalyticsContainer className="page-container">
      <div className="card">
        <SectionTitle><FiBarChart /> Performance Attribution</SectionTitle>
        <MetricsGrid>
          <div className="metric">
            <div className="label">Excess Return (Alpha)</div>
            <div className="value">14.2%</div>
            <div className="note">+2.1% vs prev. month</div>
          </div>
          <div className="metric">
            <div className="label">Information Ratio</div>
            <div className="value">1.84</div>
            <div className="note">Top 5% of strategies</div>
          </div>
          <div className="metric">
            <div className="label">Tracking Error</div>
            <div className="value">4.5%</div>
            <div className="note">Within target range</div>
          </div>
        </MetricsGrid>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }} />
            <Bar dataKey="value" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card">
        <SectionTitle><FiMap /> Cross-Asset Correlation</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {correlationMatrix.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.x} / {item.y}</span>
              <span style={{ 
                color: item.z > 0.7 ? 'var(--accent-green)' : item.z < 0 ? 'var(--accent-red)' : 'var(--text-tertiary)',
                fontWeight: '700'
              }}>
                {(item.z * 100).toFixed(0)}%
              </span>
            </div>
          ))}
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '10px', fontStyle: 'italic' }}>
            High correlation detected between NIFTY and BANKNIFTY. Diversification benefit is currently low.
          </p>
        </div>
      </div>
      
      <div className="card full-width">
        <SectionTitle><FiLayers /> Strategy Alpha Generation</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Array.from({ length: 20 }, (_, i) => ({ name: i, val: 10 + Math.sin(i / 2) * 5 + i * 0.5 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }} />
            <Line type="monotone" dataKey="val" stroke="var(--accent-green)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsContainer>
  );
};

export default AnalyticsPage;
