// src/components/Visualizations/CustomChartBase.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Space, Spin, Empty } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import './Visualizations.css';

const CustomChartBase = ({ 
  title,
  children,
  loading = false,
  error = null,
  onExport,
  onRefresh,
  height = '400px',
  className = '',
  style = {}
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <Card 
      className={`custom-chart-wrapper ${isFullScreen ? 'fs-mode' : ''} ${className}`}
      style={{ ...style }}
      size="small"
      title={<div className="chart-header-title">{title}</div>}
      extra={
        <Space size={8}>
          {onRefresh && <Button icon={<ReloadOutlined />} size="small" type="text" onClick={onRefresh} />}
          {onExport && <Button icon={<DownloadOutlined />} size="small" type="text" onClick={onExport} />}
          <Button 
            icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            size="small" 
            type="text" 
            onClick={toggleFullScreen} 
          />
        </Space>
      }
      ref={containerRef}
    >
      <div className="chart-body" style={{ height: isFullScreen ? 'calc(100vh - 100px)' : height, position: 'relative' }}>
        {loading ? (
          <div className="chart-state-overlay">
            <Spin tip="Generating High-Fidelity Visualization..." />
          </div>
        ) : error ? (
          <div className="chart-state-overlay">
            <Empty description={<span style={{ color: '#ff4d4f' }}>{error}</span>} />
          </div>
        ) : (
          <div className="chart-content-area">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CustomChartBase;
