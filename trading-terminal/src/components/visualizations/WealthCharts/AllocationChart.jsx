import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  background: var(--tertiary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  height: ${props => props.height || '300px'};
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--secondary-dark)',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '4px 0 0 0', color: payload[0].payload.fill, fontSize: '13px', fontWeight: '600' }}>
          ₹{payload[0].value.toLocaleString('en-IN')} ({(payload[0].payload.percent * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

const AllocationChart = ({ data, title = "Asset Allocation", height }) => {
  const COLORS = ['var(--accent-blue)', 'var(--accent-green)', 'var(--accent-purple)', 'var(--accent-red)', '#eab308'];

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: total > 0 ? item.value / total : 0
  }));

  return (
    <ChartWrapper height={height}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {dataWithPercent.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
};

export default AllocationChart;
