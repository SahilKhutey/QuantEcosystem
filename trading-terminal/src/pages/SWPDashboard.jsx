import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Space, Typography, Button, Tag, Select, Card, Table } from 'antd';
import { 
  ProjectOutlined, 
  RocketOutlined, 
  HistoryOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { MetricCard } from '../components/Analytics';
import { LineChart, HeatmapChart } from '../components/Visualizations';
import { swpAPI } from '../services/api/swp';
import './SWPDashboard.css';

const { Title, Text } = Typography;

const SWPDashboard = () => {
  const [activeAccount, setActiveAccount] = useState(null);
  const [swpAccounts, setSwpAccounts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [accountPerformance, setAccountPerformance] = useState({});
  const [sustainability, setSustainability] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    setLoading(true);
    swpAPI.getSWPAccounts().then(res => {
      setSwpAccounts(res.data || []);
      if (res.data?.length > 0) setActiveAccount(res.data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeAccount) {
      setLoading(true);
      Promise.all([
        swpAPI.getSWPPerformance(activeAccount, '1y'),
        swpAPI.getPerformanceMetrics(activeAccount),
        swpAPI.getSustainabilityAnalysis(activeAccount, '4% rule')
      ]).then(([perf, metrics, sustain]) => {
        setAccountPerformance(perf.data || {});
        setPerformanceMetrics(metrics.data || {});
        setSustainability(sustain.data || {});
        setLoading(false);
      });
    }
  }, [activeAccount]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Systematic Withdrawal Plan Intelligence</Title>
          <Text type="secondary">Automated capital decumulation & longevity simulation desk</Text>
        </div>
        <Space>
          <Select 
            value={activeAccount} 
            onChange={setActiveAccount} 
            options={swpAccounts.map(a => ({ value: a.id, label: a.name }))}
            style={{ width: 220 }}
          />
          <Button 
            icon={isMonitoring ? <StopOutlined /> : <PlayCircleOutlined />} 
            danger={isMonitoring}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'HALT TELEMETRY' : 'ENGAGE MONITOR'}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <MetricCard 
            title="Portfolio Longevity" 
            value={`${performanceMetrics.sustainabilityPeriod} Years`}
            trend="Stable"
            isPositive={true}
            description="Projected depletion timeframe"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Success Probability" 
            value={`${performanceMetrics.successRate}%`}
            trend="Monte Carlo"
            isPositive={true}
            description="Reliability at current withdrawal rate"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Withdrawal Load" 
            value={`${performanceMetrics.withdrawalRate}%`}
            trend={performanceMetrics.withdrawalRate > 4 ? 'High Risk' : 'Sustainable'}
            isPositive={performanceMetrics.withdrawalRate <= 4}
            description="Annualized withdrawal vs AUM"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Sustainability Score" 
            value={`${sustainability.sustainabilityScore}/10`}
            trend="Institutional"
            isPositive={true}
            description="Aggregate health classification"
          />
        </Col>

        <Col span={16}>
          <LineChart 
            title="Equity Trajectory & Depletion Curve" 
            data={accountPerformance.equityCurve || []}
            loading={loading}
            height={400}
          />
        </Col>
        <Col span={8}>
          <HeatmapChart 
            title="Sustainability Heatmap (Rate vs Market)" 
            data={sustainability.probabilityByRate || []}
            height={400}
          />
        </Col>

        <Col span={24}>
          <Card title="Withdrawal Ledger & Audit Trail" size="small">
            <Table 
              size="small"
              dataSource={performanceMetrics.history || []}
              columns={[
                { title: 'Date', dataIndex: 'date' },
                { title: 'Withdrawal', dataIndex: 'amount', render: v => `₹${v.toLocaleString()}` },
                { title: 'Remaining', dataIndex: 'balance', render: v => `₹${v.toLocaleString()}` },
                { title: 'Status', render: () => <Tag color="blue">PROCESSED</Tag> }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SWPDashboard;
;
