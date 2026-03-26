import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, InputNumber } from 'antd';
import { 
  GoldOutlined, 
  LineChartOutlined, 
  DotChartOutlined, 
  SafetyCertificateOutlined, 
  SyncOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  RadarChartOutlined,
  BarChartOutlined,
  SwapOutlined,
  DollarOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Area, Column, Pie, Radar, DualAxes } from '@ant-design/plots';
import { commoditiesAPI } from '../services/api/commodities';
import MetricCard from '../components/Analytics/MetricCard';
import './CommoditiesPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CommoditiesPage = () => {
  const [goldHedge, setGoldHedge] = useState({
    ratio: 15.2,
    portfolioValue: 1000000,
    equityExposure: 750000,
    riskLevel: 'moderate'
  });

  const goldComparisonData = [
    { type: 'Sovereign (SGB)', return: 9.2, cost: 0.0, liquidity: 70, safety: 95, tax: 'Tax-free' },
    { type: 'ETF', return: 8.5, cost: 0.8, liquidity: 90, safety: 85, tax: 'LTCG' },
    { type: 'Digital Gold', return: 8.2, cost: 1.5, liquidity: 85, safety: 75, tax: 'LTCG' },
    { type: 'Physical', return: 7.8, cost: 12.0, liquidity: 50, safety: 60, tax: 'LTCG' }
  ];

  const goldPriceHistory = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      date: `2024-03-${i+1}`,
      price: 6000 + Math.sin(i / 5) * 200 + Math.random() * 100
    }));
  }, []);

  return (
    <div className="commodities-page">
      <div className="commodities-header">
        <Title level={2}><GoldOutlined /> Commodities Intelligence & Gold Hub</Title>
        <Space>
          <Button icon={<SwapOutlined />}>Trigger Hedge Rebalancing</Button>
          <Button type="primary" icon={<HistoryOutlined />}>Commodity Sector Audit</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="Spot Gold (per g)" value="₹6,450" icon={<GoldOutlined />} color="#faad14" trend={1.2} />
        </Col>
        <Col span={6}>
          <MetricCard title="Portfolio Hedge Ratio" value={`${goldHedge.ratio}%`} icon={<SafetyCertificateOutlined />} color="#52c41a" />
        </Col>
        <Col span={6}>
          <MetricCard title="Market Volatility (VIX)" value="15.2" icon={<LineChartOutlined />} color="#1890ff" />
        </Col>
        <Col span={6}>
          <MetricCard title="Commodity Correlation" value="0.12" icon={<RadarChartOutlined />} color="#722ed1" />
        </Col>

        <Col span={16}>
          <Card className="commodities-content-card">
             <Tabs defaultActiveKey="hedge">
                <TabPane tab={<span><SafetyCertificateOutlined /> Dynamic Gold Hedge Simulator</span>} key="hedge">
                   <Row gutter={24}>
                      <Col span={10}>
                         <Card title="Hedge Calculator" size="small">
                            <Form layout="vertical">
                               <Form.Item label="Portfolio Value ($)">
                                  <InputNumber defaultValue={1000000} style={{ width: '100%' }} />
                               </Form.Item>
                               <Form.Item label="Equity Exposure (%)">
                                  <Slider defaultValue={75} />
                               </Form.Item>
                               <Form.Item label="Risk Appetite">
                                  <Select defaultValue="moderate" options={[
                                     { label: 'Conservative', value: 'conservative' },
                                     { label: 'Moderate', value: 'moderate' },
                                     { label: 'Aggressive', value: 'aggressive' }
                                  ]} />
                               </Form.Item>
                               <Button type="primary" block icon={<ExperimentOutlined />}>Recalculate Hedge</Button>
                            </Form>
                         </Card>
                      </Col>
                      <Col span={14}>
                         <div style={{ height: 350 }}>
                            <Pie 
                               data={[
                                  { type: 'Equity', value: 75 },
                                  { type: 'Gold Hedge', value: 15 },
                                  { type: 'Fixed Income', value: 10 }
                               ]}
                               angleField="value"
                               colorField="type"
                               radius={0.8}
                               innerRadius={0.6}
                               label={{ type: 'inner', offset: '-50%', content: '{value}%' }}
                            />
                         </div>
                         <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Text type="secondary">Recommended Hedge Strategy: <strong>15.2% Sovereign Gold Bonds</strong></Text>
                         </div>
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><BarChartOutlined /> Asset Class Comparison</span>} key="comparison">
                   <Table 
                     dataSource={goldComparisonData}
                     pagination={false}
                     columns={[
                        { title: 'Asset Type', dataIndex: 'type', render: (t) => <strong>{t}</strong> },
                        { title: 'Avg Return (1y)', dataIndex: 'return', render: (v) => `${v}%` },
                        { title: 'Cost (Annual)', dataIndex: 'cost', render: (v) => `${v}%` },
                        { title: 'Liquidity Score', dataIndex: 'liquidity', render: (v) => <Progress percent={v} size="small" /> },
                        { title: 'Safety Score', dataIndex: 'safety', render: (v) => <Progress percent={v} size="small" strokeColor="#52c41a" /> },
                        { title: 'Taxation', dataIndex: 'tax' }
                     ]}
                   />
                </TabPane>

                <TabPane tab={<span><LineChartOutlined /> Historical Arbitrage</span>} key="historical">
                   <div style={{ height: 400 }}>
                      <Area 
                        data={goldPriceHistory}
                        xField="date"
                        yField="price"
                        smooth
                        color="#faad14"
                        title="Gold Spot Price (Intraday Cluster)"
                      />
                   </div>
                </TabPane>
             </Tabs>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Commodity Momentum (Relative)" className="commodities-content-card">
              <div style={{ height: 350 }}>
                  <Radar 
                    data={[
                      { item: 'Gold', value: 85 },
                      { item: 'Silver', value: 65 },
                      { item: 'Crude Oil', value: 45 },
                      { item: 'Natural Gas', value: 30 },
                      { item: 'Copper', value: 70 }
                    ]}
                    xField="item"
                    yField="value"
                    meta={{ value: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.3 } }}
                  />
              </div>
          </Card>

          <Card title="Institutional Sector Flows" className="commodities-content-card" style={{ marginTop: 24 }}>
             <List size="small">
                <List.Item>
                   <Text>Central Bank Accumulation</Text>
                   <Tag color="green">High</Tag>
                </List.Item>
                <List.Item>
                   <Text>Retail ETF Flows</Text>
                   <Tag color="orange">Neutral</Tag>
                </List.Item>
                <List.Item>
                   <Text>Jewelry Demand (Regional)</Text>
                   <Tag color="blue">Rising</Tag>
                </List.Item>
             </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CommoditiesPage;
