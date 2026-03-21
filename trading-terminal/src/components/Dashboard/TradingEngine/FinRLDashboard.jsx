import React, { useState } from 'react';
import { FiTrendingUp, FiCpu, FiPlay } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart } from 'recharts';

const FinRLDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/finrl/run', {});
      setResults(resp.data);
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to FinRL execution API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-cyan)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu color="var(--accent-cyan)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>FinRL Framework (Deep Reinforcement Learning)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>OpenAI Gym MDP</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Welcome to the cutting edge of quantitative finance. <strong>FinRL</strong> models trading strictly as a Markov Decision Process (MDP). Rather than hard-coding signal rules, a Deep Neural Network (DQN, PPO, A2C) learns optimal trading policies by maximizing cumulative Return Rewards over thousands of synthetic training epochs!
        </p>
        
        <button 
          className="btn" 
          onClick={runSimulation}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
            background: 'var(--accent-cyan)', color: 'white', border: 'none'
          }}
        >
          <FiPlay />
          {loading ? 'Executing Proximal Policy Optimization Epochs...' : 'Train AI Agent & Evaluate'}
        </button>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            
            {/* Phase 1: Training Curve */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--text-primary)', borderBottom: '1px dotted var(--border)', paddingBottom: '6px' }}>
                Phase 1: Agent Training Convergence (PPO)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                The agent repeatedly interacts with the Gym Environment. Notice how the <span style={{color: 'var(--accent-cyan)'}}>Episodic Reward</span> increases while the <span style={{color: 'var(--accent-rose)'}}>Policy Loss</span> decays over epochs.
              </p>
              
              <div style={{ height: '220px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={results.training_epochs} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="epoch" stroke="#888" tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" stroke="#888" tick={{fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                      labelStyle={{ color: '#aaa' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="episodic_reward" name="Reward Score" stroke="var(--accent-cyan)" strokeWidth={2} dot={true} />
                    <Line yAxisId="right" type="monotone" dataKey="policy_loss" name="Policy Loss" stroke="var(--accent-rose)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phase 2: Out of sample evaluation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 10px 0', borderBottom: '1px dotted var(--border)', paddingBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
                    Phase 2: Out-Of-Sample Evaluation Backtest
                  </h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          DRL AI Return: <strong style={{color: 'var(--accent-teal)'}}>+{results.metrics['Total Return [%]']}%</strong>
                      </span>
                  </div>
              </div>
              
              <div style={{ height: '240px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.evaluation_timeseries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                    <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} tickFormatter={(val) => '$' + val} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                      labelStyle={{ color: '#aaa' }}
                      formatter={(value) => ['$' + value, 'AI Portfolio Value']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="equity" name="Model Portfolio Value" stroke="var(--accent-teal)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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

export default FinRLDashboard;
