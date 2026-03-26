import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Timeline, Alert, Popover, Input, Steps } from 'antd';
import { 
  RocketOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  HistoryOutlined, 
  SafetyCertificateOutlined,
  CloudUploadOutlined,
  ContainerOutlined,
  BugOutlined,
  AuditOutlined,
  GithubOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Radar, Heatmap, DualAxes } from '@ant-design/plots';
import { pipelineAPI } from '../services/api/pipeline';
import MetricCard from '../components/Analytics/MetricCard';
import './PipelinePage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

const PipelinePage = () => {
  const [pipelineStatus, setPipelineStatus] = useState('running');

  const githubActionsLogs = [
    { id: 1, event: 'Checkout repository', status: 'finish', time: '17:40:01' },
    { id: 2, event: 'Set up Python 3.10', status: 'finish', time: '17:40:05' },
    { id: 3, event: 'Install dependencies', status: 'finish', time: '17:41:12' },
    { id: 4, event: 'Run unit and integration tests', status: 'process', time: '17:42:30' },
    { id: 5, event: 'Build Docker image', status: 'wait', time: '-' },
    { id: 6, event: 'Deploy to Kubernetes', status: 'wait', time: '-' }
  ];

  const coverageTrends = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      build: `B-${1024 + i}`,
      unit: 85 + Math.random() * 5,
      integration: 70 + Math.random() * 10
    }));
  }, []);

  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <Title level={2}><RocketOutlined /> Institutional Strat-Ops & CI/CD Hub</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>Pipeline Artifacts</Button>
           <Button type="primary" icon={<SyncOutlined spin={pipelineStatus === 'running'} />}>
             {pipelineStatus === 'running' ? 'Re-running Pipeline' : 'Trigger Manual Build'}
           </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="Last Build Status" value="Processing" icon={<SyncOutlined spin />} color="#1890ff" />
        </Col>
        <Col span={6}>
          <MetricCard title="Test Coverage (Avg)" value="92.4%" icon={<SafetyCertificateOutlined />} color="#52c41a" trend={1.2} />
        </Col>
        <Col span={6}>
          <MetricCard title="K8s Rollout Health" value="100%" icon={<DeploymentUnitOutlined />} color="#722ed1" />
        </Col>
        <Col span={6}>
          <MetricCard title="Mean Time To Recover" value="42m" icon={<BugOutlined />} color="#faad14" />
        </Col>

        <Col span={16}>
          <Card className="pipeline-main-card">
             <Tabs defaultActiveKey="workflow">
                <TabPane tab={<span><GithubOutlined /> GitHub Actions Orchestrator</span>} key="workflow">
                   <div style={{ padding: '24px 0' }}>
                      <Steps direction="vertical" current={3}>
                         {githubActionsLogs.map(log => (
                           <Step 
                             key={log.id} 
                             title={log.event} 
                             description={log.status === 'finish' ? `Completed at ${log.time}` : log.status === 'process' ? 'Running unit and integration tests...' : 'Waiting for previous steps'}
                             status={log.status}
                           />
                         ))}
                      </Steps>
                   </div>
                   <Divider />
                   <Alert 
                     message="Workflow Policy: master-branch-lock" 
                     description="Automatic deployments to production are restricted to merged pull requests with 2+ senior approvals and 100% test pass rate."
                     type="info"
                     showIcon
                   />
                </TabPane>

                <TabPane tab={<span><SafetyOutlined /> Quality Engineering Trends</span>} key="quality">
                   <Title level={4}>Test Coverage Multi-Regression (Unit vs Integration)</Title>
                   <div style={{ height: 400 }}>
                      <DualAxes 
                        data={[coverageTrends, coverageTrends]}
                        xField="build"
                        yField={['unit', 'integration']}
                        geometryOptions={[
                          { geometry: 'area', color: '#52c41a', smooth: true },
                          { geometry: 'line', color: '#1890ff', smooth: true }
                        ]}
                        title="Coverage Depth across Builds"
                      />
                   </div>
                </TabPane>

                <TabPane tab={<span><ContainerOutlined /> Kubernetes Rollout Monitor</span>} key="k8s">
                   <Row gutter={24}>
                      <Col span={12}>
                         <Card title="ReplicaSet Status: trading-system-prod" size="small">
                            <List size="small">
                               <List.Item>
                                  <Text>Desired Replicas</Text>
                                  <Badge count={8} overflowCount={999} style={{ backgroundColor: '#1890ff' }} />
                               </List.Item>
                               <List.Item>
                                  <Text>Available Replicas</Text>
                                  <Badge count={8} overflowCount={999} style={{ backgroundColor: '#52c41a' }} />
                               </List.Item>
                               <List.Item>
                                  <Text>Unavailable</Text>
                                  <Badge count={0} style={{ backgroundColor: '#ff4d4f' }} />
                               </List.Item>
                            </List>
                            <Divider />
                            <Progress percent={100} status="active" strokeColor="#52c41a" title="Rollout Completion" />
                         </Card>
                      </Col>
                      <Col span={12}>
                         <Card title="Resource Constraints" size="small">
                            <Radar 
                              data={[
                                { item: 'CPU Request', value: 85 },
                                { item: 'Memory Limit', value: 72 },
                                { item: 'Egress BW', value: 45 },
                                { item: 'Ingress BW', value: 30 },
                                { item: 'Pod Churn', value: 12 }
                              ]}
                              xField="item"
                              yField="value"
                              meta={{ value: { min: 0, max: 100 } }}
                              area={{ style: { fillOpacity: 0.3 } }}
                            />
                         </Card>
                      </Col>
                   </Row>
                </TabPane>
             </Tabs>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Pipeline Security Audit" className="pipeline-main-card">
              <Timeline mode="left">
                 <Timeline.Item color="green" label="10:00">SAST Scan Passed (No critical vulnerabilities)</Timeline.Item>
                 <Timeline.Item color="green" label="10:15">DAST Scan Passed</Timeline.Item>
                 <Timeline.Item color="blue" label="10:45">Secret Scanning (Validated)</Timeline.Item>
                 <Timeline.Item color="gray" label="Pending">Final Compliance Check</Timeline.Item>
              </Timeline>
          </Card>

          <Card title="Build Artifacts (Amazon ECR/GCR)" className="pipeline-main-card" style={{ marginTop: 24 }}>
             <Table 
               dataSource={[
                 { tag: 'v2.4.1', size: '412MB', build: 'Success' },
                 { tag: 'v2.4.0', size: '410MB', build: 'Success' },
                 { tag: 'v2.3.9-rc1', size: '408MB', build: 'Failed' }
               ]}
               size="small"
               pagination={false}
               columns={[
                 { title: 'Tag', dataIndex: 'tag', render: (t) => <code>{t}</code> },
                 { title: 'Size', dataIndex: 'size' },
                 { title: 'Status', dataIndex: 'build', render: (s) => <Tag color={s === 'Success' ? 'green' : 'red'}>{s}</Tag> }
               ]}
             />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PipelinePage;
