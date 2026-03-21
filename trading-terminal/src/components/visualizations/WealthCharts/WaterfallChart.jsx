import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  background: var(--tertiary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  height: ${props => props.height || '400px'};
  width: 100%;
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // payload[0] is the invisible base, payload[1] is the visible bar
    const visiblePayload = payload.find(p => p.dataKey !== 'base');
    if (!visiblePayload) return null;
    
    return (
      <div style={{
        backgroundColor: 'var(--secondary-dark)',
        border: '1px solid var(--border-color)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>{label}</p>
        <p style={{ margin: '0', color: visiblePayload.payload.isTotal ? 'var(--accent-blue)' : (visiblePayload.value > 0 ? 'var(--accent-green)' : 'var(--accent-red)'), fontSize: '15px', fontWeight: 'bold' }}>
          {visiblePayload.payload.isTotal ? 'Balance' : 'Cashflow'}: ₹{Math.abs(visiblePayload.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

const WaterfallChart = ({ data, title = "Cashflow Waterfall", height }) => {
  // Transform data for Waterfall (stacked bar approach)
  // Data format expected: [{ name: 'Initial', value: 10000 }, { name: 'Withdrawal', value: -2000 }, { name: 'Interest', value: 500 }]
  
  let runningTotal = 0;
  const transformedData = data.map((item, index) => {
    const isTotal = item.isTotal; // usually the first and last column might represent totals instead of changes
    const previousTotal = runningTotal;
    
    if (isTotal) {
      runningTotal = item.value;
      return {
        name: item.name,
        base: 0,
        val: item.value,
        isTotal: true
      };
    } else {
      runningTotal += item.value;
      // For positive changes, base is previous total.
      // For negative changes, base is current running total (previous + negative change).
      return {
        name: item.name,
        base: item.value >= 0 ? previousTotal : runningTotal,
        val: Math.abs(item.value),
        originalValue: item.value,
        isTotal: false
      };
    }
  });

  return (
    <ChartWrapper height={height}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
          
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="val" stackId="a" radius={[2, 2, 2, 2]}>
            {transformedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isTotal 
                  ? 'var(--accent-blue)' 
                  : (entry.originalValue >= 0 ? 'var(--accent-green)' : 'var(--accent-red)')} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default WaterfallChart;
