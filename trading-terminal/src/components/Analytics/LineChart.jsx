// src/components/Analytics/LineChart.jsx
import React from 'react';
import { Line } from '@ant-design/plots';
import ChartContainer from './ChartContainer';

const LineChart = ({ 
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
  smooth = true,
  point = { size: 4, shape: 'circle' },
  lineStyle = { lineWidth: 2 },
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
    smooth,
    point,
    lineStyle,
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
      <Line {...config} />
    </ChartContainer>
  );
};

export default LineChart;
