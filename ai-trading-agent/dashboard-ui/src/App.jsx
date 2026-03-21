import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertCircle, Newspaper, 
  BarChart3, Activity, ShieldCheck, Zap, MessageSquare,
  RefreshCw, ChevronRight, Globe, Database
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('BTC/USDT');

  // Simulated data for demo while backend might not be running in this terminal
  const dummyData = {
    agent_analysis: {
      symbol: "BTC/USDT",
      fusion: {
        final_signal: 1,
        confidence: 0.82,
        breakdown: [
          "market: Oversold (RSI: 28.50) | Golden Cross",
          "news: Positive news sentiment (0.45)",
          "macro: Weak DXY (Risk-On)",
          "quant: Mean Reversion Buy (Z-Score: -2.10)"
        ]
      },
      reasoning: "The system identifies a strong confluence of bullish signals. Technical indicators suggest an oversold condition combined with a momentum crossover. Sentiment remains positive following recent institutional news, and macro tailwinds from a weakening dollar provide further support for a long position."
    },
    performance: { pnl: 1240.50, return_pct: 12.4, trade_count: 42 },
    risk: { drawdown: 2.1, status: "Healthy", exposure: "Low" }
  };

  useEffect(() => {
    // In a real scenario, we'd use WebSocket or Fetch here
    setTimeout(() => {
      setData(dummyData);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0e14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Initializing AI Trading Ecosystem...</p>
        </div>
      </div>
    );
  }

  const getSignalColor = (signal) => {
    if (signal === 1) return 'text-emerald-400';
    if (signal === -1) return 'text-rose-400';
    return 'text-gray-400';
  };

  const getSignalBg = (signal) => {
    if (signal === 1) return 'bg-emerald-500/10 border-emerald-500/20';
    if (signal === -1) return 'bg-rose-500/10 border-rose-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-6 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg pulse">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI TRADING AGENT <span className="text-blue-500">ECOSYSTEM</span></h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Activity size={12} /> ENGINE: ACTIVE</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="flex items-center gap-1 text-emerald-500"><Globe size={12} /> NETWORK: STABLE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">Current Asset</p>
            <p className="text-lg font-mono font-bold">{symbol}</p>
          </div>
          <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Signal Display */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className={`glass-card ${data.agent_analysis.fusion.final_signal === 1 ? 'glow-green' : 'glow-red'} border-2`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Master Decision</h2>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold">FUSION ENGINE V1.2</div>
            </div>
            
            <div className="text-center py-6">
              <p className={`text-6xl font-black mb-2 ${getSignalColor(data.agent_analysis.fusion.final_signal)}`}>
                {data.agent_analysis.fusion.final_signal === 1 ? 'STRONG BUY' : 'STRONG SELL'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-slate-500 text-sm">ConfidenceScore</span>
                <span className="text-lg font-bold text-white">{(data.agent_analysis.fusion.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase">Risk Rating</p>
                <p className="text-sm font-bold text-emerald-400">{data.risk.status}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase">Drawdown</p>
                <p className="text-sm font-bold text-rose-400">{data.risk.drawdown}%</p>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Database size={16} /> Agent Intelligence Fusion
            </h2>
            <div className="space-y-3">
              {data.agent_analysis.fusion.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                  <span className="text-xs font-medium text-slate-300">{item.split(':')[0]}</span>
                  <span className="text-[11px] text-slate-500 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics & Reasoning */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-white">${data.performance.pnl.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +{data.performance.return_pct}%
              </p>
            </div>
            <div className="glass-card">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Total Trades</p>
              <p className="text-2xl font-bold text-white">{data.performance.trade_count}</p>
              <p className="text-xs text-slate-500 mt-1">Last 30 Days</p>
            </div>
            <div className="glass-card">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Exposure</p>
              <p className="text-2xl font-bold text-blue-400">{data.risk.exposure}</p>
              <p className="text-xs text-slate-500 mt-1">Capital Utilized</p>
            </div>
          </div>

          <div className="glass-card h-[300px]">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">Market Alpha (Simulated)</h2>
            <div className="h-full pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: 0, v: 4000 }, { t: 1, v: 4500 }, { t: 2, v: 4200 }, 
                  { t: 3, v: 4800 }, { t: 4, v: 5100 }, { t: 5, v: 4900 }, 
                  { t: 6, v: 5400 }
                ]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card border-l-4 border-l-blue-500">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" /> Reasoning Engine Output
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 font-medium italic">
              "{data.agent_analysis.reasoning}"
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer / Status Bar */}
      <footer className="mt-8 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest border-t border-white/5 pt-4">
        <div className="flex gap-4">
          <span>Latency: 42ms</span>
          <span>API: v2.0-stable</span>
        </div>
        <div>
          © 2026 AI TRADING AGENT ECOSYSTEM | ALL AGENTS SECURED
        </div>
      </footer>
    </div>
  );
};

export default App;
