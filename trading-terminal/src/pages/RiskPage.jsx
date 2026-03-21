import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiShield, FiAlertTriangle, FiBarChart2, FiActivity, FiTarget, FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const RiskContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 20px;
  height: 100%;
  
  .risk-header {
    grid-column: 1 / span 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
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

const RiskMetric = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  .label { color: var(--text-tertiary); font-size: 12px; margin-bottom: 8px; }
  .value { font-size: 24px; font-weight: 700; color: var(--text-primary); }
  .indicator { 
    height: 4px; 
    width: 100%; 
    background: rgba(255,255,255,0.05); 
    border-radius: 2px; 
    margin-top: 12px;
    position: relative;
    
    .fill { 
      position: absolute; 
      height: 100%; 
      border-radius: 2px;
    }
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
  
  svg { color: var(--accent-red); }
`;

const StressTestRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 14px;
  
  .scenario { color: var(--text-primary); font-weight: 500; }
  .impact { text-align: right; }
  .status { text-align: right; font-weight: 600; }
  
  .positive { color: var(--accent-green); }
  .negative { color: var(--accent-red); }
`;

import useAppStore from '../services/store/appStore';

const RiskPage = () => {
  const { selectedSymbol } = useAppStore();
  const exposureData = [
    { subject: 'Technology', value: 85, fullMark: 100 },
    { subject: 'Finance', value: 60, fullMark: 100 },
    { subject: 'Energy', value: 40, fullMark: 100 },
    { subject: 'Healthcare', value: 55, fullMark: 100 },
    { subject: 'Consumer', value: 70, fullMark: 100 },
  ];

  const barData = [
    { name: 'Equity', var: 12.5, limit: 15 },
    { name: 'Fixed Inc', var: 4.2, limit: 10 },
    { name: 'Commod', var: 8.8, limit: 12 },
    { name: 'Crypto', var: 24.5, limit: 25 },
    { name: 'Cash', var: 0.5, limit: 2 },
  ];

  return (
    <RiskContainer className="page-container">
      <div className="risk-header">
        <RiskMetric>
          <div className="label">Portfolio VaR (95%)</div>
          <div className="value">₹1,24,500</div>
          <div className="indicator">
            <div className="fill" style={{ width: '65%', background: 'var(--accent-red)' }}></div>
          </div>
        </RiskMetric>
        <RiskMetric>
          <div className="label">Conditional VaR (CVaR)</div>
          <div className="value">₹1,85,200</div>
          <div className="indicator">
            <div className="fill" style={{ width: '75%', background: 'var(--accent-red)' }}></div>
          </div>
        </RiskMetric>
        <RiskMetric>
          <div className="label">Beta to Benchmark</div>
          <div className="value">1.14</div>
          <div className="indicator">
            <div className="fill" style={{ width: '55%', background: 'var(--accent-blue)' }}></div>
          </div>
        </RiskMetric>
        <RiskMetric>
          <div className="label">Sharpe Ratio</div>
          <div className="value">2.42</div>
          <div className="indicator">
            <div className="fill" style={{ width: '82%', background: 'var(--accent-green)' }}></div>
          </div>
        </RiskMetric>
      </div>
      
      <div className="card">
        <SectionTitle><FiShield /> Sector Concentration Risk</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={exposureData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 12 }} />
            <PolarRadiusAxis hide />
            <Radar
              name="Exposure"
              dataKey="value"
              stroke="var(--accent-blue)"
              fill="var(--accent-blue)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card">
        <SectionTitle><FiBarChart2 /> Asset-Class VaR vs Limits</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }} />
            <Bar dataKey="var" fill="var(--accent-red)" radius={[4, 4, 0, 0]} name="Current VaR %" />
            <Bar dataKey="limit" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} name="Risk Limit %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card full-width">
        <SectionTitle><FiZap /> Stress Test Scenarios</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '10px 0', color: 'var(--text-tertiary)', fontSize: '13px', borderBottom: '1px solid var(--border-color)' }}>
            <span>Scenario Definition</span>
            <span style={{ textAlign: 'right' }}>Projected P&L</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </div>
          
          <StressTestRow>
            <span className="scenario">S&P 500 Crash (-10%)</span>
            <span className="impact negative">-₹2,45,000</span>
            <span className="status negative">CRITICAL</span>
          </StressTestRow>
          <StressTestRow>
            <span className="scenario">Interest Rate Hike (+50 bps)</span>
            <span className="impact negative">-₹45,200</span>
            <span className="status" style={{ color: 'var(--accent-blue)' }}>WARNING</span>
          </StressTestRow>
          <StressTestRow>
            <span className="scenario">Oil Price Spike (+15%)</span>
            <span className="impact positive">+₹12,400</span>
            <span className="status positive">SAFE</span>
          </StressTestRow>
          <StressTestRow>
            <span className="scenario">Tech Sector Correction (-5%)</span>
            <span className="impact negative">-₹85,000</span>
            <span className="status negative">CRITICAL</span>
          </StressTestRow>
          <StressTestRow>
            <span className="scenario">Emerging Market Rally (+5%)</span>
            <span className="impact positive">+₹22,500</span>
            <span className="status positive">SAFE</span>
          </StressTestRow>
        </div>
      </div>
    </RiskContainer>
  );
};

export default RiskPage;
