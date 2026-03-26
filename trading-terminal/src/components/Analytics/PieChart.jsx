// src/components/Analytics/PieChart.jsx
import React from 'react';
import { Pie } from '@ant-design/plots';
import ChartContainer from './ChartContainer';

const PieChart = ({ 
  title, 
  data, 
  angleField, 
  colorField,
  extra,
  style = {},
  chartStyle = {},
  loading = false,
  error = null,
  radius = 0.8,
  innerRadius = 0.6,
  label = {
    type: 'spider',
    content: '{type}: {value}',
    offset: '30%',
  },
  legend = {
    position: 'top',
  },
  statistic = {
    title: {
      formatter: () => 'Distribution',
    },
    content: {
      formatter: () => '',
    },
  },
  ...rest
}) => {
  const config = {
    data,
    angleField,
    colorField,
    radius,
    innerRadius,
    label,
    legend,
    statistic,
    ...rest,
  };

  return (
    <ChartContainer 
      title={title}
      extra={extra}
      style={style}
      chartStyle={chartStyle}
      loading={loading}
      error={error}
    >
      <Pie {...config} />
    </ChartContainer>
  );
};

export default PieChart;
