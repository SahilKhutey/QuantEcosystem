import React, { useState } from 'react';
import { FiActivity, FiPlayCircle, FiCheckCircle } from 'react-icons/fi';
import api from '@/services/api';

const LeanBacktester = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runBacktest = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/backtest/run', { symbol });
      setResults(resp.data.stats);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to engine API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiActivity color="var(--accent-emerald)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Lean Algorithmic Trading Engine</h2>
        </div>
        <span className="badge badge-emerald">Engine Ready</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Execute high-performance event-driven backtests across equities, forex, and crypto using the Lean-inspired core engine.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)} 
            placeholder="Symbol (e.g. AAPL)"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          />
          <button 
            className="btn btn-primary" 
            onClick={runBacktest}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPlayCircle />
            {loading ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        {results && !results.error && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', marginTop: 0 }}>
              <FiCheckCircle /> Backtest Complete
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Return</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{results['Total Return']}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Sharpe Ratio</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{results['Sharpe Ratio']}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Max Drawdown</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--accent-rose)' }}>{results['Max Drawdown']}</p>
              </div>
            </div>
          </div>
        )}
        
        {results && results.error && (
          <div style={{ color: 'var(--accent-rose)', padding: '10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px' }}>
            {results.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeanBacktester;
