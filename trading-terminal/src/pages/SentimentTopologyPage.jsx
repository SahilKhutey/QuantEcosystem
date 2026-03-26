import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Input, Alert, Timeline } from 'antd';
import { 
  ClusterOutlined, 
  NodeIndexOutlined, 
  MessageOutlined, 
  GlobalOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  DotChartOutlined,
  AimOutlined,
  FilterOutlined,
  SyncOutlined,
  SearchOutlined,
  HistoryOutlined,
  AlertOutlined,
  BarChartOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge, Chord } from '@ant-design/plots';
import { sentimentTopologyAPI } from '../services/api/sentiment_topology';
import MetricCard from '../components/Analytics/MetricCard';
import './SentimentTopologyPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SentimentTopologyPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeAsset, setActiveAsset] = useState('BTC/USD');

  const entityData = [
    { source: 'US FED', target: 'Yield Curve', value: 85, type: 'Bullish' },
    { source: 'OPEC+', target: 'OIL/USD', value: 92, type: 'Bullish' },
    { source: 'Elon Musk', target: 'TSLA', value: 78, type: 'Volatile' },
    { source: 'SEC Gov', target: 'BTC/USD', value: 65, type: 'Bearish' },
    { source: 'China GDP', target: 'EM Markets', value: 42, type: 'Moderate' },
    { source: 'UK BoE', target: 'GBP/USD', value: 55, type: 'Neutral' }
  ];

  return (
    <div className="sentiment-topology-page">
      <div className="sentiment-header">
        <Title level={2}><ClusterOutlined /> NLP Sentiment Topology & Signal Attribution</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>Signal Forensic Replay</Button>
           <Button type="primary" icon={<SyncOutlined />}>Trigger Sentiment Sweep</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Real-time Sentiment DNA */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Systemic Sentiment Score" value="0.42" trend={12} icon={<GlobalOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="NLP Entity Coverage" value="1,420" trend={5} suffix=" Nodes" icon={<DeploymentUnitOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Signal Accuracy (P95)" value="78.2%" trend={2} icon={<SafetyCertificateOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Attribution Convergence" value="0.12ms" icon={<ThunderboltOutlined />} color="#722ed1" />
              </Col>
           </Row>
        </Col>

        {/* Entity-Impact Chord Diagram */}
        <Col span={12}>
           <Card title="NLP Entity-Impact Topology" className="sentiment-card shadow-sm">
              <div style={{ height: 400 }}>
                 <Chord 
                    data={entityData}
                    sourceField="source"
                    targetField="target"
                    weightField="value"
                    colorField="type"
                    label={{ style: { fill: '#333', fontSize: 10 } }}
                 />
              </div>
              <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                 Node weight represents 'Entity Centrality' in the current news cycle. Edges represent 'Thematic Transference' (aligning with `sentiment_engine/logic.py`).
              </Paragraph>
           </Card>
        </Col>

        {/* Signal-to-Trade Attribution */}
        <Col span={12}>
           <Card className="sentiment-card">
              <Tabs defaultActiveKey="attribution">
                 <TabPane tab={<span><AimOutlined /> Signal-to-Trade Attribution</span>} key="attribution">
                    <Timeline mode="left">
                       <Timeline.Item label="14:42:01" color="green">
                          <Text strong>Entity Identified: FED (Bullish Tone)</Text>
                          <Paragraph style={{ fontSize: '11px' }}>Raw NLP Score: 0.84. Impact Vector: +12bps on USD Correlation.</Paragraph>
                       </Timeline.Item>
                       <Timeline.Item label="14:42:05" color="blue">
                          <Text strong>Signal Triggered: LONG EUR/USD (Proxy)</Text>
                          <Paragraph style={{ fontSize: '11px' }}>Strategy: Macro Momentum. Allocation: 2% Risk Budget.</Paragraph>
                       </Timeline.Item>
                       <Timeline.Item label="14:42:12" dot={<DotChartOutlined style={{ color: '#1890ff' }} />}>
                          <Text strong>Execution Confirmation</Text>
                          <Paragraph style={{ fontSize: '11px' }}>Price: 1.0842. Slippage: 0.2 pips. Filling Probe: Done.</Paragraph>
                       </Timeline.Item>
                    </Timeline>
                    <Divider />
                    <Title level={5}>Cross-Asset Sentiment Drift</Title>
                    <div style={{ height: 200 }}>
                       <Line 
                          data={Array.from({ length: 30 }).map((_, i) => ({ time: i, sent: 0.5 + 0.2 * Math.sin(i/3) + Math.random() * 0.1 }))}
                          xField="time"
                          yField="sent"
                          color="#52c41a"
                       />
                    </div>
                 </TabPane>

                 <TabPane tab={<span><BarChartOutlined /> Thematic Heatmap</span>} key="thematic">
                    <div style={{ height: 400 }}>
                       <Heatmap 
                          data={['Inflation', 'GDP', 'Energy', 'War', 'Tech'].flatMap(theme => 
                            ['USD', 'EUR', 'JPY', 'GOLD', 'BTC'].map(asset => ({
                               theme,
                               asset,
                               impact: Math.random() * 100
                            }))
                          )}
                          xField="asset"
                          yField="theme"
                          colorField="impact"
                          color={['#ffffff', '#1890ff', '#001529']}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* NLP Diagnostic Audits */}
        <Col span={24}>
           <Card title={<Space><SearchOutlined /> NLP Forensic Signal Search</Space>} className="sentiment-card shadow-sm">
              <Form layout="inline" style={{ marginBottom: 16 }}>
                 <Form.Item style={{ width: 400 }}>
                    <Input placeholder="Enter Entity (e.g., 'Jerome Powell', 'Semiconductor Shortage')" prefix={<FilterOutlined />} />
                 </Form.Item>
                 <Form.Item>
                    <Button type="primary">Search DNA</Button>
                 </Form.Item>
              </Form>
              <Table 
                 size="small"
                 dataSource={[
                   { key: '1', news: 'US inflation data suggests cooling labor market.', score: '+0.62', impact: 'Moderate', result: 'BUY Sp&500' },
                   { key: '2', news: 'China factory output declines for 3rd month.', score: '-0.74', impact: 'High', result: 'SELL Commodities' },
                   { key: '3', news: 'NVIDIA announces next-gen H200 chips.', score: '+0.88', impact: 'extreme', result: 'BUY Tech' }
                 ]}
                 columns={[
                    { title: 'Source News Vector', dataIndex: 'news', key: 'news', width: '60%' },
                    { title: 'NLP Score', dataIndex: 'score', key: 'score', render: (s) => <Tag color={s.startsWith('+') ? 'green' : 'volcano'}>{s}</Tag> },
                    { title: 'Market Impact', dataIndex: 'impact', key: 'impact' },
                    { title: 'Execution Result', dataIndex: 'result', key: 'result' }
                 ]}
                 pagination={false}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SentimentTopologyPage;
