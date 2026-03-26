// src/components/Dashboard/AlertWidget.jsx
import React from 'react';
import { Card, List, Tag, Button } from 'antd';
import { NotificationOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const AlertWidget = ({ 
  title = "System Alerts",
  alerts = [],
  onClearAll,
  onClearAlert,
  loading = false,
  error = null,
  className = '',
  style = {},
  cardStyle = {},
  listStyle = {},
  showClearAll = true,
  maxAlerts = 5,
  showTimestamp = true,
  showType = true
}) => {
  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'red';
      case 'error': return 'volcano';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <CloseCircleOutlined />;
      case 'error': return <CloseCircleOutlined />;
      case 'warning': return <ExclamationCircleOutlined />;
      case 'info': return <CheckCircleOutlined />;
      default: return <NotificationOutlined />;
    }
  };

  const renderAlert = (alert, index) => (
    <List.Item key={index} className="alert-item">
      <List.Item.Meta
        avatar={
          <Tag color={getAlertColor(alert.type)}>
            {getAlertIcon(alert.type)}
          </Tag>
        }
        title={
          <div className="alert-title">
            {showType && alert.type && <Tag color={getAlertColor(alert.type)} style={{ marginRight: 8, fontSize: '0.7rem' }}>{alert.type.toUpperCase()}</Tag>}
            <span style={{ fontWeight: 500 }}>{alert.title}</span>
          </div>
        }
        description={
          <div className="alert-description">
            <div style={{ fontSize: '0.9rem', color: '#333' }}>{alert.message}</div>
            {showTimestamp && alert.timestamp && (
              <div className="alert-timestamp" style={{ color: '#8c8c8c', fontSize: '0.75rem', marginTop: 4 }}>
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        }
      />
      <div className="alert-actions">
        {onClearAlert && (
          <Button type="link" size="small" onClick={() => onClearAlert(alert)}>
            Dismiss
          </Button>
        )}
      </div>
    </List.Item>
  );

  const visibleAlerts = maxAlerts ? alerts.slice(0, maxAlerts) : alerts;

  return (
    <Card 
      className={`alert-widget ${className}`} 
      style={{ borderRadius: 8, ...cardStyle }}
    >
      <div className="alert-widget-content" style={style}>
        <div className="alert-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="alert-title" style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <NotificationOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
          {showClearAll && onClearAll && (
            <Button type="primary" size="small" onClick={onClearAll}>
              Clear All
            </Button>
          )}
        </div>
        
        <List
          dataSource={visibleAlerts}
          renderItem={renderAlert}
          loading={loading}
          style={listStyle}
          size="small"
        />
        
        {maxAlerts && alerts.length > maxAlerts && (
          <div className="alert-see-more" style={{ textAlign: 'right', marginTop: 8 }}>
            <Button type="link" size="small">
              See all {alerts.length} alerts
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AlertWidget;
