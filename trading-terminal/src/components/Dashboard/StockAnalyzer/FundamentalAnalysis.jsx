import React, { useState, useEffect } from 'react';
import { FiBook, FiAward, FiTrendingUp, FiPercent, FiInfo } from 'react-icons/fi';
import { getFundamentals } from '../../../services/api/stockAnalyzer';

const ScoreCircle = ({ value, label, color }) => (
  <div style={{ textAlign: 'center', padding: '10px' }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
      border: `3px solid ${color}`,
      background: color + '15',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
    </div>
    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
  </div>
);

const DataRow = ({ label, value, benchmark, color, suffix = '' }) => (
  <div style={styles.dataRow}>
    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
    {benchmark && (
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 8 }}>({benchmark})</span>
    )}
    <span style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
      {value}{suffix}
    </span>
  </div>
);

const FundamentalAnalysis = ({ symbol = 'HDFCBANK' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('valuation');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getFundamentals(symbol);
      setData(result);
      setLoading(false);
    })();
  }, [symbol]);

  if (loading || !data) return (
    <div style={styles.card}>
      <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        Loading fundamental data…
      </div>
    </div>
  );

  const tabs = [
    { id: 'valuation',    label: 'Valuation' },
    { id: 'profitability',label: 'Profitability' },
    { id: 'growth',       label: 'Growth' },
    { id: 'strength',     label: 'Balance Sheet' },
  ];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-amber-dim)' }}>
            <FiBook color="var(--accent-amber)" size={16} />
          </div>
          <span>Fundamental Analysis</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composite score row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 16, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
        <ScoreCircle value={data.quality_score}   label="Quality"    color="var(--accent-blue)" />
        <ScoreCircle value={data.growth_score}    label="Growth"     color="var(--accent-green)" />
        <ScoreCircle value={data.value_score}     label="Value"      color="var(--accent-amber)" />
        <ScoreCircle value={data.momentum_score}  label="Momentum"   color="var(--accent-purple)" />
      </div>

      {/* Tab content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tab === 'valuation' && (
          <>
            <DataRow label="P/E Ratio"         value={data.valuation.pe_ratio}       color="var(--accent-blue)" />
            <DataRow label="P/B Ratio"         value={data.valuation.pb_ratio}       color="var(--accent-blue)" />
            <DataRow label="EV/EBITDA"         value={data.valuation.ev_ebitda} />
            <DataRow label="PEG Ratio"         value={data.valuation.peg_ratio} />
            <DataRow label="Price/Sales"       value={data.valuation.price_to_sales} />
            <div style={styles.dcfBox}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>DCF Intrinsic Value</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  ₹{data.valuation.dcf_value?.toLocaleString()}
                </span>
                <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 700 }}>
                  +{data.valuation.dcf_upside}% upside
                </span>
              </div>
            </div>
          </>
        )}
        {tab === 'profitability' && (
          <>
            <DataRow label="Return on Equity"    value={data.profitability.roe}             suffix="%" color="var(--accent-green)" />
            <DataRow label="Return on Assets"    value={data.profitability.roa}             suffix="%" />
            <DataRow label="Net Profit Margin"   value={data.profitability.net_margin}      suffix="%" color="var(--accent-green)" />
            <DataRow label="Operating Margin"    value={data.profitability.operating_margin} suffix="%" />
            <DataRow label="Gross Margin"        value={data.profitability.gross_margin}    suffix="%" />
          </>
        )}
        {tab === 'growth' && (
          <>
            <DataRow label="Revenue Growth (YoY)" value={`+${data.growth.revenue_yoy}`}    suffix="%" color="var(--accent-green)" />
            <DataRow label="Earnings Growth (YoY)" value={`+${data.growth.earnings_yoy}`}  suffix="%" color="var(--accent-green)" />
            <DataRow label="Book Value Growth"    value={`+${data.growth.book_value_yoy}`}  suffix="%" />
            <DataRow label="Loan Growth"          value={`+${data.growth.loan_growth}`}     suffix="%" color="var(--accent-blue)" />
          </>
        )}
        {tab === 'strength' && (
          <>
            <DataRow label="Debt / Equity"      value={data.strength.debt_to_equity}    color="var(--accent-green)" />
            <DataRow label="Current Ratio"      value={data.strength.current_ratio} />
            <DataRow label="Interest Coverage"  value={data.strength.interest_coverage} suffix="x" />
            <DataRow label="Gross NPA"          value={data.strength.npa_gross}          suffix="%" color="var(--accent-amber)" />
            <DataRow label="Net NPA"            value={data.strength.npa_net}            suffix="%" color="var(--accent-green)" />
            <DataRow label="Capital Adequacy"   value={data.strength.car}               suffix="%" color="var(--accent-blue)" />
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 20 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap', gap: 10,
  },
  title: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  iconCircle: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tab: {
    padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
    cursor: 'pointer', border: '1px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.2s',
  },
  tabActive: { background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' },
  dataRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 14px', background: 'var(--bg-tertiary)', borderRadius: 8,
  },
  dcfBox: {
    padding: '14px 16px', background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, marginTop: 6,
  },
};

export default FundamentalAnalysis;
