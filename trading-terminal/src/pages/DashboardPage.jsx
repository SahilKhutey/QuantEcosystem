import React, { useState, useEffect } from 'react';
import {
  FiCpu, FiActivity, FiSearch, FiShield, FiGlobe,
  FiTrendingUp, FiTrendingDown, FiZap, FiBriefcase, FiBarChart2,
} from 'react-icons/fi';
import { runModelFusion } from '../services/api/quantEngine';
import { getMarketAnalysis } from '../services/api/aiAgent';
import { getScreeningResults } from '../services/api/stockAnalyzer';
import { getGlobalMarketData } from '../services/api/marketMap';

const mockKpis = {
  portfolio_value: '₹24.75L',
  daily_pnl: '+₹38,420',
  daily_pnl_pct: '+1.58%',
  active_signals: 7,
  win_rate: '71.2%',
  sharpe: '1.42',
  nifty: '22,412',
  nifty_change: '+1.14%',
  sensex: '73,847',
  sensex_change: '+0.92%',
  usd_inr: '83.18',
  vix_india: '14.2',
};

const moduleStatus = [
  { name: 'Advanced Quant Engine',  route: '/quant-engine',       icon: FiCpu,       status: 'live', color: 'var(--accent-purple)', desc: '5 models active · Regime: BULL' },
  { name: 'AI Trading Agent',        route: '/ai-agent',           icon: FiBriefcase, status: 'live', color: 'var(--accent-blue)',   desc: 'Bias: Moderately Bullish · 7 signals' },
  { name: 'Stock Analyzer Pro',      route: '/stock-analysis',     icon: FiSearch,    status: 'live', color: 'var(--accent-green)',  desc: 'RSI: 58 · MACD: Bullish · EMA: ▲' },
  { name: 'Trading Engine',          route: '/trading-engine',     icon: FiShield,    status: 'live', color: 'var(--accent-amber)',  desc: 'Sharpe: 1.42 · VaR(95): -2.34%' },
  { name: 'Global Market Map',       route: '/global-market',      icon: FiGlobe,     status: 'live', color: 'var(--accent-cyan)',   desc: 'S&P +0.82% · Nikkei -0.42% · NIFTY +1.14%' },
];

import useAppStore from '../services/store/appStore';

import { useMarketData } from '../services/data/marketData';

