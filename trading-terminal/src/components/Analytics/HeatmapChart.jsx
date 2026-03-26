// src/components/Analytics/HeatmapChart.jsx
import React from 'react';
import { Heatmap } from '@ant-design/plots';
import ChartContainer from './ChartContainer';

const HeatmapChart = ({ 
  title, 
  data, 
  xField, 
  yField,
  colorField,
  extra,
  style = {},
  chartStyle = {},
  loading = false,
  error = null,
  color = ({ value }) => {
    return value > 0.8 ? '#ff4d4f' :
           value > 0.5 ? '#faad14' :
           value > 0.2 ? '#52c41a' : '#1890ff';
  },
  legend = {
    position: 'right',
  },
  tooltip = {
    formatter: (datum) => {
      return {
        name: datum.factor || datum.type || 'Value',
        value: typeof datum.value === 'number' ? `${(datum.value * 100).toFixed(1)}%` : datum.value,
        description: 'Value level'
      };
    },
  },
  ...rest
}) => {
  const config = {
    data,
    xField,
    yField,
    colorField,
    color,
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
      <Heatmap {...config} />
    </ChartContainer>
  );
};

export default HeatmapChart;
