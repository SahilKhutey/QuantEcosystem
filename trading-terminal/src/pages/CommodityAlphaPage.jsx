import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, InputNumber, Select, Radio, Alert } from 'antd';
import { 
  GoldOutlined, 
  SafetyOutlined, 
  SafetyCertificateOutlined, 
  RetweetOutlined, 
  ExperimentOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AimOutlined,
  DeploymentUnitOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, DualAxes, Bullet } from '@ant-design/plots';
import { commodityAlphaAPI } from '../services/api/commodity_alpha';
import MetricCard from '../components/Analytics/MetricCard';
import './CommodityAlphaPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CommodityAlphaPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeAsset, setActiveAsset] = useState('GOLD');

  const goldInstrumentData = [
    { type: 'SGB', return: 7.2, risk: 12, costs: 0, tax: 0, suitability: 95 },
    { type: 'ETFs', return: 6.8, risk: 14, costs: 0.8, tax: 20, suitability: 80 },
    { type: 'Digital', return: 6.5, risk: 15, costs: 1.2, tax: 20, suitability: 70 },
    { type: 'Physical', return: 6.0, risk: 18, costs: 12, tax: 20, suitability: 50 }
  ];

  return (
    <div className="commodity-alpha-page">
      <div className="commodity-header">
        <Title level={2}><GoldOutlined /> Institutional Commodity Alpha Hub</Title>
        <Space>
           <Button icon={<RetweetOutlined />}>Rebalance Hedges</Button>
           <Button type="primary" icon={<AimOutlined />}>Trigger Optimization Sweep</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Core Alpha Metrics */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Spot Gold (24k)" value="₹6,420" trend={1.2} suffix="/gram" icon={<BankOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Inflation Shield Alpha" value="2.8%" trend={0.5} icon={<SafetyCertificateOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Equity Correlation" value="-0.24" icon={<LineChartOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Optimal Hedge Ratio" value="14.2%" icon={<AimOutlined />} color="#722ed1" />
              </Col>
           </Row>
        </Col>

        {/* Hedge Optimization Lab */}
        <Col span={10}>
           <Card title="Gold-Equity Hedge Optimizer" className="commodity-card shadow-sm">
              <Form layout="vertical">
                 <Form.Item label="Portfolio Risk Profile">
                    <Radio.Group defaultValue="moderate" buttonStyle="solid">
                       <Radio.Button value="conservative">Cons.</Radio.Button>
                       <Radio.Button value="moderate">Mod.</Radio.Button>
                       <Radio.Button value="aggressive">Aggr.</Radio.Button>
                    </Radio.Group>
                 </Form.Item>
                 <Form.Item label="Current Equity Exposure (₹)">
                    <InputNumber style={{ width: '100%' }} defaultValue={10000000} prefix="₹" />
                 </Form.Item>
                 <Form.Item label="Expected Inflation Regime">
                    <Select defaultValue="moderate">
                       <Select.Option value="low">Low (&lt;4%)</Select.Option>
                       <Select.Option value="moderate">Moderate (4-7%)</Select.Option>
                       <Select.Option value="high">Hyper (&gt;7%)</Select.Option>
                    </Select>
                 </Form.Item>
              </Form>
              <Divider />
              <div style={{ height: 250 }}>
                 <Radar 
                   data={[
                     { item: 'Equity Protection', value: 85 },
                     { item: 'Inflation Hedge', value: 92 },
                     { item: 'Liquidity Score', value: 70 },
                     { item: 'Cost Efficiency', value: 65 },
                     { item: 'Tax Optimization', value: 95 }
                   ]}
                   xField="item"
                   yField="value"
                   meta={{ value: { min: 0, max: 100 } }}
                   area={{ style: { fillOpacity: 0.1, fill: '#faad14' } }}
                 />
              </div>
           </Card>
        </Col>

        {/* Instrument Comparison Lab */}
        <Col span={14}>
           <Card className="commodity-card">
              <Tabs defaultActiveKey="lab">
                 <TabPane tab={<span><MedicineBoxOutlined /> Inflation Shield Lab</span>} key="lab">
                    <Title level={4}>Tax-Adjusted Return Comparison (10Y Horizon)</Title>
                    <div style={{ height: 350 }}>
                       <DualAxes 
                          data={[
                            goldInstrumentData,
                            goldInstrumentData.map(d => ({ type: d.type, score: d.suitability }))
                          ]}
                          xField="type"
                          yField={['return', 'score']}
                          geometryOptions={[
                             { geometry: 'column', color: '#faad14' },
                             { geometry: 'line', color: '#1890ff', smooth: true }
                          ]}
                       />
                    </div>
                    <Divider />
                    <Alert 
                      message="Instrument Suitability Alert: Sovereign Gold Bonds (SGB)" 
                      description="SGBs offer an additional 2.5% fixed interest + capital gains tax exemption if held to maturity (8 years). Optimal for retirement hedging (aligning with `gold_strategy.py`)."
                      type="info"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><RiseOutlined /> Gold Accumulation (SIP)</span>} key="sip">
                    <Title level={4}>DCA (Dollar Cost Averaging) Performance</Title>
                    <div style={{ height: 400 }}>
                       <Line 
                          data={Array.from({ length: 24 }).map((_, i) => ({
                             month: i,
                             invested: 10000 * (i + 1),
                             value: 10000 * (i + 1) * (1 + 0.05 * Math.sin(i/2) + 0.005 * i)
                          }))}
                          xField="month"
                          yField="value"
                          seriesField="type"
                          smooth
                          color={['#faad14', '#1890ff']}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Strategic Allocation Table */}
        <Col span={24}>
           <Card title="Commodity Inventory Topology" className="commodity-card shadow-sm">
              <Table 
                 dataSource={[
                   { key: '1', asset: 'SGB Series XII', qty: '400g', value: '₹2,568,000', yield: '+2.5% + Capital', status: 'Matured 2030' },
                   { key: '2', asset: 'Gold ETF (Nippon)', qty: '142 units', value: '₹892,000', yield: 'Spot Track', status: 'Liquid' },
                   { key: '3', asset: 'Digital Gold (Tanishq)', qty: '12g', value: '₹77,040', yield: 'Accumulating', status: 'SIP Active' }
                 ]}
                 columns={[
                    { title: 'Instrument Asset', dataIndex: 'asset', key: 'asset', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Quantity Vector', dataIndex: 'qty', key: 'qty' },
                    { title: 'Market Value', dataIndex: 'value', key: 'value' },
                    { title: 'Inherent Yield', dataIndex: 'yield', key: 'yield', render: (y) => <Tag color="green">{y}</Tag> },
                    { title: 'Liquidity Status', dataIndex: 'status', key: 'status', render: (s) => <Badge status={s === 'Liquid' ? 'success' : 'processing'} text={s} /> }
                 ]}
                 pagination={false}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CommodityAlphaPage;
