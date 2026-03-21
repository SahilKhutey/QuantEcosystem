import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { getTechnicalIndicators } from '../../../services/api/stockAnalyzer';

const Gauge = ({ value, min = 0, max = 100, color, label, sublabel }) => {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const rotation = (pct / 100) * 180 - 90;
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value.toFixed(1)}</div>
      <div style={styles.gaugeTrack}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.8s ease',
        }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 4 }}>{sublabel}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  );
};

const IndicatorRow = ({ label, value, signal, color, detail }) => (
  <div style={styles.indicatorRow}>
    <div style={styles.indicatorLeft}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      {detail && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{detail}</div>}
    </div>
    <div style={styles.indicatorRight}>
      <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</span>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
        background: color + '20', color,
      }}>{signal}</span>
    </div>
  </div>
);

const TechnicalIndicators = ({ symbol = 'HDFCBANK' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getTechnicalIndicators(symbol);
      setData(result);
      setLoading(false);
    })();
  }, [symbol]);

  if (loading || !data) return (
    <div style={styles.card}>
      <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        Loading technical indicators…
      </div>
    </div>
  );

  const signalColor = (signal) => {
    if (['BUY', 'BULLISH', 'STRONG_BUY'].includes(signal)) return 'var(--accent-green)';
    if (['SELL', 'BEARISH', 'STRONG_SELL'].includes(signal)) return 'var(--accent-red)';
    return 'var(--accent-amber)';
  };

  const overallColor = signalColor(data.overall_signal);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-green-dim)' }}>
            <FiBarChart2 color="var(--accent-green)" size={16} />
          </div>
          <span>Technical Indicators</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          background: overallColor + '15',
          border: `1px solid ${overallColor}40`,
        }}>
          {data.overall_signal === 'BUY' ? <FiTrendingUp color={overallColor} /> : <FiTrendingDown color={overallColor} />}
          <span style={{ fontSize: 13, fontWeight: 700, color: overallColor }}>{data.overall_signal}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: overallColor, fontFamily: 'var(--font-mono)' }}>
            {data.signal_strength}/100
          </span>
        </div>
      </div>

      {/* Key gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <Gauge
          value={data.rsi.value} min={0} max={100}
          color={data.rsi.value > 70 ? 'var(--accent-red)' : data.rsi.value < 30 ? 'var(--accent-green)' : 'var(--accent-amber)'}
          label="RSI(14)"
          sublabel={data.rsi.value > 70 ? 'OVERBOUGHT' : data.rsi.value < 30 ? 'OVERSOLD' : 'NEUTRAL'}
        />
        <Gauge
          value={data.adx.value} min={0} max={60}
          color={data.adx.value > 25 ? 'var(--accent-purple)' : 'var(--text-secondary)'}
          label="ADX"
          sublabel={data.adx.trend_strength}
        />
        <Gauge
          value={data.stochastic.k} min={0} max={100}
          color={data.stochastic.k > 80 ? 'var(--accent-red)' : data.stochastic.k < 20 ? 'var(--accent-green)' : 'var(--accent-cyan)'}
          label="%K Stochastic"
          sublabel={data.stochastic.signal}
        />
      </div>

      {/* Bollinger Bands */}
      <div style={styles.bollingerCard}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Bollinger Bands
        </div>
        <div style={styles.bbBar}>
          <span style={{ fontSize: 11, color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>₹{data.bollinger.lower.toFixed(0)}</span>
          <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, margin: '0 12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${data.bollinger.pct_b * 100}%`,
              background: 'var(--gradient-blue)', borderRadius: 5,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>₹{data.bollinger.upper.toFixed(0)}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
          %B: <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{data.bollinger.pct_b.toFixed(2)}</span>
          &nbsp;·&nbsp; BW: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{data.bollinger.bandwidth.toFixed(1)}%</span>
        </div>
      </div>

      {/* Indicator rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        <IndicatorRow
          label="MACD"
          value={data.macd.value.toFixed(2)}
          signal={data.macd.trend}
          color={signalColor(data.macd.trend)}
          detail={`Signal: ${data.macd.signal_line.toFixed(2)} · Hist: ${data.macd.histogram.toFixed(2)}`}
        />
        <IndicatorRow
          label="EMA Alignment"
          value=""
          signal={data.ema.signal}
          color={signalColor(data.ema.signal)}
          detail={`EMA20: ${data.ema.ema_20.toFixed(0)} · EMA50: ${data.ema.ema_50.toFixed(0)} · EMA200: ${data.ema.ema_200.toFixed(0)}`}
        />
        <IndicatorRow
          label="ATR(14)"
          value={data.atr.value.toFixed(1)}
          signal={data.atr.volatility}
          color="var(--accent-cyan)"
          detail="Average True Range"
        />
        <IndicatorRow
          label="Volume Trend"
          value={`${data.volume_profile.relative.toFixed(2)}x`}
          signal={data.volume_profile.trend}
          color={data.volume_profile.trend === 'INCREASING' ? 'var(--accent-green)' : 'var(--accent-amber)'}
          detail="vs 20-day average"
        />
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
  gaugeTrack: { height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, margin: '6px 0', overflow: 'hidden' },
  bollingerCard: { background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px' },
  bbBar: { display: 'flex', alignItems: 'center' },
  indicatorRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8,
  },
  indicatorLeft: { flex: 1 },
  indicatorRight: { display: 'flex', alignItems: 'center', gap: 10 },
};

export default TechnicalIndicators;
