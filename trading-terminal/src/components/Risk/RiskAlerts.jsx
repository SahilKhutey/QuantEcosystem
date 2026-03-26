// src/components/Risk/RiskAlerts.jsx
import React from 'react';
import { Card, Tag, List, Button } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const RiskAlerts = ({ 
  alerts = [],
  loading = false,
  error = null,
  title = "Risk Alerts",
  className = '',
  style = {},
  cardStyle = {},
  onAlertResolve
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
    <List.Item key={alert.id || Math.random()} className="alert-item">
      <List.Item.Meta
        avatar={
          <div style={{ 
            width: 40, height: 40, borderRadius: '50%', 
            background: `${getAlertColor(alert.severity)}15`,
            color: getAlertColor(alert.severity),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>
            {getAlertIcon(alert.severity)}
          </div>
        }
        title={
          <div className="alert-title">
            <div className="alert-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Tag color={getAlertColor(alert.severity)} style={{ margin: 0 }}>
                {alert.severity?.toUpperCase()}
              </Tag>
              <span className="alert-date" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="alert-title-text" style={{ fontWeight: 600, fontSize: '15px' }}>
              {alert.title}
            </div>
          </div>
        }
        description={
          <div className="alert-description" style={{ marginTop: '8px' }}>
            <div className="alert-content" style={{ fontSize: '13px', color: '#595959', marginBottom: '8px' }}>
              {alert.description}
            </div>
            <div className="alert-details" style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#8c8c8c' }}>
              <div className="alert-metric">
                <span className="metric-label" style={{ fontWeight: 500 }}>Risk Level: </span>
                <span className="metric-value" style={{ color: '#262626' }}>{alert.riskLevel}</span>
              </div>
              <div className="alert-metric">
                <span className="metric-label" style={{ fontWeight: 500 }}>Exposure: </span>
                <span className="metric-value" style={{ color: '#262626' }}>{alert.exposure}</span>
              </div>
              <div className="alert-metric">
                <span className="metric-label" style={{ fontWeight: 500 }}>Impact: </span>
                <span className="metric-value" style={{ color: '#262626' }}>{alert.impact}</span>
              </div>
            </div>
          </div>
        }
      />
      {onAlertResolve && (
        <div className="alert-actions" style={{ marginLeft: '16px' }}>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => onAlertResolve(alert)}
          >
            Resolve
          </Button>
        </div>
      )}
    </List.Item>
  );

  return (
    <Card 
      className={`risk-alerts ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div className="alerts-header" style={{ marginBottom: '16px' }}>
        <div className="alerts-title" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          {title}
        </div>
      </div>
      
      <div className="alerts-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading alerts...</div>
        ) : error ? (
          <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '24px' }}>{error}</div>
        ) : (
          <List
            dataSource={alerts}
            renderItem={renderAlert}
            locale={{ emptyText: 'No active risk alerts' }}
          />
        )}
      </div>
    </Card>
  );
};

export default RiskAlerts;
