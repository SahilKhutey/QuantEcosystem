import React, { useState, useEffect } from 'react';
import { FiPieChart, FiTarget, FiCheckCircle } from 'react-icons/fi';
import api from '@/services/api';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

const PyPortfolioOptDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/pypfopt/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to PyPortfolioOpt API." });
    }
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #10b981', borderColor: '#10b981' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPieChart color="#10b981" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>PyPortfolioOpt (Markowitz Mean-Variance)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Portfolio Optimization</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>PyPortfolioOpt</strong> completely solves the capital allocation issue. Rather than merely generating trading signals, it ingests <code>Expected Returns</code> and <code>Covariance Matrices</code> across massive asset baskets to solve <strong>Modern Portfolio Theory</strong> via convex SciPy optimizers. It mathematically dictates the exact percentage Weights representing the absolute highest returning portfolio for the lowest measurable risk (The Max Sharpe Tangency Portfolio).
        </p>

        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#10b981', color: '#fff', border: 'none'
          }}
        >
          <FiTarget />
          {loading ? 'Solving Scipy Matrix Constraints...' : 'Generate New Markowitz Efficient Frontier'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {Object.entries(results.metrics).map(([key, value], idx) => (
                    <div key={idx} style={{ flex: 1, padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCheckCircle color="#10b981" size={24}/>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>{key}</div>
                            <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                
                {/* Scatter Plot representing the Frontier Edge */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>The Efficient Frontier (Risk / Reward)</h4>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        The theoretical Edge (highest returns for lowest Volatility). The optimal combination lies on the upper left fringe.
                    </p>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis type="number" dataKey="volatility" name="Volatility (Risk)" stroke="#888" tick={{fontSize: 10}} domain={['auto', 'auto']} tickFormatter={(v) => (v*100).toFixed(0)+'%'} />
                              <YAxis type="number" dataKey="return" name="Expected Return" stroke="#888" tick={{fontSize: 10}} domain={['auto', 'auto']} tickFormatter={(v) => (v*100).toFixed(0)+'%'} />
                              <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                              <Scatter name="Random Portfolios" data={results.frontier_curve} fill="#10b981" fillOpacity={0.4} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart representing the solved optimal asset distribution */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Solved Optimal Target Asset Weights</h4>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        The percentage allocations achieving the exact coordinates of the Max Sharpe "Tangency" portfolio calculated above.
                    </p>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                  data={results.optimal_weights}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="weight"
                                  nameKey="asset"
                                  label={({asset, percent}) => asset + ' ' + (percent * 100).toFixed(0) + '%'}
                                >
                                  {results.optimal_weights.map((entry, index) => (
                                    <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [(value*100).toFixed(2)+'%', 'Allocation Weight']} contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                                <Legend />
                            </PieChart>
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

export default PyPortfolioOptDashboard;
