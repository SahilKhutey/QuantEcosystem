import React, { useState } from 'react';
import { FiTrendingUp, FiZap, FiGrid } from 'react-icons/fi';
import api from '@/services/api';

const VectorbtDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [timingInfo, setTimingInfo] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    setTimingInfo(null);
    
    const startTime = performance.now();
    try {
      const resp = await api.post('/vectorbt/run', {});
      const endTime = performance.now();
      
      setResults(resp.data);
      setTimingInfo((endTime - startTime).toFixed(0)); // milliseconds
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to VectorBT API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-magenta)', borderColor: '#d946ef' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiZap color="#d946ef" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>VectorBT Optimizer Engine</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(217, 70, 239, 0.1)', color: '#d946ef' }}>Lightning-Fast Vectorized</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Execute massive hyper-parameter sweeps instantaneously! VectorBT completely avoids slow python logic-loops by broadcasting strategy logic into boolean NumPy Matrices (e.g. `Portfolio.from_signals`). In this demo, we will simultaneously evaluate an SMA Strategy across 25 distinct Fast/Slow combinations over 1,000 days of data.
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#d946ef', color: 'white', border: 'none'
          }}
        >
          <FiGrid />
          {loading ? 'Array Broadcasting...' : 'Execute 25-Parameter Sweep'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  Sweep Optimization Results
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Evaluated {results.combinations_evaluated} Combinations in <strong style={{color: '#d946ef'}}>{timingInfo}ms</strong>
                </span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Rank</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Parameter Combo</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Total Return</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Max Drawdown</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Sharpe Ratio</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((r, idx) => (
                    <tr key={idx} style={{ 
                        borderBottom: '1px solid var(--border)', 
                        background: idx === 0 ? 'rgba(217, 70, 239, 0.05)' : 'transparent' 
                    }}>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>#{idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>{r.Combination}</td>
                      <td style={{ padding: '8px', color: r['Total Return [%]'] >= 0 ? 'var(--accent-teal)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                          {r['Total Return [%]'] >= 0 ? '+' : ''}{r['Total Return [%]'].toFixed(2)}%
                      </td>
                      <td style={{ padding: '8px', color: 'var(--accent-amber)' }}>{r['Max Drawdown [%]'].toFixed(2)}%</td>
                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{r['Sharpe Ratio'].toFixed(2)}</td>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{r['Win Rate [%]'].toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default VectorbtDashboard;
