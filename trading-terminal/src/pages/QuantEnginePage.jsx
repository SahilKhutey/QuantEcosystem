import React, { useState } from 'react';
import { FiCpu } from 'react-icons/fi';
import ModelFusionDashboard from '../components/dashboard/QuantEngine/ModelFusionDashboard';
import RegimeDetection from '../components/dashboard/QuantEngine/RegimeDetection';
import StochasticModels from '../components/dashboard/QuantEngine/StochasticModels';

const SYMBOLS = ['NIFTY50', 'BANKNIFTY', 'SENSEX', 'HDFCBANK', 'TCS', 'RELIANCE'];

const QuantEnginePage = () => {
  const [symbol, setSymbol] = useState('NIFTY50');

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCpu color="var(--accent-purple)" size={22} />
            Advanced Quant Engine
          </div>
          <div className="page-subtitle">
            ARIMA · LSTM · HMM · Bayesian · Monte Carlo model fusion & regime detection
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Symbol:</span>
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '8px 14px', color: 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer', outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="badge badge-purple">
            <span className="status-dot live" /> 5 Models Active
          </span>
        </div>
      </div>

      {/* Model fusion — full width */}
      <div style={{ marginBottom: 16 }}>
        <ModelFusionDashboard symbol={symbol} />
      </div>

      {/* Regime + Stochastic side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RegimeDetection symbol={symbol} />
        <StochasticModels symbol={symbol} />
      </div>
    </div>
  );
};

export default QuantEnginePage;
