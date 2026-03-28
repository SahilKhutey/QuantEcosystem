import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Timeline, Alert, Popover, Switch, Modal } from 'antd';
import { 
  DeploymentUnitOutlined, 
  ContainerOutlined, 
  ControlOutlined, 
  CloudServerOutlined,
  SyncOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  DotChartOutlined,
  GlobalOutlined,
  BugOutlined,
  CodeOutlined,
  MonitorOutlined,
  ConsoleSqlOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Radar, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { orchestratorAPI } from '../services/api/orchestrator';
import MetricCard from '../components/Analytics/MetricCard';
import './OrchestratorPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const OrchestratorPage = () => {
  const [containers, setContainers] = useState([
    { name: 'strategy-api', status: 'running', replicas: 3, cpu: 14.2, memory: 512, uptime: '14d 2h' },
    { name: 'strategy-worker', status: 'running', replicas: 8, cpu: 42.5, memory: 2048, uptime: '4d 18h' },
    { name: 'trading-db', status: 'running', replicas: 1, cpu: 5.4, memory: 4096, uptime: '28d 12h' },
    { name: 'cache-redis', status: 'running', replicas: 2, cpu: 2.1, memory: 1024, uptime: '28d 12h' }
  ]);

  return (
    <div className="orchestrator-page">
      <div className="orchestrator-header">
        <Title level={2}><DeploymentUnitOutlined /> Strategy Docker Orchestrator</Title>
        <Space>
           <Button icon={<ConsoleSqlOutlined />}>View Raw Logs</Button>
           <Button type="primary" icon={<SyncOutlined />}>Trigger Rolling Restart</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Environment Topology Map */}
        <Col span={10}>
           <Card title="Container Cluster Topology" className="orchestrator-card shadow-sm">
              <Row gutter={[16, 16]}>
                 {containers.map(c => (
                   <Col span={12} key={c.name}>
                      <Card size="small" hoverable className="service-node">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                               <ContainerOutlined style={{ color: '#1890ff' }} />
                               <Text strong>{c.name}</Text>
                            </Space>
                            <Badge status="success" />
                         </div>
                         <Divider style={{ margin: '8px 0' }} />
                         <Row gutter={8}>
                            <Col span={12}><Text type="secondary" style={{ fontSize: '10px' }}>Replicas</Text><br/><Text strong>{c.replicas}</Text></Col>
                            <Col span={12}><Text type="secondary" style={{ fontSize: '10px' }}>CPU Load</Text><br/><Text strong>{c.cpu}%</Text></Col>
                         </Row>
                      </Card>
                   </Col>
                 ))}
              </Row>
              <Divider />
              <div style={{ height: 250 }}>
                 <Radar 
                    data={containers.map(c => ({ item: c.name, score: c.cpu }))}
                    xField="item"
                    yField="score"
                    meta={{ score: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.1 } }}
                 />
              </div>
           </Card>
        </Col>

        {/* Real-time Resource Pressure */}
        <Col span={14}>
           <Card className="orchestrator-card">
              <Tabs defaultActiveKey="pressure">
                 <TabPane tab={<span><DashboardOutlined /> Resource Management</span>} key="pressure">
                    <Row gutter={24}>
                       <Col span={12}>
                          <Title level={4}>Cluster Memory Utilization</Title>
                          <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                             <Progress type="dashboard" percent={74} strokeColor="#faad14" width={180} />
                          </div>
                          <div style={{ textAlign: 'center', marginTop: -40 }}>
                             <Text strong>7.4GB / 10GB Consumed</Text><br/>
                             <Tag color="orange">Near Pressure Threshold</Tag>
                          </div>
                       </Col>
                       <Col span={12}>
                          <Title level={4}>CPU Throttling Events</Title>
                          <div style={{ height: 200 }}>
                             <Column 
                               data={Array.from({ length: 12 }).map((_, i) => ({ time: i, events: Math.random() < 0.2 ? 5 : 0 }))}
                               xField="time"
                               yField="events"
                               color="#ff4d4f"
                             />
                          </div>
                       </Col>
                    </Row>
                    <Divider />
                    <Title level={5}>Vertical Pod Autoscaling (VPA) Thresholds</Title>
                    <Table 
                      size="small"
                      pagination={false}
                      dataSource={containers}
                      columns={[
                        { title: 'Service', dataIndex: 'name' },
                        { title: 'Min CPUn', render: () => '0.5' },
                        { title: 'Max CPUn', render: () => '2.0' },
                        { title: 'Target P90', render: () => '1.4' },
                        { title: 'Autoscale', render: () => <Switch size="small" defaultChecked /> }
                      ]}
                    />
                 </TabPane>

                 <TabPane tab={<span><ConsoleSqlOutlined /> Orchestration Logs</span>} key="logs">
                    <div className="log-container">
                       <pre style={{ color: '#fff', fontSize: '11px' }}>
{`[2024-03-26 17:45:01] INFO  strategy-api-v28 Deployment successful.
[2024-03-26 17:45:05] WARN  strategy-worker-v12 CPU pressure detected on node-4.
[2024-03-26 17:45:10] INFO  strategy-worker-v12 Scaling replicas to 12.
[2024-03-26 17:45:12] INFO  strategy-worker-v12-replicas_provisioned successfully.
[2024-03-26 17:46:00] INFO  trading-db Connections within stable range (142/500).`}
                       </pre>
                    </div>
                 </TabPane>
              </Tabs>
           </Card>

           <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col span={24}>
                 <Alert 
                   message="Infrastructure Health: Optimal" 
                   description="All strategy containers are synchronized with `docker-compose-strategy.yml` configurations. No orphaned processes detected."
                   type="success"
                   showIcon
                 />
              </Col>
           </Row>
        </Col>

        {/* Global Network Latency Bridge */}
        <Col span={24}>
          <Card title={<Space><GlobalOutlined /> Strategic Edge Gateway Latency</Space>} className="orchestrator-card shadow-sm">
             <Row gutter={24}>
                <Col span={6}>
                   <Statistic title="LD4 (London)" value={42} suffix="ms" valueStyle={{ color: '#1890ff' }} />
                </Col>
                <Col span={6}>
                   <Statistic title="NY4 (New York)" value={85} suffix="ms" valueStyle={{ color: '#1890ff' }} />
                </Col>
                <Col span={6}>
                   <Statistic title="TY3 (Tokyo)" value={142} suffix="ms" valueStyle={{ color: '#faad14' }} />
                </Col>
                <Col span={6}>
                   <Statistic title="BSE/NSE (Local)" value={1.2} suffix="ms" valueStyle={{ color: '#52c41a' }} />
                </Col>
             </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrchestratorPage;
