// src/components/Signals/SignalAlerts.jsx
import React from 'react';
import { Card, Tag, List, Button } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, BellOutlined } from '@ant-design/icons';

const SignalAlerts = ({ 
  alerts = [],
  title = "Signal Alerts",
  className = '',
  style = {},
  onResolve
}) => {
  const getAlertColor = (severity) => {
    return severity === 'critical' ? '#ff4d4f' :
           severity === 'high' ? '#faad14' :
           severity === 'medium' ? '#1890ff' : '#52c41a';
  };

  const getAlertIcon = (severity) => {
    return severity === 'critical' ? <CloseCircleOutlined /> :
           severity === 'high' ? <WarningOutlined /> :
           severity === 'medium' ? <WarningOutlined /> : <CheckCircleOutlined />;
  };

  const renderAlert = (alert) => (
    <List.Item key={alert.id || Math.random()} className="alert-item" style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
      <List.Item.Meta
        avatar={
          <div style={{ 
            width: 36, height: 36, borderRadius: '50%', 
            background: `${getAlertColor(alert.severity)}15`,
            color: getAlertColor(alert.severity),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>
            {getAlertIcon(alert.severity)}
          </div>
        }
        title={
          <div className="alert-title">
            <div className="alert-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Tag color={getAlertColor(alert.severity)} style={{ margin: 0, fontSize: '10px' }}>
                {alert.severity?.toUpperCase()}
              </Tag>
              <span className="alert-date" style={{ fontSize: '11px', color: '#8c8c8c' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="alert-title-text" style={{ fontWeight: 600, fontSize: '14px' }}>
              {alert.message}
            </div>
          </div>
        }
        description={
          <div className="alert-description" style={{ marginTop: '4px', fontSize: '12px', color: '#595959' }}>
            {alert.details || 'No details available'}
          </div>
        }
      />
      {onResolve && (
        <div className="alert-actions" style={{ marginLeft: '16px' }}>
          <Button type="primary" size="small" onClick={() => onResolve(alert)}>Resolve</Button>
        </div>
      )}
    </List.Item>
  );

  return (
    <Card 
      className={`signal-alerts ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}
    >
      <div className="alerts-header" style={{ marginBottom: '16px' }}>
        <div className="alerts-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          {title}
        </div>
      </div>
      
      <div className="alerts-content">
        {alerts.length === 0 ? (
          <div className="no-alerts" style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
            <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: '12px' }} />
            <div>No active signal alerts</div>
          </div>
        ) : (
          <List
            dataSource={alerts}
            renderItem={renderAlert}
          />
        )}
      </div>
    </Card>
  );
};

export default SignalAlerts;
