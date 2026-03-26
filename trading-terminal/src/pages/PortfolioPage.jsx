import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  Select, 
  Button, 
  Spin, 
  Alert,
  Progress,
  Tag,
  Space,
  Dropdown,
  Tooltip,
  DatePicker,
  Input,
  Typography
} from 'antd';
import { 
  PieChartOutlined, 
  BarChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  FallOutlined,
  DownOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Pie, Line } from '@ant-design/plots';
import { portfolioAPI } from '../services/api/portfolio';
import './PortfolioPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const PortfolioPage = () => {
  // State Management
  const [portfolioData, setPortfolioData] = useState({});
  const [allocationData, setAllocationData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({});
  const [loading, setLoading] = useState({
    summary: true, allocation: true, pnl: true,
    positions: true, transactions: true, risk: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [allocationGroupBy, setAllocationGroupBy] = useState('asset');
  const [pnlTimeframe, setPnlTimeframe] = useState('30d');
  const [positionFilters, setPositionFilters] = useState({ status: 'all', search: '' });
  const [transactionFilters, setTransactionFilters] = useState({ dateRange: [], type: 'all', search: '' });

  const fetchData = useCallback(async () => {
    setLoading({
      summary: true, allocation: true, pnl: true,
      positions: true, transactions: true, risk: true
    });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        portfolioAPI.getPortfolioSummary(),
        portfolioAPI.getAssetAllocation(allocationGroupBy),
        portfolioAPI.getPnLAnalysis(pnlTimeframe),
        portfolioAPI.getPositions(positionFilters),
        portfolioAPI.getTransactions(transactionFilters),
        portfolioAPI.getRiskMetrics()
      ]);

      if (responses[0].status === 'fulfilled') setPortfolioData(responses[0].value.data);
      if (responses[1].status === 'fulfilled') setAllocationData(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setPnlData(responses[2].value.data.history || []);
      if (responses[3].status === 'fulfilled') setPositions(responses[3].value.data);
      if (responses[4].status === 'fulfilled') setTransactions(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setRiskMetrics(responses[5].value.data);

      setLoading({
        summary: false, allocation: false, pnl: false,
        positions: false, transactions: false, risk: false
      });
    } catch (err) {
      setError('Failed to load portfolio data');
    }
  }, [allocationGroupBy, pnlTimeframe, positionFilters, transactionFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export Portfolio Data
  const handleExport = async (format) => {
    try {
      const blob = await portfolioAPI.exportPortfolioData(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  // Filter Logic
  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      const matchesSearch = !positionFilters.search || p.symbol.toLowerCase().includes(positionFilters.search.toLowerCase());
      return (positionFilters.status === 'all' || p.status === positionFilters.status) && matchesSearch;
    });
  }, [positions, positionFilters]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = !transactionFilters.search || t.symbol.toLowerCase().includes(transactionFilters.search.toLowerCase());
      return (transactionFilters.type === 'all' || t.type === transactionFilters.type) && matchesSearch;
    });
  }, [transactions, transactionFilters]);

  // Chart Configs
  const allocationConfig = useMemo(() => ({
    data: allocationData,
    angleField: 'value',
    colorField: 'name',
    radius: 0.8,
    innerRadius: 0.6,
    label: { type: 'spider', content: '{name}: {percentage}%' },
  }), [allocationData]);

  const riskDistributionConfig = useMemo(() => ({
    data: [
      { type: 'Low Risk', value: 60 },
      { type: 'Medium Risk', value: 30 },
      { type: 'High Risk', value: 10 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: ['#52c41a', '#faad14', '#ff4d4f'],
  }), []);

  const pnlConfig = useMemo(() => ({
    data: pnlData,
    xField: 'date',
    yField: 'pnl',
    smooth: true,
    yAxis: { label: { formatter: (v) => `$${v}` } },
  }), [pnlData]);

  // Column Definitions
  const positionColumns = [
    { title: 'Asset', dataIndex: 'symbol', key: 'symbol', render: (s) => <strong>{s}</strong> },
    { title: 'Quantity', dataIndex: 'qty', align: 'right', render: (q) => q.toFixed(4) },
    { title: 'Avg Price', dataIndex: 'avg_entry_price', align: 'right', render: (p) => `$${p?.toLocaleString()}` },
    { title: 'Market Value', dataIndex: 'market_value', align: 'right', render: (v) => `$${v?.toLocaleString()}` },
    { title: 'P&L', dataIndex: 'pnl_unrealized', align: 'right', render: (pnl, r) => (
      <Text type={pnl >= 0 ? "success" : "danger"}>${pnl?.toLocaleString()} ({r.pnl_pct?.toFixed(2)}%)</Text>
    )},
    { title: 'Allocation', dataIndex: 'allocation', render: (_, r) => <Progress percent={Math.round((r.market_value / (portfolioData.total_value || 1)) * 100)} size="small" /> }
  ];

  const transactionColumns = [
    { title: 'Date', dataIndex: 'timestamp', render: (t) => new Date(t).toLocaleDateString() },
    { title: 'Asset', dataIndex: 'symbol' },
    { title: 'Type', dataIndex: 'type', render: (t) => <Tag color={t === 'buy' ? 'green' : 'red'}>{t.toUpperCase()}</Tag> },
    { title: 'Price', dataIndex: 'price', align: 'right', render: (p) => `$${p?.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', render: (s = 'completed') => <Tag color="green">{s.toUpperCase()}</Tag> }
  ];

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <Title level={2}>Portfolio Overview</Title>
        <div className="header-controls">
          <Dropdown menu={{ items: [
            { key: 'csv', label: 'Export as CSV', onClick: () => handleExport('csv') },
            { key: 'pdf', label: 'Export as PDF', onClick: () => handleExport('pdf') }
          ] }}>
            <Button icon={<DownloadOutlined />}>Export <DownOutlined /></Button>
          </Dropdown>
          <Button icon={<SyncOutlined />} onClick={fetchData} loading={Object.values(loading).some(l => l)}>Refresh</Button>
        </div>
      </div>

      {!loading.summary ? (
        <Row gutter={[24, 24]} className="summary-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card className="summary-card">
              <Statistic title="Total Value" value={portfolioData.total_value} precision={2} prefix={<DollarCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="summary-card">
              <Statistic title="Daily P&L" value={portfolioData.unrealized_pnl} precision={2} suffix="%" valueStyle={{ color: portfolioData.unrealized_pnl >= 0 ? '#52c41a' : '#ff4d4f' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="summary-card">
              <Statistic title="Cash Balance" value={portfolioData.cash_balance} precision={2} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="summary-card">
              <Statistic title="Sharpe Ratio" value={riskMetrics.sharpe_ratio} precision={2} />
            </Card>
          </Col>
        </Row>
      ) : <Spin size="large" className="loading-container" />}

      <Card className="portfolio-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
          <Space>
            {activeTab === 'overview' && <Select value={allocationGroupBy} onChange={setAllocationGroupBy} options={[{ value: 'asset', label: 'By Asset' }]} />}
            {activeTab === 'pnl' && <Select value={pnlTimeframe} onChange={setPnlTimeframe} options={[{ value: '30d', label: 'Last 30 Days' }]} />}
            {(activeTab === 'positions' || activeTab === 'transactions') && <Search placeholder="Search..." onSearch={(v) => activeTab === 'positions' ? setPositionFilters(p => ({ ...p, search: v })) : setTransactionFilters(p => ({ ...p, search: v }))} />}
          </Space>
        }>
          <TabPane tab={<span><PieChartOutlined />Overview</span>} key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}><Card title="Asset Allocation">{loading.allocation ? <Spin /> : <Pie {...allocationConfig} height={300} />}</Card></Col>
              <Col xs={24} lg={12}>
                <Card title="Risk Distribution">
                  {loading.risk ? <Spin /> : (
                    <div className="risk-charts">
                      <Pie {...riskDistributionConfig} height={200} />
                      <div className="risk-metrics" style={{ marginTop: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div className="risk-item"><span>Sharpe:</span> <strong>{riskMetrics.sharpe_ratio?.toFixed(2)}</strong></div>
                          <div className="risk-item"><span>Max Drawdown:</span> <strong style={{ color: '#ff4d4f' }}>{riskMetrics.max_drawdown?.toFixed(2)}%</strong></div>
                          <div className="risk-item"><span>VaR (95%):</span> <strong>${riskMetrics.var_95?.toLocaleString()}</strong></div>
                        </Space>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Performance Summary">
                  <Row gutter={16} style={{ textAlign: 'center' }}>
                    <Col span={6}><Statistic title="1 Month" value={5.2} suffix="%" valueStyle={{ color: '#3f8600' }} /></Col>
                    <Col span={6}><Statistic title="3 Month" value={12.4} suffix="%" valueStyle={{ color: '#3f8600' }} /></Col>
                    <Col span={6}><Statistic title="YTD" value={18.1} suffix="%" valueStyle={{ color: '#3f8600' }} /></Col>
                    <Col span={6}><Statistic title="Annualized" value={22.5} suffix="%" valueStyle={{ color: '#3f8600' }} /></Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><LineChartOutlined />P&L Analysis</span>} key="pnl">
            <Row gutter={[24, 24]}>
              <Col xs={24}><Card title="Portfolio Performance Over Time">{loading.pnl ? <Spin /> : <Line {...pnlConfig} height={400} />}</Card></Col>
              <Col xs={24} lg={12}>
                <Card title="Top Performers">
                  <Table dataSource={positions.filter(p => p.pnl_unrealized > 0).sort((a,b) => b.pnl_unrealized - a.pnl_unrealized).slice(0, 5)} columns={[{ title: 'Asset', dataIndex: 'symbol' }, { title: 'P&L', dataIndex: 'pnl_unrealized', render: v => <Text type="success">+${v?.toLocaleString()}</Text> }]} pagination={false} size="small" />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Underperformers">
                  <Table dataSource={positions.filter(p => p.pnl_unrealized < 0).sort((a,b) => a.pnl_unrealized - b.pnl_unrealized).slice(0, 5)} columns={[{ title: 'Asset', dataIndex: 'symbol' }, { title: 'P&L', dataIndex: 'pnl_unrealized', render: v => <Text type="danger">${v?.toLocaleString()}</Text> }]} pagination={false} size="small" />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined />Positions</span>} key="positions">
             <Table columns={positionColumns} dataSource={filteredPositions} rowKey="symbol" />
          </TabPane>
          <TabPane tab={<span><HistoryOutlined />Transactions</span>} key="transactions">
            <Table columns={transactionColumns} dataSource={filteredTransactions} rowKey="id" />
          </TabPane>
        </Tabs>
      </Card>
      
      {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginTop: 16 }} />}
    </div>
  );
};

export default PortfolioPage;
