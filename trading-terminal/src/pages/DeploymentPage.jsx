import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Alert, Modal } from 'antd';
import { 
  ThunderboltOutlined, 
  DeploymentUnitOutlined, 
  NodeIndexOutlined, 
  CloudServerOutlined, 
  SyncOutlined,
  ContainerOutlined,
  DashboardOutlined,
  MonitorOutlined,
  BoxPlotOutlined,
  ClusterOutlined,
  InteractionOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { deploymentControlAPI } from '../services/api/deployment_control';
import MetricCard from '../components/Analytics/MetricCard';
import './DeploymentPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DeploymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [activePod, setActivePod] = useState('STRAT_WORKER_01');

  const containerData = [
    { pod: 'API_NODE', cpu: 12, mem: 420, status: 'Healthy' },
    { pod: 'CELERY_WORKER', cpu: 85, mem: 1420, status: 'Critical' },
    { pod: 'REDIS_MASTER', cpu: 5, mem: 256, status: 'Healthy' },
    { pod: 'STRAT_WORKER_01', cpu: 42, mem: 880, status: 'Healthy' },
    { pod: 'STRAT_WORKER_02', cpu: 38, mem: 840, status: 'Healthy' }
  ];

  return (
    <div className="deployment-page">
      <div className="deploy-header">
        <Title level={2}><CloudServerOutlined /> Institutional Docker & Deployment Orchestrator</Title>
        <Space>
           <Button icon={<SyncOutlined />}>Trigger Rolling Restart</Button>
           <Button type="primary" icon={<ThunderboltOutlined />}>Trigger Horizontal Scaler</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Real-time Infrastructure DNA */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Active Containers" value="14" trend={2} icon={<ContainerOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Cluster Resource Load" value="72.4%" trend={15} icon={<DashboardOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="CI/CD Success Rate" value="98.2%" trend={-1} icon={<SafetyCertificateOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Replica Availability" value="3/3" icon={<DeploymentUnitOutlined />} color="#722ed1" />
              </Col>
           </Row>
        </Col>

        {/* Container Topology Pressure Map */}
        <Col span={10}>
           <Card title="Container Resource Topology" className="deploy-card shadow-sm">
              <div style={{ height: 350 }}>
                 <Radar 
                    data={[
                       { item: 'API Latency', value: 85 },
                       { item: 'Worker Stress', value: 92 },
                       { item: 'Database Load', value: 45 },
                       { item: 'Redis Pressure', value: 38 },
                       { item: 'Network IO', value: 72 }
                    ]}
                    xField="item"
                    yField="value"
                    meta={{ value: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.1, fill: '#faad14' } }}
                 />
              </div>
              <Divider />
              <Form layout="vertical">
                 <Form.Item label="Auto-Scaling Threshold (CPU %)">
                    <Slider defaultValue={80} />
                 </Form.Item>
                 <Form.Item label="Replica Count (Min/Max)">
                    <Slider range defaultValue={[2, 10]} />
                 </Form.Item>
              </Form>
           </Card>
        </Col>

        {/* CI/CD Pipeline Telemetry */}
        <Col span={14}>
           <Card className="deploy-card">
              <Tabs defaultActiveKey="topology">
                 <TabPane tab={<span><ClusterOutlined /> Pod Topology Monitoring</span>} key="topology">
                    <Table 
                       size="small"
                       dataSource={containerData}
                       columns={[
                          { title: 'Pod Identifier', dataIndex: 'pod', key: 'pod', render: (t) => <Text strong>{t}</Text> },
                          { title: 'CPU Usage', dataIndex: 'cpu', key: 'cpu', render: (v) => <Progress percent={v} size="small" strokeColor={v > 80 ? '#ff4d4f' : '#1890ff'} /> },
                          { title: 'Memory (MB)', dataIndex: 'mem', key: 'mem' },
                          { title: 'Health Status', dataIndex: 'status', key: 'status', render: (s) => <Badge status={s === 'Healthy' ? 'success' : 'error'} text={s} /> }
                       ]}
                       pagination={false}
                    />
                    <Divider />
                    <Alert 
                      message="Node Resource Exhaustion" 
                      description="CELERY_WORKER is throttled at 85% CPU. Strategy execution latency may increase (aligning with `deploy-strategy-engine.sh`)."
                      type="error"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><InteractionOutlined /> CI/CD Pipeline Telemetry</span>} key="cicd">
                    <div style={{ height: 400 }}>
                       <Line 
                          data={Array.from({ length: 20 }).map((_, i) => ({ step: i, failRate: Math.random() * 5 }))}
                          xField="step"
                          yField="failRate"
                          color="#ff4d4f"
                          smooth
                       />
                    </div>
                    <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                       Deployment failure rate across historic production pushes.
                    </Paragraph>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Low-Level DevOps Logs */}
        <Col span={24}>
           <Card title={<Space><MonitorOutlined /> Infrastructure Forensic Event Stream</Space>} className="deploy-card shadow-sm">
              <List
                size="small"
                dataSource={[
                  { time: '14:42:01', event: 'POD_SCALED_UP', detail: 'Worker replicas increased to 5 following CPU spike.' },
                  { time: '14:41:55', event: 'DOCKER_IMAGE_PULLED', detail: 'Strategy-v4.2.1 pulled from internal registry.' },
                  { time: '14:40:22', event: 'REPLICA_FAILURE', detail: 'Worker-03 terminated. Auto-recovering.' }
                ]}
                renderItem={item => (
                  <List.Item>
                     <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                           <Text code>{item.time}</Text>
                           <Tag color="geekblue">{item.event}</Tag>
                           <Text>{item.detail}</Text>
                        </Space>
                        <Button size="small" type="link">View Logs</Button>
                     </div>
                  </List.Item>
                )}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeploymentPage;
