import React, { useState } from 'react';
import { FiTrendingUp, FiImage, FiPlayCircle, FiCpu } from 'react-icons/fi';
import api from '@/services/api';

const BacktraderDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [optResults, setOptResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    setOptResults(null);
    try {
      const resp = await api.post('/backtrader/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Backtrader API." });
    }
    setLoading(false);
  };

  const runOptimizer = async () => {
    setOptLoading(true);
    setResults(null);
    setOptResults(null);
    try {
      const resp = await api.post('/backtrader/optimize', { param_min: 10, param_max: 14 });
      setOptResults(resp.data);
    } catch (err) {
      console.error(err);
      setOptResults({ error: "Failed to connect to optimizer." });
    }
    setOptLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTrendingUp color="var(--accent-blue)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Backtrader-Inspired Subsystem</h2>
        </div>
        <span className="badge badge-blue">Cerebro Live</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Run the specialized Cerebro Python engine mimicking Backtrader. Test strategies with `Lines` array buffers, generate native Matplotlib plots, or invoke the multi-core Strategy Optimizer.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className="btn btn-primary" 
            onClick={runSimulation}
            disabled={loading || optLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPlayCircle />
            {loading ? 'Simulating...' : 'Run Single Backtest'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={runOptimizer}
            disabled={loading || optLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)' }}
          >
            <FiCpu color="var(--accent-purple)" />
            {optLoading ? 'Optimizing Grid...' : 'Run Strategy Optimizer'}
          </button>
        </div>

        {/* --- Single Run Results --- */}
        {results && !results.error && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Performance Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Return</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{results.stats['Total Return']}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Sharpe Ratio</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{results.stats['Sharpe Ratio']}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Max Drawdown</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--accent-amber)' }}>{results.stats['Max Drawdown']}</p>
              </div>
            </div>

            {results.plot_image && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  <FiImage /> Matplotlib Output
                </h4>
                <img 
                  src={results.plot_image} 
                  alt="Backtrader Simulation Plot" 
                  style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }} 
                />
              </div>
            )}
          </div>
        )}
        
        {/* --- Optimizer Results --- */}
        {optResults && !optResults.error && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Optimizer Heat Map Grid</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Executed {optResults.grid.length} parameter permutations using `cerebro.optstrategy()`. Showing top results ranked by Sharpe Ratio.
            </p>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Period (P1)</th>
                  <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Multiplier</th>
                  <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Total Return</th>
                  <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Sharpe Ratio</th>
                </tr>
              </thead>
              <tbody>
                {optResults.grid.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{row.period1}</td>
                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{row.multiplier}</td>
                    <td style={{ padding: '8px', color: idx === 0 ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{row['Total Return']}</td>
                    <td style={{ padding: '8px', fontWeight: idx === 0 ? 'bold' : 'normal', color: 'var(--text-primary)' }}>{row['Sharpe Ratio']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(results?.error || optResults?.error) && (
          <div style={{ color: 'var(--accent-rose)', padding: '10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px', marginTop: '16px' }}>
            {results?.error || optResults?.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BacktraderDashboard;
