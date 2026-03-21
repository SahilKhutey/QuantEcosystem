import React, { useState, useEffect } from 'react';
import { FiDatabase, FiGrid, FiBarChart2 } from 'react-icons/fi';
import api from '@/services/api';
import { ComposedChart, AreaChart, Area, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const OpenBBDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Toggling the OpenBB Nested Namespace
  const [module, setModule] = useState('stocks'); 
  const [symbol, setSymbol] = useState('AAPL');

  const handleModuleChange = (newModule) => {
      setModule(newModule);
      if (newModule === 'stocks') setSymbol('AAPL');
      if (newModule === 'crypto') setSymbol('BTC-USD');
      if (newModule === 'economy') setSymbol('Interest_Rates');
  }

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/openbb/run', { module, symbol });
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to OpenBB API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #f97316', borderColor: '#f97316' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiDatabase color="#f97316" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>OpenBB (Open Data Platform)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>Unified Abstract API</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>OpenBB</strong> (<code>OpenBB-finance/OpenBB</code>) is the definitive terminal for normalizing quantitative financial data. Rather than wrestling with dozens of varying vendor APIs (Yahoo, Polygon, FRED, Binance), OpenBB maps hundreds of integrations into a single, standardized, nested Python namespace hierarchy representation. You execute <code>obbb.stocks.load()</code>, <code>obbb.crypto.load()</code>, or <code>obbb.economy.macro()</code> and OpenBB handles the translation seamlessly.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button 
                className="btn" 
                onClick={() => handleModuleChange('stocks')}
                style={{ 
                    background: module === 'stocks' ? '#f97316' : 'rgba(255,255,255,0.05)', 
                    color: module === 'stocks' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid #f97316'
                }}
            >
                obbb.stocks.load()
            </button>
            <button 
                className="btn" 
                onClick={() => handleModuleChange('crypto')}
                style={{ 
                    background: module === 'crypto' ? '#f97316' : 'rgba(255,255,255,0.05)', 
                    color: module === 'crypto' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid #f97316'
                }}
            >
                obbb.crypto.load()
            </button>
            <button 
                className="btn" 
                onClick={() => handleModuleChange('economy')}
                style={{ 
                    background: module === 'economy' ? '#f97316' : 'rgba(255,255,255,0.05)', 
                    color: module === 'economy' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid #f97316'
                }}
            >
                obbb.economy.macro()
            </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Argument</label>
                <input 
                    type="text"
                    className="input-field" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    disabled={loading}
                    style={{ width: '150px' }}
                />
            </div>

            <button 
              className="btn" 
              onClick={runSimulation}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555'
              }}
            >
              <FiGrid />
              {loading ? 'Resolving Backend Provider...' : 'Execute Namespace Command'}
            </button>
        </div>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBarChart2 color="#f97316" size={18} />
                    <code style={{ color: '#f97316', fontSize: '14px', background: 'rgba(249, 115, 22, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {results.message}
                    </code>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Resolved Provider: <strong style={{ color: 'white', textTransform: 'uppercase'}}>{results.provider}</strong>
                </div>
            </div>

            <div style={{ height: '320px', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <ResponsiveContainer width="100%" height="100%">
                
                {results.type === "candlestick" ? (
                    <ComposedChart data={results.dataset} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={30} />
                      <YAxis yAxisId="price" domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => '$'+v} />
                      <YAxis yAxisId="volume" orientation="right" stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => (v/1000).toFixed(0)+'K'} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                        labelStyle={{ color: '#aaa', marginBottom: '5px' }}
                      />
                      <Legend />
                      <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#f97316" opacity={0.3} barSize={6} />
                      <Line yAxisId="price" type="monotone" dataKey="close" name="Close Price" stroke="#f97316" dot={false} strokeWidth={2} />
                    </ComposedChart>
                ) : (
                    <AreaChart data={results.dataset} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={20} />
                        <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => v.toFixed(2)+'%'} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                            formatter={(value) => [value.toFixed(2)+'%', 'Federal Interest Rate']}
                        />
                        <Area type="monotone" dataKey="rate" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                )}

              </ResponsiveContainer>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenBBDashboard;
