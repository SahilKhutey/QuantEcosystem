// src/components/Visualizations/CustomLineChart.jsx
import React from 'react';
import { Line, Area } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const CustomLineChart = ({ 
  data = [],
  title = "Trend Analysis",
  xField = 'date',
  yField = 'value',
  seriesField = 'category',
  isArea = false,
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    data,
    xField,
    yField,
    seriesField,
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <CustomChartBase title={title} loading={loading} error={error} height={height}>
      {isArea ? <Area {...config} height={height - 40} /> : <Line {...config} height={height - 40} />}
    </CustomChartBase>
  );
};

export default CustomLineChart;
