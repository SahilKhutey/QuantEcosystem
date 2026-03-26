import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Alert, Timeline } from 'antd';
import { 
  GlobalOutlined, 
  BankOutlined, 
  RiseOutlined, 
  LineChartOutlined, 
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  DeploymentUnitOutlined,
  SyncOutlined,
  AimOutlined,
  PieChartOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  DotChartOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { macroHubAPI } from '../services/api/macro_hub';
import MetricCard from '../components/Analytics/MetricCard';
import './MacroHubPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MacroHubPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState('GLOBAL');

  const inflationData = [
    { country: 'USA', cpi: 3.2, gdp: 2.1, rate: 5.5, sentiment: 'Neutral' },
    { country: 'UK', cpi: 4.1, gdp: 0.5, rate: 5.25, sentiment: 'Bearish' },
    { country: 'EU', cpi: 2.8, gdp: 0.8, rate: 4.5, sentiment: 'Moderate' },
    { country: 'Japan', cpi: 2.4, gdp: 1.2, rate: 0.1, sentiment: 'Bullish' },
    { country: 'China', cpi: 0.1, gdp: 5.2, rate: 3.45, sentiment: 'Fragile' }
  ];

  return (
    <div className="macro-hub-page">
      <div className="macro-header">
        <Title level={2}><GlobalOutlined /> Institutional Macro Intelligence Hub</Title>
        <Space>
           <Button icon={<HistoryOutlined />}>Historic Cycle Replay</Button>
           <Button type="primary" icon={<SyncOutlined />}>Trigger Macro Sweep</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Real-time Macro DNA */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Systemic Risk Sentiment" value="0.48" trend={-12} icon={<SafetyOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Fed Funds Rate Prob" value="5.50%" trend={0} suffix=" (Unchanged)" icon={<BankOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Global Inflation (Avg)" value="3.12%" trend={2} icon={<RiseOutlined />} color="#ff4d4f" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Macro Correlation Vol" value="0.22" icon={<LineChartOutlined />} color="#52c41a" />
              </Col>
           </Row>
        </Col>

        {/* Global Inflation Heatmap */}
        <Col span={14}>
           <Card title="Global Inflation & Growth Topology" className="macro-card shadow-sm">
              <div style={{ height: 400 }}>
                 <Scatter 
                    data={inflationData}
                    xField="gdp"
                    yField="cpi"
                    colorField="country"
                    size={25}
                    shape="circle"
                    pointStyle={{ fillOpacity: 0.6 }}
                 />
              </div>
              <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                 Mapping relative economic strength vs inflationary pressure (aligning with `macro_service.py`).
              </Paragraph>
           </Card>
        </Col>

        {/* Interest Rate Probability Curve */}
        <Col span={10}>
           <Card className="macro-card">
              <Tabs defaultActiveKey="rates">
                 <TabPane tab={<span><BankOutlined /> Rate Probability Curve</span>} key="rates">
                    <Title level={5}>CME FedWatch Projections (May 2026)</Title>
                    <div style={{ height: 350 }}>
                       <Column 
                          data={[
                            { rate: '5.00-5.25', prob: 0.12 },
                            { rate: '5.25-5.50', prob: 0.74 },
                            { rate: '5.50-5.75', prob: 0.14 }
                          ]}
                          xField="rate"
                          yField="prob"
                          color="#1890ff"
                       />
                    </div>
                    <Divider />
                    <Alert 
                      message="Monetary Divergence Warning" 
                      description="Market-implied 74% probability of rate hold. Dissenting hawks cite resilient labor market metrics."
                      type="info"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><EnvironmentOutlined /> Regional Alpha Sentiment</span>} key="sentiment">
                    <div style={{ height: 400 }}>
                       <Radar 
                          data={[
                             { item: 'North America', value: 85 },
                             { item: 'Western Europe', value: 42 },
                             { item: 'Emerging Asia', value: 92 },
                             { item: 'LATAM', value: 55 },
                             { item: 'Africa', value: 38 }
                          ]}
                          xField="item"
                          yField="value"
                          meta={{ value: { min: 0, max: 100 } }}
                          area={{ style: { fillOpacity: 0.1, fill: '#52c41a' } }}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Economic Calendar Forensic Stream */}
        <Col span={24}>
           <Card title={<Space><HistoryOutlined /> Weekly Economic Calendar Forensics</Space>} className="macro-card shadow-sm">
              <Table 
                 size="small"
                 dataSource={[
                   { key: '1', date: '2026-03-24 14:30', country: 'USA', event: 'Initial Jobless Claims', impact: 'High', actual: '210K', forecast: '205K', status: 'Worse' },
                   { key: '2', date: '2026-03-25 10:00', country: 'EU', event: 'Eurozone CPI (YoY)', impact: 'Crucial', actual: '2.4%', forecast: '2.6%', status: 'Better' },
                   { key: '3', date: '2026-03-26 15:00', country: 'GB', event: 'BoE Interest Rate Decision', impact: 'Extreme', actual: '???', forecast: '5.25%', status: 'Pending' }
                 ]}
                 columns={[
                    { title: 'GMT Timestamp', dataIndex: 'date', key: 'date' },
                    { title: 'Country/Region', dataIndex: 'country', key: 'country', render: (c) => <Tag>{c}</Tag> },
                    { title: 'Indicator Asset Event', dataIndex: 'event', key: 'event', render: (e) => <Text strong>{e}</Text> },
                    { title: 'Market Impact', dataIndex: 'impact', key: 'impact' },
                    { title: 'Actual Delta', dataIndex: 'actual', key: 'actual' },
                    { title: 'Forecast', dataIndex: 'forecast', key: 'forecast' },
                    { title: 'Surprise Status', dataIndex: 'status', key: 'status', render: (s) => <Badge status={s === 'Better' ? 'success' : s === 'Worse' ? 'error' : 'processing'} text={s} /> }
                 ]}
                 pagination={false}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MacroHubPage;
