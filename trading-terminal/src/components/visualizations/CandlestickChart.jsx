// src/components/Visualizations/CandlestickChart.jsx
import React from 'react';
import { Stock } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const CandlestickChart = ({ 
  data = [],
  title = "Price Action",
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    data,
    xField: 'date',
    yField: ['open', 'high', 'low', 'close'],
    stockStyle: {
      stroke: '#000',
      lineWidth: 0.5,
    },
    fallingFill: '#ff4d4f',
    risingFill: '#52c41a',
    tooltip: {
      crosshairs: {
        line: {
          style: {
            lineWidth: 0.5,
            stroke: 'rgba(0,0,0,0.45)',
          },
        },
      },
    },
  };

  return (
    <CustomChartBase 
      title={title} 
      loading={loading} 
      error={error} 
      height={height}
      onExport={() => console.log('Exporting CSV...')}
    >
      <Stock {...config} height={height - 40} />
    </CustomChartBase>
  );
};

export default CandlestickChart;
