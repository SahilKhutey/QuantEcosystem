import React, { useState, useEffect } from 'react';
import { FiActivity, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getRegimeAnalysis } from '../../../services/api/quantEngine';

const RegimeDetection = ({ symbol = 'NIFTY50' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getRegimeAnalysis(symbol);
      setData(result);
      setLoading(false);
    })();
  }, [symbol]);

  if (loading || !data) return (
    <div style={styles.card}>
      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
        Detecting market regime…
      </div>
    </div>
  );

  const regimeConfig = {
    BULL:     { color: 'var(--accent-green)', icon: FiTrendingUp,   bg: 'var(--accent-green-dim)', label: 'Bull Market' },
    BEAR:     { color: 'var(--accent-red)',   icon: FiTrendingDown, bg: 'var(--accent-red-dim)',   label: 'Bear Market' },
    SIDEWAYS: { color: 'var(--accent-amber)', icon: FiMinus,        bg: 'var(--accent-amber-dim)', label: 'Sideways / Ranging' },
  };
  const cfg = regimeConfig[data.current_regime] || regimeConfig.SIDEWAYS;
  const Icon = cfg.icon;
  const confPct = Math.round(data.confidence * 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '8px 12px', fontSize: 12,
      }}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
            {p.dataKey}: {Math.round(p.value * 100)}%
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: cfg.bg }}>
            <FiActivity color={cfg.color} size={16} />
          </div>
          <span>Regime Detection</span>
        </div>
        <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color }}>
          {data.current_regime}
        </span>
      </div>

      {/* Current Regime Display */}
      <div style={{ ...styles.regimeBox, borderColor: cfg.color + '40', background: cfg.bg }}>
        <Icon size={36} color={cfg.color} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Confidence: <span style={{ color: cfg.color, fontWeight: 700 }}>{confPct}%</span>
          </div>
        </div>
      </div>

      {/* Probability bars */}
      <div style={styles.probSection}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Regime Probabilities
        </div>
        {[
          { key: 'bull',     label: 'Bull',     color: 'var(--accent-green)' },
          { key: 'bear',     label: 'Bear',     color: 'var(--accent-red)'   },
          { key: 'sideways', label: 'Sideways', color: 'var(--accent-amber)' },
        ].map(({ key, label, color }) => {
          const prob = data.probabilities[key] || 0;
          return (
            <div key={key} style={styles.probRow}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 70 }}>{label}</span>
              <div style={styles.probTrack}>
                <div style={{
                  height: '100%', width: `${Math.round(prob * 100)}%`,
                  background: color, borderRadius: 3, transition: 'width 0.8s ease',
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)', width: 40, textAlign: 'right' }}>
                {Math.round(prob * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Regime history chart */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          30-Day Regime History
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={data.history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 1]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="bull"     stackId="1" stroke="var(--accent-green)" fill="rgba(16,185,129,0.3)" strokeWidth={0} />
            <Area type="monotone" dataKey="sideways" stackId="1" stroke="var(--accent-amber)" fill="rgba(245,158,11,0.3)"  strokeWidth={0} />
            <Area type="monotone" dataKey="bear"     stackId="1" stroke="var(--accent-red)"   fill="rgba(239,68,68,0.3)"   strokeWidth={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: 20,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
  },
  title: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    padding: '3px 10px', borderRadius: 999, fontSize: 11,
    fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  regimeBox: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 20px', borderRadius: 10, border: '1px solid',
    marginBottom: 16,
  },
  probSection: { marginBottom: 4 },
  probRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  probTrack: {
    flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden',
  },
};

export default RegimeDetection;
