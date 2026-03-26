// src/components/Dashboard/DashboardLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Space, Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, SettingOutlined } from '@ant-design/icons';

const DashboardLayout = ({ 
  children,
  title = "Dashboard",
  titleExtra,
  layoutConfig,
  onLayoutChange,
  fullScreen = false,
  onFullScreenToggle,
  style = {},
  className = '',
  gridGutter = [24, 24],
  columnCount = 4,
  minColumnWidth = 300,
  cardStyle = {},
  defaultLayout = []
}) => {
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate the number of columns based on available width
  const calculateColumns = () => {
    const width = containerWidth || 1200;
    const columns = Math.floor(width / minColumnWidth);
    return Math.max(columns, 1);
  };

  const columns = calculateColumns();
  
  const renderGrid = () => {
    if (!children) return null;
    
    // Ensure children is an array
    const childrenArray = React.Children.toArray(children);
    
    return (
      <Row gutter={gridGutter} style={{ width: '100%' }}>
        {childrenArray.map((child, index) => (
          <Col key={index} span={24 / columns}>
            {React.isValidElement(child) ? React.cloneElement(child, { 
              style: { ...child.props.style, marginBottom: 24 },
              columnSpan: 24 / columns
            }) : child}
          </Col>
        ))}
      </Row>
    );
  };

  const handleFullScreenToggle = () => {
    const newFullScreen = !isFullScreen;
    setIsFullScreen(newFullScreen);
    if (onFullScreenToggle) {
      onFullScreenToggle(newFullScreen);
    }
  };

  return (
    <div className={`dashboard-layout ${className}`} style={style}>
      <div className="dashboard-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="dashboard-title">
          <h2 style={{ margin: 0 }}>{title}</h2>
          {titleExtra && <div className="title-extra">{titleExtra}</div>}
        </div>
        
        <div className="dashboard-controls">
          <Space>
            <Button 
              icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={handleFullScreenToggle}
            >
              {isFullScreen ? 'Exit Fullscreen' : 'Full Screen'}
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </Button>
          </Space>
        </div>
      </div>
      
      <div ref={containerRef} className="dashboard-content" style={{ width: '100%' }}>
        {renderGrid()}
      </div>
      
      {showSettings && (
        <div className="dashboard-settings" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
          <Card 
            title="Dashboard Settings" 
            style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            extra={<Button type="text" onClick={() => setShowSettings(false)}>X</Button>}
          >
            <p>Customize your dashboard layout and widgets here</p>
            <div className="settings-content">
              {/* Settings controls would go here */}
            </div>
          </Card>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: -1 }} 
            onClick={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
