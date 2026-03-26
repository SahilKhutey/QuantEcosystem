// src/components/Sidebar/SystemStatus.jsx
import React from 'react';
import { Tag, Row, Col, Space } from 'antd';
import { 
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const SystemStatus = ({ 
  marketStatus = 'open',
  connectivity = 'connected',
  version = '1.2.0',
  compact = false,
  className = '',
  style = {}
}) => {
  const getMarketConfig = () => {
    switch (marketStatus) {
      case 'open': return { label: 'OPEN', color: 'success', icon: <CheckCircleOutlined /> };
      case 'closed': return { label: 'CLOSED', color: 'error', icon: <CloseCircleOutlined /> };
      case 'pre-market': return { label: 'PRE-MKT', color: 'blue', icon: <InfoCircleOutlined /> };
      case 'after-hours': return { label: 'POST-MKT', color: 'purple', icon: <WarningOutlined /> };
      default: return { label: 'UNKNOWN', color: 'default', icon: <InfoCircleOutlined /> };
    }
  };
  
  const getConnectivityConfig = () => {
    switch (connectivity) {
      case 'connected': return { label: 'CONNECTED', color: 'success', icon: <CheckCircleOutlined /> };
      case 'connecting': return { label: 'CONNECTING', color: 'processing', icon: <InfoCircleOutlined /> };
      default: return { label: 'OFFLINE', color: 'error', icon: <CloseCircleOutlined /> };
    }
  };
  
  const market = getMarketConfig();
  const conn = getConnectivityConfig();
  
  if (compact) {
    return (
      <Space size={8} className={className} style={style}>
        <Tag color={market.color} icon={market.icon} style={{ fontSize: '10px', margin: 0 }}>{market.label}</Tag>
        <Tag color={conn.color} style={{ fontSize: '10px', margin: 0 }}>{conn.label}</Tag>
      </Space>
    );
  }

  return (
    <div className={`system-status ${className}`} style={{ padding: '0 12px', ...style }}>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <div style={{ fontSize: '10px', color: '#8c8c8c', marginBottom: '4px' }}>MARKET</div>
          <Tag color={market.color} icon={market.icon} style={{ width: '100%', textAlign: 'center', fontSize: '10px', borderRadius: '4px' }}>
            {market.label}
          </Tag>
        </Col>
        <Col span={12}>
          <div style={{ fontSize: '10px', color: '#8c8c8c', marginBottom: '4px' }}>NETWORK</div>
          <Tag color={conn.color} style={{ width: '100%', textAlign: 'center', fontSize: '10px', borderRadius: '4px' }}>
            {conn.label}
          </Tag>
        </Col>
      </Row>
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '9px', color: '#434343' }}>v{version}</span>
      </div>
    </div>
  );
};

export default SystemStatus;
