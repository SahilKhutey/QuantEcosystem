import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, Switch, Alert, Popover } from 'antd';
import { 
  NodeIndexOutlined, 
  DeploymentUnitOutlined, 
  AreaChartOutlined, 
  DotChartOutlined, 
  ThunderboltOutlined,
  BugOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  MonitorOutlined,
  CodeOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  SyncOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { rlAgentStudioAPI } from '../services/api/rl_agent_studio';
import MetricCard from '../components/Analytics/MetricCard';
import './RLAgentStudioPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const RLAgentStudioPage = () => {
  const [training, setTraining] = useState(false);
  const [activeAgent, setActiveAgent] = useState('PPO_Trader_v8');

  const rewardData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
       episode: i,
       reward: 20 + i*0.8 + Math.random()*10,
       loss: 0.5 / (1 + i/10) + Math.random()*0.05
    }));
  }, []);

  const handleTrainTrigger = () => {
    setTraining(true);
    setTimeout(() => setTraining(false), 5000);
  };

  return (
    <div className="rl-agent-studio-page">
      <div className="rl-header">
        <Title level={2}><DeploymentUnitOutlined /> Adaptive RL Agent Studio & Reward Lab</Title>
        <Space>
           <Button icon={<PlayCircleOutlined />}>Live Agent Inference</Button>
           <Button type="primary" onClick={handleTrainTrigger} loading={training} icon={<SyncOutlined />}>
              Re-optimize Policy
           </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Agent Metadata & Hyper-params */}
        <Col span={8}>
           <Card title="Active Agent DNA" className="rl-card shadow-sm">
              <List
                size="small"
                dataSource={[
                  { id: 'PPO_Trader_v8', name: 'Macro PPO Agent v8', algorithm: 'PPO', status: 'Live', reward: '+142.5' },
                  { id: 'DQN_Market_v2', name: 'DQN Scalper v2', algorithm: 'DQN', status: 'Training', reward: '+18.2' },
                  { id: 'SAC_Hedge_v1', name: 'SAC Hedge v1', algorithm: 'SAC', status: 'Standby', reward: '+5.4' },
                  { id: 'A3C_Global_v3', name: 'A3C Global v3', algorithm: 'A3C', status: 'Dev', reward: 'N/A' }
                ]}
                renderItem={item => (
                  <List.Item 
                    className={`agent-item ${activeAgent === item.id ? 'active' : ''}`}
                    onClick={() => setActiveAgent(item.id)}
                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'all 0.3s' }}
                  >
                     <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                           <Text strong>{item.name}</Text>
                           <Tag color={item.status === 'Live' ? 'green' : 'orange'}>{item.algorithm}</Tag>
                        </div>
                        <div style={{ marginTop: 4 }}>
                           <Text style={{ fontSize: '10px' }} type="secondary">Status: {item.status} | Reward: {item.reward}</Text>
                        </div>
                     </div>
                  </List.Item>
                )}
              />
              <Divider dashed />
              <Form layout="vertical">
                 <Form.Item label="Learning Rate (α)">
                    <InputNumber style={{ width: '100%' }} defaultValue={0.0003} step={0.0001} />
                 </Form.Item>
                 <Form.Item label="Discount Factor (γ)">
                    <Slider min={0.9} max={0.999} defaultValue={0.99} step={0.001} />
                 </Form.Item>
                 <Form.Item label="Experience Replay Buffer Size">
                    <Select defaultValue="100000">
                       <Select.Option value="50000">50,000 Samples</Select.Option>
                       <Select.Option value="100000">100,000 Samples</Select.Option>
                       <Select.Option value="200000">200,000 Samples</Select.Option>
                    </Select>
                 </Form.Item>
                 <Form.Item label="Entropy Regularization">
                    <Switch defaultChecked />
                 </Form.Item>
              </Form>
           </Card>

           <Card title="Agent Action-Space Distribution" className="rl-card shadow-sm" style={{ marginTop: 24 }}>
              <div style={{ height: 200 }}>
                 <Radar 
                    data={[
                       { item: 'Buy Aggression', value: 72 },
                       { item: 'Sell Aggression', value: 24 },
                       { item: 'Hold Stability', value: 85 },
                       { item: 'Risk Sensitivity', value: 92 },
                       { item: 'Reward Alignment', value: 78 }
                    ]}
                    xField="item"
                    yField="value"
                    meta={{ value: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.1, fill: '#1890ff' } }}
                 />
              </div>
           </Card>
        </Col>

        {/* Training Telemetry & Reward Surface */}
        <Col span={16}>
           <Card className="rl-card">
              <Tabs defaultActiveKey="reward">
                 <TabPane tab={<span><DotChartOutlined /> PPO Reward Convergence</span>} key="reward">
                    <Title level={4}>Episode reward & TD-Error Profile</Title>
                    <div style={{ height: 400 }}>
                       <DualAxes 
                          data={[rewardData, rewardData]}
                          xField="episode"
                          yField={['reward', 'loss']}
                          geometryOptions={[
                             { geometry: 'line', color: '#52c41a', smooth: true },
                             { geometry: 'area', color: '#ff4d4f', opacity: 0.1 }
                          ]}
                       />
                    </div>
                    <Divider />
                    <Row gutter={24}>
                       <Col span={8}>
                          <Statistic title="Mean Episode Reward" value={142.5} precision={1} valueStyle={{ color: '#52c41a' }} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="Policy Entropy" value={0.842} precision={3} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="Exploration Rate (ε)" value="2.5%" />
                       </Col>
                    </Row>
                 </TabPane>

                 <TabPane tab={<span><DashboardOutlined /> Policy Value Surface</span>} key="surface">
                    <Title level={4}>State-Value Function Estimation (V(s))</Title>
                    <div style={{ height: 400 }}>
                       <Heatmap 
                          data={Array.from({ length: 20 }).flatMap((_, x) => 
                            Array.from({ length: 20 }).map((_, y) => ({
                               vol: x,
                               trend: y,
                               value: Math.sin(x/5) + Math.cos(y/5) + Math.random() * 0.2
                            }))
                          )}
                          xField="vol"
                          yField="trend"
                          colorField="value"
                          color={['#f5222d', '#ffffff', '#52c41a']}
                       />
                    </div>
                    <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                       Visualization of the neural value head predicting future rewards across market volatility (X) and trend strength (Y).
                    </Paragraph>
                 </TabPane>

                 <TabPane tab={<span><BranchesOutlined /> Action Probability Dist.</span>} key="probs">
                    <div style={{ height: 400 }}>
                       <Column 
                          data={[
                             { action: 'BUY', prob: 0.72 },
                             { action: 'SELL', prob: 0.12 },
                             { action: 'HOLD', prob: 0.16 }
                          ]}
                          xField="action"
                          yField="prob"
                          color={({ action }) => {
                             if (action === 'BUY') return '#52c41a';
                             if (action === 'SELL') return '#ff4d4f';
                             return '#1890ff';
                          }}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Global RL Deployment Hub */}
        <Col span={24}>
           <Card title={<Space><MonitorOutlined /> Real-time RL Agent Inference Monitor</Space>} className="rl-card shadow-sm">
              <Row gutter={24}>
                 <Col span={6}>
                    <Statistic title="Inference Latency" value={0.85} suffix="ms" valueStyle={{ color: '#52c41a' }} />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Feature Vector Drift" value="0.012" prefix="Δ" />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Active Episodes" value={142} />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Policy Hash" value="0x7f4a21" />
                 </Col>
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RLAgentStudioPage;
