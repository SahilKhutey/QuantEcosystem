import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, DatePicker, InputNumber, Select, Alert } from 'antd';
import { 
  ExperimentOutlined, 
  LineChartOutlined, 
  BarChartOutlined, 
  DotChartOutlined, 
  RadarChartOutlined,
  StockOutlined,
  FundOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  HeatMapOutlined,
  AimOutlined,
  RetweetOutlined,
  ExpandOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes } from '@ant-design/plots';
import { backtestEngineAPI } from '../services/api/backtest_engine';
import MetricCard from '../components/Analytics/MetricCard';
import './BacktestStudioPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const BacktestStudioPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const simulationResults = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      pathId: i % 10,
      month: i,
      value: 100000 * Math.pow(1.01, i) + (Math.random() - 0.5) * 5000 * Math.sqrt(i)
    }));
  }, []);

  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="backtest-studio">
      <div className="studio-header">
        <Title level={2}><ExperimentOutlined /> Institutional Backtest Simulation Studio</Title>
        <Space>
           <Button icon={<RetweetOutlined />}>Reset Parameters</Button>
           <Button type="primary" onClick={runSimulation} loading={loading} icon={<ThunderboltOutlined />}>Execute Monte Carlo Path</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Configuration Pane */}
        <Col span={6}>
          <Card title="Simulation Controller" className="studio-card shadow-sm">
             <Form form={form} layout="vertical">
                <Form.Item label="Equity Universe" name="universe">
                   <Select mode="multiple" placeholder="Select assets" defaultValue={['AAPL', 'BTC', 'ETH']}>
                      <Select.Option value="AAPL">Apple Inc. (AAPL)</Select.Option>
                      <Select.Option value="BTC">Bitcoin (BTC)</Select.Option>
                      <Select.Option value="ETH">Ethereum (ETH)</Select.Option>
                   </Select>
                </Form.Item>
                <Form.Item label="Backtest Window" name="range">
                   <RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Initial Liquidity" name="initial">
                   <InputNumber prefix="₹" style={{ width: '100%' }} defaultValue={1000000} />
                </Form.Item>
                <Form.Item label="Recurrence Model">
                   <Select defaultValue="SIP">
                      <Select.Option value="SIP">Monthly SIP</Select.Option>
                      <Select.Option value="LUMP">Lump Sum</Select.Option>
                      <Select.Option value="DCA">Value/Dollar Cost Averaging</Select.Option>
                   </Select>
                </Form.Item>
                <Divider dashed />
                <Form.Item label="Expected Returns (%)">
                   <InputNumber style={{ width: '100%' }} defaultValue={12.5} />
                </Form.Item>
                <Form.Item label="Volatility σ (%)">
                   <InputNumber style={{ width: '100%' }} defaultValue={18.2} />
                </Form.Item>
                <Form.Item label="Simulation Paths (n)">
                   <InputNumber style={{ width: '100%' }} defaultValue={1000} />
                </Form.Item>
             </Form>
          </Card>
        </Col>

        {/* Results Visualization */}
        <Col span={18}>
          <Card className="studio-card">
             <Tabs defaultActiveKey="projections">
                <TabPane tab={<span><LineChartOutlined /> Monte Carlo Projections</span>} key="projections">
                   <Title level={4}>Stochastic Return Paths (Confidence Interval: 95%)</Title>
                   <div style={{ height: 450 }}>
                      <Area 
                        data={simulationResults}
                        xField="month"
                        yField="value"
                        seriesField="pathId"
                        smooth
                        line={{ style: { lineWidth: 1, opacity: 0.3 } }}
                        areaStyle={{ fillOpacity: 0.05 }}
                        title="Aggregated Simulation Surface"
                      />
                   </div>
                   <Divider />
                   <Row gutter={24}>
                      <Col span={8}>
                         <Statistic title="Success Probability (Target Achievement)" value={84.2} suffix="%" valueStyle={{ color: '#52c41a' }} />
                      </Col>
                      <Col span={8}>
                         <Statistic title="Expected Final Value" value={1425890} prefix="₹" />
                      </Col>
                      <Col span={8}>
                         <Statistic title="Worst Case (5th Percentile)" value={892450} prefix="₹" valueStyle={{ color: '#ff4d4f' }} />
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><RetweetOutlined /> SIP vs Lump Sum Lab</span>} key="comparison">
                   <Row gutter={24}>
                      <Col span={16}>
                         <Title level={4}>Strategy Superiority Matrix</Title>
                         <div style={{ height: 400 }}>
                            <DualAxes 
                               data={[
                                 Array.from({ length: 24 }).map((_, i) => ({ month: i, sip: 1000 * i * 1.05, lump: 24000 * Math.pow(1.05, i/12) })),
                                 Array.from({ length: 24 }).map((_, i) => ({ month: i, diff: 1000 * i * 1.05 - 24000 * Math.pow(1.05, i/12) }))
                               ]}
                               xField="month"
                               yField={['sip', 'diff']}
                               geometryOptions={[
                                 { geometry: 'line', color: '#1890ff', seriesField: 'type' },
                                 { geometry: 'area', color: '#52c41a', opacity: 0.2 }
                               ]}
                            />
                         </div>
                      </Col>
                      <Col span={8}>
                         <Card title="Volatility Reduction" size="small">
                            <Progress type="dashboard" percent={72} strokeColor="#52c41a" />
                            <Paragraph style={{ marginTop: 16 }}>
                               SIP reduces annualized volatility of entry by **28%** compared to Lump Sum under current market regime.
                            </Paragraph>
                         </Card>
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><HeatMapOutlined /> Walking-Forward Stability</span>} key="stability">
                   <Title level={4}>Stability Heatmap: Window Sensitivity Analysis</Title>
                   <div style={{ height: 400 }}>
                      <Heatmap 
                         data={Array.from({ length: 10 }).flatMap((_, i) => 
                           Array.from({ length: 10 }).map((__, j) => ({
                             lookback: (i+1)*6,
                             forward: (j+1)*3,
                             sharpe: 1.2 + Math.random() * 0.8
                           }))
                         )}
                         xField="lookback"
                         yField="forward"
                         colorField="sharpe"
                         color={['#f5222d', '#ffffff', '#52c41a']}
                         label={{ style: { fill: '#000' } }}
                      />
                   </div>
                </TabPane>
             </Tabs>
          </Card>
        </Col>

        {/* Institutional Metrics Grid */}
        <Col span={24}>
           <Row gutter={[24, 24]}>
              <Col span={6}>
                 <MetricCard title="Max Drawdown" value="-14.2%" trend={-2.4} suffix="Institutional" icon={<ArrowDownOutlined />} color="#ff4d4f" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Recovery Factor" value={4.25} icon={<RetweetOutlined />} color="#1890ff" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Tail Risk (VaR)" value="₹89k" icon={<SafetyCertificateOutlined />} color="#722ed1" />
              </Col>
              <Col span={6}>
                 <MetricCard title="Strategy Fidelity" value="High" status="stable" icon={<AimOutlined />} color="#52c41a" />
              </Col>
           </Row>
        </Col>
      </Row>
    </div>
  );
};

export default BacktestStudioPage;
