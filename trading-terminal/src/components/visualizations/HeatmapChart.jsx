// src/components/Visualizations/HeatmapChart.jsx
import React from 'react';
import { Heatmap } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const HeatmapChart = ({ 
  data = [],
  title = "Market Correlation Heatmap",
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    data,
    xField: 'assetX',
    yField: 'assetY',
    colorField: 'correlation',
    color: ['#ff4d4f', '#ffffff', '#52c41a'], // Red to Green
    legend: {
      position: 'bottom',
    },
    label: {
      autoHide: true,
      style: {
        fill: '#fff',
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)',
      },
      callback: (val) => ({ text: val.toFixed(2) }),
    },
    tooltip: {
      formatter: (datum) => ({
        name: `${datum.assetX} vs ${datum.assetY}`,
        value: `Corr: ${datum.correlation.toFixed(2)}`,
      }),
    },
  };

  return (
    <CustomChartBase 
      title={title} 
      loading={loading} 
      error={error} 
      height={height}
    >
      <Heatmap {...config} height={height - 40} />
    </CustomChartBase>
  );
};

export default HeatmapChart;
