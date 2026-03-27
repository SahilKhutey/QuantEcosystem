import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Space, Typography, Button, Tag, Select } from 'antd';
import { 
  ProjectOutlined, 
  RocketOutlined, 
  HistoryOutlined, 
  SafetyCertificateOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { MetricCard } from '../components/Analytics';
import { LineChart, PieChart } from '../components/Visualizations';
import { sipAPI } from '../services/api/sip';
import './SIPDashboard.css';

const { Title, Text } = Typography;

const SIPDashboard = () => {
  const [activeAccount, setActiveAccount] = useState(null);
  const [sipAccounts, setSipAccounts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [accountPerformance, setAccountPerformance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    sipAPI.getSIPAccounts().then(res => {
      setSipAccounts(res.data || []);
      if (res.data?.length > 0) setActiveAccount(res.data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeAccount) {
      setLoading(true);
      Promise.all([
        sipAPI.getSIPPerformance(activeAccount, '1y'),
        sipAPI.getPerformanceMetrics(activeAccount)
      ]).then(([perf, metrics]) => {
        setAccountPerformance(perf.data || {});
        setPerformanceMetrics(metrics.data || {});
        setLoading(false);
      });
    }
  }, [activeAccount]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Systematic Investment Intelligence</Title>
          <Text type="secondary">Automated capital deployment & risk-weighted wealth compounding</Text>
        </div>
        <Space>
          <Select 
            value={activeAccount} 
            onChange={setActiveAccount} 
            options={sipAccounts.map(a => ({ value: a.id, label: a.name }))}
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>NEW STRATAGEM</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <MetricCard 
            title="Equity Value" 
            value={`₹${(performanceMetrics.currentValue / 100000).toFixed(2)}L`}
            trend={`+${performanceMetrics.roi}%`}
            isPositive={true}
            description="Total current market value"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="NAV Growth (CAGR)" 
            value={`${performanceMetrics.cagr}%`}
            trend="Stable"
            isPositive={true}
            description="Compounded Annual Growth Rate"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Volatility (Σ)" 
            value={`${performanceMetrics.volatility}%`}
            trend="Low"
            isPositive={true}
            description="Standard deviation of returns"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Conviction Score" 
            value={`${performanceMetrics.profitFactor}/10`}
            trend="Institutional"
            isPositive={true}
            description="Strategy quality score"
          />
        </Col>

        <Col span={16}>
          <LineChart 
            title="Growth Trajectory & Benchmarking" 
            data={accountPerformance.equityCurve || []}
            loading={loading}
            height={400}
          />
        </Col>
        <Col span={8}>
          <PieChart 
            title="Asset Topology" 
            data={Object.entries(performanceMetrics.allocation || {}).map(([type, value]) => ({ type, value }))}
            height={400}
          />
        </Col>

        <Col span={24}>
          <Card title="Execution Audit & Dispatch Ledger" size="small">
            <Table 
              size="small"
              dataSource={performanceMetrics.history || []}
              columns={[
                { title: 'Date', dataIndex: 'date' },
                { title: 'Dispatch', dataIndex: 'amount', render: v => `₹${v.toLocaleString()}` },
                { title: 'Units', dataIndex: 'units' },
                { title: 'NAV', dataIndex: 'nav' },
                { title: 'Status', render: () => <Tag color="green">SETTLED</Tag> }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SIPDashboard;
