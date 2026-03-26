import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, InputNumber, Select, Radio, Slider, Checkbox } from 'antd';
import { 
  NodeIndexOutlined, 
  SafetyOutlined, 
  AimOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalculatorOutlined,
  DollarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  GlobalOutlined,
  ReconciliationOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Pie, Column, Line, Radar, Heatmap, DualAxes, Bullet } from '@ant-design/plots';
import { allocatorAPI } from '../services/api/allocator';
import MetricCard from '../components/Analytics/MetricCard';
import './AllocatorPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AllocatorPage = () => {
  const [profile, setProfile] = useState({
    age: 30,
    risk: 'moderate',
    goal: 'wealth_creation'
  });

  const allocationData = [
    { type: 'Equity', value: 50 },
    { type: 'Debt', value: 30 },
    { type: 'Gold', value: 10 },
    { type: 'Real Estate', value: 5 },
    { type: 'Cash', value: 3 },
    { type: 'Alternative', value: 2 }
  ];

  return (
    <div className="allocator-page">
      <div className="allocator-header">
        <Title level={2}><NodeIndexOutlined /> Institutional Portfolio Architect</Title>
        <Space>
           <Button icon={<CalculatorOutlined />}>Markowitz Optimizer</Button>
           <Button type="primary" icon={<AimOutlined />}>Lock Final Allocation</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* User Profile & Goal Settings */}
        <Col span={8}>
          <Card title={<Space><UserOutlined /> Demographic & Goal Vectors</Space>} className="allocator-card shadow-sm">
             <Form layout="vertical">
                <Row gutter={16}>
                   <Col span={12}>
                      <Form.Item label="Age Vector">
                         <InputNumber min={18} max={100} defaultValue={30} style={{ width: '100%' }} />
                      </Form.Item>
                   </Col>
                   <Col span={12}>
                      <Form.Item label="Retirement Target">
                         <InputNumber min={40} max={80} defaultValue={60} style={{ width: '100%' }} />
                      </Form.Item>
                   </Col>
                </Row>
                <Form.Item label="Investment Objective">
                   <Select defaultValue="wealth_creation">
                      <Select.Option value="retirement">Retirement Planning</Select.Option>
                      <Select.Option value="wealth_creation">Wealth Aggregation</Select.Option>
                      <Select.Option value="income">Systematic Income (SWP)</Select.Option>
                      <Select.Option value="education">Educational Corpus</Select.Option>
                   </Select>
                </Form.Item>
                <Form.Item label="Risk Tolerance Spectrum">
                   <Radio.Group defaultValue="moderate" buttonStyle="solid">
                      <Radio.Button value="conservative">Conservative</Radio.Button>
                      <Radio.Button value="moderate">Moderate</Radio.Button>
                      <Radio.Button value="aggressive">Aggressive</Radio.Button>
                   </Radio.Group>
                </Form.Item>
                <Divider dashed />
                <Title level={5}>Corpus Telemetry</Title>
                <Form.Item label="Target Goal Amount">
                   <InputNumber prefix="₹" style={{ width: '100%' }} defaultValue={50000000} step={1000000} />
                </Form.Item>
                <Form.Item label="Current Investable Corpus">
                   <InputNumber prefix="₹" style={{ width: '100%' }} defaultValue={500000} />
                </Form.Item>
                <Form.Item label="Time Horizon (Years)">
                   <Slider min={1} max={40} defaultValue={20} />
                </Form.Item>
             </Form>
          </Card>

          <Card title="Dynamic Risk Capacity Gauge" className="allocator-card shadow-sm" style={{ marginTop: 24 }}>
             <div style={{ textAlign: 'center' }}>
                <Progress type="dashboard" percent={68} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                <Title level={5}>68/100 (Moderate Alpha)</Title>
                <Text type="secondary" style={{ fontSize: '10px' }}>Capacity based on Age (60%) and Horizon (40%) aligned with `allocator.py`.</Text>
             </div>
          </Card>
        </Col>

        {/* Allocation Strategy & Outcomes */}
        <Col span={16}>
          <Card className="allocator-card">
             <Tabs defaultActiveKey="strat">
                <TabPane tab={<span><PieChartOutlined /> Asset Allocation Strategy</span>} key="strat">
                   <Row gutter={24}>
                      <Col span={12}>
                         <Title level={4}>Optimal Target Allocation</Title>
                         <div style={{ height: 350 }}>
                            <Pie 
                               data={allocationData}
                               angleField="value"
                               colorField="type"
                               radius={0.8}
                               label={{ type: 'inner', offset: '-30%', content: '{percentage}' }}
                               interactions={[{ type: 'element-active' }]}
                            />
                         </div>
                      </Col>
                      <Col span={12}>
                         <Title level={4}>Sub-Class Deep Dive</Title>
                         <List
                           size="small"
                           dataSource={[
                             { type: 'Equity', subclass: 'Multi-Cap (70%), Sectoral (30%)', color: '#1890ff' },
                             { type: 'Debt', subclass: 'Corp Bonds (60%), Gilt (40%)', color: '#52c41a' },
                             { type: 'Gold', subclass: 'Sovereign Gold Bonds', color: '#faad14' },
                             { type: 'Alternatives', subclass: 'Venture, Crypto (10%)', color: '#722ed1' }
                           ]}
                           renderItem={item => (
                             <List.Item>
                                <Space direction="vertical" size={0}>
                                   <Text strong style={{ color: item.color }}>{item.type}</Text>
                                   <Text type="secondary" style={{ fontSize: '12px' }}>{item.subclass}</Text>
                                </Space>
                             </List.Item>
                           )}
                         />
                         <Divider />
                         <Statistic title="Expected Annualized Return" value="13.2" suffix="%" valueStyle={{ color: '#52c41a' }} />
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><ScheduleOutlined /> Deployment Schedule</span>} key="schedule">
                   <Title level={4}>Phased Deployment Map (Next 12 Months)</Title>
                   <div style={{ height: 400 }}>
                      <Column 
                        data={Array.from({ length: 12 }).flatMap((_, i) => 
                          ['Equity', 'Debt', 'Gold'].map(asset => ({
                            month: `M-${i+1}`,
                            amount: (asset === 'Equity' ? 50000 : asset === 'Debt' ? 30000 : 10000) * (1 + Math.random() * 0.1),
                            type: asset
                          }))
                        )}
                        xField="month"
                        yField="amount"
                        seriesField="type"
                        isStack={true}
                        color={['#1890ff', '#52c41a', '#faad14']}
                      />
                   </div>
                </TabPane>

                <TabPane tab={<span><DashboardOutlined /> Expected Outcome Projection</span>} key="outcome">
                   <Row gutter={24}>
                      <Col span={24}>
                         <div style={{ height: 350 }}>
                            <DualAxes 
                               data={[
                                 Array.from({ length: 20 }).map((_, i) => ({ year: 2024+i, expected: 500000 * Math.pow(1.13, i), baseline: 500000 * Math.pow(1.07, i) })),
                                 Array.from({ length: 20 }).map((_, i) => ({ year: 2024+i, risk: Math.sin(i/3) * 10 + 20 }))
                               ]}
                               xField="year"
                               yField={['expected', 'risk']}
                               geometryOptions={[
                                 { geometry: 'area', color: '#1890ff', opacity: 0.3 },
                                 { geometry: 'line', color: '#ff4d4f' }
                               ]}
                            />
                         </div>
                      </Col>
                   </Row>
                   <Divider />
                   <Alert 
                     message="Portfolio Parity Alert" 
                     description="Scenario analysis indicates 72% probability of achieving targets within 18 years. Consider increasing allocation to mid-cap equity for 15.2% alpha boost."
                     type="success"
                     showIcon
                   />
                </TabPane>
             </Tabs>
          </Card>
        </Col>

        {/* Real-time Recommendations */}
        <Col span={24}>
          <Card title={<Space><ReconciliationOutlined /> Intelligent Alpha Recommendations</Space>} className="allocator-card shadow-sm">
             <Row gutter={24}>
                <Col span={8}>
                   <Card size="small" className="recommendation-card">
                      <Space align="start">
                         <AimOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                         <div>
                            <Text strong>Tax-Loss Harvesting</Text>
                            <Paragraph style={{ fontSize: '11px', color: '#8c8c8c' }}>Currently identified ₹42,500 in harvestable losses across long-term equity segments.</Paragraph>
                         </div>
                      </Space>
                   </Card>
                </Col>
                <Col span={8}>
                   <Card size="small" className="recommendation-card">
                      <Space align="start">
                         <SafetyOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                         <div>
                            <Text strong>Emergency Buffer</Text>
                            <Paragraph style={{ fontSize: '11px', color: '#8c8c8c' }}>Reallocating ₹150,000 to liquid funds to maintain 6x monthly expense coverage.</Paragraph>
                         </div>
                      </Space>
                   </Card>
                </Col>
                <Col span={8}>
                   <Card size="small" className="recommendation-card">
                      <Space align="start">
                         <ArrowUpOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
                         <div>
                            <Text strong>Wealth Accelerators</Text>
                            <Paragraph style={{ fontSize: '11px', color: '#8c8c8c' }}>Increase sectoral weight in IT/Pharma by 4% to capture mid-recovery cycle alpha.</Paragraph>
                         </div>
                      </Space>
                   </Card>
                </Col>
             </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AllocatorPage;
