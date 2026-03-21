import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const ChartContainer = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  height: 450px;
  margin-bottom: 24px;
`;

// Calculate normalized (percentage) return from first datapoint for fair comparison
const normalizeData = (indices) => {
  if (!indices || indices.length === 0) return [];
  
  // Base timelines on the first index
  const baseTimeline = indices[0].history.map(h => h.date);
  
  const normalizedData = baseTimeline.map((date, index) => {
    const dataPoint = { date };
    
    indices.forEach(idx => {
      const historyMatch = idx.history[index];
      if (historyMatch) {
        const baseValue = idx.history[0].value;
        const currentReturn = ((historyMatch.value - baseValue) / baseValue) * 100;
        dataPoint[idx.id] = currentReturn;
      }
    });
    
    return dataPoint;
  });
  
  return normalizedData;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--tertiary-dark)',
        border: '1px solid var(--border-color)',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '13px' }}>
            {entry.name}: {entry.value > 0 ? '+' : ''}{entry.value.toFixed(2)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const EquityComparison = ({ indices }) => {
  const data = useMemo(() => normalizeData(indices), [indices]);

  if (!indices || indices.length === 0) return null;

  return (
    <ChartContainer>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Relative Performance (1Y %)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
            tickLine={false}
          />
          <YAxis 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20, fontSize: 12 }} />
          
          {indices.map((idx, index) => (
            <Line 
              key={idx.id}
              type="monotone" 
              dataKey={idx.id} 
              name={idx.name}
              stroke={COLORS[index % COLORS.length]} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EquityComparison;
