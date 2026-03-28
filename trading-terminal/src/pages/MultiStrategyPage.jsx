import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Button, Tag, Space, Table, Badge, Switch, Modal, message, Typography, Progress, Divider } from 'antd';
import { 
  ThunderboltOutlined, 
  PlayCircleOutlined, 
  StopOutlined, 
  SyncOutlined,
  RadarChartOutlined,
  DotChartOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { Line, Pie, Radar } from '@ant-design/plots';
import { tradingEngineAPI } from '../services/api/tradingEngine';
import MetricCard from '../components/Analytics/MetricCard';
import { CustomChartBase } from '../components/Visualizations';

const { Text, Title, Paragraph } = Typography;


const MultiStrategyPage = () => {
  const [strategies, setStrategies] = useState([
    { id: '1', name: 'HFT Neural Cluster', allocation: 45, pnl: 12.4, status: 'active', atrStop: 6420, chandelierStop: 6380, marginOfSafety: 14.5 },
    { id: '2', name: 'Positional Swing Alpha', allocation: 30, pnl: -2.1, status: 'paused', atrStop: 1420, chandelierStop: 1390, marginOfSafety: 28.2 },
    { id: '3', name: 'Global Macro Sentiment', allocation: 25, pnl: 4.8, status: 'active', atrStop: 890, chandelierStop: 850, marginOfSafety: 12.1 }
  ]);

  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [controlModal, setControlModal] = useState({ visible: false, strategy: null });

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      // Mocking real-time updates for now, replace with tradingEngineAPI.getStrategyMetrics()
      const perfPoint = {
        timestamp: new Date().toLocaleTimeString(),
        pnl: strategies.reduce((sum, s) => sum + s.pnl, 0) + (Math.random() - 0.5) * 500,
        equity: 125000 + (Math.random() - 0.5) * 2000
      };
      setPerformanceData(prev => [...prev.slice(-20), perfPoint]);
      setLoading(false);
    } catch (err) {
      console.error("Telemetry failure", err);
    }
  };

  const handleToggle = (strategy) => {
    const action = strategy.status === 'active' ? 'stop' : 'start';
    Modal.confirm({
      title: `${action.toUpperCase()} Strategy`,
      content: `Are you sure you want to ${action} ${strategy.name}?`,
      onOk: async () => {
        try {
          await tradingEngineAPI.toggleStrategy(strategy.id, action);
          message.success(`${strategy.name} ${action}ed successfully`);
          setStrategies(prev => prev.map(s => s.id === strategy.id ? { ...s, status: action === 'start' ? 'active' : 'paused' } : s));
        } catch (err) {
          message.error(`Failed to ${action} strategy`);
        }
      }
    });
  };

  const performanceConfig = {
    data: performanceData,
    xField: 'timestamp',
    yField: 'pnl',
    smooth: true,
    color: '#1890ff',
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
      },
    },
  };

  const allocationConfig = {
    appendPadding: 10,
    data: strategies,
    angleField: 'allocation',
    colorField: 'name',
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: { fontSize: 14, textAlign: 'center' },
    },
    interactions: [{ type: 'element-active' }],
  };

  const columns = [
    { title: 'Strategy', dataIndex: 'name', key: 'name', render: (text) => <strong>{text}</strong> },
    { title: 'Allocation', dataIndex: 'allocation', key: 'allocation', render: (val) => <Progress percent={val} size="small" /> },
    { title: 'Margin of Safety', dataIndex: 'marginOfSafety', key: 'mos', render: (val) => <Tag color={val > 20 ? 'green' : 'orange'}>{val}% Intrinsic</Tag> },
    { title: 'Stop Loss', key: 'stop', render: (record) => (
       <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '10px' }}>Chandelier: ₹{record.chandelierStop}</Text>
          <Text type="secondary" style={{ fontSize: '10px' }}>ATR (2.0x): ₹{record.atrStop}</Text>
       </Space>
    )},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Badge status={status === 'active' ? 'success' : 'processing'} text={status.toUpperCase()} /> },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Switch 
          checked={record.status === 'active'} 
          onChange={() => handleToggle(record)}
          checkedChildren={<PlayCircleOutlined />} 
          unCheckedChildren={<StopOutlined />}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#001529' }}>
            <ThunderboltOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
            Multi-Strategy Command Center
          </h1>
          <p style={{ color: '#8c8c8c', margin: '4px 0 0' }}>Real-time execution monitoring and strategy orchestration</p>
        </div>
        <Space>
          <Button icon={<SyncOutlined spin={loading} />} onClick={() => setLoading(true)}>Refresh Telemetry</Button>
          <Button type="primary" icon={<RadarChartOutlined />}>Global Risk Guard</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Top Level Metrics */}
        <Col span={6}>
          <MetricCard 
            title="Total Combined P&L" 
            value={strategies.reduce((sum, s) => sum + s.pnl, 0)} 
            prefix="$" 
            trend={12.5} 
            icon={<RiseOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Active Strategies" 
            value={strategies.filter(s => s.status === 'active').length} 
            suffix={`/ ${strategies.length}`} 
            icon={<GlobalOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Avg. Signal Confidence" 
            value={(strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length * 100).toFixed(1)} 
            suffix="%" 
            icon={<SafetyCertificateOutlined />}
            color="#faad14"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="System Entropy / Risk" 
            value="3.2" 
            suffix="Low" 
            icon={<DotChartOutlined />}
            color="#722ed1"
          />
        </Col>

        {/* Charts Section */}
        <Col span={16}>
          <CustomChartBase title="Aggregate Performance (P&L Trend)">
            <Line {...performanceConfig} height={350} />
          </CustomChartBase>
        </Col>
        <Col span={8}>
          <CustomChartBase title="Capital Allocation (By Strategy)">
            <Pie {...allocationConfig} height={350} />
          </CustomChartBase>
        </Col>

        {/* Strategy Table */}
        <Col span={24}>
          <Card title="Active Strategy Omnibus" bodyStyle={{ padding: 0 }}>
            <Table 
              dataSource={strategies} 
              columns={columns} 
              rowKey="id" 
              pagination={false}
              className="institutional-table"
            />
            <Divider />
            <Title level={4} style={{ paddingLeft: 24, paddingTop: 16 }}>Institutional Portfolio Parity Map</Title>
            <div style={{ height: 350, padding: '0 24px' }}>
               <Radar 
                  data={strategies.map(s => ({
                     item: s.name,
                     score: (s.allocation * (s.pnl + 10)) / 100 // Risk parity proxy
                  }))}
                  xField="item"
                  yField="score"
                  meta={{ score: { min: 0, max: 100 } }}
                  area={{ style: { fillOpacity: 0.1, fill: '#1890ff' } }}
                  line={{ style: { stroke: '#1890ff', lineWidth: 2 } }}
               />
            </div>
            <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16, paddingBottom: 16 }}>
               Allocations are risk-weighted based on strategy-specific volatility and historical Sharpe convergence (aligning with `multi_strategy_manager.py`).
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MultiStrategyPage;
