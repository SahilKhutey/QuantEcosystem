// src/components/Signals/SignalIndicator.jsx
import React from 'react';
import { Card, Row, Col, Tag, Progress } from 'antd';
import { SignalOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

const SignalIndicator = ({ 
  strength = 0.75,
  direction = 'bullish',
  source = 'technical',
  timestamp,
  title = "Signal Indicator",
  className = '',
  style = {}
}) => {
  // Determine direction color
  const directionColor = direction === 'bullish' ? '#52c41a' : '#ff4d4f';
  const directionIcon = direction === 'bullish' ? <UpOutlined /> : <DownOutlined />;
  
  // Determine signal strength category
  const getStrengthCategory = (strength) => {
    if (strength >= 0.8) return 'strong';
    if (strength >= 0.6) return 'moderate';
    return 'weak';
  };
  
  const strengthCategory = getStrengthCategory(strength);
  const strengthColor = strengthCategory === 'strong' ? '#52c41a' : 
                         strengthCategory === 'moderate' ? '#faad14' : '#ff4d4f';
  
  // Format timestamp
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A';
  
  return (
    <Card 
      className={`signal-indicator ${className}`} 
      style={{
        ...style,
        borderLeft: `4px solid ${directionColor}`,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <div className="signal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="signal-title" style={{ fontSize: '16px', fontWeight: 600 }}>
          <SignalOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </div>
        <div className="signal-source">
          <Tag color="blue">{source.charAt(0).toUpperCase() + source.slice(1)}</Tag>
        </div>
      </div>
      
      <div className="signal-content">
        <div className="signal-direction" style={{ marginBottom: '12px' }}>
          <div className="direction-indicator" style={{ color: directionColor, fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {directionIcon}
            {direction.charAt(0).toUpperCase() + direction.slice(1)}
          </div>
        </div>
        
        <div className="signal-strength" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div className="strength-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Signal Strength</div>
            <div className="strength-value" style={{ color: strengthColor, fontWeight: 600, fontSize: '14px' }}>
              {strengthCategory.charAt(0).toUpperCase() + strengthCategory.slice(1)}
            </div>
          </div>
          <Progress 
            percent={strength * 100} 
            strokeColor={strengthColor} 
            showInfo={false} 
            strokeWidth={10}
          />
        </div>
        
        <div className="signal-metrics" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
          <Row gutter={8}>
            <Col span={12}>
              <div className="signal-metric">
                <div className="metric-label" style={{ fontSize: '11px', color: '#8c8c8c' }}>Conviction</div>
                <div className="metric-value" style={{ color: strengthColor, fontWeight: 600 }}>
                  {(strength * 100).toFixed(1)}%
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="signal-metric">
                <div className="metric-label" style={{ fontSize: '11px', color: '#8c8c8c' }}>Last Update</div>
                <div className="metric-value" style={{ color: '#262626', fontWeight: 500 }}>
                  {formattedTime}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default SignalIndicator;
