import React, { useState } from 'react';
import { FiGitCommit, FiLayers, FiPlay, FiCheckCircle } from 'react-icons/fi';

const UnifiedPipelineBuilder = () => {
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  
  // Pipeline Node States
  const [dataHarness, setDataHarness] = useState('yfinance');
  const [alphaEngine, setAlphaEngine] = useState('qlib');
  const [backtester, setBacktester] = useState('backtrader');
  const [portfolioOpt, setPortfolioOpt] = useState('pypfopt');
  const [executor, setExecutor] = useState('hummingbot');

  const [logs, setLogs] = useState([]);

  const runSystemicPipeline = () => {
    setDeploying(true);
    setDeployed(false);
    setLogs([]);

    const sequence = [
        "[SYSTEM] Allocating Isolated Environment...",
        "[NODE 1: DATA] Fetching multidimensional tensors via " + dataHarness.toUpperCase() + " module...",
        "[NODE 2: ALPHA] Training feature extraction matrices across " + alphaEngine.toUpperCase() + " AI engine...",
        "[NODE 3: ENGINE] Sweeping combinatorial hypergrids via " + backtester.toUpperCase() + " simulation...",
        "[NODE 4: OPTIM] Applying Modern Portfolio Theory weighting via " + portfolioOpt.toUpperCase() + "...",
        "[NODE 5: LIVE] Exposing limit order depth matrices natively via " + executor.toUpperCase() + "...",
        "[SUCCESS] Holistic Framework deployed into production memory."
    ];

    let step = 0;
    const interval = setInterval(() => {
        if (step < sequence.length) {
            setLogs(prev => [...prev, sequence[step]]);
            step++;
        } else {
            clearInterval(interval);
            setDeploying(false);
            setDeployed(true);
        }
    }, 800);
  };

  const getBadgeStyle = (nodeType) => {
    switch(nodeType) {
        case 'data': return { bg: 'rgba(56, 189, 248, 0.1)', border: '#38bdf8', color: '#38bdf8' }; // light blue
        case 'ml': return { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', color: '#a855f7' }; // purple
        case 'sim': return { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', color: '#f97316' }; // orange
        case 'opt': return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', color: '#10b981' }; // green
        case 'exec': return { bg: 'rgba(244, 63, 94, 0.1)', border: '#f43f5e', color: '#f43f5e' }; // rose
        default: return { bg: 'transparent', border: '#555', color: '#fff' };
    }
  };

  const PipelineNode = ({ title, type, value, setter, options }) => {
    const style = getBadgeStyle(type);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '160px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid ' + style.border, borderRadius: '8px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: style.color }}>{title}</span>
                <FiLayers color={style.color} size={14} />
            </div>
            <select 
                className="input-field"
                value={value}
                onChange={(e) => setter(e.target.value)}
                disabled={deploying}
                style={{ width: '100%', fontSize: '13px', border: '1px solid ' + style.border + '40', outline: 'none', background: '#111' }}
            >
                {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
            </select>
        </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '24px', border: '1px solid #c084fc', background: 'linear-gradient(to bottom right, #110e19, #1c152a)' }}>
      <div className="card-header" style={{ borderBottom: '1px solid rgba(192, 132, 252, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiGitCommit color="#c084fc" size={24} />
            <div>
                <h2 className="card-title" style={{ margin: 0, fontSize: '20px', color: '#f3e8ff' }}>Master Pipeline Orchestrator</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d8b4fe' }}>Unified Deployment Bridge establishing connectivity across all 19 integrated quantitative frameworks.</p>
            </div>
        </div>
      </div>
      
      <div className="card-body">
        
        {/* The Node Flow Graph */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            
            <PipelineNode title="1. Data Harness" type="data" value={dataHarness} setter={setDataHarness} options={[
                {val: 'yfinance', label: 'yfinance (History)'},
                {val: 'openbb', label: 'OpenBB (Unified)'},
                {val: 'ccxt', label: 'CCXT (Crypto API)'}
            ]} />

            <div style={{ color: '#555', padding: '0 4px', fontSize: '24px'}}>→</div>

            <PipelineNode title="2. Alpha / ML" type="ml" value={alphaEngine} setter={setAlphaEngine} options={[
                {val: 'qlib', label: 'Qlib (Microsoft)'},
                {val: 'tensortrade', label: 'TensorTrade (RL)'},
                {val: 'finrl', label: 'FinRL (PPO Agent)'},
                {val: 'prophet', label: 'Prophet (GAM)'},
                {val: 'alphalens', label: 'Alphalens (Factor)'}
            ]} />

            <div style={{ color: '#555', padding: '0 4px', fontSize: '24px'}}>→</div>

            <PipelineNode title="3. Simulator" type="sim" value={backtester} setter={setBacktester} options={[
                {val: 'backtrader', label: 'Backtrader'},
                {val: 'zipline', label: 'Zipline'},
                {val: 'freqtrade', label: 'Freqtrade / FreqAI'},
                {val: 'vectorbt', label: 'VectorBT (Numba)'},
                {val: 'backtestingpy', label: 'Backtesting.py'},
                {val: 'bt', label: 'bt (pmorissette)'}
            ]} />

            <div style={{ color: '#555', padding: '0 4px', fontSize: '24px'}}>→</div>

            <PipelineNode title="4. Optimizer" type="opt" value={portfolioOpt} setter={setPortfolioOpt} options={[
                {val: 'pypfopt', label: 'PyPortfolioOpt'},
                {val: 'quantstats', label: 'QuantStats'}
            ]} />

            <div style={{ color: '#555', padding: '0 4px', fontSize: '24px'}}>→</div>

            <PipelineNode title="5. Live Executor" type="exec" value={executor} setter={setExecutor} options={[
                {val: 'hummingbot', label: 'Hummingbot (HFT)'},
                {val: 'lean', label: 'LEAN (QuantConnect)'}
            ]} />

        </div>

        {/* Action Center */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '220px' }}>
                <button 
                  className="btn" 
                  onClick={runSystemicPipeline}
                  disabled={deploying}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    width: '100%', padding: '14px', fontSize: '14px',
                    background: deployed ? '#10b981' : (deploying ? '#555' : '#c084fc'), 
                    color: 'white', border: 'none', borderRadius: '8px',
                    boxShadow: deploying ? 'none' : '0 4px 14px rgba(192, 132, 252, 0.4)'
                  }}
                >
                  {deployed ? <><FiCheckCircle /> Pipeline Active</> : (deploying ? 'Bridging Node Topologies...' : <><FiPlay /> Deploy Full Ecosystem</>)}
                </button>
            </div>

            {/* Simulated Live Action Log */}
            <div style={{ flex: 1, height: '180px', background: '#09090b', border: '1px solid #333', borderRadius: '8px', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px' }}>
                {logs.length === 0 && !deploying && (
                    <span style={{ color: '#666' }}>&gt; Awaiting deployment linking 19 independent repositories... Select your pipeline nodes and initialize.</span>
                )}
                {logs.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: '6px', color: log.includes('[SUCCESS]') ? '#10b981' : (log.includes('NODE') ? '#c084fc' : '#aaa') }}>
                        &gt; {log}
                    </div>
                ))}
                {deploying && (
                    <div style={{ color: '#666', marginTop: '6px', animation: 'pulse 1s infinite' }}>&gt; Processing bridge connection _</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default UnifiedPipelineBuilder;
