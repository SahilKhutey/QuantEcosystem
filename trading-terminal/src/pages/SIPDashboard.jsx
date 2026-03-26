import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tabs, 
  Select, 
  Button, 
  Spin, 
  Alert,
  Tag,
  Space,
  Tooltip,
  Progress,
  Badge,
  Descriptions,
  Statistic,
  Input,
  Avatar,
  Divider,
  Switch,
  Dropdown,
  Menu,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Checkbox,
  Collapse,
  List
} from 'antd';
import { 
  FundProjectionScreenOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { sipAPI } from '../services/api/sip';
import './SIPDashboard.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;

const SIPDashboard = () => {
  // State Management
  const [sipAccounts, setSipAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [accountPerformance, setAccountPerformance] = useState({});
  const [contributionHistory, setContributionHistory] = useState([]);
  const [portfolioAllocation, setPortfolioAllocation] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [projections, setProjections] = useState({});
  const [loading, setLoading] = useState({
    accounts: true,
    performance: true,
    contributions: true,
    allocation: true,
    metrics: true,
    projections: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeframe, setTimeframe] = useState('1y');
  const [period, setPeriod] = useState('5y');
  
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [accountForm] = useForm();
  const [contributionForm] = useForm();
  const [editForm] = useForm();

  // Constants
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const timeframeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const periodOptions = [
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' },
    { value: '10y', label: '10 Years' }
  ];

  // Fetch data
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (activeAccount) fetchAccountData();
  }, [activeAccount, timeframe, period]);

  const fetchAccounts = async () => {
    setLoading(prev => ({ ...prev, accounts: true }));
    try {
      const response = await sipAPI.getSIPAccounts();
      setSipAccounts(response.data || []);
      if (response.data?.length > 0 && !activeAccount) setActiveAccount(response.data[0].id);
    } catch (err) { setError('SIP registry connection failure'); }
    setLoading(prev => ({ ...prev, accounts: false }));
  };

  const fetchAccountData = async () => {
    setLoading(prev => ({ ...prev, performance: true, contributions: true, allocation: true, metrics: true, projections: true }));
    try {
      const [perf, cont, alloc, metr, proj] = await Promise.allSettled([
        sipAPI.getSIPPerformance(activeAccount, timeframe),
        sipAPI.getContributionHistory(activeAccount),
        sipAPI.getPortfolioAllocation(activeAccount),
        sipAPI.getPerformanceMetrics(activeAccount),
        sipAPI.getProjections(activeAccount, period)
      ]);
      if (perf.status === 'fulfilled') setAccountPerformance(perf.value.data || {});
      if (cont.status === 'fulfilled') setContributionHistory(cont.value.data || []);
      if (alloc.status === 'fulfilled') setPortfolioAllocation(alloc.value.data || {});
      if (metr.status === 'fulfilled') setPerformanceMetrics(metr.value.data || {});
      if (proj.status === 'fulfilled') setProjections(proj.value.data || {});
    } catch (err) { setError('Telemetry synchronization error'); }
    setLoading(prev => ({ ...prev, performance: false, contributions: false, allocation: false, metrics: false, projections: false }));
  };

  const performanceChartConfig = useMemo(() => ({
    data: accountPerformance.equityCurve || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#1890ff', '#52c41a'],
    yAxis: { label: { formatter: (v) => `$${v.toLocaleString()}` } }
  }), [accountPerformance]);

  const allocationConfig = useMemo(() => ({
    data: Object.entries(portfolioAllocation).map(([type, value]) => ({ type, value })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
  }), [portfolioAllocation]);

  const projectionData = useMemo(() => projections.projections?.map(p => ({ ...p, type: 'Projected Value' })) || [], [projections]);

  const handleDeleteAccount = (acc) => {
    confirm({
      title: 'Decommission SIP Stratagem?',
      icon: <ExclamationCircleOutlined />,
      content: 'Systematic termination is irreversible. Proceed?',
      okType: 'danger',
      onOk: () => sipAPI.deleteSIPAccount(acc.id).then(fetchAccounts)
    });
  };

  const currentAccountDetails = useMemo(() => sipAccounts.find(a => a.id === activeAccount) || {}, [sipAccounts, activeAccount]);

  return (
    <div className="sip-dashboard">
      <div className="sip-header">
        <h1><FundProjectionScreenOutlined /> SIP Intelligence Command</h1>
        <div className="header-controls">
          <Select value={activeAccount} onChange={setActiveAccount} options={sipAccounts.map(a => ({ value: a.id, label: a.name }))} style={{ width: 220 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAccountModal(true)}>New Stratagem</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchAccountData}>Refresh telemetry</Button>
        </div>
      </div>

      {activeAccount && (
        <>
          <Row gutter={[24, 24]} className="summary-cards">
            <Col span={4}><Card className="summary-card"><Statistic title="Equity" value={performanceMetrics.currentValue} precision={2} prefix="$" valueStyle={{ color: '#52c41a' }} /><div className="summary-change">Returns: ${performanceMetrics.returns?.toFixed(2)}</div></Card></Col>
            <Col span={4}><Card className="summary-card"><Statistic title="ROI" value={performanceMetrics.roi} precision={2} suffix="%" valueStyle={{ color: '#52c41a' }} /><div className="summary-change">CAGR: {performanceMetrics.cagr}%</div></Card></Col>
            <Col span={4}><Card className="summary-card"><Statistic title="Risk Topology" value={performanceMetrics.riskLevel?.toUpperCase()} valueStyle={{ color: '#faad14' }} /><div className="summary-change">Vol: {performanceMetrics.volatility}%</div></Card></Col>
            <Col span={4}><Card className="summary-card"><Statistic title="Contributions" value={contributionHistory.length} /><div className="summary-change">Next: {performanceMetrics.nextContributionDate?.split('T')[0]}</div></Card></Col>
            <Col span={4}><Card className="summary-card"><Statistic title="Profit Factor" value={performanceMetrics.profitFactor} precision={2} /><div className="summary-change">Win Rate: {performanceMetrics.winRate}%</div></Card></Col>
            <Col span={4}><Card className="summary-card"><Statistic title="Capital" value={performanceMetrics.totalInvestment} precision={2} prefix="$" /><div className="summary-change">Basis Cost</div></Card></Col>
          </Row>

          <Card className="sip-content-card">
            <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={<Space>{activeTab === 'dashboard' && <Select value={timeframe} onChange={setTimeframe} options={timeframeOptions} style={{ width: 120 }} />}{activeTab === 'projections' && <Select value={period} onChange={setPeriod} options={periodOptions} style={{ width: 120 }} />}<Button icon={<DownloadOutlined />}>Export Ledger</Button></Space>}>
              <TabPane tab={<span><BarChartOutlined /> Dashboard</span>} key="dashboard">
                <Row gutter={[24, 24]}>
                  <Col span={16}><Card title="Growth Trajectory" extra={<Button type="primary" onClick={() => setShowContributionModal(true)}>New Dispatch</Button>}><Line {...performanceChartConfig} height={400} /></Card></Col>
                  <Col span={8}><Card title="Performance Analytics"><div className="performance-metrics">
                    {[{ title: 'Total Investment', value: performanceMetrics.totalInvestment, color: '#1890ff' }, { title: 'Current Value', value: performanceMetrics.currentValue, color: '#52c41a' }].map((m, i) => <div key={i} className="metric-item"><div className="metric-label">{m.title}</div><div className="metric-value" style={{ color: m.color }}>${m.value?.toLocaleString()}</div></div>)}
                  </div></Card><Card title="Asset Topology" style={{ marginTop: 24 }}><Pie {...allocationConfig} height={250} /></Card></Col>
                  <Col span={24}><Card title="Contribution Ledger"><Table dataSource={contributionHistory} columns={[{ title: 'Dispatch Date', dataIndex: 'date' }, { title: 'Capital Amount', dataIndex: 'amount', render: v => `$${v.toLocaleString()}` }, { title: 'Status', render: () => <Badge status="success" text="SETTLED" /> }]} pagination={{ pageSize: 5 }} rowKey="id" /></Card></Col>
                </Row>
              </TabPane>
              {/* Other tabs omitted for brevity, keeping structure complete */}
              <TabPane tab={<span><LineChartOutlined /> Performance</span>} key="performance"><Card title="Analysis Module Active"><Line data={accountPerformance.drawdownCurve || []} xField="date" yField="drawdown" height={400} /></Card></TabPane>
              <TabPane tab={<span><PieChartOutlined /> Projections</span>} key="projections"><Card title="Wealth Forecast"><Line data={projectionData} xField="date" yField="value" height={400} /></Card></TabPane>
              <TabPane tab={<span><DatabaseOutlined /> Account Management</span>} key="management"><Card title="Stratagem Configuration"><Form layout="vertical"><Form.Item label="Identity"><Input value={activeAccount} disabled /></Form.Item><Button type="primary" onClick={() => setShowEditModal(true)}>Modify Configuration</Button><Divider /><Button type="danger" onClick={() => handleDeleteAccount(currentAccountDetails)}>Terminate Stratagem</Button></Form></Card></TabPane>
            </Tabs>
          </Card>
        </>
      )}

      {/* Modals */}
      <Modal title="Initialize New SIP Stratagem" open={showAccountModal} onCancel={() => setShowAccountModal(false)} onOk={() => accountForm.submit()}>
        <Form form={accountForm} layout="vertical" onFinish={(v) => sipAPI.createSIPAccount(v).then(() => { setShowAccountModal(false); fetchAccounts(); })}>
          <Form.Item name="name" label="Stratagem Identity" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Recurrent Capital Dispatch" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="frequency" label="Dispatch Cycle"><Select options={frequencyOptions} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Manual Capital Dispatch" open={showContributionModal} onCancel={() => setShowContributionModal(false)} onOk={() => contributionForm.submit()}>
        <Form form={contributionForm} layout="vertical" onFinish={(v) => sipAPI.addContribution(activeAccount, v).then(() => { setShowContributionModal(false); fetchAccountData(); })}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Modify SIP Configuration" open={showEditModal} onCancel={() => setShowEditModal(false)} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={(v) => sipAPI.updateSIPAccount(activeAccount, v).then(() => { setShowEditModal(false); fetchAccounts(); })}>
          <Form.Item name="autoRebalance" valuePropName="checked"><Checkbox>Enable Auto Rebalancing</Checkbox></Form.Item>
          <Form.Item name="rebalanceFrequency" label="Rebalance Frequency" style={{ display: editForm.getFieldValue('autoRebalance') ? 'block' : 'none' }}>
            <Select><Select.Option value="monthly">Monthly</Select.Option><Select.Option value="quarterly">Quarterly</Select.Option><Select.Option value="annually">Annually</Select.Option></Select>
          </Form.Item>
          <Form.Item name="contributionDay" label="Contribution Day"><InputNumber min={1} max={31} /></Form.Item>
        </Form>
      </Modal>

      {error && <Alert message="Telemetry Link Severed" description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginTop: 16 }} />}
    </div>
  );
};

export default SIPDashboard;
