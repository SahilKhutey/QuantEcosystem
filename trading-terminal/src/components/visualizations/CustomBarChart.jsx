// src/components/Visualizations/CustomBarChart.jsx
import React from 'react';
import { Column, Bar } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const CustomBarChart = ({ 
  data = [],
  title = "Comparison Chart",
  xField = 'category',
  yField = 'value',
  isHorizontal = false,
  isGrouped = false,
  seriesField,
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    data,
    xField,
    yField,
    seriesField,
    isGroup: isGrouped,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  return (
    <CustomChartBase title={title} loading={loading} error={error} height={height}>
      {isHorizontal ? <Bar {...config} height={height - 40} /> : <Column {...config} height={height - 40} />}
    </CustomChartBase>
  );
};

export default CustomBarChart;
