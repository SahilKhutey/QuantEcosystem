import React, { useState, useEffect } from 'react';
import {
  FiCpu, FiRefreshCw, FiActivity, FiZap, FiTrendingUp, FiCheckCircle
} from 'react-icons/fi';
import { runModelFusion, MOCK_MODEL_FUSION } from '../../../services/api/quantEngine';

const ModelFusionDashboard = ({ symbol = 'NIFTY50' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await runModelFusion(symbol);
      setData(result);
      setLoading(false);
    };
    load();
  }, [symbol]);

  if (loading) return (
    <div style={styles.card}>
      <div style={styles.loadingRow}>
        <FiRefreshCw style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-blue)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading model fusion…</span>
      </div>
    </div>
  );

  const fusionPct = Math.round(data.fusion_signal * 100);
  const isLong = data.fusion_signal > 0.5;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-purple-dim)' }}>
            <FiCpu color="var(--accent-purple)" size={16} />
          </div>
          <span>Model Fusion Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot live" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live</span>
        </div>
      </div>

      {/* Fusion Signal Meter */}
      <div style={styles.fusionMeter}>
        <div style={styles.meterLabel}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Fused Signal — {data.symbol}
          </span>
          <span style={{
            ...styles.badge,
            background: isLong ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
            color: isLong ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {data.conviction}
          </span>
        </div>
        <div style={styles.meterTrack}>
          <div style={{
            ...styles.meterFill,
            width: `${fusionPct}%`,
            background: isLong ? 'var(--gradient-green)' : 'var(--gradient-red)',
          }} />
          <div style={{ ...styles.meterLine, left: '50%' }} />
        </div>
        <div style={styles.meterFooter}>
          <span style={{ color: 'var(--accent-red)', fontSize: 11 }}>BEAR</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: isLong ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {fusionPct}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}> /100</span>
          </span>
          <span style={{ color: 'var(--accent-green)', fontSize: 11 }}>BULL</span>
        </div>
      </div>

      {/* Model weights table */}
      <div style={styles.modelsGrid}>
        {Object.entries(data.models).map(([name, m]) => {
          const pct = Math.round(m.signal * 100);
          const bull = m.signal > 0.5;
          return (
            <div key={name} style={styles.modelRow}>
              <div style={styles.modelLeft}>
                <div style={{
                  ...styles.modelDot,
                  background: bull ? 'var(--accent-green)' : 'var(--accent-red)'
                }} />
                <span style={styles.modelName}>{name.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div style={styles.modelRight}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: bull ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {pct}%
                </span>
                <span style={styles.modelWeight}>w={Math.round(m.weight * 100)}%</span>
                <div style={styles.modelBar}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: bull ? 'var(--accent-green)' : 'var(--accent-red)',
                    borderRadius: 2,
                    opacity: 0.7,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <FiCheckCircle size={12} color="var(--accent-green)" />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          All {Object.keys(data.models).length} models active · Updated {new Date(data.last_updated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  },
  loadingRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 16,
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  fusionMeter: { marginBottom: 20 },
  meterLabel: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  badge: {
    padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
    letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  meterTrack: {
    height: 10, background: 'var(--bg-tertiary)',
    borderRadius: 5, position: 'relative', overflow: 'hidden',
  },
  meterFill: {
    height: '100%', borderRadius: 5,
    transition: 'width 1s ease', position: 'relative',
  },
  meterLine: {
    position: 'absolute', top: 0, bottom: 0,
    width: 2, background: 'rgba(255,255,255,0.15)',
  },
  meterFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
  },
  modelsGrid: {
    display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16,
  },
  modelRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px',
    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
  },
  modelLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  modelDot: { width: 7, height: 7, borderRadius: '50%' },
  modelName: { fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
  modelRight: { display: 'flex', alignItems: 'center', gap: 10 },
  modelWeight: { fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' },
  modelBar: {
    width: 60, height: 4, background: 'var(--bg-card)',
    borderRadius: 2, overflow: 'hidden',
  },
  footer: {
    display: 'flex', alignItems: 'center', gap: 6,
    paddingTop: 12, borderTop: '1px solid var(--border-color)',
  },
};

export default ModelFusionDashboard;
