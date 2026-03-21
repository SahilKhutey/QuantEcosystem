import React, { useState, useEffect } from 'react';

// Mock components for the dashboard - in production these would be separate files
const StrategyCard = ({ name, data }) => (
  <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 hover:border-blue-500 transition-all">
    <h3 className="text-xl font-bold uppercase tracking-wider text-blue-400 mb-2">{name}</h3>
    <div className="flex justify-between items-center">
      <span className="text-slate-400">Signal:</span>
      <span className={`font-mono px-2 py-1 rounded ${
        data?.signal?.includes('BUY') ? 'bg-green-900 text-green-400' : 
        data?.signal?.includes('SELL') ? 'bg-red-900 text-red-400' : 
        'bg-slate-700 text-slate-300'
      }`}>
        {data?.signal || 'HOLD'}
      </span>
    </div>
    <div className="mt-4">
      <div className="text-sm text-slate-500">Confidence</div>
      <div className="w-full bg-slate-700 h-2 rounded-full mt-1">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${(data?.confidence || 0) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

const PortfolioOverview = ({ data }) => (
  <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800 col-span-1 md:col-span-2">
    <h2 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="text-slate-500 text-sm">Total Value</div>
        <div className="text-2xl font-mono text-white">${data?.total_value?.toLocaleString() || '0'}</div>
      </div>
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="text-slate-500 text-sm">Daily P&L</div>
        <div className={`text-2xl font-mono ${data?.daily_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {data?.daily_pnl >= 0 ? '+' : ''}{data?.daily_pnl?.toLocaleString() || '0'}
        </div>
      </div>
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="text-slate-500 text-sm">Active Positions</div>
        <div className="text-2xl font-mono text-white">{data?.active_positions || 0}</div>
      </div>
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="text-slate-500 text-sm">Risk Score</div>
        <div className="text-2xl font-mono text-amber-400">{data?.risk_score || 0}/100</div>
      </div>
    </div>
  </div>
);

const RiskDashboard = ({ strategies }) => (
  <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
    <h2 className="text-xl font-bold text-white mb-4">Risk Distribution</h2>
    <div className="space-y-4">
      {Object.entries(strategies).map(([name, data]) => (
        <div key={name} className="flex items-center gap-4">
          <span className="text-slate-400 w-24 text-sm truncate">{name}</span>
          <div className="flex-1 bg-slate-700 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full" 
              style={{ width: `${(data?.allocation_pct || 0) || 0}%` }}
            />
          </div>
          <span className="text-slate-300 text-sm font-mono">{data?.allocation_pct || 0}%</span>
        </div>
      ))}
    </div>
  </div>
);

const MultiStrategyDashboard = () => {
    const [strategies, setStrategies] = useState({});
    const [portfolio, setPortfolio] = useState({
        total_value: 100000,
        daily_pnl: 1250,
        active_positions: 3,
        risk_score: 42
    });
    
    useEffect(() => {
        // WebSocket connection for real-time updates
        const ws = new WebSocket('ws://localhost:8001/ws/strategies');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.strategies) setStrategies(data.strategies);
            if (data.portfolio) setPortfolio(data.portfolio);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            // Fallback for demo purposes
            setStrategies({
                scalping: { signal: 'BUY', confidence: 0.8, allocation_pct: 15 },
                swing: { signal: 'HOLD', confidence: 0.2, allocation_pct: 30 },
                momentum: { signal: 'STRONG_BUY', confidence: 0.9, allocation_pct: 25 },
                mean_reversion: { signal: 'SELL', confidence: 0.6, allocation_pct: 10 },
                algorithmic: { signal: 'BUY', confidence: 0.7, allocation_pct: 20 }
            });
        };
        
        return () => ws.close();
    }, []);
    
    return (
        <div className="p-8 bg-slate-950 min-h-screen font-sans text-slate-200">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">PORTFOLIO COMMAND</h1>
                    <p className="text-slate-500 border-l-2 border-blue-500 pl-4 mt-2">Real-time Multi-Strategy Execution Engine</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 uppercase tracking-widest">Market Status</div>
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        OPEN
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Strategy Performance Cards */}
                {Object.entries(strategies).map(([name, data]) => (
                    <StrategyCard key={name} name={name} data={data} />
                ))}
                
                {/* Portfolio Overview */}
                <PortfolioOverview data={portfolio} />
                
                {/* Risk Dashboard */}
                <RiskDashboard strategies={strategies} />
            </div>
        </div>
    );
};

export default MultiStrategyDashboard;
