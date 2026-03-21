import React, { useState } from 'react';
import { FiTrendingUp, FiActivity, FiFileText } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ZiplineDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/zipline/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Zipline API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-teal)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText color="var(--accent-teal)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Zipline Quantopian Engine</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>Research Mode</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Execute Pythonic algorithmic trading models mimicking Quantopian's Zipline API. Features a functional `Pipeline` engine for factor computation and output analytics formatted as PyFolio Tear Sheets.
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: 'var(--accent-teal)', color: 'white', border: 'none'
          }}
        >
          <FiActivity />
          {loading ? 'Evaluating Algorithm...' : 'Run Zipline Backtest'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              PyFolio Tear Sheet
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              {Object.entries(results.stats).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>{k}</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: k === 'Max Drawdown' ? 'var(--accent-amber)' : 'var(--accent-teal)' }}>{v}</p>
                </div>
              ))}
            </div>

            {results.equity_curve && results.equity_curve.length > 0 && (
              <div style={{ height: '300px', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Portfolio Value (Equity Curve)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.equity_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 10}} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{fontSize: 10}} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                       itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--accent-teal)" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
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

export default ZiplineDashboard;
