// src/components/StockAnalysis/IndicatorSettings.jsx
import React, { useState, useEffect } from 'react';
import { Card, Space, Button, InputNumber } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const IndicatorSettings = ({ 
  indicator,
  onSettingsChange,
  onClose,
  className = '',
  style = {}
}) => {
  const [settings, setSettings] = useState(indicator);
  const [color, setColor] = useState(indicator.color || '#1890ff');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  useEffect(() => {
    setSettings(indicator);
    setColor(indicator.color || '#1890ff');
  }, [indicator]);

  const getIndicatorParameters = (type) => {
    switch (type) {
      case 'sma':
      case 'ema':
        return [{ name: 'period', label: 'Period', min: 5, max: 200, step: 1 }];
      case 'bollinger':
        return [
          { name: 'period', label: 'Period', min: 5, max: 200, step: 1 },
          { name: 'stdDev', label: 'Std Dev', min: 1, max: 3, step: 0.1 }
        ];
      case 'rsi':
        return [{ name: 'period', label: 'Period', min: 2, max: 100, step: 1 }];
      case 'macd':
        return [
          { name: 'fastPeriod', label: 'Fast Period', min: 5, max: 50, step: 1 },
          { name: 'slowPeriod', label: 'Slow Period', min: 5, max: 200, step: 1 },
          { name: 'signalPeriod', label: 'Signal Period', min: 2, max: 50, step: 1 }
        ];
      default:
        return [];
    }
  };

  const handleParameterChange = (name, value) => {
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setSettings({ ...settings, color: newColor });
    setColorPickerVisible(false);
  };

  const handleSave = () => {
    onSettingsChange(settings.id, settings);
    onClose();
  };

  return (
    <Card 
      className={`indicator-settings ${className}`} 
      style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...style }}
      title={`Settings: ${indicator.name || indicator.type.toUpperCase()}`}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      size="small"
    >
      <div className="settings-container">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>PARAMETERS</div>
          {getIndicatorParameters(indicator.type).map(param => (
            <div key={param.name} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>{param.label}</div>
              <InputNumber
                min={param.min}
                max={param.max}
                step={param.step}
                value={settings[param.name]}
                onChange={value => handleParameterChange(param.name, value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>APPEARANCE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: color, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 0 0 1px #d9d9d9' }}
              onClick={() => setColorPickerVisible(!colorPickerVisible)}
            />
            <span style={{ fontSize: '12px' }}>Line Color</span>
          </div>
          {colorPickerVisible && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              {['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'].map(c => (
                <div 
                  key={c} 
                  style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: color === c ? '2px solid #000' : 'none' }}
                  onClick={() => handleColorChange(c)}
                />
              ))}
            </div>
          )}
        </div>
        
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose}>Cancel</Button>
          <Button size="small" type="primary" onClick={handleSave}>Apply</Button>
        </Space>
      </div>
    </Card>
  );
};

export default IndicatorSettings;
