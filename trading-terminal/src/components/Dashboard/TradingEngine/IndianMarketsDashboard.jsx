import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCw, FiPieChart } from 'react-icons/fi';
import api from '@/services/api';

const IndianMarketsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [index, setIndex] = useState('NIFTY');

  const fetchOptionsChain = async () => {
    setLoading(true);
    try {
      const resp = await api.post('/indian_brokers/options', { index, expiry: '2026-03-26' });
      setData(resp.data);
    } catch (err) {
      console.error(err);
      setData({ error: "Failed to pull NSE Options Array." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOptionsChain();
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #10b981', borderColor: '#10b981' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPieChart color="#10b981" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Groww / Indian Markets (NSE/BSE)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Options Flow Bridge</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Real-time extraction of National Stock Exchange structured Options Arrays. Uses <strong>Groww / Upstox</strong> proxy architecture to abstract the heavy parsing required for Open Interest (OI) mapping on Indian indexes.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Index</label>
                <select 
                    className="input-field" 
                    value={index}
                    onChange={(e) => setIndex(e.target.value)}
                    disabled={loading}
                    style={{ width: '150px' }}
                >
                    <option value="NIFTY">NIFTY 50</option>
                    <option value="BANKNIFTY">BANKNIFTY</option>
                </select>
            </div>
            
            <button 
              className="btn" 
              onClick={fetchOptionsChain}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold' }}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} />
              {loading ? 'Synthesizing NSE Book...' : 'Fetch Live Market Depth'}
            </button>
        </div>

        {data && data.data && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', animation: 'fadeIn 0.5s ease' }}>
                
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                   <div style={{fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Underlying Spot Price</div>
                   <div style={{fontSize: '28px', color: 'white', fontWeight: 'bold'}}>
                      ₹{data.data.spot_price.toLocaleString()} <span style={{fontSize:'14px', color: '#10b981'}}>Live</span>
                   </div>
                </div>

                <div style={{ overflowX: 'auto', padding: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #333' }}>
                                <th style={{ padding: '8px', color: 'var(--accent-teal)' }}>Call (CE) LTP</th>
                                <th style={{ padding: '8px', color: 'var(--accent-teal)' }}>Call (CE) OI</th>
                                <th style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>Strike Price</th>
                                <th style={{ padding: '8px', color: 'var(--accent-rose)' }}>Put (PE) OI</th>
                                <th style={{ padding: '8px', color: 'var(--accent-rose)' }}>Put (PE) LTP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.data.strikes.map((strike, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px', color: 'var(--accent-teal)' }}>₹{strike.CE.lastPrice.toFixed(2)}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{(strike.CE.openInterest / 100000).toFixed(1)}L</td>
                                    <td style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold' }}>{strike.strikePrice}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{(strike.PE.openInterest / 100000).toFixed(1)}L</td>
                                    <td style={{ padding: '12px', color: 'var(--accent-rose)' }}>₹{strike.PE.lastPrice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default IndianMarketsDashboard;
