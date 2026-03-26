import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, InputNumber, Slider, Alert, Radio, Switch } from 'antd';
import { 
  DeploymentUnitOutlined, 
  NodeIndexOutlined, 
  LineChartOutlined, 
  DotChartOutlined, 
  ThunderboltOutlined,
  BugOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  DotNetOutlined,
  BranchesOutlined,
  CodeOutlined,
  RadarChartOutlined,
  BoxPlotOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { modelZooAPI } from '../services/api/model_zoo';
import MetricCard from '../components/Analytics/MetricCard';
import './ModelZooPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ModelZooPage = () => {
  const [training, setTraining] = useState(false);
  const [activeModel, setActiveModel] = useState('LSTM_v4');

  const greekData = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
       price: 150 + i*5,
       delta: 0.1 + i*0.045,
       gamma: 0.01 + Math.sin(i/2) * 0.005,
       vega: 0.5 - Math.abs(i-10)*0.04
    }));
  }, []);

  const handleTrainTrigger = () => {
    setTraining(true);
    setTimeout(() => setTraining(false), 5000);
  };

  return (
    <div className="model-zoo-page">
      <div className="zoo-header">
        <Title level={2}><DeploymentUnitOutlined /> Neural Architecture & Quant Lab</Title>
        <Space>
           <Button icon={<SearchOutlined />}>Trigger NAS Sweep</Button>
           <Button type="primary" onClick={handleTrainTrigger} loading={training} icon={<ThunderboltOutlined />}>
              Re-fit Model Hyper-parameters
           </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Model Inventory & Trainer */}
        <Col span={8}>
           <Card title="Quantitative Model Zoo" className="zoo-card shadow-sm">
              <List
                size="small"
                dataSource={[
                  { id: 'LSTM_v4', name: 'Temporal LSTM v4', status: 'Fit', accuracy: '94.2%', loss: 0.012 },
                  { id: 'GARCH_11', name: 'GARCH(1,1) Volatility', status: 'Live', accuracy: 'N/A', loss: 0.045 },
                  { id: 'MARK_OPT', name: 'Markowitz SLSQP', status: 'Stable', accuracy: '88.5%', loss: 0.082 },
                  { id: 'BLACK_S', name: 'Black-Scholes V2', status: 'Active', accuracy: 'Purity 99%', loss: 0.001 }
                ]}
                renderItem={item => (
                  <List.Item 
                    className={`model-item ${activeModel === item.id ? 'active' : ''}`}
                    onClick={() => setActiveModel(item.id)}
                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'all 0.3s' }}
                  >
                     <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                           <Text strong>{item.name}</Text>
                           <Tag color={item.status === 'Live' ? 'green' : 'blue'}>{item.status}</Tag>
                        </div>
                        <div style={{ marginTop: 8 }}>
                           <Progress percent={parseFloat(item.accuracy) || 100} size="small" strokeColor="#1890ff" />
                        </div>
                     </div>
                  </List.Item>
                )}
              />
              <Divider dashed />
              <Form layout="vertical">
                 <Form.Item label="Sequence Length (Lookback)">
                    <InputNumber style={{ width: '100%' }} defaultValue={60} />
                 </Form.Item>
                 <Form.Item label="Optimizer Function">
                    <Select defaultValue="adam">
                       <Select.Option value="adam">Adam (Stochastic)</Select.Option>
                       <Select.Option value="sgd">SGD (Momentum)</Select.Option>
                       <Select.Option value="rmsprop">RMSProp</Select.Option>
                    </Select>
                 </Form.Item>
                 <Form.Item label="Model Quantization">
                    <Switch defaultChecked /> <Text type="secondary" style={{ marginLeft: 8 }}>INT8 Precision</Text>
                 </Form.Item>
              </Form>
           </Card>

           <Card title="GARCH(1,1) Volatility Persistence" className="zoo-card shadow-sm" style={{ marginTop: 24 }}>
              <div style={{ height: 200 }}>
                 <Radar 
                   data={[
                     { item: 'Omega', value: 0.05 },
                     { item: 'Alpha (Shock)', value: 0.12 },
                     { item: 'Beta (Persistence)', value: 0.83 },
                     { item: 'Mean Reversion', value: 0.45 },
                     { item: 'Log Likelihood', value: 0.92 }
                   ]}
                   xField="item"
                   yField="value"
                   meta={{ value: { min: 0, max: 1 } }}
                   area={{ style: { fillOpacity: 0.2, fill: '#722ed1' } }}
                 />
              </div>
           </Card>
        </Col>

        {/* Training & Analysis Worksurface */}
        <Col span={16}>
           <Card className="zoo-card">
              <Tabs defaultActiveKey="nas">
                 <TabPane tab={<span><NodeIndexOutlined /> NAS Training Telemetry</span>} key="nas">
                    <Title level={4}>Episode reward & Loss Convergence</Title>
                    <div style={{ height: 400 }}>
                       <DualAxes 
                          data={[
                            Array.from({ length: 50 }).map((_, i) => ({ step: i, reward: 80 + i/2 + Math.random()*5 })),
                            Array.from({ length: 50 }).map((_, i) => ({ step: i, loss: 1/(1+i/10) + Math.random()*0.05 }))
                          ]}
                          xField="step"
                          yField={['reward', 'loss']}
                          geometryOptions={[
                             { geometry: 'line', color: '#52c41a', smooth: true },
                             { geometry: 'line', color: '#ff4d4f', smooth: true }
                          ]}
                       />
                    </div>
                    <Divider />
                    <Row gutter={24}>
                       <Col span={8}>
                          <Statistic title="Current MSE Loss" value={0.0084} precision={4} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="MAE Sensitivity" value={0.125} precision={3} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="Training Steps" value={14200} />
                       </Col>
                    </Row>
                 </TabPane>

                 <TabPane tab={<span><LineChartOutlined /> Greeks Sensitivity Workbench</span>} key="greeks">
                    <Title level={4}>Black-Scholes Delta & Gamma Surface</Title>
                    <div style={{ height: 400 }}>
                       <Line 
                          data={greekData}
                          xField="price"
                          yField="delta"
                          smooth
                          lineStyle={{ stroke: '#1890ff', lineWidth: 3 }}
                       />
                       <div style={{ position: 'absolute', top: 50, right: 30, height: 200, width: 300, background: 'rgba(255,255,255,0.8)', padding: 12, borderRadius: 8 }}>
                          <Area 
                             data={greekData}
                             xField="price"
                             yField="vega"
                             smooth
                             color="#722ed1"
                          />
                          <Text style={{ fontSize: '10px' }}>Vega Decay (Theta Projection)</Text>
                       </div>
                    </div>
                 </TabPane>

                 <TabPane tab={<span><DotChartOutlined /> GARCH Volatility Surface</span>} key="vol">
                    <div style={{ height: 400 }}>
                        <Column 
                           data={Array.from({ length: 30 }).map((_, i) => ({
                              time: i,
                              vol: 20 + 5 * Math.sin(i/3) + Math.random() * 2
                           }))}
                           xField="time"
                           yField="vol"
                           color="#ff4d4f"
                        />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Low-Level Model Diagnostics */}
        <Col span={24}>
           <Card title={<Space><BranchesOutlined /> Model Diagnostic Audit (Quant Engine Parity)</Space>} className="zoo-card shadow-sm">
              <Row gutter={16}>
                 <Col span={6}>
                    <Statistic title="Inference Latency" value={1.2} suffix="ms" valueStyle={{ color: '#52c41a' }} />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Tensor Memory" value={256} suffix="MB" />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Pruning Ratio" value="12.5%" />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Model Version" value="v4.2.1-prod" />
                 </Col>
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModelZooPage;
