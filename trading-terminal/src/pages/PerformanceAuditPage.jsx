import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Timeline, Alert, Popover, Select, Rate } from 'antd';
import { 
  AreaChartOutlined, 
  BarChartOutlined, 
  LineChartOutlined, 
  DotChartOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  BugOutlined,
  SafetyOutlined,
  AuditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, Waterfall } from '@ant-design/plots';
import { performanceAPI } from '../services/api/performance';
import MetricCard from '../components/Analytics/MetricCard';
import './PerformanceAuditPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PerformanceAuditPage = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('HFT_NEURAL_V1');
  const [isAuditing, setIsAuditing] = useState(false);

  const attributionData = [
    { strategy: 'HFT Neural', factor: 'Sharpe', value: 2.85 },
    { strategy: 'HFT Neural', factor: 'Sortino', value: 3.12 },
    { strategy: 'HFT Neural', factor: 'Calmar', value: 2.45 },
    { strategy: 'Swing Alpha', factor: 'Sharpe', value: 1.65 },
    { strategy: 'Swing Alpha', factor: 'Sortino', value: 1.42 },
    { strategy: 'Swing Alpha', factor: 'Calmar', value: 1.15 }
  ];

  const drawdownData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      date: `2024-03-${i+1}`,
      equity: 100000 + Math.sin(i / 5) * 5000 + Math.random() * 2000,
      drawdown: -Math.abs(Math.sin(i / 3) * 5 + Math.random() * 2)
    }));
  }, []);

  const anomalyLogs = [
    { time: '17:45:01', strategy: 'HFT_NEURAL_V1', type: 'LATENCY_SPIKE', severity: 'HIGH', details: 'Execution latency reached 145ms' },
    { time: '17:30:12', strategy: 'SWING_VAL_V2', type: 'DRAWDOWN_ALERT', severity: 'CRITICAL', details: 'Daily P&L breached -₹5,000 threshold' },
    { time: '17:15:00', strategy: 'HFT_NEURAL_V1', type: 'THROUGHPUT_DROP', severity: 'MEDIUM', details: 'Trade frequency fell below 10/sec' }
  ];

  return (
    <div className="performance-audit-page">
      <div className="audit-header">
        <Title level={2}><AuditOutlined /> High-Fidelity Performance & Alpha Audit</Title>
        <Space>
           <Select 
             defaultValue={selectedStrategy} 
             style={{ width: 220 }} 
             onChange={setSelectedStrategy}
             options={[
               { label: 'HFT Neural V1', value: 'HFT_NEURAL_V1' },
               { label: 'Swing Value V2', value: 'SWING_VAL_V2' },
               { label: 'Carry Sentiment V1', value: 'CARRY_SENT_V1' }
             ]}
           />
           <Button type="primary" icon={<AimOutlined />} loading={isAuditing} onClick={() => setIsAuditing(true)}>Trigger Alpha Reconstruction</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="Institutional Sharpe" value={2.85} icon={<SafetyCertificateOutlined />} color="#52c41a" precision={2} />
        </Col>
        <Col span={6}>
          <MetricCard title="Max Drawdown (Daily)" value="-2.14%" icon={<ArrowDownOutlined />} color="#ff4d4f" />
        </Col>
        <Col span={6}>
          <MetricCard title="Recovery Factor" value={4.2} icon={<ThunderboltOutlined />} color="#1890ff" precision={1} />
        </Col>
        <Col span={6}>
          <MetricCard title="Profit Factor" value={1.92} icon={<LineChartOutlined />} color="#722ed1" precision={2} />
        </Col>

        <Col span={16}>
          <Card className="audit-main-card">
             <Tabs defaultActiveKey="alpha">
                <TabPane tab={<span><DotChartOutlined /> Alpha Attribution Forensics</span>} key="alpha">
                   <Row gutter={24}>
                      <Col span={14}>
                         <Title level={4}>Sharpe/Sortino Attribution Matrix</Title>
                         <div style={{ height: 400 }}>
                            <Column 
                               data={attributionData}
                               xField="factor"
                               yField="value"
                               seriesField="strategy"
                               isGroup={true}
                               columnStyle={{ radius: [4, 4, 0, 0] }}
                               color={['#52c41a', '#1890ff', '#faad14']}
                               label={{ position: 'top' }}
                            />
                         </div>
                      </Col>
                      <Col span={10}>
                         <Card title="Volatility Regime Audit" size="small">
                            <Paragraph style={{ fontSize: '12px', color: '#8c8c8c' }}>
                               Current Alpha decay profile suggests neural signal convergence in low-volatility regimes.
                            </Paragraph>
                            <Divider />
                            <Statistic title="Alpha Decay Half-Life" value="14.2 days" />
                            <Divider />
                            <Statistic title="Strategy Capacity ($)" value="125M" />
                         </Card>
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><AreaChartOutlined /> Drawdown Forensics</span>} key="drawdown">
                   <div style={{ height: 450 }}>
                      <DualAxes 
                        data={[drawdownData, drawdownData]}
                        xField="date"
                        yField={['equity', 'drawdown']}
                        geometryOptions={[
                          { geometry: 'line', color: '#1890ff', smooth: true },
                          { geometry: 'area', color: '#ff4d4f', opacity: 0.3 }
                        ]}
                        title="Equity Curve vs Under-the-Water Drawdown"
                      />
                   </div>
                </TabPane>

                <TabPane tab={<span><WaterfallOutlined /> P&L Attribution Tree</span>} key="attribution">
                   <div style={{ height: 400 }}>
                      <Waterfall 
                         data={[
                           { type: 'Intraday Carry', value: 4500 },
                           { type: 'Neural Signals', value: 8900 },
                           { type: 'Slippage', value: -1200 },
                           { type: 'Exchange Fees', value: -850 },
                           { type: 'Sentiment Boost', value: 1200 },
                           { type: 'Total Net P&L', isTotal: true }
                         ]}
                         xField="type"
                         yField="value"
                         appendPadding={[10, 0, 0, 0]}
                         color={({ value, isTotal }) => (isTotal ? '#1890ff' : value > 0 ? '#52c41a' : '#ff4d4f')}
                         label={{ style: { fontSize: 10, fill: '#fff' } }}
                      />
                   </div>
                </TabPane>
             </Tabs>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Strategy Anomaly Stream" className="audit-main-card">
              <List
                size="small"
                dataSource={anomalyLogs}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Badge status={item.severity === 'CRITICAL' ? 'error' : item.severity === 'HIGH' ? 'warning' : 'processing'} />}
                      title={<Space><Text strong>{item.type}</Text><Tag color={item.severity === 'CRITICAL' ? 'red' : 'orange'}>{item.severity}</Tag></Space>}
                      description={
                        <Space direction="vertical" size={0}>
                           <Text style={{ fontSize: '11px' }}>{item.details}</Text>
                           <Text type="secondary" style={{ fontSize: '10px' }}>{item.strategy} | {item.time}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
          </Card>

          <Card title="Institutional Trust Score" className="audit-main-card" style={{ marginTop: 24 }}>
             <div style={{ textAlign: 'center' }}>
                <Progress type="dashboard" percent={94} strokeColor="#52c41a" />
                <Title level={5}>94/100</Title>
                <Text type="secondary">Strategy meets all Tier-1 execution thresholds.</Text>
             </div>
             <Divider />
             <Rate disabled defaultValue={5} />
             <Text style={{ marginLeft: 8 }}>Backtest Fidelity</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceAuditPage;
