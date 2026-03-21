import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
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
    return (
      <div style={{
        backgroundColor: 'var(--secondary-dark)',
        border: '1px solid var(--border-color)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>Year {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '14px', fontWeight: '600' }}>
            {entry.name}: ₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ProjectionChart = ({ data, height }) => {
  return (
    <ChartWrapper height={height}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Wealth Growth Projection</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGained" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="var(--text-tertiary)" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          
          {data[0]?.invested !== undefined && (
            <Area 
              type="monotone" 
              dataKey="invested" 
              name="Amount Invested" 
              stroke="var(--accent-blue)" 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              stackId="1"
            />
          )}
          {data[0]?.gained !== undefined && (
             <Area 
               type="monotone" 
               dataKey="gained" 
               name="Wealth Gained" 
               stroke="var(--accent-green)" 
               fillOpacity={1} 
               fill="url(#colorGained)" 
               stackId="1"
             />
          )}
          {data[0]?.balance !== undefined && (
             <Area 
               type="monotone" 
               dataKey="balance" 
               name="Remaining Balance" 
               stroke="var(--accent-purple)" 
               fillOpacity={1} 
               fill="url(#colorBalance)" 
               stackId="2"
             />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default ProjectionChart;
