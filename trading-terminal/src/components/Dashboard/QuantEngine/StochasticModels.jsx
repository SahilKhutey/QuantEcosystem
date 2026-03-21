import React, { useState, useEffect } from 'react';
import { FiBox, FiRefreshCw } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts';
import { getStochasticModels } from '../../../services/api/quantEngine';

const StochasticModels = ({ symbol = 'NIFTY50' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('gbm');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getStochasticModels(symbol);
      setData(result);
      setLoading(false);
    })();
  }, [symbol]);

  if (loading || !data) return (
    <div style={styles.card}>
      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
        <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Running stochastic models…
      </div>
    </div>
  );

  const tabs = ['gbm', 'heston', 'monte_carlo'];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-cyan-dim)' }}>
            <FiBox color="var(--accent-cyan)" size={16} />
          </div>
          <span>Stochastic Models</span>
        </div>
        <div style={styles.tabs}>
          {tabs.map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
              {t === 'gbm' ? 'GBM' : t === 'heston' ? 'Heston' : 'Monte Carlo'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'gbm' && (
        <div>
          <div style={styles.statsRow}>
            <Stat label="Expected Price" value={`₹${data.gbm.expected_price.toLocaleString()}`} color="var(--accent-cyan)" />
            <Stat label="Daily Drift"    value={`+${(data.gbm.drift * 100).toFixed(3)}%`}         color="var(--accent-green)" />
            <Stat label="Volatility"     value={`${(data.gbm.volatility * 100).toFixed(1)}%`}     color="var(--accent-amber)" />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={styles.chartLabel}>Price Projection — 12 Month Fan Chart</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={data.gbm.paths} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={44} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v, n) => [`₹${Math.round(v).toLocaleString()}`, n.replace('p', 'P')]}
                />
                <Area type="monotone" dataKey="p90" stroke="none" fill="rgba(6,182,212,0.08)" />
                <Area type="monotone" dataKey="p50" stroke="var(--accent-cyan)" strokeWidth={2} fill="rgba(6,182,212,0.15)" />
                <Line type="monotone" dataKey="p10" stroke="rgba(6,182,212,0.4)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="p90" stroke="rgba(6,182,212,0.4)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'heston' && (
        <div>
          <div style={styles.statsRow}>
            <Stat label="Current Vol"   value={`${(data.heston.current_vol * 100).toFixed(1)}%`}   color="var(--accent-purple)" />
            <Stat label="Long-term Vol" value={`${(data.heston.long_term_vol * 100).toFixed(1)}%`} color="var(--accent-amber)" />
            <Stat label="Vol-of-Vol"    value={`${(data.heston.vol_of_vol).toFixed(2)}`}           color="var(--accent-red)" />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={styles.chartLabel}>95% Confidence Interval</div>
            <div style={styles.ciBar}>
              <div style={{ fontSize: 12, color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
                ₹{data.heston.confidence_95.lower.toLocaleString()}
              </div>
              <div style={styles.ciTrack}>
                <div style={{ height: '100%', background: 'var(--gradient-purple)', borderRadius: 4, width: '100%' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                ₹{data.heston.confidence_95.upper.toLocaleString()}
              </div>
            </div>
            <div style={styles.paramGrid}>
              <ParamItem label="Mean Reversion κ" value={data.heston.mean_reversion.toFixed(2)} />
              <ParamItem label="Paths Simulated"  value={data.heston.paths_simulated.toLocaleString()} />
            </div>
          </div>
        </div>
      )}

      {tab === 'monte_carlo' && (
        <div>
          <div style={styles.statsRow}>
            <Stat label="VaR (95%)"  value={`${(data.monte_carlo.var_95 * 100).toFixed(1)}%`}  color="var(--accent-red)" />
            <Stat label="CVaR (95%)" value={`${(data.monte_carlo.cvar_95 * 100).toFixed(1)}%`} color="var(--accent-red)" />
            <Stat label="Mean Return" value={`+${(data.monte_carlo.mean_return * 100).toFixed(1)}%`} color="var(--accent-green)" />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={styles.paramGrid}>
              <ParamItem label="Simulations"   value={data.monte_carlo.simulations.toLocaleString()} />
              <ParamItem label="Std Deviation" value={`${(data.monte_carlo.std_dev * 100).toFixed(1)}%`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, flex: 1 }}>
    <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
  </div>
);

const ParamItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
  </div>
);

const styles = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: 20,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap', gap: 10,
  },
  title: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  tabs: { display: 'flex', gap: 4 },
  tab: {
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
    borderColor: 'var(--accent-blue)',
  },
  statsRow: { display: 'flex', gap: 10 },
  chartLabel: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 },
  ciBar: { display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' },
  ciTrack: { flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' },
  paramGrid: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
};

export default StochasticModels;
