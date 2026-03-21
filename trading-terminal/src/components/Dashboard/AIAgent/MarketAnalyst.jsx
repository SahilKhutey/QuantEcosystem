import React, { useState, useEffect } from 'react';
import {
  FiBriefcase, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiTarget, FiActivity, FiRefreshCw,
} from 'react-icons/fi';
import { getMarketAnalysis } from '../../../services/api/aiAgent';

const biasConfig = {
  STRONGLY_BULLISH:   { color: 'var(--accent-green)',  label: '🟢 Strongly Bullish', pct: 90 },
  MODERATELY_BULLISH: { color: 'var(--accent-green)',  label: '🟢 Moderately Bullish', pct: 65 },
  NEUTRAL:            { color: 'var(--accent-amber)',  label: '🟡 Neutral', pct: 50 },
  MODERATELY_BEARISH: { color: 'var(--accent-red)',    label: '🔴 Moderately Bearish', pct: 35 },
  STRONGLY_BEARISH:   { color: 'var(--accent-red)',    label: '🔴 Strongly Bearish', pct: 10 },
};

const MarketAnalyst = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getMarketAnalysis();
      setData(result);
      setLoading(false);
    })();
  }, []);

  if (loading || !data) return (
    <div style={styles.card}>
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
        <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
        AI Analyst processing…
      </div>
    </div>
  );

  const bias = biasConfig[data.overall_bias] || biasConfig.NEUTRAL;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-blue-dim)' }}>
            <FiBriefcase color="var(--accent-blue)" size={16} />
          </div>
          <span>AI Market Analyst</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Horizon: {data.target_horizon}
        </span>
      </div>

      {/* Bias meter */}
      <div style={styles.biasBox}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Overall Market Bias</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: bias.color, marginBottom: 10 }}>
          {bias.label}
        </div>
        <div style={styles.convictionRow}>
          <div style={styles.meterTrack}>
            <div style={{
              height: '100%', width: `${data.conviction_score}%`,
              background: bias.color === 'var(--accent-green)' ? 'var(--gradient-green)' : bias.color === 'var(--accent-red)' ? 'var(--gradient-red)' : 'var(--gradient-amber)',
              borderRadius: 4, transition: 'width 1s ease',
            }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: bias.color, fontFamily: 'var(--font-mono)', width: 40 }}>
            {data.conviction_score}
          </span>
        </div>
        <p style={styles.thesis}>{data.thesis}</p>
      </div>

      {/* Catalysts */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><FiTarget size={13} /> Key Catalysts</div>
        <div style={styles.catalysts}>
          {data.key_catalysts.map((c, i) => (
            <div key={i} style={styles.catalyst}>
              <div style={styles.catalystLeft}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                  background: c.impact === 'HIGH' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)',
                  color: c.impact === 'HIGH' ? 'var(--accent-red)' : 'var(--accent-amber)',
                }}>{c.impact}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.event}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.timing}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk factors */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><FiAlertTriangle size={13} color="var(--accent-red)" /> Risk Factors</div>
        <ul style={styles.risks}>
          {data.risk_factors.map((r, i) => (
            <li key={i} style={styles.risk}><span style={styles.riskDot} />{r}</li>
          ))}
        </ul>
      </div>

      {/* Watchlist */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}><FiActivity size={13} /> AI Watchlist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.watchlist.map(item => {
            const isBuy = item.action === 'BUY';
            const upside = (((item.target - item.cmp) / item.cmp) * 100).toFixed(1);
            return (
              <div key={item.symbol} style={styles.watchRow}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minWidth: 80, fontFamily: 'var(--font-mono)' }}>
                  {item.symbol}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  background: isBuy ? 'var(--accent-green-dim)' : 'var(--accent-amber-dim)',
                  color: isBuy ? 'var(--accent-green)' : 'var(--accent-amber)',
                }}>{item.action}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
                  CMP: <span style={{ color: 'var(--text-primary)' }}>₹{item.cmp}</span>
                </span>
                <span style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  ₹{item.target} (+{upside}%)
                </span>
                <div style={styles.confBar}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round(item.confidence * 100)}%`,
                    background: isBuy ? 'var(--accent-green)' : 'var(--accent-amber)',
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market sentiment summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 4 }}>
        {[
          { label: 'Fear & Greed', value: data.market_sentiment.fear_greed_index, color: data.market_sentiment.fear_greed_index > 60 ? 'var(--accent-green)' : data.market_sentiment.fear_greed_index < 40 ? 'var(--accent-red)' : 'var(--accent-amber)' },
          { label: 'P/C Ratio',   value: data.market_sentiment.put_call_ratio,   color: 'var(--accent-blue)' },
          { label: 'A/D Ratio',   value: data.market_sentiment.advance_decline,  color: 'var(--accent-green)' },
          { label: 'VIX',         value: data.market_sentiment.vix,              color: data.market_sentiment.vix > 20 ? 'var(--accent-red)' : 'var(--accent-green)' },
        ].map(m => (
          <div key={m.label} style={styles.sentMetric}>
            <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: 'var(--font-mono)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
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
  biasBox: {
    background: 'var(--bg-tertiary)', borderRadius: 10, padding: '16px 18px', marginBottom: 16,
  },
  convictionRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  meterTrack: {
    flex: 1, height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden',
  },
  thesis: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
  },
  catalysts: { display: 'flex', flexDirection: 'column', gap: 8 },
  catalyst: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8,
  },
  catalystLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  risks: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  risk: { fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 },
  riskDot: { width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-red)', marginTop: 6, flexShrink: 0 },
  watchRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8,
  },
  confBar: {
    width: 50, height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden',
  },
  sentMetric: {
    background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center',
  },
};

export default MarketAnalyst;
