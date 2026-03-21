import React, { useState, useEffect } from 'react';
import { FiRss, FiExternalLink, FiTrendingUp, FiTrendingDown, FiMinus, FiRefreshCw } from 'react-icons/fi';
import { getNewsIntelligence } from '../../../services/api/aiAgent';

const sentimentColor = (score) => {
  if (score > 0.3)  return 'var(--accent-green)';
  if (score < -0.3) return 'var(--accent-red)';
  return 'var(--accent-amber)';
};

const sentimentLabel = (label) => {
  const map = { POSITIVE: { color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
                 NEGATIVE: { color: 'var(--accent-red)',   bg: 'var(--accent-red-dim)' },
                 NEUTRAL:  { color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' } };
  return map[label] || map.NEUTRAL;
};

const impactBadge = (impact) => {
  const map = { HIGH: 'badge-red', MEDIUM: 'badge-amber', LOW: 'badge-blue' };
  return map[impact] || 'badge-blue';
};

const NewsIntelligence = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getNewsIntelligence('market india', 10);
    setNews(data);
    setSelected(data[0] || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={styles.wrapper}>
      {/* Left: list */}
      <div style={styles.list}>
        <div style={styles.listHeader}>
          <div style={styles.listTitle}>
            <div style={{ ...styles.iconCircle, background: 'var(--accent-amber-dim)' }}>
              <FiRss color="var(--accent-amber)" size={15} />
            </div>
            <span>News Intelligence</span>
          </div>
          <button style={styles.refreshBtn} onClick={load}>
            <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        <div style={styles.newsItems}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ ...styles.skeleton, height: 72, marginBottom: 8 }} className="skeleton" />
            ))
          ) : news.map(item => {
            const sc = sentimentLabel(item.sentiment_label);
            const isSelected = selected?.id === item.id;
            return (
              <div
                key={item.id}
                style={{
                  ...styles.newsItem,
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  borderColor: isSelected ? 'var(--accent-amber)' : 'transparent',
                }}
                onClick={() => setSelected(item)}
              >
                <div style={styles.newsTop}>
                  <span style={styles.source}>{item.source}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatTime(item.published_at)}</span>
                </div>
                <div style={styles.newsTitle}>{item.title}</div>
                <div style={styles.newsTags}>
                  <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 10 }}>
                    {item.sentiment >= 0 ? '+' : ''}{(item.sentiment * 100).toFixed(0)} {item.sentiment_label}
                  </span>
                  <span className={`badge ${impactBadge(item.impact)}`} style={{ fontSize: 10 }}>
                    {item.impact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: detail */}
      <div style={styles.detail}>
        {selected ? (
          <>
            <div style={styles.detailHeader}>
              <span style={styles.source}>{selected.source}</span>
              <a href={selected.url} target="_blank" rel="noreferrer" style={styles.extLink}>
                <FiExternalLink size={13} /> Open
              </a>
            </div>
            <h3 style={styles.detailTitle}>{selected.title}</h3>

            {/* Sentiment gauge */}
            <div style={styles.sentGauge}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                AI Sentiment Score
              </div>
              <div style={styles.gaugeTrack}>
                <div style={{
                  position: 'absolute', left: '50%', top: 0, bottom: 0,
                  width: `${Math.abs(selected.sentiment * 50)}%`,
                  transform: selected.sentiment >= 0 ? 'none' : `translateX(-100%)`,
                  background: selected.sentiment >= 0 ? 'var(--gradient-green)' : 'var(--gradient-red)',
                  borderRadius: 3,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--accent-red)' }}>Bearish</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: sentimentColor(selected.sentiment), fontFamily: 'var(--font-mono)' }}>
                  {selected.sentiment >= 0 ? '+' : ''}{(selected.sentiment * 100).toFixed(0)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--accent-green)' }}>Bullish</span>
              </div>
            </div>

            <p style={styles.summary}>{selected.summary}</p>

            {/* Entities */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Key Entities
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.entities.map(e => (
                  <span key={e} style={styles.entityTag}>{e}</span>
                ))}
              </div>
            </div>

            {/* Affected symbols */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Affected Symbols
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.symbol_tags.map(s => (
                  <span key={s} className="badge badge-blue" style={{ fontSize: 11 }}>{s}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
            Select a news item to read details
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, height: '100%',
  },
  list: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  listHeader: {
    padding: '16px 16px 14px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  listTitle: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  },
  iconCircle: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  refreshBtn: {
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
    borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center',
  },
  newsItems: { flex: 1, overflowY: 'auto', padding: '8px' },
  skeleton: { borderRadius: 8, width: '100%' },
  newsItem: {
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
    border: '1px solid', transition: 'all 0.2s',
  },
  newsTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  source: { fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600, textTransform: 'uppercase' },
  newsTitle: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 },
  newsTags: { display: 'flex', gap: 6 },
  detail: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: 24, overflowY: 'auto',
  },
  detailHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  extLink: {
    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
    color: 'var(--accent-blue)', textDecoration: 'none',
  },
  detailTitle: {
    fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 16, color: 'var(--text-primary)',
  },
  sentGauge: { marginBottom: 16 },
  gaugeTrack: {
    height: 8, background: 'var(--bg-tertiary)', borderRadius: 4,
    position: 'relative', overflow: 'hidden',
  },
  summary: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 },
  entityTag: {
    padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', letterSpacing: '0.5px',
  },
};

export default NewsIntelligence;
