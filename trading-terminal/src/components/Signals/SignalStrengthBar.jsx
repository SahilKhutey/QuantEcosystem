// src/components/Signals/SignalStrengthBar.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';

const SignalStrengthBar = ({ 
  strength = 0.75,
  direction = 'bullish',
  title = "Signal Strength",
  className = '',
  style = {}
}) => {
  // Determine direction color and icon
  const directionColor = direction === 'bullish' ? '#52c41a' : '#ff4d4f';
  const directionIcon = direction === 'bullish' ? '↑' : '↓';
  
  // Determine signal strength category
  const getStrengthCategory = (strength) => {
    if (strength >= 0.8) return { category: 'Strong', color: '#52c41a' };
    if (strength >= 0.6) return { category: 'Moderate', color: '#faad14' };
    return { category: 'Weak', color: '#ff4d4f' };
  };
  
  const strengthCategory = getStrengthCategory(strength);
  
  return (
    <Card 
      className={`signal-strength-bar ${className}`} 
      style={{
        ...style,
        borderLeft: `4px solid ${directionColor}`,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <div className="strength-header" style={{ marginBottom: '16px' }}>
        <div className="strength-title" style={{ fontSize: '16px', fontWeight: 600 }}>
          {title}
        </div>
      </div>
      
      <div className="strength-content">
        <div className="strength-bar" style={{ marginBottom: '20px' }}>
          <div className="bar-container" style={{ height: '24px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div 
              className="bar-fill" 
              style={{ 
                width: `${strength * 100}%`, 
                height: '100%',
                backgroundColor: strengthCategory.color,
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {(strength * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="strength-details">
          <Row gutter={16}>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Category</div>
                <div className="metric-value" style={{ color: strengthCategory.color, fontWeight: 600 }}>
                  {strengthCategory.category}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Conviction</div>
                <div className="metric-value" style={{ color: strengthCategory.color, fontWeight: 600 }}>
                  {(strength * 100).toFixed(1)}%
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="metric-item">
                <div className="metric-label" style={{ fontSize: '12px', color: '#8c8c8c' }}>Direction</div>
                <div className="metric-value" style={{ color: directionColor, fontWeight: 700 }}>
                  {directionIcon} {direction.charAt(0).toUpperCase() + direction.slice(1)}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default SignalStrengthBar;
