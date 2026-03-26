// src/components/Analytics/BarChart.jsx
import React from 'react';
import { Column } from '@ant-design/plots';
import ChartContainer from './ChartContainer';

const BarChart = ({ 
  title, 
  data, 
  xField, 
  yField, 
  seriesField,
  extra,
  style = {},
  chartStyle = {},
  loading = false,
  error = null,
  columnStyle = { stroke: '#fff', lineWidth: 1 },
  legend = { position: 'top' },
  tooltip = {
    formatter: (datum) => {
      return {
        name: datum.type || 'Value',
        value: datum.value?.toLocaleString(),
      };
    },
  },
  ...rest
}) => {
  const config = {
    data,
    xField,
    yField,
    seriesField,
    columnStyle,
    legend,
    tooltip,
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
      <Column {...config} />
    </ChartContainer>
  );
};

export default BarChart;
