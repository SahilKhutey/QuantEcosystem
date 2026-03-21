import React, { useState } from 'react';
import { FiTrendingUp, FiFastForward, FiList } from 'react-icons/fi';
import api from '@/services/api';

const BacktestingPyDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/backtestingpy/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Backtesting.py API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-purple)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFastForward color="var(--accent-purple)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Backtesting.py Framework</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>Ultra-Fast Vectorized</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Execute rapid, pandas-like backtests using the incredibly concise Backtesting.py structure. Features the magic `self.I()` wrapper for instantaneous indicator injection and outputs a standardized, flat-array statistic summary perfectly suited for programmatic parsing.
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: 'var(--accent-purple)', color: 'white', border: 'none'
          }}
        >
          <FiList />
          {loading ? 'Crunching DataFrame...' : 'Run Vectorized Backtest'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Execution Summary
            </h3>
            
            <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
               gap: '0', 
               fontFamily: 'monospace',
               fontSize: '14px',
               color: 'var(--text-primary)',
               background: 'var(--bg-surface)',
               borderRadius: '6px',
               border: '1px solid var(--border)',
               overflow: 'hidden'
            }}>
              {Object.entries(results.stats).map(([k, v], i) => (
                <div key={k} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontWeight: 'bold' }}>{v}</span>
                </div>
              ))}
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

export default BacktestingPyDashboard;
