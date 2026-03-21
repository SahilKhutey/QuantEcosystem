import React, { useState } from 'react';
import { FiPieChart, FiRefreshCw, FiTarget } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockPortfolio = {
  total_value: 2475000,
  daily_pnl: 38420,
  daily_pnl_pct: 1.58,
  allocations: [
    { name: 'Large Cap Equity',  value: 35, amount: 866250,  color: '#3b82f6' },
    { name: 'Mid Cap Equity',    value: 20, amount: 495000,  color: '#8b5cf6' },
    { name: 'Debt / Bonds',      value: 20, amount: 495000,  color: '#10b981' },
    { name: 'Gold & Commodities',value: 10, amount: 247500,  color: '#f59e0b' },
    { name: 'International',     value: 10, amount: 247500,  color: '#06b6d4' },
    { name: 'Cash & Liquid',     value: 5,  amount: 123750,  color: '#ef4444' },
  ],
  holdings: [
    { symbol: 'HDFCBANK', name: 'HDFC Bank',   qty: 200, avg: 1480, cmp: 1598, sector: 'Finance',   weight: 12.9 },
    { symbol: 'TCS',      name: 'TCS',          qty: 50,  avg: 3650, cmp: 3876, sector: 'IT',        weight: 7.8  },
    { symbol: 'RELIANCE', name: 'Reliance',    qty: 80,  avg: 2750, cmp: 2871, sector: 'Energy',    weight: 9.3  },
    { symbol: 'INFY',     name: 'Infosys',     qty: 120, avg: 1780, cmp: 1876, sector: 'IT',        weight: 9.1  },
    { symbol: 'MARUTI',   name: 'Maruti',      qty: 15,  avg: 10200, cmp: 11240, sector: 'Auto',   weight: 6.8  },
  ],
  optimization: {
    current_sharpe: 1.42,
    optimized_sharpe: 1.87,
    expected_return: 16.2,
    expected_risk: 13.8,
  },
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  if (value < 5) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{value}%</text>;
};

const PortfolioOptimization = () => {
  const data = mockPortfolio;
  const isUp = data.daily_pnl >= 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: d.color, fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: 'var(--text-primary)' }}>₹{d.amount.toLocaleString()}</div>
        <div style={{ color: 'var(--text-secondary)' }}>{d.value}% allocation</div>
      </div>
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div style={{ ...styles.iconCircle, background: 'var(--accent-blue-dim)' }}>
            <FiPieChart color="var(--accent-blue)" size={16} />
          </div>
          <span>Portfolio Optimization</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>₹{(data.total_value / 1e5).toFixed(1)}L</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isUp ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isUp ? '+' : ''}₹{data.daily_pnl.toLocaleString()} ({isUp ? '+' : ''}{data.daily_pnl_pct}%)
          </div>
        </div>
      </div>

      {/* Pie chart + allocation list */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data.allocations} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
              dataKey="value" labelLine={false} label={renderLabel}>
              {data.allocations.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          {data.allocations.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{a.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization suggestion */}
      <div style={styles.optBox}>
        <FiTarget color="var(--accent-purple)" size={14} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Markowitz Optimization — Expected Improvement
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Current Sharpe', value: data.optimization.current_sharpe, color: 'var(--text-primary)' },
              { label: 'Optimized Sharpe', value: data.optimization.optimized_sharpe, color: 'var(--accent-green)' },
              { label: 'Expected Return', value: `${data.optimization.expected_return}%`, color: 'var(--accent-blue)' },
              { label: 'Expected Risk', value: `${data.optimization.expected_risk}%`, color: 'var(--accent-amber)' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Top Holdings
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Symbol', 'Qty', 'Avg', 'CMP', 'P&L', 'Weight'].map(h => (
                <th key={h} style={{ fontSize: 10, color: 'var(--text-secondary)', padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.holdings.map(h => {
              const pnl = ((h.cmp - h.avg) / h.avg * 100).toFixed(1);
              const isPos = pnl >= 0;
              return (
                <tr key={h.symbol} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{h.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.sector}</div>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{h.qty}</td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{h.avg.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{h.cmp.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 700, color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {isPos ? '+' : ''}{pnl}%
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 13, color: 'var(--text-secondary)' }}>{h.weight}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 20 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
  },
  title: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  iconCircle: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  optBox: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '14px 16px', background: 'var(--accent-purple-dim)',
    border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10,
  },
};

export default PortfolioOptimization;
