import React, { useState, useEffect } from 'react';
import { FiDownloadCloud, FiBarChart2, FiInfo } from 'react-icons/fi';
import api from '@/services/api';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const YFinanceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('3mo');

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/yfinance/run', { symbol, period });
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to YFinance API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #7c3aed', borderColor: '#7c3aed' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiDownloadCloud color="#7c3aed" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>yfinance (Yahoo Finance Downloader)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>Data Access API</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>yfinance</strong> is the most ubiquitous python library in quantitative finance. It is an indispensable wrapper for rapidly pulling Pandas-friendly historical Price Data (<code>Open, High, Low, Close, Volume</code>) alongside Ticker Metadata and Corporate Actions (Dividends, Splits) directly from the Yahoo! Finance APIs.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Equity Symbol</label>
                <input 
                    type="text"
                    className="input-field" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    disabled={loading}
                    style={{ width: '120px' }}
                />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>lookback Period</label>
                <select 
                    className="input-field" 
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    disabled={loading}
                    style={{ width: '120px' }}
                >
                    <option value="1mo">1 Month</option>
                    <option value="3mo">3 Months</option>
                    <option value="6mo">6 Months</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>

            <button 
              className="btn" 
              onClick={runSimulation}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                background: '#7c3aed', color: 'white', border: 'none'
              }}
            >
              <FiBarChart2 />
              {loading ? 'Fetching Native Pandas History...' : 'Download via yfinance()'}
            </button>
        </div>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  {results.metadata.shortName} ({results.metadata.symbol})
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)'}}>
                    <span>Sector: <strong>{results.metadata.sector}</strong></span>
                    <span>Industry: <strong>{results.metadata.industry}</strong></span>
                </div>
            </div>

            <div style={{ height: '350px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={30} />
                  
                  {/* Left Axis for Price */}
                  <YAxis yAxisId="price" domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => '$'+v} />
                  {/* Right Axis for Volume */}
                  <YAxis yAxisId="volume" orientation="right" strike="#888" tick={{fontSize: 10}} tickFormatter={(v) => (v/1000000).toFixed(1)+'M'} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa', marginBottom: '5px' }}
                    formatter={(value, name) => {
                        if (name === 'Closing Price') return ['$' + value.toFixed(2), name];
                        if (name === 'Volume') return [value.toLocaleString(), name];
                        if (name === 'Dividend Paid') return ['+$' + value.toFixed(2), name];
                        return [value, name];
                    }}
                  />
                  <Legend />
                  
                  {/* The Volume Bars map to right axis */}
                  <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#4B5563" opacity={0.5} barSize={8} />
                  {/* Dividend Hits */}
                  <Bar yAxisId="price" dataKey="dividend" name="Dividend Paid" fill="var(--accent-teal)" barSize={4} />
                  {/* The Price Line maps to left axis */}
                  <Line yAxisId="price" type="monotone" dataKey="close" name="Closing Price" stroke="#7c3aed" dot={false} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
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

export default YFinanceDashboard;
