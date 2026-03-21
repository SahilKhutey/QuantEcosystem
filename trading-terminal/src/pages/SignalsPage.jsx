import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiZap, FiTarget, FiShield, FiTrendingUp, FiTrendingDown, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';

const SignalsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: 100%;
  
  .signal-cards {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
  }
  
  .signal-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const SignalCard = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: 80px 1fr 200px;
  gap: 20px;
  align-items: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateX(5px);
    border-color: var(--accent-blue);
  }
  
  .strategy-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-blue);
  }
  
  .info {
    .symbol-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
      
      .symbol { font-size: 18px; font-weight: 700; }
      .type { 
        padding: 2px 8px; 
        border-radius: 4px; 
        font-size: 11px; 
        font-weight: 700;
        
        &.long { background: rgba(0, 204, 102, 0.1); color: var(--accent-green); }
        &.short { background: rgba(255, 51, 51, 0.1); color: var(--accent-red); }
      }
    }
    
    .strategy-name { font-size: 13px; color: var(--text-tertiary); }
  }
  
  .levels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 13px;
    
    .level {
      .label { color: var(--text-tertiary); font-size: 11px; margin-bottom: 2px; }
      .value { font-family: 'Roboto Mono', monospace; font-weight: 600; }
    }
  }
  
  .conviction {
    text-align: right;
    
    .label { color: var(--text-tertiary); font-size: 11px; margin-bottom: 5px; }
    .score-bar {
      height: 6px;
      width: 100px;
      background: rgba(255,255,255,0.05);
      border-radius: 3px;
      margin-left: auto;
      overflow: hidden;
      
      .fill { height: 100%; background: var(--accent-blue); }
    }
    .score-text { margin-top: 5px; font-weight: 700; font-size: 14px; color: var(--accent-blue); }
  }
`;

const SidebarCard = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  h4 { font-size: 14px; margin-bottom: 15px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
`;

const SignalsPage = () => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    // Mock signal data
    const mockSignals = [
      {
        id: 1,
        symbol: 'RELIANCE',
        type: 'long',
        strategy: 'Mean Reversion v4',
        entry: 2542.50,
        target: 2610.00,
        stop: 2515.00,
        conviction: 88,
        time: '5m ago'
      },
      {
        id: 2,
        symbol: 'TCS',
        type: 'short',
        strategy: 'Institutional Flow',
        entry: 3120.00,
        target: 3040.00,
        stop: 3155.00,
        conviction: 72,
        time: '12m ago'
      },
      {
        id: 3,
        symbol: 'HDFCBANK',
        type: 'long',
        strategy: 'Breakout Engine',
        entry: 1562.40,
        target: 1610.00,
        stop: 1545.00,
        conviction: 94,
        time: '45m ago'
      },
      {
        id: 4,
        symbol: 'INFY',
        type: 'long',
        strategy: 'Mean Reversion v4',
        entry: 1420.00,
        target: 1465.00,
        stop: 1405.00,
        conviction: 65,
        time: '1h ago'
      }
    ];
    setSignals(mockSignals);
  }, []);

  return (
    <SignalsContainer className="page-container">
      <div className="signal-cards">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Active Trade Signals</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{signals.length} active opportunities</span>
        </div>
        
        {signals.map(sig => (
          <SignalCard key={sig.id}>
            <div className="strategy-icon">
              {sig.strategy.includes('Reversion') ? <FiActivity size={24} /> : sig.strategy.includes('Breakout') ? <FiZap size={24} /> : <FiShield size={24} />}
            </div>
            
            <div className="info">
              <div className="symbol-row">
                <span className="symbol">{sig.symbol}</span>
                <span className={`type ${sig.type}`}>{sig.type.toUpperCase()}</span>
              </div>
              <div className="strategy-name">{sig.strategy} • <FiClock size={12} /> {sig.time}</div>
              
              <div className="levels" style={{ marginTop: '15px' }}>
                <div className="level">
                  <div className="label">ENTRY</div>
                  <div className="value">₹{sig.entry.toFixed(2)}</div>
                </div>
                <div className="level">
                  <div className="label">TARGET</div>
                  <div className="value" style={{ color: 'var(--accent-green)' }}>₹{sig.target.toFixed(2)}</div>
                </div>
                <div className="level">
                  <div className="label">STOP LOSS</div>
                  <div className="value" style={{ color: 'var(--accent-red)' }}>₹{sig.stop.toFixed(2)}</div>
                </div>
                <div className="level">
                  <div className="label">RR RATIO</div>
                  <div className="value">1:{((sig.target - sig.entry) / (sig.entry - sig.stop)).toFixed(1)}</div>
                </div>
              </div>
            </div>
            
            <div className="conviction">
              <div className="label">CONVICTION SCORE</div>
              <div className="score-bar">
                <div className="fill" style={{ width: `${sig.conviction}%` }}></div>
              </div>
              <div className="score-text">{sig.conviction}%</div>
              <button style={{ marginTop: '15px', padding: '8px 20px', background: 'var(--accent-blue)', border: 'none', borderRadius: '4px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
                TRADE NOW
              </button>
            </div>
          </SignalCard>
        ))}
      </div>

      <div className="signal-stats">
        <SidebarCard>
          <h4><FiTrendingUp /> Strategy Performance</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { name: 'Mean Reversion', win: 68, yield: 12.4 },
              { name: 'Breakout Engine', win: 54, yield: 8.2 },
              { name: 'Institutional Flow', win: 76, yield: 15.1 }
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Win Rate: {s.win}%</div>
                </div>
                <div style={{ color: 'var(--accent-green)', fontWeight: '700' }}>+{s.yield}%</div>
              </div>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard>
          <h4><FiCheckCircle /> Signal Accuracy (MTD)</h4>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>72.4%</div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
            AI conviction correlation to trade outcome has improved by 4.2% since the last update.
          </p>
        </SidebarCard>
        
        <SidebarCard style={{ background: 'linear-gradient(135deg, var(--accent-blue) 0%, #0056b3 100%)', border: 'none' }}>
          <h4 style={{ color: 'white' }}><FiZap /> Smart Auto-Trade</h4>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', marginBottom: '15px' }}>
            Enable automated execution for signals with {'>'}90% conviction score.
          </p>
          <button style={{ width: '100%', padding: '10px', background: 'white', color: 'var(--accent-blue)', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>
            ENABLE AUTO-TRADE
          </button>
        </SidebarCard>
      </div>
    </SignalsContainer>
  );
};

export default SignalsPage;
