import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, InputNumber, Slider, Form, Switch, Statistic, Select } from 'antd';
import { 
  ExperimentOutlined, 
  RocketOutlined, 
  LineChartOutlined, 
  DashboardOutlined, 
  DeploymentUnitOutlined,
  ThunderboltOutlined,
  DotChartOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  SlidersOutlined,
  SyncOutlined,
  BulbOutlined,
  GlobalOutlined,
  BgColorsOutlined
} from '@ant-design/icons';
import { Area, Line, Radar, Scatter, DualAxes } from '@ant-design/plots';
import { drlAPI } from '../services/api/drl';
import MetricCard from '../components/Analytics/MetricCard';
import './DRLStudioPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DRLStudioPage = () => {
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [metrics, setMetrics] = useState({
    episode: 1240,
    reward: 14.5,
    loss: 0.0024,
    entropy: 0.85,
    epsilon: 0.05
  });

  const [hyperParams, setHyperParams] = useState({
    learningRate: 0.0003,
    gamma: 0.99,
    clipRange: 0.2,
    entCoef: 0.01,
    batchSize: 64
  });

  const trainingData = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      episode: i,
      reward: Math.sin(i / 10) * 5 + i / 10 + Math.random() * 2,
      loss: 1 / (i + 1) + Math.random() * 0.1
    }));
  }, []);

  const stateActionData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      state: `S${i}`,
      action: Math.floor(Math.random() * 3), // Buy, Sell, Hold
      confidence: 0.5 + Math.random() * 0.5
    }));
  }, []);

  return (
    <div className="drl-studio-page">
      <div className="drl-header">
        <Title level={2}><ExperimentOutlined /> Deep RL Training Studio (PPO Agent)</Title>
        <Space>
          <Button 
            icon={trainingStatus === 'training' ? <SyncOutlined spin /> : <RocketOutlined />} 
            type={trainingStatus === 'training' ? 'danger' : 'primary'}
            onClick={() => setTrainingStatus(trainingStatus === 'training' ? 'idle' : 'training')}
          >
            {trainingStatus === 'training' ? 'Stop Training' : 'Start Training Cycle'}
          </Button>
          <Button icon={<SlidersOutlined />}>Save Policy Weights</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={4}>
          <MetricCard title="Current Episode" value={metrics.episode} icon={<SyncOutlined />} color="#1890ff" />
        </Col>
        <Col span={5}>
          <MetricCard title="Avg Episode Reward" value={metrics.reward} icon={<ThunderboltOutlined />} color="#52c41a" trend={8.4} />
        </Col>
        <Col span={5}>
          <MetricCard title="Policy Loss" value={metrics.loss} icon={<DashboardOutlined />} color="#ff4d4f" precision={4} />
        </Col>
        <Col span={5}>
          <MetricCard title="Explorer Epsilon" value={metrics.epsilon} icon={<BulbOutlined />} color="#faad14" />
        </Col>
        <Col span={5}>
          <MetricCard title="Policy Entropy" value={metrics.entropy} icon={<RadarChartOutlined />} color="#722ed1" />
        </Col>

        <Col span={16}>
          <Card className="drl-content-card">
            <Tabs defaultActiveKey="evolution">
              <TabPane tab={<span><LineChartOutlined /> Policy Evolution Metrics</span>} key="evolution">
                <div style={{ height: 450 }}>
                   <DualAxes 
                     data={[trainingData, trainingData]}
                     xField="episode"
                     yField={['reward', 'loss']}
                     geometryOptions={[
                       { geometry: 'line', color: '#52c41a', smooth: true },
                       { geometry: 'line', color: '#ff4d4f', smooth: true }
                     ]}
                     title="Episode Reward vs Policy Loss"
                   />
                </div>
              </TabPane>
              <TabPane tab={<span><DotChartOutlined /> State-Action Space (Latent)</span>} key="latent">
                <div style={{ height: 450 }}>
                   <Scatter 
                     data={stateActionData.map(d => ({
                       x: Math.random() * 100,
                       y: Math.random() * 100,
                       action: d.action === 1 ? 'BUY' : d.action === 2 ? 'SELL' : 'HOLD',
                       confidence: d.confidence
                     }))}
                     xField="x"
                     yField="y"
                     colorField="action"
                     sizeField="confidence"
                     size={[4, 12]}
                     shape="circle"
                     pointStyle={{ fillOpacity: 0.6 }}
                     title="T-SNE Dimensionality Reduction of Strategy Manifold"
                   />
                </div>
              </TabPane>
            </Tabs>
          </Card>

          <Card title="Agent Policy Audit Trail" className="drl-content-card" style={{ marginTop: 24 }}>
             <List
               size="small"
               dataSource={[
                 { time: '17:20:05', episode: 1238, reward: 12.4, event: 'Epsilon decayed to 0.05' },
                 { time: '17:21:12', episode: 1239, reward: 15.1, event: 'KL Divergence threshold exceeded - Early stopping' },
                 { time: '17:22:45', episode: 1240, reward: 14.5, event: 'Replay buffer reshuffled - batch normalization applied' }
               ]}
               renderItem={item => (
                 <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                       <Space>
                          <Text type="secondary">[{item.time}]</Text>
                          <Text strong>Ep {item.episode}</Text>
                          <Tag color={item.reward > 10 ? 'green' : 'orange'}>Reward: {item.reward}</Tag>
                          <Text>{item.event}</Text>
                       </Space>
                       <Button size="small" icon={<GlobalOutlined />}>Explore State</Button>
                    </Space>
                 </List.Item>
               )}
             />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Hyper-Parameter Orchestration" className="drl-content-card">
             <Form layout="vertical">
                <Form.Item label="Learning Rate (α)">
                   <Slider min={0.0001} max={0.01} step={0.0001} defaultValue={hyperParams.learningRate} />
                </Form.Item>
                <Form.Item label="Discount Factor (γ)">
                   <Slider min={0.9} max={0.999} step={0.001} defaultValue={hyperParams.gamma} />
                </Form.Item>
                <Form.Item label="PPO Clip Range (ε)">
                   <Slider min={0.1} max={0.3} step={0.01} defaultValue={hyperParams.clipRange} />
                </Form.Item>
                <Form.Item label="Entropy Coefficient">
                   <Slider min={0} max={0.1} step={0.001} defaultValue={hyperParams.entCoef} />
                </Form.Item>
                <Form.Item label="Policy Network Architecture">
                   <Select defaultValue="mlp" options={[
                      { label: 'MLP (Multiple Layer Perceptron)', value: 'mlp' },
                      { label: 'CNN (Feature Extraction)', value: 'cnn' },
                      { label: 'LSTM (Temporal Memory)', value: 'lstm' }
                   ]} />
                </Form.Item>
                <Divider />
                <Form.Item label="Reward Function Strategy">
                   <Select defaultValue="pnl" options={[
                      { label: 'PnL (Direct Profit)', value: 'pnl' },
                      { label: 'Sharpe (Risk-Adjusted)', value: 'sharpe' },
                      { label: 'Sortino (Tail-Risk)', value: 'sortino' }
                   ]} />
                </Form.Item>
                <Button type="primary" block icon={<SlidersOutlined />}>Update Hyper-Params</Button>
             </Form>
          </Card>

          <Card title="Training Environment Health" className="drl-content-card" style={{ marginTop: 24 }}>
             <List size="small">
                <List.Item>
                   <Text>Market Data Fidelity</Text>
                   <Badge status="success" text="Tick-Level (High)" />
                </List.Item>
                <List.Item>
                   <Text>Simulator Latency</Text>
                   <Tag color="green">140μs</Tag>
                </List.Item>
                <List.Item>
                   <Text>Replay Buffer Load</Text>
                   <Progress percent={45} size="small" />
                </List.Item>
             </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DRLStudioPage;
