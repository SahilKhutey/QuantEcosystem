import React from 'react';
import { FiShield, FiAlertTriangle, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const mockRisk = {
  metrics: {
    var_95:       { value: -2.34, label: 'VaR (95%)',   desc: '1-day 95% VaR' },
    cvar_95:      { value: -3.12, label: 'CVaR (95%)',  desc: 'Expected Shortfall' },
    sharpe:       { value: 1.42,  label: 'Sharpe',      desc: 'Annualized' },
    sortino:      { value: 1.89,  label: 'Sortino',     desc: 'Downside volatility adj.' },
    max_drawdown: { value: -14.2, label: 'Max DD',      desc: 'Peak-to-trough' },
    calmar:       { value: 1.12,  label: 'Calmar',      desc: 'Return / Max DD' },
    beta:         { value: 0.87,  label: 'Beta',        desc: 'vs NIFTY50' },
    alpha:        { value: 4.2,   label: 'Alpha',       desc: 'Annualized %' },
  },
  concentration: {
    top_holding: 12.9,
    top_sector: 22.0,
    hhi: 0.063,
  },
  radar: [
    { axis: 'Sharpe',      value: 71 },
    { axis: 'Drawdown',    value: 62 },
    { axis: 'Volatility',  value: 58 },
    { axis: 'Beta',        value: 78 },
    { axis: 'Calmar',      value: 56 },
    { axis: 'Alpha',       value: 84 },
  ],
  stress_tests: [
    { scenario: 'COVID Crash (Mar 2020)',   impact: -18.4, recovery: '5 months' },
    { scenario: '2008 GFC Scenario',        impact: -31.2, recovery: '18 months' },
    { scenario: 'Flash Crash Simulation',   impact: -8.1,  recovery: '3 weeks' },
    { scenario: 'Rate Hike Shock (+200bp)', impact: -12.6, recovery: '6 months' },
  ],
};

const MetricCard = ({ label, value, desc, color }) => (
  <div style={styles.metricCard}>
    <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
      {typeof value === 'number' ? (value >= 0 ? (label.includes('Sharpe') || label.includes('Sortino') || label.includes('Calmar') || label.includes('Beta') || label.includes('Alpha') ? value.toFixed(2) : `+${value.toFixed(2)}%`) : `${value.toFixed(2)}%`) : value}
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{label}</div>
    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{desc}</div>
  </div>
);

const RiskManagement = () => {
  const d = mockRisk;
  const m = d.metrics;

  const metricColor = (key, val) => {
    if (key === 'sharpe' || key === 'sortino' || key === 'calmar' || key === 'alpha') {
      return val > 1.5 ? 'var(--accent-green)' : val > 0.8 ? 'var(--accent-amber)' : 'var(--accent-red)';
    }
    if (key === 'var_95' || key === 'cvar_95' || key === 'max_drawdown') return 'var(--accent-red)';
    if (key === 'beta') return val < 1 ? 'var(--accent-green)' : val < 1.2 ? 'var(--accent-amber)' : 'var(--accent-red)';
    return 'var(--text-primary)';
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-red-dim)' }}>
            <FiShield color="var(--accent-red)" size={16} />
          </div>
          <span>Risk Management</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Portfolio-level metrics</span>
      </div>

      {/* Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {Object.entries(m).map(([key, metric]) => (
          <MetricCard
            key={key}
            label={metric.label}
            value={metric.value}
            desc={metric.desc}
            color={metricColor(key, metric.value)}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Radar chart */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Risk-Return Profile
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={d.radar}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Concentration risk */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Concentration Risk
          </div>
          {[
            { label: 'Top Holding', value: d.concentration.top_holding, max: 20, color: 'var(--accent-amber)' },
            { label: 'Top Sector',  value: d.concentration.top_sector,  max: 40, color: 'var(--accent-blue)'  },
            { label: 'HHI Index',   value: d.concentration.hhi * 100,   max: 10, color: 'var(--accent-green)' },
          ].map(c => (
            <div key={c.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>
                  {c.label === 'HHI Index' ? c.value.toFixed(1) : c.value}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c.value / c.max) * 100}%`, background: c.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress tests */}
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <FiAlertTriangle size={12} color="var(--accent-amber)" style={{ marginRight: 6 }} />
          Stress Test Scenarios
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {d.stress_tests.map((s, i) => (
            <div key={i} style={styles.stressRow}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{s.scenario}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', minWidth: 60, textAlign: 'right' }}>
                {s.impact}%
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>
                ~{s.recovery}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 20 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
  },
  title: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  iconCircle: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  metricCard: {
    background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 14px', textAlign: 'center',
  },
  stressRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8,
  },
};

export default RiskManagement;
