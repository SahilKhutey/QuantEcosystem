import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Timeline, Alert, Popover } from 'antd';
import { 
  GlobalOutlined, 
  LineChartOutlined, 
  ThunderboltOutlined, 
  DashboardOutlined, 
  SafetyCertificateOutlined,
  DotChartOutlined,
  RadarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  BgColorsOutlined,
  SlidersOutlined,
  ExperimentOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Radar, Heatmap, DualAxes } from '@ant-design/plots';
import { macroAPI } from '../services/api/macro';
import MetricCard from '../components/Analytics/MetricCard';
import './MacroPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MacroPage = () => {
  const [macroStats, setMacroStats] = useState({
    fedRate: 5.25,
    cpi: 3.1,
    gdpGrowth: 2.4,
    unemployment: 3.8,
    riskScore: 0.65
  });

  const [economicEvents, setEconomicEvents] = useState([
    { date: '17:30', event: 'FOMC Statement', impact: 'High', actual: '5.25%', forecast: '5.25%', previous: '5.25%' },
    { date: '18:15', event: 'Consumer Confidence', impact: 'Medium', actual: '104.5', forecast: '103.0', previous: '101.2' },
    { date: '19:00', event: '10-Year Bond Auction', impact: 'Medium', actual: '4.2%', forecast: '4.3%', previous: '4.1%' }
  ]);

  const rotationData = [
    { sector: 'Technology', momentum: 0.85, flow: 1240 },
    { sector: 'Energy', momentum: -0.12, flow: -450 },
    { sector: 'Finance', momentum: 0.45, flow: 890 },
    { sector: 'Healthcare', momentum: 0.22, flow: 120 },
    { sector: 'Utilities', momentum: -0.35, flow: -670 }
  ];

  const historicalTrends = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      date: `2024-03-${i+1}`,
      cpi: 3.0 + Math.sin(i / 10) * 0.2 + Math.random() * 0.1,
      unemployment: 3.9 - Math.sin(i / 15) * 0.1
    }));
  }, []);

  return (
    <div className="macro-page">
      <div className="macro-header">
        <Title level={2}><GlobalOutlined /> Global Macro Intelligence Hub</Title>
        <Space>
          <Button icon={<AimOutlined />}>Trigger Sector Allocation</Button>
          <Button type="primary" icon={<ExperimentOutlined />}>Macro Stress Simulation</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={4}>
          <MetricCard title="FED Funds Rate" value={`${macroStats.fedRate}%`} icon={<ThunderboltOutlined />} color="#1890ff" />
        </Col>
        <Col span={5}>
          <MetricCard title="CPI (Inflation)" value={`${macroStats.cpi}%`} icon={<ArrowUpOutlined />} color="#ff4d4f" trend={2.4} />
        </Col>
        <Col span={5}>
          <MetricCard title="GDP Growth" value={`${macroStats.gdpGrowth}%`} icon={<LineChartOutlined />} color="#52c41a" trend={0.5} />
        </Col>
        <Col span={5}>
          <MetricCard title="Unemployment" value={`${macroStats.unemployment}%`} icon={<ArrowDownOutlined />} color="#faad14" trend={-1.2} />
        </Col>
        <Col span={5}>
          <MetricCard title="Composite Risk Score" value={macroStats.riskScore} icon={<RadarChartOutlined />} color="#722ed1" precision={2} />
        </Col>

        <Col span={16}>
          <Card className="macro-content-card">
            <Tabs defaultActiveKey="indicators">
               <TabPane tab={<span><LineChartOutlined /> FRED Economic Telemetry</span>} key="indicators">
                 <div style={{ height: 450 }}>
                    <DualAxes 
                      data={[historicalTrends, historicalTrends]}
                      xField="date"
                      yField={['cpi', 'unemployment']}
                      geometryOptions={[
                        { geometry: 'line', color: '#ff4d4f', smooth: true },
                        { geometry: 'line', color: '#1890ff', smooth: true }
                      ]}
                      title="Inflation vs Unemployment (The Phillips Curve Cluster)"
                    />
                 </div>
               </TabPane>
               <TabPane tab={<span><DotChartOutlined /> Sector Rotation Momentum</span>} key="rotation">
                  <Row gutter={24}>
                    <Col span={14}>
                       <Title level={4}>Momentum Score vs Capital Flow ($M)</Title>
                       <div style={{ height: 350 }}>
                          <Column 
                             data={rotationData}
                             xField="sector"
                             yField="momentum"
                             color={({ momentum }) => momentum > 0 ? '#52c41a' : '#ff4d4f'}
                             label={{ position: 'top', style: { fill: '#000' } }}
                          />
                       </div>
                    </Col>
                    <Col span={10}>
                       <Card title="Flow Distribution" size="small">
                          <List
                            size="small"
                            dataSource={rotationData}
                            renderItem={item => (
                              <List.Item>
                                 <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Text>{item.sector}</Text>
                                    <Space>
                                       <Tag color={item.flow > 0 ? 'green' : 'red'}>{item.flow > 0 ? '+' : ''}{item.flow}M</Tag>
                                       <Progress percent={Math.abs(item.momentum) * 100} size="small" style={{ width: 50 }} />
                                    </Space>
                                 </Space>
                              </List.Item>
                            )}
                          />
                       </Card>
                    </Col>
                  </Row>
               </TabPane>
            </Tabs>
          </Card>

          <Card title="Economic Calendar (Institutional Stream)" className="macro-content-card" style={{ marginTop: 24 }}>
             <Table 
               dataSource={economicEvents}
               size="small"
               pagination={false}
               columns={[
                 { title: 'Time', dataIndex: 'date' },
                 { title: 'Event', dataIndex: 'event', render: (t) => <strong>{t}</strong> },
                 { title: 'Impact', dataIndex: 'impact', render: (i) => <Badge status={i === 'High' ? 'error' : 'warning'} text={i.toUpperCase()} /> },
                 { title: 'Actual', dataIndex: 'actual' },
                 { title: 'Forecast', dataIndex: 'forecast' },
                 { title: 'Previous', dataIndex: 'previous' },
                 { title: 'Alert', render: () => <Button size="small" icon={<NotificationOutlined />} /> }
               ]}
             />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Composite Risk-On/Off Sentiment" className="macro-content-card">
              <div style={{ height: 350 }}>
                  <Radar 
                    data={[
                      { item: 'Treasury Yields', value: 85 },
                      { item: 'VIX Volatility', value: 45 },
                      { item: 'Dollar Index', value: 65 },
                      { item: 'Commodity Basket', value: 30 },
                      { item: 'High Yield Spreads', value: 70 }
                    ]}
                    xField="item"
                    yField="value"
                    meta={{ value: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.3 } }}
                  />
              </div>
          </Card>

          <Card title="Macro Regime Detection" className="macro-content-card" style={{ marginTop: 24 }}>
             <Alert 
               message="Current Regime: Stagflation Risk (Moderate)" 
               description="High inflation coupled with slowing GDP growth detected in APAC/EM regions. Portfolio recommendation: Overweight Gold/Commodities."
               type="warning"
               showIcon
             />
             <Divider />
             <List size="small">
                <List.Item>
                   <Text>Recession Probability (12M)</Text>
                   <Badge status="processing" text="24.5%" />
                </List.Item>
                <List.Item>
                   <Text>FED Pivot Confidence</Text>
                   <Progress percent={65} size="small" />
                </List.Item>
             </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MacroPage;
