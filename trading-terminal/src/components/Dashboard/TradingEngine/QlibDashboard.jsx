import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDatabase, FiCheckCircle } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Bar } from 'recharts';

const QlibDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Simulated ML Pipeline Progress State
  const [progressState, setProgressState] = useState(0);
  const pipelineSteps = [
      "Idle",
      "Fetching Universal Dataset (Arctic DB)...",
      "Engineering Cross-Sectional Features...",
      "Training Supervised Regressor (LightGBM)...",
      "Inferencing Forward-Return Alpha Scores...",
      "Executing Top-K Portfolio Backtest..."
  ];

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    setProgressState(1);
    
    // Fake progress progression for UX
    const timer1 = setTimeout(() => setProgressState(2), 1000);
    const timer2 = setTimeout(() => setProgressState(3), 2500);
    const timer3 = setTimeout(() => setProgressState(4), 4500);
    const timer4 = setTimeout(() => setProgressState(5), 5500);

    try {
      const resp = await api.post('/qlib/run', {});
      
      // Clean up timers if API returns early
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4);
      
      setProgressState(6); // Done
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setProgressState(0);
      setResults({ error: "Failed to assemble Qlib ML pipeline." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #00a4ef', borderColor: '#00a4ef' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiDatabase color="#00a4ef" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Microsoft Qlib (Supervised ML Alpha)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(0, 164, 239, 0.1)', color: '#00a4ef' }}>End-to-End Pipeline</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>Qlib</strong> transitions us from simple logic rules directly into Supervised Machine Learning. It fetches massive <i>Dataset Zoos</i>, generates technical features, trains gradient-boosting trees (like <code>LightGBM</code>) to output continuous Alpha Predictions, and executes <code>Top-K</code> Long/Short decile portfolios.
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: '#00a4ef', color: 'white', border: 'none'
          }}
        >
          <FiDatabase />
          {loading ? 'Processing ML Pipeline...' : 'Run Quantitative AI Research Pipeline'}
        </button>

        {loading && progressState > 0 && progressState < 6 && (
            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Executing AI Pipeline:</span>
                    <span style={{ color: '#00a4ef', fontSize: '13px', fontWeight: 'bold' }}>Step {progressState}/5</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: ((progressState / 5) * 100) + '%', background: '#00a4ef', height: '100%', transition: 'width 0.3s ease' }}></div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'transparent transparent #00a4ef #00a4ef' }}></div>
                    {pipelineSteps[progressState]}
                </div>
            </div>
        )}

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(0, 164, 239, 0.05)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCheckCircle color="#00a4ef" size={24}/>
                    <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Execution Time</div>
                        <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{results.metrics['Execution Time [s]']}s</div>
                    </div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(0, 164, 239, 0.05)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCheckCircle color="#00a4ef" size={24}/>
                    <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Avg Information Coefficient (IC)</div>
                        <div style={{ fontSize: '16px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{results.metrics['Average IC (Information Coefficient)'].toFixed(4)}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  Top-K Alpha Strategy Backtest
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
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                The <span style={{color: '#00a4ef'}}>Blue Bars</span> represent the Information Coefficient (IC). This is the Pearson correlation proving the Machine Learning model correctly predicted the forward-returns of the cross-sectional universe on that specific day. The <span style={{color: 'var(--accent-teal)'}}>Green Line</span> shows the Long/Short equity compounding.
            </p>

            <div style={{ height: '300px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.timeseries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} tickFormatter={(val) => '$' + val} />
                  <YAxis yAxisId="right" orientation="right" domain={[-0.1, 0.1]} stroke="#888" tick={{fontSize: 12}} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="ic" name="Information Coefficient (IC)" fill="#00a4ef" fillOpacity={0.6} barSize={4} />
                  <Line yAxisId="left" type="monotone" dataKey="equity" name="Top-K Net Worth" stroke="var(--accent-teal)" dot={false} strokeWidth={2} />
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

export default QlibDashboard;
