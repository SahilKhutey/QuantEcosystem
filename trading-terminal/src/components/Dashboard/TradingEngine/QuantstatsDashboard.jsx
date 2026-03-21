import React, { useState, useEffect } from 'react';
import { FiFileText, FiTrendingDown, FiTable } from 'react-icons/fi';
import api from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const QuantstatsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/quantstats/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to QuantStats API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #ef4444', borderColor: '#ef4444' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText color="#ef4444" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>QuantStats (Performance Tearsheet Metrics)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Strategy Analytics</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>QuantStats</strong> is a crucial library for in-depth portfolio performance analysis. It is explicitly designed to calculate and map mathematically stringent KPI variables over completed equity curves. It produces comprehensive HTML-style Tearsheets covering complex elements like Compounded Annual Growth (<code>CAGR</code>), <code>Sortino</code> ratios, Monthly Distribution Heatmaps, and the infamous <code>Underwater Plot</code> charting explicit drawdown durations and severities.
        </p>

        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#ef4444', color: '#fff', border: 'none'
          }}
        >
          <FiTable />
          {loading ? 'Crunching Historic Yields...' : 'Compute Full Reporting Tearsheet'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            {/* Top Level KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(results.metrics).map(([key, value], idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{key}</div>
                        <div style={{ fontSize: '22px', color: key === 'Max Drawdown' ? 'var(--accent-rose)' : 'white', fontWeight: 'bold' }}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Classical Underwater Plot */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <FiTrendingDown color="var(--accent-rose)" />
                    <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Drawdown Depths (Underwater Plot)</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Visually graphs the negative % displacement the strategy equity spent below its previous absolute All-Time-Highs over its lifetime. 0% indicates new highs are being made.
                </p>
                <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.underwater} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={50} />
                          <YAxis stroke="#888" tick={{fontSize: 10}} domain={['auto', 0]} tickFormatter={(v) => v.toFixed(0)+'%'} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                            formatter={(value) => [value.toFixed(2)+'%', 'Drawdown']}
                          />
                          <ReferenceLine y={0} stroke="#666" />
                          <Area type="monotone" dataKey="drawdown" stroke="var(--accent-rose)" fill="var(--accent-rose)" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Returns Heatmap */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Monthly Return Heatmap</h4>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Year</th>
                                {months.map(m => (
                                    <th key={m} style={{ padding: '8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{m}</th>
                                ))}
                                <th style={{ padding: '8px', color: 'white', borderBottom: '1px solid var(--border)' }}>YTD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.heatmap.map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>{row.Year}</td>
                                    {months.map(m => {
                                        const val = row[m];
                                        const color = val > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                                        const textCol = val > 0 ? 'var(--accent-teal)' : 'var(--accent-rose)';
                                        return (
                                            <td key={m} style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)', background: color, color: textCol }}>
                                                {(val * 100).toFixed(1)}%
                                            </td>
                                        );
                                    })}
                                    <td style={{ padding: '10px 8px', color: 'white', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                                        <span style={{ color: row.YTD > 0 ? 'var(--accent-teal)' : 'var(--accent-rose)'}}>
                                            {(row.YTD * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default QuantstatsDashboard;
