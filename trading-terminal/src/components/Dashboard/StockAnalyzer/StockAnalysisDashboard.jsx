import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiTrendingUp, FiTrendingDown, FiBarChart2,
  FiStar, FiActivity,
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { analyzeStock } from '../../../services/api/stockAnalyzer';

const popularSymbols = ['NIFTY50', 'HDFCBANK', 'TCS', 'RELIANCE', 'INFY', 'MARUTI', 'ZOMATO', 'LTIM'];

const StockAnalysisDashboard = ({ onSymbolChange }) => {
  const [symbol, setSymbol] = useState('HDFCBANK');
  const [input, setInput] = useState('HDFCBANK');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('3M');

  const load = async (sym) => {
    setLoading(true);
    const result = await analyzeStock(sym);
    setData(result);
    setLoading(false);
    onSymbolChange?.(sym);
  };

  useEffect(() => { load(symbol); }, [symbol]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSymbol(input.trim().toUpperCase());
  };

  const isUp = data ? data.change_pct >= 0 : true;

  const timeframes = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
  const chartData = data ? data.price_history.slice(-timeframes[timeframe]) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.[0]) return null;
    return (
      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          ₹{payload[0].value?.toFixed(2)}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.card}>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={styles.searchRow}>
        <div style={styles.searchBox}>
          <FiSearch size={15} color="var(--text-secondary)" />
          <input
            style={styles.searchInput}
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            placeholder="Search symbol... (e.g. HDFCBANK)"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
          Analyze
        </button>
      </form>

      {/* Quick picks */}
      <div style={styles.quickPicks}>
        {popularSymbols.map(s => (
          <button
            key={s}
            style={{ ...styles.chip, ...(symbol === s ? styles.chipActive : {}) }}
            onClick={() => { setInput(s); setSymbol(s); }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Analyzing {symbol}…
        </div>
      ) : data && (
        <>
          {/* Header */}
          <div style={styles.stockHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>{data.symbol}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 20 }}>
                  {data.exchange}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{data.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                ₹{data.cmp.toFixed(2)}
              </div>
              <div style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                {isUp ? <FiTrendingUp /> : <FiTrendingDown />}
                {isUp ? '+' : ''}{data.change.toFixed(2)} ({isUp ? '+' : ''}{data.change_pct.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={styles.chartWrap}>
            <div style={styles.chartControls}>
              {Object.keys(timeframes).map(tf => (
                <button
                  key={tf}
                  style={{ ...styles.tfBtn, ...(timeframe === tf ? styles.tfBtnActive : {}) }}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isUp ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={v => `₹${Math.round(v)}`} width={55} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="close"
                  stroke={isUp ? 'var(--accent-green)' : 'var(--accent-red)'}
                  strokeWidth={2} fill="url(#priceGrad)" dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key stats */}
          <div style={styles.statsGrid}>
            {[
              { label: 'Day High',     value: `₹${data.day_high.toFixed(2)}` },
              { label: 'Day Low',      value: `₹${data.day_low.toFixed(2)}` },
              { label: '52W High',     value: `₹${data.week_52_high}` },
              { label: '52W Low',      value: `₹${data.week_52_low}` },
              { label: 'Volume',       value: (data.volume / 1e6).toFixed(1) + 'M' },
              { label: 'Market Cap',   value: data.market_cap },
            ].map(s => (
              <div key={s.label} style={styles.statItem}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 20 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
    borderRadius: 8, padding: '0 14px',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text-primary)', fontSize: 14, height: 40,
    fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
  },
  quickPicks: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: {
    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: '1px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s',
    fontFamily: 'var(--font-mono)',
  },
  chipActive: { background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' },
  stockHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  chartWrap: { marginBottom: 16 },
  chartControls: { display: 'flex', gap: 4, marginBottom: 8, justifyContent: 'flex-end' },
  tfBtn: {
    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', border: '1px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-secondary)',
  },
  tfBtnActive: { background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  statItem: { background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
};

export default StockAnalysisDashboard;
