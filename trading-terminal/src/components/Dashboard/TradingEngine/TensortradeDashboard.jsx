import React, { useState } from 'react';
import { FiTrendingUp, FiBox, FiCpu } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const TensortradeDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/tensortrade/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to TensorTrade API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-fuchsia)', borderColor: '#e879f9' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBox color="#e879f9" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>TensorTrade Environment (Modular RL)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(232, 121, 249, 0.1)', color: '#e879f9' }}>Discrete Sub-Modules</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Unlike monolithic tracking architectures, <strong>TensorTrade</strong> builds Reinforcement Learning Markov Decision Processes by mixing and matching distinctly separate components. A standard <code>TradingEnv</code> is merely an assembly wrapper for distinct <code>ActionSchemes</code>, <code>RewardSchemes</code>, and <code>DataFeeds</code>.
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#e879f9', color: 'white', border: 'none'
          }}
        >
          <FiCpu />
          {loading ? 'Assembling RL Modules...' : 'Assemble Environment & Run Model'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Action Scheme</div>
                    <div style={{ fontSize: '15px', color: '#e879f9', fontWeight: 'bold' }}>{results.config.ActionScheme}</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Reward Scheme</div>
                    <div style={{ fontSize: '15px', color: '#e879f9', fontWeight: 'bold' }}>{results.config.RewardScheme}</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Broker Engine</div>
                    <div style={{ fontSize: '15px', color: '#e879f9', fontWeight: 'bold' }}>{results.config.Broker}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  Evaluated Agent Performance
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Return: <strong style={{color: 'var(--accent-teal)'}}>+{results.metrics['Total Return [%]']}%</strong>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Net Worth: <strong style={{color: 'white'}}>${results.metrics['Final Equity [$]']}</strong>
                    </span>
                </div>
            </div>
            
            <div style={{ height: '240px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.timeseries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} tickFormatter={(val) => '$' + val} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value) => ['$' + value.toFixed(2), 'Net Worth']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="equity" name="OOS Net Worth" stroke="#e879f9" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)'}}>Discrete AI Action Intent Ledger (Last 10 Executions):</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Policy Action</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Executed Qty</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Exec. Price</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Sharpe Feedback Step</th>
                  </tr>
                </thead>
                <tbody>
                  {results.ledger.map((trade, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{trade.date}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: trade.action === 'BUY' ? 'var(--accent-teal)' : 'var(--accent-rose)' }}>{trade.action}</td>
                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{trade.qty.toFixed(4)}</td>
                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>${trade.price.toFixed(2)}</td>
                      <td style={{ padding: '8px', color: trade.reward >= 0 ? 'var(--accent-teal)' : 'var(--accent-rose)' }}>{trade.reward > 0 ? '+' : ''}{trade.reward.toFixed(4)}</td>
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

export default TensortradeDashboard;
