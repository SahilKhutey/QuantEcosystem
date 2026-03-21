import React, { useState } from 'react';
import { FiTrendingUp, FiLayers, FiList } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const BtDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/bt/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to bt framework API." });
    }
    setLoading(false);
  };

  const colors = {
      'TECH_ALPHA_weight': '#3b82f6',
      'BLUE_CHIP_weight': '#10b981',
      'BONDS_ETF_weight': '#f59e0b',
      'GOLD_TRUST_weight': '#8b5cf6'
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-orange)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiLayers color="var(--accent-orange)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>bt Framework (Asset Allocation)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)' }}>Procedural Node Evaluation</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Evaluate portfolio structures using the highly modular <strong>bt</strong> Node pipeline engine! Instead of event-driven ticks, strategies are built via "Algos" that execute procedurally sequentially down a tree. This is the optimal architecture for Asset Allocation and Rebalancing backtests.
        </p>

        <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)'}}>Strategy Definition Pipeline:</h4>
            <pre style={{ margin: 0, color: 'var(--accent-green)', fontFamily: 'monospace', fontSize: '13px' }}>
{`s_eq_weight = Strategy('Equal Weight Portfolio', [
  RunMonthly(),    # Halt daily operations; proceed only on month boundary
  SelectAll(),     # Include all 4 mock assets
  WeighEqually(),  # Dictate 25% target weights each
  Rebalance()      # Execute market trades to achieve the 25% targets
])`}
            </pre>
        </div>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: 'var(--accent-orange)', color: 'white', border: 'none'
          }}
        >
          <FiList />
          {loading ? 'Executing Pipeline Nodes...' : 'Run Portfolio Rebalancer'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  Execution Summary
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Return: <strong style={{color: 'var(--accent-teal)'}}>+{results.metrics['Total Return [%]']}%</strong>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Target Weights: <strong style={{color: 'white'}}>25.0% Each</strong>
                    </span>
                </div>
            </div>
            
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)'}}>Portfolio Allocation Weights Over Time (The Rebalancing Effect):</h4>
            <div style={{ height: '300px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.timeseries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis domain={[0, 50]} stroke="#888" tick={{fontSize: 12}} tickFormatter={(val) => val + '%'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value) => [value + '%', 'Weight']}
                  />
                  <Legend />
                  <Line type="stepAfter" dataKey="TECH_ALPHA_weight" name="TECH_ALPHA (25%)" stroke={colors['TECH_ALPHA_weight']} dot={false} strokeWidth={2} />
                  <Line type="stepAfter" dataKey="BLUE_CHIP_weight" name="BLUE_CHIP (25%)" stroke={colors['BLUE_CHIP_weight']} dot={false} strokeWidth={2} />
                  <Line type="stepAfter" dataKey="BONDS_ETF_weight" name="BONDS_ETF (25%)" stroke={colors['BONDS_ETF_weight']} dot={false} strokeWidth={2} />
                  <Line type="stepAfter" dataKey="GOLD_TRUST_weight" name="GOLD_TRUST (25%)" stroke={colors['GOLD_TRUST_weight']} dot={false} strokeWidth={2} />
                </LineChart>
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

export default BtDashboard;
