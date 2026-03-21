import React, { useState, useEffect } from 'react';
import { FiCpu, FiPlay, FiServer, FiLayers } from 'react-icons/fi';
import api from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from 'recharts';

const HummingbotDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // High Frequency Config Parameters
  const [bidSpread, setBidSpread] = useState(0.2); // Percentage
  const [askSpread, setAskSpread] = useState(0.2);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/hummingbot/run', { 
          bid_spread: bidSpread / 100, 
          ask_spread: askSpread / 100, 
          order_amount: 0.1 
      });
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Hummingbot API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #0ea5e9', borderColor: '#0ea5e9' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu color="#0ea5e9" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Hummingbot (High-Frequency Trading)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>Pure Market Making</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>Hummingbot</strong> ignores historical Candle OHLC logic entirely. It is a live-execution engine designed exclusively for <strong>Market Making</strong> and exchange arbitrage. By operating highly parametric bots natively in Cython, it continually sweeps current centralized/decentralized Orderbooks, places Maker Limit Bids and Asks on both sides of the moving spread, captures the arbitrary variance, and strictly enforces <code>Inventory Skew</code> boundaries at high speeds.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bid Spread (%)</label>
                <input 
                    type="number"
                    step="0.05"
                    className="input-field" 
                    value={bidSpread}
                    onChange={(e) => setBidSpread(Number(e.target.value))}
                    disabled={loading}
                    style={{ width: '120px' }}
                />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ask Spread (%)</label>
                <input 
                    type="number"
                    step="0.05"
                    className="input-field" 
                    value={askSpread}
                    onChange={(e) => setAskSpread(Number(e.target.value))}
                    disabled={loading}
                    style={{ width: '120px' }}
                />
            </div>

            <button 
              className="btn" 
              onClick={runSimulation}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                background: '#0ea5e9', color: 'white', border: 'none'
              }}
            >
              <FiPlay />
              {loading ? 'Submitting Order Matrix...' : 'Execute PMM Tick Cycle'}
            </button>
        </div>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiServer color="#0ea5e9" size={18} />
                    <code style={{ color: '#0ea5e9', fontSize: '12px', background: 'rgba(14, 165, 233, 0.1)', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                        {results.message}
                    </code>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '20px' }}>
                
                {/* Active Limit Order Depth Chart mapping the pure parameters */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FiLayers color="var(--text-secondary)" />
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Internal Orderbook Limits (PMM Strategy)</h4>
                    </div>
                    
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={results.depth_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis type="number" dataKey="price" domain={['dataMin', 'dataMax']} tickFormatter={(v) => '$' + v.toFixed(0)} stroke="#888" tick={{fontSize: 10}} />
                              <YAxis stroke="#888" tick={{fontSize: 10}} tickFormatter={(v) => v.toFixed(2)} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                                labelFormatter={(v) => 'Price Level: $' + Number(v).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              />
                              <Legend />
                              {/* Central Mid Price Line representing nothingness */}
                              <Area type="step" dataKey="bidDepth" name="Cumulative Robotic Bids" stroke="var(--accent-teal)" fill="var(--accent-teal)" fillOpacity={0.3} strokeWidth={2} />
                              <Area type="step" dataKey="askDepth" name="Cumulative Robotic Asks" stroke="var(--accent-rose)" fill="var(--accent-rose)" fillOpacity={0.3} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Inventory Balances HUD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', flex: 1 }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Current State Hash</h4>
                        {Object.entries(results.metrics).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{k}</span>
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Inventory Skew Constraints</h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)'}}>Base (BTC)</span>
                            <span style={{ color: 'white', fontWeight: 'bold'}}>{results.inventory.base_pct.toFixed(2)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ width: results.inventory.base_pct + '%', height: '100%', background: 'var(--accent-teal)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)'}}>Quote (USDT)</span>
                            <span style={{ color: 'white', fontWeight: 'bold'}}>{results.inventory.quote_pct.toFixed(2)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: results.inventory.quote_pct + '%', height: '100%', background: '#0ea5e9' }} />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.5 }}>
                            The bot maintains continuous Bid/Ask depth parameters symmetrically. If inventory skew crosses limits (e.g. holding 80% BTC), it ceases bidding entirely to naturally offload inventory constraints via remaining ask layers.
                        </p>
                    </div>
                </div>

            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default HummingbotDashboard;
