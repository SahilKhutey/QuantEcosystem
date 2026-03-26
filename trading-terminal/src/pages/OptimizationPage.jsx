import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Alert, InputNumber, Slider, Form, Switch, Statistic } from 'antd';
import { 
  RocketOutlined, 
  DashboardOutlined, 
  NodeIndexOutlined, 
  ControlOutlined, 
  ThunderboltOutlined,
  DotChartOutlined,
  RadarChartOutlined,
  StockOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  SlidersOutlined,
  InteractionOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { Area, Column, Radar, Heatmap, DualAxes } from '@ant-design/plots';
import { optimizationAPI } from '../services/api/optimization';
import MetricCard from '../components/Analytics/MetricCard';
import './OptimizationPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const OptimizationPage = () => {
  const [hftStats, setHftStats] = useState({
    avgLatency: 2.45,
    p99Latency: 8.12,
    cacheHitRate: 94.2,
    compressionRatio: 4.5,
    pipelineEfficiency: 98.4
  });

  const [allocations, setAllocations] = useState([
    { strategy: 'HFT Scalping', current: 25.0, target: 30.0, deviation: 5.0, risk: 8.2, status: 'rebalance' },
    { strategy: 'Momentum Swing', current: 35.0, target: 35.0, deviation: 0.0, risk: 4.5, status: 'stable' },
    { strategy: 'Mean Reversion', current: 15.0, target: 20.0, deviation: 5.0, risk: 3.8, status: 'rebalance' },
    { strategy: 'Options Hedge', current: 15.0, target: 10.0, deviation: -5.0, risk: 2.1, status: 'rebalance' },
    { strategy: 'Cash Reserve', current: 10.0, target: 5.0, deviation: -5.0, risk: 0.0, status: 'stable' }
  ]);

  const [rebalancingSuggestions, setRebalancingSuggestions] = useState([
    { id: 1, symbol: 'AAPL', action: 'BUY', weight: '+2.5%', reason: 'Underweight relative to momentum signal', priority: 'high' },
    { id: 2, symbol: 'BTCUSD', action: 'SELL', weight: '-1.2%', reason: 'Risk-parity threshold exceeded', priority: 'medium' },
    { id: 3, symbol: 'TSLA', action: 'BUY', weight: '+0.8%', reason: 'Alpha-factor score upgrade', priority: 'low' }
  ]);

  const hftLatencyData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      timestamp: i,
      latency: 1 + Math.random() * 3 + (i % 10 === 0 ? 5 : 0),
      threshold: 5
    }));
  }, []);

  const allocationColumns = [
    { title: 'Strategy', dataIndex: 'strategy', key: 'strategy', render: (text) => <strong>{text}</strong> },
    { title: 'Current %', dataIndex: 'current', key: 'current', render: (val) => `${val}%` },
    { title: 'Target %', dataIndex: 'target', key: 'target', render: (val) => `${val}%` },
    { 
      title: 'Deviation', 
      dataIndex: 'deviation', 
      key: 'deviation', 
      render: (val) => <Tag color={Math.abs(val) > 2 ? 'red' : 'green'}>{val > 0 ? '+' : ''}{val}%</Tag> 
    },
    { 
      title: 'Risk Score', 
      dataIndex: 'risk', 
      key: 'risk', 
      render: (val) => <Progress percent={val * 10} steps={5} size="small" strokeColor={val > 7 ? '#ff4d4f' : '#52c41a'} /> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (text) => <Badge status={text === 'stable' ? 'success' : 'processing'} text={text.toUpperCase()} /> 
    }
  ];

  return (
    <div className="optimization-page">
      <div className="optimization-header">
        <Title level={2}><RocketOutlined /> Optimization Workbench & HFT Intelligence</Title>
        <Space>
          <Button icon={<InteractionOutlined />}>Trigger Rebalancing</Button>
          <Button type="primary" icon={<ExperimentOutlined />}>Run Scenario Optimization</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* HFT Intelligence Section */}
        <Col span={6}>
          <MetricCard title="Avg Pipeline Latency" value={`${hftStats.avgLatency}ms`} icon={<ThunderboltOutlined />} color="#1890ff" trend={-12.4} />
        </Col>
        <Col span={6}>
          <MetricCard title="Cache Hit Rate" value={`${hftStats.cacheHitRate}%`} icon={<DashboardOutlined />} color="#52c41a" trend={2.1} />
        </Col>
        <Col span={6}>
          <MetricCard title="HFT Pipeline Eff." value={`${hftStats.pipelineEfficiency}%`} icon={<SafetyCertificateOutlined />} color="#722ed1" />
        </Col>
        <Col span={6}>
          <MetricCard title="Compression Ratio" value={`${hftStats.compressionRatio}x`} icon={<NodeIndexOutlined />} color="#faad14" />
        </Col>

        <Col span={24}>
           <Card className="optimization-content-card">
              <Tabs defaultActiveKey="hft">
                <TabPane tab={<span><ThunderboltOutlined /> HFT Pipeline Performance</span>} key="hft">
                  <Row gutter={24}>
                    <Col span={16}>
                      <Title level={4}>Ultra-Low Latency Telemetry (Micro-Real-Time)</Title>
                      <div style={{ height: 400 }}>
                        <DualAxes 
                          data={[hftLatencyData, hftLatencyData]}
                          xField="timestamp"
                          yField={['latency', 'threshold']}
                          geometryOptions={[
                            { geometry: 'line', color: '#1890ff', smooth: true },
                            { geometry: 'line', color: '#ff4d4f', lineDash: [4, 4] }
                          ]}
                          title="Pipeline Latency (ms) vs Threshold"
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                       <Card title="HFT Bottleneck Audit" size="small">
                          <List
                            size="small"
                            dataSource={[
                              { name: 'Data Ingestion', val: '0.45ms', status: 'success' },
                              { name: 'Technical Indicators', val: '1.12ms', status: 'success' },
                              { name: 'Sentiment NLP', val: '2.45ms', status: 'warning' },
                              { name: 'Order Book Imbalance', val: '0.85ms', status: 'success' },
                              { name: 'Execution Handshake', val: '3.20ms', status: 'warning' }
                            ]}
                            renderItem={item => (
                              <List.Item>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                   <Text>{item.name}</Text>
                                   <Tag color={item.status === 'success' ? 'green' : 'orange'}>{item.val}</Tag>
                                </Space>
                              </List.Item>
                            )}
                          />
                          <Divider />
                          <Statistic title="P99 Tail Latency" value={8.12} suffix="ms" valueStyle={{ color: '#cf1322' }} />
                       </Card>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab={<span><RadarChartOutlined /> Dynamic Capital Allocator</span>} key="allocation">
                  <Row gutter={24}>
                    <Col span={10}>
                       <Card title="Allocation Control Panel" size="small">
                         <Form layout="vertical">
                            <Form.Item label="Risk Tolerance (λ)">
                               <Slider defaultValue={0.5} min={0} max={1} step={0.1} />
                            </Form.Item>
                            <Form.Item label="Max Strategy Weight (%)">
                               <InputNumber defaultValue={40} min={10} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Optimization Objective">
                               <Select defaultValue="sharpe">
                                  <Select.Option value="sharpe">Maximize Sharpe Ratio</Select.Option>
                                  <Select.Option value="sortino">Maximize Sortino Ratio</Select.Option>
                                  <Select.Option value="risk">Minimize Volatility</Select.Option>
                               </Select>
                            </Form.Item>
                            <Button type="primary" block icon={<SlidersOutlined />}>Re-Run Allocator</Button>
                         </Form>
                       </Card>
                    </Col>
                    <Col span={14}>
                       <div style={{ height: 400 }}>
                          <Radar 
                            data={allocations.map(a => ({ name: a.strategy, value: a.current }))}
                            xField="name"
                            yField="value"
                            meta={{ value: { min: 0, max: 50 } }}
                            area={{ style: { fillOpacity: 0.2 } }}
                          />
                       </div>
                    </Col>
                    <Col span={24} style={{ marginTop: 24 }}>
                       <Table 
                         dataSource={allocations} 
                         columns={allocationColumns} 
                         pagination={false} 
                         size="small"
                       />
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab={<span><InteractionOutlined /> Rebalancing Hub</span>} key="rebalancing">
                   <Row gutter={24}>
                     <Col span={16}>
                        <Title level={4}>Actionable Rebalancing Trade List</Title>
                        <Table 
                          dataSource={rebalancingSuggestions}
                          pagination={false}
                          columns={[
                            { title: 'Symbol', dataIndex: 'symbol', render: (t) => <strong>{t}</strong> },
                            { title: 'Action', dataIndex: 'action', render: (t) => <Tag color={t === 'BUY' ? 'green' : 'red'}>{t}</Tag> },
                            { title: 'Weight Adjustment', dataIndex: 'weight' },
                            { title: 'Reasoning', dataIndex: 'reason' },
                            { title: 'Priority', dataIndex: 'priority', render: (p) => <Badge status={p === 'high' ? 'error' : p === 'medium' ? 'warning' : 'default'} text={p.toUpperCase()} /> },
                            { title: 'Execute', render: () => <Button size="small" type="primary">Execute</Button> }
                          ]}
                        />
                     </Col>
                     <Col span={8}>
                        <Card title="Optimization Audit Trail" size="small">
                           <Timeline mode="left">
                              <Timeline.Item label="17:15:05" color="green">Optimization engine started</Timeline.Item>
                              <Timeline.Item label="17:15:08" color="green">Covariance matrix updated</Timeline.Item>
                              <Timeline.Item label="17:15:10" color="blue">Black-Litterman priors applied</Timeline.Item>
                              <Timeline.Item label="17:15:12" color="blue">Rebalancing suggestions generated</Timeline.Item>
                           </Timeline>
                        </Card>
                     </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><StockOutlined /> Slippage Simulator</span>} key="slippage">
                   <Row gutter={24}>
                      <Col span={16}>
                         <Card title="Market Impact vs Order Size (Non-Linear Regression)">
                            <div style={{ height: 400 }}>
                               <Area 
                                 data={Array.from({ length: 20 }).map((_, i) => ({
                                   size: i * 100,
                                   impact: Math.pow(i, 1.5) * 0.5
                                 }))}
                                 xField="size"
                                 yField="impact"
                                 smooth
                                 color="#f5222d"
                                 title="Estimated Slippage (bps)"
                               />
                            </div>
                         </Card>
                      </Col>
                      <Col span={8}>
                         <Card title="Execution Cost Audit" size="small">
                            <Statistic title="Average Slippage" value={14.5} suffix="bps" />
                            <Divider />
                            <Statistic title="Estimated Market Impact" value={2450} prefix="$" valueStyle={{ color: '#cf1322' }} />
                            <Divider />
                            <Paragraph style={{ fontSize: '12px', color: '#8c8c8c' }}>
                               Impact is calculated using the square-root model of price dynamics based on 30-day ADV.
                            </Paragraph>
                         </Card>
                      </Col>
                   </Row>
                </TabPane>
              </Tabs>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OptimizationPage;
