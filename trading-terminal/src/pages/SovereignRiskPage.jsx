import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Slider, Alert } from 'antd';
import { 
  SafetyCertificateOutlined, 
  DotChartOutlined, 
  PieChartOutlined, 
  AreaChartOutlined, 
  ThunderboltOutlined,
  AlertOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  BlockOutlined,
  LineChartOutlined,
  BarChartOutlined,
  DeploymentUnitOutlined,
  AimOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Gauge } from '@ant-design/plots';
import { sovereignRiskAPI } from '../services/api/sovereign_risk';
import MetricCard from '../components/Analytics/MetricCard';
import './SovereignRiskPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SovereignRiskPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeBucket, setActiveBucket] = useState('EQUITY_HFT');

  const hhiData = [
    { strategy: 'Macro PPO', hhi: 0.12, exposure: 4200000, risk: 'Low' },
    { strategy: 'DQN Scalper', hhi: 0.45, exposure: 1200000, risk: 'Serious' },
    { strategy: 'GARCH Vol', hhi: 0.22, exposure: 2500000, risk: 'Moderate' },
    { strategy: 'Arb Prime', hhi: 0.08, exposure: 5500000, risk: 'Very Low' },
    { strategy: 'Momentum X', hhi: 0.38, exposure: 800000, risk: 'High' }
  ];

  return (
    <div className="sovereign-risk-page">
      <div className="risk-header">
        <Title level={2}><SecurityScanOutlined /> Sovereign Risk & HHI Concentration Dashboard</Title>
        <Space>
           <Button icon={<AlertOutlined />}>Trigger Stress Test</Button>
           <Button type="primary" icon={<SecurityScanOutlined />}>Trigger HHI Audit</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Real-time Sovereign Meta-Metrics */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Systemic HHI Score" value="0.24" trend={5} suffix=" (Balanced)" icon={<BlockOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="95% VaR (Institutional)" value="₹1.42 Cr" trend={12} icon={<LineChartOutlined />} color="#ff4d4f" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Liquidity Diversification" value="0.82" trend={-2} icon={<PieChartOutlined />} color="#52c41a" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Counterparty Health" value="AAA" icon={<SafetyCertificateOutlined />} color="#faad14" />
              </Col>
           </Row>
        </Col>

        {/* HHI Concentration Matrix */}
        <Col span={12}>
           <Card title="Structural Concentration Matrix (HHI)" className="risk-card shadow-sm">
              <div style={{ height: 400 }}>
                 <Column 
                    data={hhiData}
                    xField="strategy"
                    yField="hhi"
                    color={({ strategy }) => {
                       const d = hhiData.find(i => i.strategy === strategy);
                       if (d.hhi > 0.4) return '#ff4d4f';
                       if (d.hhi > 0.3) return '#faad14';
                       return '#1890ff';
                    }}
                    label={{ position: 'middle', style: { fill: '#fff', opacity: 0.6 } }}
                 />
              </div>
              <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                 Herfindahl-Hirschman Index (HHI) measures portfolio fragility through concentration (aligning with `portfolio_risk.py`).
              </Paragraph>
           </Card>
        </Col>

        {/* Liquidity Stress Surface */}
        <Col span={12}>
           <Card className="risk-card">
              <Tabs defaultActiveKey="stress">
                 <TabPane tab={<span><AreaChartOutlined /> Liquidity Stress Surface</span>} key="stress">
                    <Title level={4}>Estimated Haircut vs Market Volatility</Title>
                    <div style={{ height: 400 }}>
                       <Area 
                          data={Array.from({ length: 30 }).map((_, i) => ({
                             vol: i,
                             haircut: Math.pow(i/10, 2) + Math.random() * 2
                          }))}
                          xField="vol"
                          yField="haircut"
                          color="#ff4d4f"
                          smooth
                       />
                    </div>
                    <Alert 
                      style={{ marginTop: 16 }}
                      message="Liquidity Crunch Warning" 
                      description="VaR breaches projected 2% limit if vix exceeds 35. Immediate deleveraging recommended for HFT clusters."
                      type="warning"
                      showIcon
                    />
                 </TabPane>

                 <TabPane tab={<span><RadarChartOutlined /> Factor Exposure Radar</span>} key="factors">
                    <div style={{ height: 400 }}>
                       <Radar 
                          data={[
                             { item: 'Beta Sensitivity', value: 85 },
                             { item: 'Small Cap Bias', value: 42 },
                             { item: 'Value Factor', value: 65 },
                             { item: 'Quality Bias', value: 92 },
                             { item: 'Momentum Drift', value: 78 }
                          ]}
                          xField="item"
                          yField="value"
                          meta={{ value: { min: 0, max: 100 } }}
                          area={{ style: { fillOpacity: 0.1, fill: '#722ed1' } }}
                       />
                    </div>
                 </TabPane>
              </Tabs>
           </Card>
        </Col>

        {/* Counterparty Exposure Audit */}
        <Col span={24}>
           <Card title={<Space><AimOutlined /> Multi-Tier Counterparty Exposure Matrix</Space>} className="risk-card shadow-sm">
              <Table 
                 size="small"
                 dataSource={[
                   { key: '1', cp: 'Zerodha Prime', asset: 'Equity/F&O', exposure: '₹480 Cr', limit: '₹600 Cr', status: 'Stable' },
                   { key: '2', cp: 'Binance Inst.', asset: 'Crypto Spot', exposure: '₹12 Cr', limit: '₹15 Cr', status: 'Active Watch' },
                   { key: '3', cp: 'Interactive Brokers', asset: 'US Stocks', exposure: '₹82 Cr', limit: '₹200 Cr', status: 'AAA Secure' }
                 ]}
                 columns={[
                    { title: 'Counterparty Institution', dataIndex: 'cp', key: 'cp', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Asset Category Vector', dataIndex: 'asset', key: 'asset' },
                    { title: 'Current Notional Exposure', dataIndex: 'exposure', key: 'exposure' },
                    { title: 'Strategic Credit Limit', dataIndex: 'limit', key: 'limit' },
                    { title: 'Health Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s.includes('AAA') ? 'green' : s.includes('Watch') ? 'gold' : 'blue'}>{s}</Tag> }
                 ]}
                 pagination={false}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SovereignRiskPage;
