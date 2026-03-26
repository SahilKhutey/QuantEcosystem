// src/components/Visualizations/RadialChart.jsx
import React from 'react';
import { Pie } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const RadialChart = ({ 
  data = [],
  title = "Distribution",
  angleField = 'value',
  colorField = 'type',
  innerRadius = 0.6,
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    appendPadding: 10,
    data,
    angleField,
    colorField,
    radius: 1,
    innerRadius,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '16px'
        },
        content: title,
      },
    },
  };

  return (
    <CustomChartBase title={title} loading={loading} error={error} height={height}>
      <Pie {...config} height={height - 40} />
    </CustomChartBase>
  );
};

export default RadialChart;
