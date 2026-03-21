import React, { useState, useEffect } from 'react';
import { FiGlobe, FiDatabase, FiRefreshCw, FiLayers } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Area, AreaChart } from 'recharts';

const CcxtDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [exchange, setExchange] = useState('binance');
  const [symbol, setSymbol] = useState('BTC/USDT');

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/ccxt/run', { exchange, symbol });
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to unified CCXT API." });
    }
    setLoading(false);
  };

  // Run on first mount
  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #f59e0b', borderColor: '#f59e0b' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiLayers color="#f59e0b" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>CCXT (Market Data Normalization Library)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Data Adapters</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Stepping away from predictive algorithms, <strong>CCXT (CryptoCurrency eXchange Trading Library)</strong> focuses purely on structural engineering data parity. It abstracts the deeply erratic, diverging websocket and REST syntaxes of 100+ different crypto exchanges (Binance, Kraken, Coinbase) and parses them into a single, identical, predictable JSON dictionary for quantitative trading systems!
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Exchange Connector</label>
                <select 
                    className="input-field" 
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    disabled={loading}
                    style={{ width: '200px' }}
                >
                    <option value="binance">Binance</option>
                    <option value="kraken">Kraken</option>
                </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Universal Asset Ticker</label>
                <select 
                    className="input-field" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    disabled={loading}
                    style={{ width: '150px' }}
                >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                </select>
            </div>

            <button 
              className="btn" 
              onClick={runSimulation}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                background: '#f59e0b', color: '#000', border: 'none', fontWeight: 'bold'
              }}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} />
              {loading ? 'Normalizing Exchange Connection...' : 'Fetch Normalized REST Stream'}
            </button>
        </div>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            {/* Unified Universal Ticker Widget */}
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)', borderBottom: '1px dotted var(--border)', paddingBottom: '8px' }}>
                Universal Normalized Ticker JSON Object <code>[{results.exchange} : {results.symbol}]</code>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Last Price</div>
                    <div style={{ fontSize: '24px', color: 'white', fontWeight: 'bold' }}>
                        ${results.normalized_ticker.last.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>24h Delta (USD)</div>
                    <div style={{ fontSize: '24px', color: results.normalized_ticker.change24h >= 0 ? 'var(--accent-teal)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                        {results.normalized_ticker.change24h >= 0 ? '+' : ''}{results.normalized_ticker.change24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>24h Delta (%)</div>
                    <div style={{ fontSize: '24px', color: results.normalized_ticker.percent24h >= 0 ? 'var(--accent-teal)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                        {results.normalized_ticker.percent24h >= 0 ? '+' : ''}{results.normalized_ticker.percent24h.toFixed(3)}%
                    </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>24h Base Volume</div>
                    <div style={{ fontSize: '24px', color: '#f59e0b', fontWeight: 'bold' }}>
                        {results.normalized_ticker.baseVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {results.symbol.split('/')[0]}
                    </div>
                </div>
            </div>

            {/* CCXT Cumulative Orderbook Render (Market Depth) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                      Interactive Market Depth (Order Book)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Regardless of API source structure, CCXT allows identical parsing of Bid/Ask cumulative liquidity pools.
                    </p>
                </div>
            </div>
            
            <div style={{ height: '300px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.market_depth} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="price" stroke="#888" tick={{fontSize: 10}} type="number" domain={['dataMin', 'dataMax']} tickFormatter={(v) => '$'+v.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}/>
                  <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => v.toFixed(2)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa', marginBottom: '5px' }}
                    labelFormatter={(v) => 'Price Level: $' + Number(v).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  />
                  {/* Bids: Buy orders scaling down on the left */}
                  <Area type="step" dataKey="bidDepth" name="Cumulative Bids" stroke="var(--accent-teal)" fill="var(--accent-teal)" fillOpacity={0.2} />
                  {/* Asks: Sell orders scaling up on the right */}
                  <Area type="step" dataKey="askDepth" name="Cumulative Asks" stroke="var(--accent-rose)" fill="var(--accent-rose)" fillOpacity={0.2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)'}}>Underlying Raw Native Dictionary Snippet (Before CCXT Schema Normalization):</h4>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', height: '120px', overflowY: 'auto' }}>
                <pre style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                    {JSON.stringify(results.raw_payload_snippet, null, 2)}
                </pre>
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

export default CcxtDashboard;
