import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Timeline, List, Divider, Tooltip, Alert, Switch, Statistic } from 'antd';
import { 
  BarChartOutlined, 
  CloudServerOutlined, 
  DeploymentUnitOutlined, 
  HistoryOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  BugOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { Area, Column, Heatmap } from '@ant-design/plots';
import { systemAPI } from '../services/api/system';
import MetricCard from '../components/Analytics/MetricCard';
import './SystemHealthPage.css';

const { Title, Text, Paragraph } = Typography;

const SystemHealthPage = () => {
  const [services, setServices] = useState([
    { name: 'Quant Engine Core', status: 'healthy', version: 'v2.4.1', latency: '4ms', uptime: '14d 6h' },
    { name: 'Risk Management Engine', status: 'healthy', version: 'v1.9.3', latency: '8ms', uptime: '14d 6h' },
    { name: 'Execution Bridge (FIX)', status: 'healthy', version: 'v3.1.0', latency: '12ms', uptime: '14d 6h' },
    { name: 'Strategy Orchestrator', status: 'degraded', version: 'v2.0.5', latency: '45ms', uptime: '2d 4h' },
    { name: 'Model Training Service', status: 'healthy', version: 'v1.1.0', latency: '650ms', uptime: '14d 6h' }
  ]);

  const [deploymentSteps, setDeploymentSteps] = useState([
    { time: '2026-03-26 14:00', task: 'Pre-flight check: Alpha Vantage keys verified', status: 'success' },
    { time: '2026-03-26 14:05', task: 'Orchestrating strategy-engine containers', status: 'success' },
    { time: '2026-03-26 14:10', task: 'Database Migration: StockDB v4.2 applied', status: 'success' },
    { time: '2026-03-26 14:15', task: 'Initializing RL Agent environment', status: 'loading' },
    { time: 'Pending', task: 'Health check: Live market data streams', status: 'pending' }
  ]);

  const [logs, setLogs] = useState([
    { id: 1, time: '17:11:05', level: 'info', component: 'EXEC', message: 'Order filled: 100 shares AAPL @ $172.45' },
    { id: 2, time: '17:10:58', level: 'warn', component: 'RISK', message: 'VaR breach detected in Portfolio B (Threshold: $10k, Current: $12.5k)' },
    { id: 3, time: '17:10:45', level: 'info', component: 'QUANT', message: 'GARCH model updated for RELIANCE (Volatility forecast: 1.2%)' },
    { id: 4, time: '17:10:02', level: 'error', component: 'DB', message: 'Connection timeout on StockDB replication node' }
  ]);

  const statusColumns = [
    { title: 'Service Name', dataIndex: 'name', key: 'name', render: (text) => <strong>{text}</strong> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (text) => (
      <Badge 
        status={text === 'healthy' ? 'success' : text === 'degraded' ? 'warning' : 'error'} 
        text={text.toUpperCase()} 
      />
    )},
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Latency', dataIndex: 'latency', key: 'latency', render: (text) => <Tag color={parseInt(text) < 20 ? 'green' : 'orange'}>{text}</Tag> },
    { title: 'Uptime', dataIndex: 'uptime', key: 'uptime' }
  ];

  const resourceData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      cpu: 40 + Math.sin(i / 2) * 20 + Math.random() * 10,
      memory: 65 + Math.cos(i / 4) * 15 + Math.random() * 5
    }));
  }, []);

  return (
    <div className="system-health-page">
      <div className="health-header">
        <Title level={2}><CloudServerOutlined /> System Reliability & Deployment Monitor</Title>
        <Space>
          <Button icon={<SyncOutlined />}>Restart Services</Button>
          <Button type="primary" icon={<CloudUploadOutlined />}>Deploy Engine v2.5</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="System Uptime" value="14d 6h" icon={<HistoryOutlined />} color="#52c41a" trend={0} />
        </Col>
        <Col span={6}>
          <MetricCard title="Operational Latency" value="12ms" icon={<ThunderboltOutlined />} color="#1890ff" trend={-8.5} />
        </Col>
        <Col span={6}>
          <MetricCard title="Error Rate (1h)" value="0.02%" icon={<BugOutlined />} color="#ff4d4f" trend={2.1} />
        </Col>
        <Col span={6}>
          <MetricCard title="Active Containers" value="24/24" icon={<NodeIndexOutlined />} color="#722ed1" />
        </Col>

        <Col span={16}>
          <Card title="Infrastructure Reliability Monitor" className="health-card">
            <Tabs defaultActiveKey="status">
              <Tabs.TabPane tab={<span><SafetyCertificateOutlined /> Service Health</span>} key="status">
                <Table 
                  dataSource={services} 
                  columns={statusColumns} 
                  pagination={false} 
                  size="middle" 
                />
                <Divider />
                <Alert 
                  message="Service Degraded: Strategy Orchestrator" 
                  description="Increased latency detected on node-east-1. Automated failover initiated." 
                  type="warning" 
                  showIcon 
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span><BarChartOutlined /> Resource Utilization</span>} key="resources">
                <div style={{ height: 400 }}>
                   <Area 
                     data={resourceData}
                     xField="time"
                     yField="cpu"
                     smooth
                     color="#1890ff"
                     areaStyle={{ fillOpacity: 0.2 }}
                     title="CPU Usage (%)"
                   />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>

          <Card title="Operational Log Stream" className="health-card" style={{ marginTop: 24 }}>
             <List
               size="small"
               dataSource={logs}
               renderItem={item => (
                 <List.Item>
                   <Space>
                      <Text type="secondary" style={{ width: 80 }}>[{item.time}]</Text>
                      <Tag color={item.level === 'error' ? 'red' : item.level === 'warn' ? 'orange' : 'blue'}>
                         {item.level.toUpperCase()}
                      </Tag>
                      <Tag icon={<DatabaseOutlined />}>{item.component}</Tag>
                      <Text>{item.message}</Text>
                   </Space>
                 </List.Item>
               )}
             />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Deployment Lifecycle" className="health-card">
             <Timeline mode="left">
                {deploymentSteps.map((step, index) => (
                  <Timeline.Item 
                    key={index} 
                    label={step.time}
                    dot={step.status === 'loading' ? <SyncOutlined spin /> : null}
                    color={step.status === 'success' ? 'green' : step.status === 'loading' ? 'blue' : 'gray'}
                  >
                    <Text strong={step.status === 'loading'}>{step.task}</Text>
                  </Timeline.Item>
                ))}
             </Timeline>
             <Divider />
             <div className="deployment-stats">
                <div style={{ marginBottom: 12 }}>
                   <span>Build Consistency</span>
                   <Progress percent={98.4} strokeColor="#52c41a" />
                </div>
                <div style={{ marginBottom: 12 }}>
                   <span>Integration Success</span>
                   <Progress percent={92} strokeColor="#1890ff" />
                </div>
             </div>
          </Card>

          <Card title="Global Network Topology" className="health-card" style={{ marginTop: 24 }}>
             <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <NodeIndexOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>
                   <Badge status="success" text="Tokyo Node: Online" /><br/>
                   <Badge status="success" text="London Node: Online" /><br/>
                   <Badge status="processing" text="New York Node: Syncing" />
                </div>
             </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemHealthPage;
