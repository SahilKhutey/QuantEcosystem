// src/components/Signals/ConfidenceTicker.jsx
import React, { useState, useEffect } from 'react';
import { Card } from 'antd';

const ConfidenceTicker = ({ 
  confidence = 0.75,
  title = "Signal Confidence",
  className = '',
  style = {},
  showTimer = true
}) => {
  const [countdown, setCountdown] = useState(60);
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Determine confidence level
  const getConfidenceLevel = (value) => {
    if (value >= 0.8) return { level: 'High', color: '#52c41a' };
    if (value >= 0.6) return { level: 'Medium', color: '#faad14' };
    return { level: 'Low', color: '#ff4d4f' };
  };
  
  const confidenceLevel = getConfidenceLevel(confidence);
  
  useEffect(() => {
    if (showTimer) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 1000);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showTimer]);

  return (
    <Card 
      className={`confidence-ticker ${className}`} 
      style={{
        ...style,
        borderLeft: `4px solid ${confidenceLevel.color}`,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <div className="confidence-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="confidence-title" style={{ fontSize: '16px', fontWeight: 600 }}>
          {title}
        </div>
        {showTimer && (
          <div className="confidence-timer" style={{ 
            color: isFlashing ? confidenceLevel.color : '#8c8c8c', 
            fontWeight: 600,
            transition: 'color 0.3s ease'
          }}>
            {countdown}s
          </div>
        )}
      </div>
      
      <div className="confidence-content">
        <div className="confidence-level" style={{ marginBottom: '12px' }}>
          <div className="level-indicator" style={{ 
            color: confidenceLevel.color, 
            fontSize: '24px', 
            fontWeight: 700 
          }}>
            {confidenceLevel.level}
          </div>
        </div>
        
        <div className="confidence-meter" style={{ 
          height: '8px', 
          background: '#f0f0f0', 
          borderRadius: '4px', 
          overflow: 'hidden',
          marginBottom: '12px' 
        }}>
          <div className="meter-value" style={{ 
            width: `${confidence * 100}%`, 
            height: '100%',
            backgroundColor: confidenceLevel.color,
            transition: 'width 0.5s ease'
          }}></div>
        </div>
        
        <div className="confidence-score">
          <div className="score-value" style={{ 
            color: confidenceLevel.color, 
            fontSize: '18px', 
            fontWeight: 600 
          }}>
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfidenceTicker;
