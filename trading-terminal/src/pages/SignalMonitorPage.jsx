import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, Switch, Alert, Timeline } from 'antd';
import { 
  ThunderboltOutlined, 
  NodeIndexOutlined, 
  SyncOutlined, 
  SearchOutlined, 
  HistoryOutlined, 
  AlertOutlined, 
  BarChartOutlined, 
  DeploymentUnitOutlined,
  CloudUploadOutlined,
  PlayCircleOutlined,
  MonitorOutlined,
  SearchOutlined as FilterOutlined,
  DotChartOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { signalMonitorAPI } from '../services/api/signal_monitor';
import MetricCard from '../components/Analytics/MetricCard';
import './SignalMonitorPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SignalMonitorPage = () => {
  const [running, setRunning] = useState(false);
  const [activeSignal, setActiveSignal] = useState('ALPHA_GEN_V4');

  const signalPropData = [
    { source: 'Reuters News', target: 'NLP Parser', value: 840, latency: '12ms' },
    { source: 'NLP Parser', target: 'Feature Eng.', value: 820, latency: '5ms' },
    { source: 'Feature Eng.', target: 'Neural Signal', value: 815, latency: '24ms' },
    { source: 'Neural Signal', target: 'Execution Bus', value: 810, latency: '2ms' }
  ];

  return (
    <div className="signal-monitor-page">
      <div className="monitor-header">
        <Title level={2}><ThunderboltOutlined /> HFT Signal Propagation & Anomaly Trace</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>Signal Forensic Replay</Button>
           <Button type="primary" icon={<SyncOutlined />}>Trigger Anomaly Scan</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Signal DNA Trace */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Signal Propagation Rate" value="1,240" trend={12} suffix=" /sec" icon={<SyncOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="E2E Latency (P99)" value="42.5ms" trend={-5} icon={<ThunderboltOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Active Features" value="4,210" icon={<DeploymentUnitOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Z-Score Extremes" value="12" icon={<AlertOutlined />} color="#ff4d4f" />
              </Col>
           </Row>
        </Col>

        {/* Signal Flow Topology */}
        <Col span={12}>
           <Card title="Signal Propagation Flow (Sanity Trace)" className="monitor-card shadow-sm">
              <div style={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <Timeline mode="alternate">
                    {signalPropData.map((item, i) => (
                       <Timeline.Item key={i} color={i === 3 ? 'green' : 'blue'} label={item.latency}>
                          <Text strong>{item.target}</Text>
                          <Paragraph style={{ fontSize: '11px' }}>Throughput: {item.value} tx/s</Paragraph>
                       </Timeline.Item>
                    ))}
                 </Timeline>
              </div>
              <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                 Visualizes the lifecycle of a high-signal event from raw data to execution (aligning with `signal_engine.py`).
              </Paragraph>
           </Card>
        </Col>

        {/* Anomaly Stream & Feature Stats */}
        <Col span={12}>
           <Card className="monitor-card">
              <Tabs defaultActiveKey="anomalies">
                 <TabPane tab={<span><AlertOutlined /> Anomaly Detection Stream</span>} key="anomalies">
                    <List
                      size="small"
                      dataSource={[
                        { id: '1', asset: 'NVDA', type: 'Volume Surge', z: 4.8, time: '14:42:01' },
                        { id: '2', asset: 'BTC/USD', type: 'Price Divergence', z: 3.2, time: '14:41:55' },
                        { id: '3', asset: 'GOLD', type: 'Correlation Break', z: 5.1, time: '14:41:42' },
                        { id: '4', asset: 'TSLA', type: 'Order Book Imbalance', z: 3.9, time: '14:41:30' }
                      ]}
                      renderItem={item => (
                        <List.Item>
                           <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Space>
                                 <Badge status="error" />
                                 <Text strong>{item.asset}</Text>
                                 <Text type="secondary">{item.type}</Text>
                              </Space>
                              <Space>
                                 <Tag color="volcano">Z: {item.z}</Tag>
                                 <Text style={{ fontSize: '10px' }}>{item.time}</Text>
                              </Space>
                           </div>
                        </List.Item>
                      )}
                    />
                    <Divider />
                    <Button block icon={<HistoryOutlined />}>View Full Anomaly Forensics</Button>
                 </TabPane>

                 <TabPane tab={<span><DotChartOutlined /> Feature Importance Radar</span>} key="features">
                    <div style={{ height: 400 }}>
                       <Radar 
                          data={[
                             { item: 'RSI Momentum', value: 85 },
                             { item: 'MACD Trend', value: 72 },
                             { item: 'NLP Sentiment', value: 94 },
                             { item: 'Volume Ratio', value: 65 },
                             { item: 'Macro Risk-On', value: 88 }
                          ]}
                          xField="item"
                          yField="value"
                          meta={{ value: { min: 0, max: 100 } }}
                          area={{ style: { fillOpacity: 0.1, fill: '#faad14' } }}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Feature Engineering Telemetry */}
        <Col span={24}>
           <Card title={<Space><MonitorOutlined /> HFT Feature Calculation Telemetry</Space>} className="monitor-card shadow-sm">
              <Row gutter={24}>
                 <Col span={6}>
                    <Statistic title="Calculation Throughput" value={42100} suffix=" ops/ms" />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Model Drift (KL-Div)" value={0.0024} precision={4} />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Pipeline Health" value="99.98%" valueStyle={{ color: '#52c41a' }} />
                 </Col>
                 <Col span={6}>
                    <Statistic title="Worker Threads" value={32} />
                 </Col>
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignalMonitorPage;
