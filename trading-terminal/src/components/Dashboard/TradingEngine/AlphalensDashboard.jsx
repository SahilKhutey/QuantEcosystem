import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiMenu } from 'react-icons/fi';
import api from '@/services/api';
import { ComposedChart, BarChart, LineChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const AlphalensDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/alphalens/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Alphalens API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #6366f1', borderColor: '#6366f1' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiMenu color="#6366f1" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Alphalens (Quantopian Factor Tear Sheets)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>Predictive Alpha Assesment</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>Alphalens</strong> is not a backtester. It is the premier institutional framework for <strong>evaluating Predictive Alpha Factors</strong> prior to execution. We analyze the raw cross-sectional predictive signal (such as a fundamental ratio or a deep-learning output) and chart its <code>Information Coefficient (IC)</code> and <code>Mean Returns by Factor Quantile</code>. This proves mathematically whether an underlying signal actually provides a probabilistic edge (e.g. going Long on the Top 20% and Shorting the Bottom 20%).
        </p>

        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#6366f1', color: '#fff', border: 'none'
          }}
        >
          <FiActivity />
          {loading ? 'Crunching Factor Matrices...' : 'Generate Alphalens Sector Tear Sheet'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {Object.entries(results.metrics).map(([key, value], idx) => (
                    <div key={idx} style={{ flex: 1, padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px' }}>
                            <FiTrendingUp color="#6366f1" size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>{key}</div>
                            <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '20px' }}>
                
                {/* Mean Returns by Factor Quantile */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Mean Return by Factor Quantile</h4>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Ideally Monotonic: Bottom Quintiles (Q1) crash heavily, Top Quintiles (Q5) rise heavily. Returns in Basis Points (bps).
                    </p>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results.quantiles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="Quantile" stroke="#888" tick={{fontSize: 10}} />
                              <YAxis stroke="#888" tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                              <ReferenceLine y={0} stroke="#666" />
                              <Bar 
                                dataKey="Returns (bps)" 
                                fill="#6366f1" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Information Coefficient (IC) Timeseries */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Information Coefficient (IC) Timeseries</h4>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Measures the Spearman rank correlation of factor predictions vs absolute reality. Consistently above 0 is highly predictive.
                    </p>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={results.information_coefficient} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={20} />
                              <YAxis stroke="#888" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                              <Legend />
                              <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" />
                              {/* Daily noisy IC points plotted as raw discrete dots/bars */}
                              <Bar dataKey="IC" fill="#6366f1" fillOpacity={0.6} barSize={3} />
                              {/* Smooth 30Day Moving Average of IC */}
                              <Line type="monotone" dataKey="IC (1M MA)" stroke="var(--accent-teal)" dot={false} strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlphalensDashboard;
