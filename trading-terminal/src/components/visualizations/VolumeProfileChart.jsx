// src/components/Visualizations/VolumeProfileChart.jsx
import React from 'react';
import { Bar } from '@ant-design/plots';
import CustomChartBase from './CustomChartBase';

const VolumeProfileChart = ({ 
  data = [],
  title = "Volume Profile",
  loading = false,
  error = null,
  height = 400
}) => {
  const config = {
    data,
    xField: 'volume',
    yField: 'price',
    barStyle: {
      fill: '#1890ff',
      fillOpacity: 0.6,
    },
    xAxis: {
      label: {
        formatter: (v) => `${(v / 1000).toFixed(0)}k`,
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `$${v}`,
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: `Price: $${datum.price}`,
        value: `${datum.volume.toLocaleString()} units`,
      }),
    },
  };

  return (
    <CustomChartBase 
      title={title} 
      loading={loading} 
      error={error} 
      height={height}
      onExport={() => console.log('Exporting Volume Profile...')}
    >
      <div className="volume-profile-inner">
        <Bar {...config} height={height - 40} />
      </div>
    </CustomChartBase>
  );
};

export default VolumeProfileChart;
