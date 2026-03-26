import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, Switch, Alert, Popover } from 'antd';
import { 
  PieChartOutlined, 
  DotChartOutlined, 
  AreaChartOutlined, 
  RadarChartOutlined, 
  ExpandOutlined,
  ThunderboltOutlined,
  BlockOutlined,
  DeploymentUnitOutlined,
  AimOutlined,
  ReconciliationOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge, Bullet } from '@ant-design/plots';
import { assetAllocationAPI } from '../services/api/asset_allocation';
import MetricCard from '../components/Analytics/MetricCard';
import './AssetAllocationPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AssetAllocationPage = () => {
  const [activeRegime, setActiveRegime] = useState('NORMAL');
  const [views, setViews] = useState([]);

  const allocationData = [
    { type: 'Eq. US', value: 42, color: '#1890ff' },
    { type: 'Eq. EM', value: 18, color: '#52c41a' },
    { type: 'FI Global', value: 25, color: '#faad14' },
    { type: 'Commodities', value: 10, color: '#722ed1' },
    { type: 'Cash/Hedge', value: 5, color: '#ff4d4f' }
  ];

  return (
    <div className="asset-allocation-page">
      <div className="allocation-header">
        <Title level={2}><PieChartOutlined /> Bayesian Asset Allocation Lab (Black-Litterman)</Title>
        <Space>
           <Button icon={<ClockCircleOutlined />}>Allocation Backtest</Button>
           <Button type="primary" icon={<RiseOutlined />}>Trigger BL Optimization</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Current Allocation & Confidence */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Optimized Sharpe Ratio" value="1.84" trend={15} icon={<RiseOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Tracking Error (Ann.)" value="2.42%" icon={<SafetyCertificateOutlined />} color="#faad14" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Information Ratio" value="0.78" trend={-2} icon={<AimOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Expected Return (E[r])" value="12.4%" icon={<ThunderboltOutlined />} color="#722ed1" />
              </Col>
           </Row>
        </Col>

        {/* Black-Litterman Workbench */}
        <Col span={10}>
           <Card title="Structural Views & Bayesian Priors" className="allocation-card shadow-sm">
              <Paragraph style={{ fontSize: '12px' }}>
                 Input your strategic market views to bias the equilibrium weights (aligning with `allocator.py`).
              </Paragraph>
              <Form layout="vertical">
                 <Form.Item label={<Space><GlobalOutlined /> Market Equilibrium Bias</Space>}>
                    <Slider range defaultValue={[20, 80]} marks={{ 0: 'Passive', 100: 'Active' }} />
                 </Form.Item>
                 <Form.Item label="Specific View: Eq. US vs FI Global">
                    <Select defaultValue="overweight">
                       <Select.Option value="overweight">Overweight Eq. US (+5%)</Select.Option>
                       <Select.Option value="underweight">Underweight Eq. US (-3%)</Select.Option>
                       <Select.Option value="neutral">Neutral Equilibrium</Select.Option>
                    </Select>
                 </Form.Item>
                 <Form.Item label="View Confidence (Ω Matrix)">
                    <Slider defaultValue={75} />
                 </Form.Item>
              </Form>
              <Divider />
              <div style={{ height: 250 }}>
                 <Radar 
                    data={[
                       { item: 'Return Optimality', value: 92 },
                       { item: 'Risk Parity', value: 85 },
                       { item: 'Turnover Constraint', value: 45 },
                       { item: 'Concentration Limit', value: 100 },
                       { item: 'Confidence (Ω)', value: 75 }
                    ]}
                    xField="item"
                    yField="value"
                    meta={{ value: { min: 0, max: 100 } }}
                    area={{ style: { fillOpacity: 0.1, fill: '#1890ff' } }}
                 />
              </div>
           </Card>
        </Col>

        {/* Allocation Topology & Frontier */}
        <Col span={14}>
           <Card className="allocation-card">
              <Tabs defaultActiveKey="frontier">
                 <TabPane tab={<span><LineChartOutlined /> Efficient Frontier (Regime-Switching)</span>} key="frontier">
                    <div style={{ height: 400 }}>
                       <Line 
                          data={Array.from({ length: 40 }).map((_, i) => ({
                             risk: i * 0.5,
                             ret: Math.sqrt(i) * 2 + Math.random() * 0.2
                          }))}
                          xField="risk"
                          yField="ret"
                          smooth
                          color="#52c41a"
                       />
                       {/* Overlay current portfolio point */}
                       <div style={{ position: 'absolute', top: 100, left: 200, padding: '4px 8px', background: '#1890ff', color: 'white', borderRadius: 4 }}>
                          You are Here (S=1.84)
                       </div>
                    </div>
                    <Alert 
                      style={{ marginTop: 16 }}
                      message="Regime Alert: Shift to 'High Volatility' Detected" 
                      description="Efficient frontier has flattened. Recommend tightening concentration limits and increasing FI/Gold allocation (aligning with `backtest_engine.py`)."
                      type="warning"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><PieChartOutlined /> Bayesian Weight Distribution</span>} key="pie">
                    <div style={{ height: 400 }}>
                       <Pie 
                          data={allocationData}
                          angleField="value"
                          colorField="type"
                          radius={0.8}
                          innerRadius={0.6}
                          label={{ type: 'inner', offset: '-30%', content: ({ percent }) => `${(percent * 100).toFixed(0)}%` }}
                       />
                    </div>
                 </TabPane>

                 <TabPane tab={<span><BarChartOutlined /> Marginal Contribution to Risk</span>} key="risk_contrib">
                    <div style={{ height: 400 }}>
                       <Column 
                          data={allocationData.map(d => ({ type: d.type, contrib: d.value * 0.12 }))}
                          xField="type"
                          yField="contrib"
                          color="#ff4d4f"
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Constraint Audit */}
        <Col span={24}>
           <Card title={<Space><SafetyCertificateOutlined /> Allocation Constraint Audit (Compliance)</Space>} className="allocation-card shadow-sm">
              <Row gutter={24}>
                 <Col span={8}>
                    <Bullet 
                       title="Eq. US Exposure"
                       data={[{ title: 'Eq. US', measures: [42], targets: [45], ranges: [0, 30, 50] }]}
                       measureField="measures"
                       rangeField="ranges"
                       targetField="targets"
                       xField="title"
                       color={{ range: ['#ffc107', '#8bc34a', '#ff9800'], measure: '#1890ff', target: '#333' }}
                    />
                 </Col>
                 <Col span={8}>
                    <Bullet 
                       title="FI Duration"
                       data={[{ title: 'Duration', measures: [4.2], targets: [5.0], ranges: [0, 3, 7] }]}
                       measureField="measures"
                       rangeField="ranges"
                       targetField="targets"
                       xField="title"
                    />
                 </Col>
                 <Col span={8}>
                    <Bullet 
                       title="Hedge Ratio"
                       data={[{ title: 'Hedge', measures: [12], targets: [15], ranges: [0, 10, 20] }]}
                       measureField="measures"
                       rangeField="ranges"
                       targetField="target"
                       xField="title"
                    />
                 </Col>
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssetAllocationPage;