const DashboardPage = () => {
  const { selectedSymbol, portfolio } = useAppStore();
  const { prices, getLatestPrice } = useMarketData();
  const [fusion, setFusion] = useState(null);
  const [analyst, setAnalyst] = useState(null);
  const [screener, setScreener] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Portfolio Calculations
  const totalInvested = portfolio.reduce((acc, h) => acc + (h.qty * h.avg), 0);
  const currentValue = portfolio.reduce((acc, h) => acc + (h.qty * (prices[h.symbol] || h.avg)), 0);
  const totalPnL = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  useEffect(() => {
    setLoading(true);
    // Fetch latest prices for portfolio items to keep dashboard fresh
    portfolio.forEach(h => getLatestPrice(h.symbol));
    
    // Fetch live indices for the top bar
    ['^NSEI', '^BSESN', 'INR=X', '^INDIAVIX'].forEach(symbol => getLatestPrice(symbol));
    
    Promise.all([
      runModelFusion(selectedSymbol),
      getMarketAnalysis(),
      getScreeningResults(),
    ]).then(([f, a, s]) => {
      setFusion(f);
      setAnalyst(a);
      setScreener(s);
      setLoading(false);
    });
  }, [selectedSymbol, portfolio]);

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Command Center</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;Market Status: <span className="text-green">OPEN</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-green">
            <span className="status-dot live" /> All Systems Live
          </span>
        </div>
      </div>

      {/* Market indices bar */}
      <div style={styles.indicesBar}>
        {[
          { label: 'NIFTY 50',   value: prices['^NSEI'] ? Math.round(prices['^NSEI']).toLocaleString() : mockKpis.nifty,      change: mockKpis.nifty_change,   up: true },
          { label: 'SENSEX',     value: prices['^BSESN'] ? Math.round(prices['^BSESN']).toLocaleString() : mockKpis.sensex,     change: mockKpis.sensex_change,   up: true },
          { label: 'USD/INR',    value: prices['INR=X'] ? prices['INR=X'].toFixed(2) : mockKpis.usd_inr,    change: 'Live Fetch',                up: false },
          { label: 'VIX India',  value: prices['^INDIAVIX'] ? prices['^INDIAVIX'].toFixed(2) : mockKpis.vix_india,  change: 'Live Fetch',                 up: false },
        ].map(idx => (
          <div key={idx.label} style={styles.indexItem}>
            <span style={styles.indexLabel}>{idx.label}</span>
            <span style={styles.indexValue}>{idx.value}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: idx.up ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {idx.up ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
              {idx.change}
            </span>
          </div>
        ))}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { 
            label: 'Portfolio Value',  
            value: `₹${currentValue.toLocaleString()}`, 
            change: `${totalPnL >= 0 ? '+' : '-'}₹${Math.abs(totalPnL).toLocaleString()} (${pnlPct.toFixed(2)}%)`, 
            positive: totalPnL >= 0,  
            color: totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
          },
          { label: 'Active Signals',   value: mockKpis.active_signals,  change: 'Across all engines', positive: true, color: 'var(--accent-blue)' },
          { label: 'Model Win Rate',   value: mockKpis.win_rate,        change: `Sharpe: ${mockKpis.sharpe}`, positive: true, color: 'var(--accent-purple)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...styles.kpiCard, borderTop: `2px solid ${kpi.color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: kpi.color }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Module status cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={styles.sectionTitle}>
          <FiZap size={13} color="var(--accent-amber)" /> Ecosystem Modules
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {moduleStatus.map(mod => {
            const Icon = mod.icon;
            return (
              <a key={mod.name} href={mod.route} style={{ textDecoration: 'none' }}>
                <div style={styles.moduleCard} onMouseEnter={e => e.currentTarget.style.borderColor = mod.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...styles.moduleIconWrap, background: mod.color + '20' }}>
                      <Icon size={20} color={mod.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{mod.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{mod.desc}</div>
                    </div>
                    <span className="status-dot live" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* AI Fusion Signal */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}><FiCpu size={13} color="var(--accent-purple)" /> Model Fusion Signal</div>
          {loading ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
          ) : fusion && (
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>NIFTY50 Fused Signal</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(fusion.fusion_signal * 100)}/100
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${Math.round(fusion.fusion_signal * 100)}%`, background: 'var(--gradient-green)', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(fusion.models).map(([name, m]) => (
                  <span key={name} className="badge" style={{
                    background: m.signal > 0.5 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                    color: m.signal > 0.5 ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontSize: 10,
                  }}>
                    {name.replace('_',' ').toUpperCase()} {Math.round(m.signal * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Watchlist */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}><FiActivity size={13} color="var(--accent-blue)" /> AI Watchlist</div>
          {loading || !analyst ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analyst.watchlist.slice(0, 4).map(item => {
                const upside = (((item.target - item.cmp) / item.cmp) * 100).toFixed(1);
                return (
                  <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', width: 80 }}>{item.symbol}</span>
                    <span className={`badge badge-${item.action === 'BUY' ? 'green' : 'amber'}`} style={{ fontSize: 10 }}>{item.action}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>₹{item.cmp}</span>
                    <span style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>+{upside}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Screener results  */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.sectionTitle}><FiBarChart2 size={13} color="var(--accent-amber)" /> Top Screener Results</div>
          {loading ? (
            <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {screener.map(s => (
                <div key={s.symbol} style={{ ...styles.screenerChip, borderColor: s.signal === 'BUY' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{s.symbol}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span className={`badge badge-${s.signal === 'BUY' ? 'green' : 'amber'}`} style={{ fontSize: 10 }}>{s.signal}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Score: {s.score}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.sector}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  indicesBar: {
    display: 'flex', gap: 12, marginBottom: 24, padding: '14px 20px',
    background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)', flexWrap: 'wrap',
  },
  indexItem: {
    display: 'flex', flexDirection: 'column', gap: 3,
    padding: '0 16px', borderRight: '1px solid var(--border-color)',
  },
  indexLabel: { fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  indexValue: { fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)' },
  kpiCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: '18px 20px',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
  },
  moduleCard: {
    padding: '14px 16px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s', cursor: 'pointer',
  },
  moduleIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: 20,
  },
  screenerChip: {
    padding: '10px 14px', background: 'var(--bg-tertiary)',
    borderRadius: 10, border: '1px solid', minWidth: 120,
  },
};

export default DashboardPage;
