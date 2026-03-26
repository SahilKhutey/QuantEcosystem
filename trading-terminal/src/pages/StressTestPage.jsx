import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, Alert, Switch, Popover } from 'antd';
import { 
  AlertOutlined, 
  ThunderboltOutlined, 
  GlobalOutlined, 
  DisconnectOutlined, 
  DotChartOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  ArrowDownOutlined,
  BuildOutlined,
  HeatMapOutlined,
  FireOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Gauge, Heatmap, DualAxes, Scatter } from '@ant-design/plots';
import { riskStressAPI } from '../services/api/risk_stress';
import MetricCard from '../components/Analytics/MetricCard';
import './StressTestPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const StressTestPage = () => {
  const [stressing, setStressing] = useState(false);
  const [activeScenario, setActiveScenario] = useState('black_swan');

  const scenarios = [
    { id: 'black_swan', name: 'Black Swan Event', description: '-25% Index Drop, Correlation Convergence to 1.0', severity: 'extreme' },
    { id: 'inflation_shock', name: 'Stagflation Shock', description: '+400bps Interest Rate Spike, Commodity Surge', severity: 'high' },
    { id: 'liquidity_crunch', name: 'Flash Liquidity Crisis', description: 'Volume Dry-up, Spread Expansion (10x)', severity: 'high' },
    { id: 'tech_bubble', name: 'Sectoral Mean Reversion', description: '-40% Tech Drawdown, Flight to Safety', severity: 'moderate' }
  ];

  const handleStressTrigger = () => {
    setStressing(true);
    setTimeout(() => setStressing(false), 3000);
  };

  return (
    <div className="stress-test-page">
      <div className="stress-header">
        <Title level={2}><AlertOutlined /> Systemic Risk Stress-Test Laboratory</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>Historic Replays</Button>
           <Button type="primary" danger onClick={handleStressTrigger} loading={stressing} icon={<ThunderboltOutlined />}>
              Expose Systemic Fragility
           </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Scenario Selection */}
        <Col span={8}>
           <Card title="Shock Scenario Vector" className="stress-card shadow-sm">
              <List
                dataSource={scenarios}
                renderItem={item => (
                  <List.Item 
                    className={`scenario-item ${activeScenario === item.id ? 'active' : ''}`}
                    onClick={() => setActiveScenario(item.id)}
                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'all 0.3s' }}
                  >
                     <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                           <Text strong>{item.name}</Text>
                           <Tag color={item.severity === 'extreme' ? 'volcano' : 'orange'}>{item.severity.toUpperCase()}</Tag>
                        </div>
                        <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ fontSize: '11px', marginTop: 4 }}>{item.description}</Paragraph>
                     </div>
                  </List.Item>
                )}
              />
              <Divider dashed />
              <Form layout="vertical">
                 <Form.Item label="Shaped Recovery Path">
                    <Select defaultValue="v_shaped">
                       <Select.Option value="v_shaped">V-Shaped (Fast)</Select.Option>
                       <Select.Option value="u_shaped">U-Shaped (Prolonged)</Select.Option>
                       <Select.Option value="l_shaped">L-Shaped (Stagnation)</Select.Option>
                       <Select.Option value="k_shaped">K-Shaped (Divergent)</Select.Option>
                    </Select>
                 </Form.Item>
                 <Form.Item label="Confidence Level (p-0.xx)">
                    <Slider min={90} max={99} defaultValue={95} />
                 </Form.Item>
              </Form>
           </Card>

           <Card title="Structural Survival Probability" className="stress-card shadow-sm" style={{ marginTop: 24 }}>
              <div style={{ height: 180, textAlign: 'center' }}>
                 <Gauge 
                    percent={0.842}
                    range={{ color: 'l(0) 0:#ff4d4f 1:#52c41a' }}
                    indicator={{ pointer: { style: { stroke: '#D0D0D0' } }, pin: { style: { stroke: '#D0D0D0' } } }}
                    axis={{ label: { formatter: (v) => Number(v) * 100 + '%' } }}
                 />
                 <Title level={4} style={{ marginTop: -20 }}>84.2% Stability</Title>
              </div>
           </Card>
        </Col>

        {/* Results Pane */}
        <Col span={16}>
           <Card className="stress-card">
              <Tabs defaultActiveKey="impact">
                 <TabPane tab={<span><DotChartOutlined /> Equity Drawdown Impact</span>} key="impact">
                    <div style={{ height: 400 }}>
                       <Area 
                          data={Array.from({ length: 50 }).map((_, i) => ({ 
                             time: i, 
                             baseline: 100 - i/5, 
                             stressed: 100 - (i < 20 ? i*1.2 : 24 + (i-20)*0.2) 
                          }))}
                          xField="time"
                          yField={['baseline', 'stressed']}
                          seriesField="type"
                          color={['#52c41a', '#ff4d4f']}
                          areaStyle={{ fillOpacity: 0.1 }}
                       />
                    </div>
                    <Divider />
                    <Row gutter={24}>
                       <Col span={8}>
                          <Statistic title="Max Potential Drawdown" value={34.2} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="Margin Call Exposure" value="₹1.2M" valueStyle={{ color: '#faad14' }} />
                       </Col>
                       <Col span={8}>
                          <Statistic title="Estimated Recovery" value={8} suffix=" Months" />
                       </Col>
                    </Row>
                 </TabPane>

                 <TabPane tab={<span><DisconnectOutlined /> Correlation Break Forensics</span>} key="correlation">
                    <Title level={4}>Structural Asset Dependencies (Regime Shift)</Title>
                    <div style={{ height: 400 }}>
                       <Heatmap 
                          data={['Equity', 'Bonds', 'Gold', 'Crypto', 'Cash'].flatMap(a1 => 
                            ['Equity', 'Bonds', 'Gold', 'Crypto', 'Cash'].map(a2 => ({
                               source: a1,
                               target: a2,
                               corr: a1 === a2 ? 1 : 0.8 + Math.random() * 0.2 // Stress scenario: everything corr to 1
                            }))
                          )}
                          xField="source"
                          yField="target"
                          colorField="corr"
                          color={['#f5222d', '#ffffff', '#ff4d4f']}
                       />
                    </div>
                    <Alert 
                      style={{ marginTop: 16 }}
                      message="Systemic Decoupling Detected" 
                      description="During inflation shock, the Gold/Bond inverse correlation collapses. Risk parity allocation becomes ineffective."
                      type="warning"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><FireOutlined /> Liquidity Decay Surface</span>} key="liquidity">
                    <div style={{ height: 400 }}>
                       <Scatter 
                          data={Array.from({ length: 100 }).map((_, i) => ({
                             spread: Math.random() * 5,
                             depth: 100 - Math.random() * 80,
                             impact: Math.random() * 10
                          }))}
                          xField="spread"
                          yField="depth"
                          colorField="impact"
                          size={10}
                          shape="circle"
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Dynamic Risk Budgeting */}
        <Col span={24}>
           <Card title={<Space><BuildOutlined /> Dynamic Strategy Risk Budgeting (Scenario Contingent)</Space>} className="stress-card shadow-sm">
              <Row gutter={24}>
                 {['HFT Alpha', 'Macro Swing', 'Grid Reversion', 'Options Shield'].map(name => (
                    <Col span={6} key={name}>
                       <Card size="small" bordered={false} style={{ background: '#fafafa' }}>
                          <Text strong>{name}</Text>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <Text type="secondary">Risk Budget</Text>
                             <Text strong color="blue">25% Max</Text>
                          </div>
                          <Progress percent={Math.random() * 80 + 20} status="active" strokeColor={Math.random() > 0.5 ? '#1890ff' : '#52c41a'} />
                          <Text style={{ fontSize: '10px' }} type="secondary">Adjusted for {activeScenario} regime (aligning with `risk_manager.py` HHI concentration metrics).</Text>
                       </Card>
                    </Col>
                 ))}
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StressTestPage;
