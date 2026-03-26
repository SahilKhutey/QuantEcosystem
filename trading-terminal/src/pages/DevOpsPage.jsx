import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Timeline, Alert, Popover, Input, Checkbox } from 'antd';
import { 
  CloudServerOutlined, 
  RocketOutlined, 
  SyncOutlined, 
  DatabaseOutlined, 
  NodeIndexOutlined,
  ThunderboltOutlined,
  BugOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
  TerminalOutlined,
  ApiOutlined,
  ContainerOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Radar, Heatmap, DualAxes } from '@ant-design/plots';
import { devopsAPI } from '../services/api/devops';
import MetricCard from '../components/Analytics/MetricCard';
import './DevOpsPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DevOpsPage = () => {
  const [deploying, setDeploying] = useState(false);
  const [clusterStats, setClusterStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 28,
    dbConnections: 124,
    redisLatency: 0.85,
    mqQueueLength: 0
  });

  const [deploymentLogs, setDeploymentLogs] = useState([
    { id: 1, time: '17:45:01', event: 'Pulling latest strategy-engine:v2.4.1', status: 'success' },
    { id: 2, time: '17:45:05', event: 'Running migrations on postgres-cluster-01', status: 'success' },
    { id: 3, time: '17:45:12', event: 'Warming up strategy cache in Redis', status: 'success' },
    { id: 4, time: '17:45:30', event: 'Switching traffic to blue-green deployment', status: 'processing' }
  ]);

  const clusterHealthData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      cpu: 30 + Math.random() * 40,
      memory: 50 + Math.random() * 20
    }));
  }, []);

  return (
    <div className="devops-page">
      <div className="devops-header">
        <Title level={2}><CloudServerOutlined /> Infrastructure & Deployment Orchestrator</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>View Deploy History</Button>
           <Button 
             type="primary" 
             icon={deploying ? <SyncOutlined spin /> : <RocketOutlined />} 
             danger={deploying}
             onClick={() => setDeploying(!deploying)}
           >
             {deploying ? 'Stop Orchestration' : 'Trigger Global Deployment'}
           </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={4}>
          <MetricCard title="Postgres Health" value="Healthy" icon={<DatabaseOutlined />} color="#52c41a" />
        </Col>
        <Col span={5}>
          <MetricCard title="Redis Latency" value={`${clusterStats.redisLatency}ms`} icon={<ThunderboltOutlined />} color="#1890ff" trend={-12.4} />
        </Col>
        <Col span={5}>
          <MetricCard title="Active MQ Queries" value={clusterStats.dbConnections} icon={<NodeIndexOutlined />} color="#722ed1" />
        </Col>
        <Col span={5}>
          <MetricCard title="Container CPU" value={`${clusterStats.cpu}%`} icon={<ContainerOutlined />} color="#faad14" precision={1} />
        </Col>
        <Col span={5}>
          <MetricCard title="Cluster Uptime" value="142d" icon={<CheckCircleOutlined />} color="#52c41a" />
        </Col>

        <Col span={24}>
          <Card className="devops-content-card">
             <Tabs defaultActiveKey="orchestration">
                <TabPane tab={<span><TerminalOutlined /> Deployment Orchestrator (Blue/Green)</span>} key="orchestration">
                   <Row gutter={24}>
                     <Col span={10}>
                        <Title level={4}>Live Deployment Sequence</Title>
                        <Timeline mode="left">
                           {deploymentLogs.map(log => (
                             <Timeline.Item 
                               key={log.id} 
                               label={log.time} 
                               color={log.status === 'success' ? 'green' : 'blue'}
                             >
                               <Space>
                                  <Text>{log.event}</Text>
                                  {log.status === 'processing' && <SyncOutlined spin />}
                               </Space>
                             </Timeline.Item>
                           ))}
                        </Timeline>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                           <Alert message="Blue Region: Production (Active)" type="info" showIcon />
                           <Alert message="Green Region: Staging (Warming Up)" type="success" showIcon />
                        </Space>
                        <Button block style={{ marginTop: 16 }} icon={<RollbackOutlined />}>Emergency Rollback</Button>
                     </Col>
                     <Col span={14}>
                        <Card title="Deployment Telemetry" size="small">
                           <div style={{ height: 350 }}>
                              <DualAxes 
                                data={[clusterHealthData, clusterHealthData]}
                                xField="hour"
                                yField={['cpu', 'memory']}
                                geometryOptions={[
                                  { geometry: 'area', color: '#1890ff', smooth: true },
                                  { geometry: 'line', color: '#52c41a', smooth: true }
                                ]}
                                title="Cluster Load Patterns (24h)"
                              />
                           </div>
                        </Card>
                     </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><DatabaseOutlined /> Cache & DB Reliability</span>} key="database">
                   <Row gutter={24}>
                      <Col span={12}>
                         <Card title="Redis Performance (Key-Value Cluster)" size="small">
                            <List size="small">
                               <List.Item>
                                  <Text>Eviction Rate</Text>
                                  <Badge status="success" text="0.001%" />
                               </List.Item>
                               <List.Item>
                                  <Text>Command Throughput</Text>
                                  <Tag color="blue">145k ops/sec</Tag>
                               </List.Item>
                               <List.Item>
                                  <Text>Memory Fragmentation</Text>
                                  <Progress percent={12} size="small" />
                               </List.Item>
                            </List>
                         </Card>
                      </Col>
                      <Col span={12}>
                         <Card title="Postgres Replication Lag" size="small">
                            <div style={{ textAlign: 'center' }}>
                               <Statistic title="Primary-Replica Lag" value={14} suffix="ms" valueStyle={{ color: '#52c41a' }} />
                               <Divider />
                               <Text type="secondary">Multi-AZ synchronous replication enabled</Text>
                            </div>
                         </Card>
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><BugOutlined /> Error Log Aggregator</span>} key="logs">
                    <Table 
                      dataSource={[
                        { t: '17:40:01', s: 'Trading Engine', m: 'WebSocket Timeout (Retrying)', l: 'WARN' },
                        { t: '17:35:12', s: 'Risk Manager', m: 'VaR calculation delayed > 100ms', l: 'WARN' },
                        { t: '17:20:01', s: 'API Gateway', m: 'Auth token refreshed successfully', l: 'INFO' }
                      ]}
                      size="small"
                      pagination={false}
                      columns={[
                        { title: 'Timestamp', dataIndex: 't' },
                        { title: 'Service', dataIndex: 's' },
                        { title: 'Message', dataIndex: 'm' },
                        { title: 'Level', dataIndex: 'l', render: (l) => <Tag color={l === 'WARN' ? 'orange' : 'blue'}>{l}</Tag> }
                      ]}
                    />
                </TabPane>
             </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DevOpsPage;
