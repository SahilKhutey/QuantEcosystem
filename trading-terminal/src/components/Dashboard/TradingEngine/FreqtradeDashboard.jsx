import React, { useState } from 'react';
import { FiTrendingUp, FiActivity, FiTerminal, FiCpu, FiTarget } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const FreqtradeDashboard = () => {
  const [activeTab, setActiveTab] = useState('backtest'); // 'backtest' | 'hyperopt'
  
  // Tab 1: Backtest
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);

  // Tab 2: FreqAI Hyperopt
  const [loadingHyperopt, setLoadingHyperopt] = useState(false);
  const [hyperoptResults, setHyperoptResults] = useState(null);
  const [epochs, setEpochs] = useState(100);

  const runBacktest = async () => {
    setLoadingBacktest(true);
    setBacktestResults(null);
    try {
      const resp = await api.post('/freqtrade/run', { start_balance: 5000, stake_amount: 1000 });
      setBacktestResults(resp.data);
    } catch (err) {
      console.error(err);
      setBacktestResults({ error: "Failed to connect to Freqtrade API." });
    }
    setLoadingBacktest(false);
  };

  const runHyperopt = async () => {
    setLoadingHyperopt(true);
    setHyperoptResults(null);
    try {
      const resp = await api.post('/freqtrade/hyperopt', { epochs: parseInt(epochs) });
      setHyperoptResults(resp.data);
    } catch (err) {
      console.error(err);
      setHyperoptResults({ error: "Failed to connect to FreqAI Hyperopt Engine." });
    }
    setLoadingHyperopt(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent-orange)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTerminal color="var(--accent-orange)" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Freqtrade & FreqAI Pipeline</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-orange)' }}>
            {activeTab === 'backtest' ? 'Live Dry-Run' : 'Genetic Optimizer'}
        </span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Freqtrade is the premier open-source crypto bot (`freqtrade/freqtrade`). It evaluates arbitrary `IStrategy` signals against vast asset whitelists. The true power lies in its **FreqAI** module encompassing the <code>hyperopt</code> engine, parsing thousands of structural epochs to genetically minimize the algorithmic objective loss function natively.
        </p>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
             <button 
                className="btn" 
                onClick={() => setActiveTab('backtest')}
                style={{ 
                    background: activeTab === 'backtest' ? 'var(--accent-orange)' : 'transparent', 
                    color: activeTab === 'backtest' ? 'white' : 'var(--text-secondary)',
                    border: activeTab === 'backtest' ? 'none' : '1px solid var(--border)'
                }}
            >
                <FiActivity style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Standard Backtester
            </button>
            <button 
                className="btn" 
                onClick={() => setActiveTab('hyperopt')}
                style={{ 
                    background: activeTab === 'hyperopt' ? '#a855f7' : 'transparent', 
                    color: activeTab === 'hyperopt' ? 'white' : 'var(--text-secondary)',
                    border: activeTab === 'hyperopt' ? 'none' : '1px solid var(--border)'
                }}
            >
                <FiCpu style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                FreqAI Hyperopt Studio
            </button>
        </div>

        {/* =============== TAB 1: STANDARD BACKTEST =============== */}
        {activeTab === 'backtest' && (
            <div>
                <button 
                className="btn" 
                onClick={runBacktest}
                disabled={loadingBacktest}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                    background: 'var(--accent-orange)', color: 'white', border: 'none'
                }}
                >
                <FiActivity />
                {loadingBacktest ? 'Booting Bot Daemon...' : 'Start Bot Simulation (60 Days)'}
                </button>

                {backtestResults && !backtestResults.error && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    Bot Statistics
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Starting Balance</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>${backtestResults.results.starting_balance.toFixed(2)}</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Current Balance</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>${backtestResults.results.current_balance.toFixed(2)}</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Profit</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: backtestResults.results.total_profit_abs >= 0 ? 'var(--accent-teal)' : 'var(--accent-rose)' }}>
                        {backtestResults.results.total_profit_abs >= 0 ? '+' : ''}${backtestResults.results.total_profit_abs.toFixed(2)} 
                        <span style={{ fontSize: '14px', marginLeft: '6px' }}>({(backtestResults.results.total_profit_pct * 100).toFixed(2)}%)</span>
                        </p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Win Rate</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{(backtestResults.results.win_rate * 100).toFixed(1)}%</p>
                    </div>
                    </div>

                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Trade Ledger ({backtestResults.results.total_closed_trades} Trades)</h4>
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Pair</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Open Date</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Exit Reason</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Open Rate</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Close Rate</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Profit Pct</th>
                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Profit Abs</th>
                        </tr>
                        </thead>
                        <tbody>
                        {backtestResults.results.trades.length > 0 ? backtestResults.results.trades.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>{t.pair}</td>
                            <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{t.open_date}</td>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)' }}><span className="badge">{t.exit_reason}</span></td>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{t.open_rate.toFixed(4)}</td>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{t.close_rate.toFixed(4)}</td>
                            <td style={{ padding: '8px', color: t.profit_ratio.includes('-') ? 'var(--accent-rose)' : 'var(--accent-teal)', fontWeight: 'bold' }}>{t.profit_ratio}</td>
                            <td style={{ padding: '8px', color: t.profit_abs.includes('-') ? 'var(--accent-rose)' : 'var(--accent-teal)' }}>{t.profit_abs}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No trades executed in this run.</td></tr>
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
                )}
                
                {backtestResults && backtestResults.error && (
                <div style={{ color: 'var(--accent-rose)', padding: '10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px' }}>
                    {backtestResults.error}
                </div>
                )}
            </div>
        )}

        {/* =============== TAB 2: FREQAI HYPEROPT =============== */}
        {activeTab === 'hyperopt' && (
            <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Search Epochs (Genetic Size)</label>
                        <input 
                            type="number"
                            step="50"
                            className="input-field" 
                            value={epochs}
                            onChange={(e) => setEpochs(Number(e.target.value))}
                            disabled={loadingHyperopt}
                            style={{ width: '160px' }}
                        />
                    </div>
                    
                    <button 
                    className="btn" 
                    onClick={runHyperopt}
                    disabled={loadingHyperopt}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                        background: '#a855f7', color: 'white', border: 'none'
                    }}
                    >
                    <FiCpu />
                    {loadingHyperopt ? 'Tuning Hyperparameters...' : 'Execute genetic `hyperopt` command'}
                    </button>
                </div>

                {hyperoptResults && !hyperoptResults.error && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiTarget color="#a855f7" size={18} />
                            <code style={{ color: '#a855f7', fontSize: '12px', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                                {hyperoptResults.message}
                            </code>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '20px' }}>
                        
                        {/* Epoch Convergence Graph */}
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <FiTrendingUp color="var(--text-secondary)" />
                                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Genomic Loss Trajectory ("Sharpe Objective")</h4>
                            </div>
                            
                            <div style={{ height: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hyperoptResults.results.epoch_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="epoch" stroke="#888" tick={{fontSize: 10}} minTickGap={20} />
                                    <YAxis stroke="#888" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                                        formatter={(value) => [value.toFixed(4), 'Objective Loss']}
                                        labelFormatter={(v) => 'Epoch ' + v}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="loss" name="Convergence (Minimization)" stroke="#a855f7" dot={false} strokeWidth={2} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        {/* Discovered Parameters Results */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', flex: 1 }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Discovered Objective Constants</h4>
                                
                                <div style={{ background: '#111', padding: '12px', borderRadius: '4px', border: '1px solid #333', fontFamily: 'monospace', fontSize: '12px', color: '#ccc', lineHeight: '1.6'}}>
                                    <span style={{color: '#a855f7'}}># Buy Space</span><br/>
                                    buy_rsi_t = {hyperoptResults.results.best_found_parameters.buy_rsi_threshold} <br/>
                                    <br/>
                                    <span style={{color: '#a855f7'}}># Sell Space</span><br/>
                                    sell_rsi_t = {hyperoptResults.results.best_found_parameters.sell_rsi_threshold} <br/>
                                    <br/>
                                    <span style={{color: '#a855f7'}}># Risk Space</span><br/>
                                    stoploss = {hyperoptResults.results.best_found_parameters.stoploss} <br/>
                                    <br/>
                                    <span style={{color: '#a855f7'}}># ROI Dictionary (Minutes: Profit %)</span><br/>
                                    {`{`} <br/>
                                    &nbsp;&nbsp;0: {hyperoptResults.results.best_found_parameters.minimal_roi_0m}, <br/>
                                    &nbsp;&nbsp;60: {hyperoptResults.results.best_found_parameters.minimal_roi_60m} <br/>
                                    {`}`}
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    </div>
                )}
                {hyperoptResults && hyperoptResults.error && (
                <div style={{ color: 'var(--accent-rose)', padding: '10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px' }}>
                    {hyperoptResults.error}
                </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default FreqtradeDashboard;
