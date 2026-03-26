// src/pages/SWPDashboard.jsx
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
  ExperimentOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Heatmap } from '@ant-design/plots';
import { swpAPI } from '../api/swp';
import './SWPDashboard.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;

const SWPDashboard = () => {
  // State Management
  const [swpAccounts, setSwpAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [accountPerformance, setAccountPerformance] = useState({});
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [portfolioAllocation, setPortfolioAllocation] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [projections, setProjections] = useState({});
  const [sustainability, setSustainability] = useState({});
  const [loading, setLoading] = useState({
    accounts: true,
    performance: true,
    withdrawals: true,
    allocation: true,
    metrics: true,
    projections: true,
    sustainability: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeframe, setTimeframe] = useState('1y');
  const [period, setPeriod] = useState('5y');
  const [strategy, setStrategy] = useState('4% rule');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [wsConnection, setWsConnection] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountForm] = useForm();
  const [withdrawalForm] = useForm();
  const [editForm] = useForm();
  const [sustainabilityForm] = useForm();

  const wsRef = useRef(null);

  // Timeframe options
  const timeframeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
    { value: '10y', label: '10 Years' }
  ];

  // Period options for projections
  const periodOptions = [
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
    { value: '10y', label: '10 Years' },
    { value: '20y', label: '20 Years' },
    { value: '30y', label: '30 Years' }
  ];

  // Withdrawal strategy options
  const strategyOptions = [
    { value: '4% rule', label: '4% Rule' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'fixed_percent', label: 'Fixed Percentage' },
    { value: 'variable', label: 'Variable (RMD)' },
    { value: 'inflation_adjusted', label: 'Inflation-Adjusted' },
    { value: 'dynamic', label: 'Dynamic Spending' }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (activeAccount && isMonitoring) {
      connectWebSocket();
    } else if (wsRef.current) {
      wsRef.current.close();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeAccount, isMonitoring]);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = swpAPI.subscribeToSWPUpdates(activeAccount, handleWebSocketMessage);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to SWP WebSocket');
    };

    ws.onclose = () => {
      console.log('SWP WebSocket disconnected');
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };

    setWsConnection(ws);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'account_update':
        setSwpAccounts(prev => 
          prev.map(acc => acc.id === activeAccount ? { ...acc, ...data.payload } : acc)
        );
        break;
      case 'performance_update':
        setAccountPerformance(data.payload);
        break;
      case 'withdrawal_update':
        setWithdrawalHistory(prev => [data.payload, ...prev]);
        break;
      default:
        break;
    }
  };

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeAccount, timeframe, period, strategy]);

  const fetchData = async () => {
    if (!activeAccount) {
      setLoading(prev => ({ ...prev, accounts: true }));
      try {
        const response = await swpAPI.getSWPAccounts();
        setSwpAccounts(response.data || []);
        if (response.data && response.data.length > 0 && !activeAccount) {
          setActiveAccount(response.data[0].id);
        }
        setLoading(prev => ({ ...prev, accounts: false }));
      } catch (err) {
        setError('Failed to load SWP accounts');
        setLoading(prev => ({ ...prev, accounts: false }));
      }
      return;
    }

    setLoading({
      accounts: false,
      performance: true,
      withdrawals: true,
      allocation: true,
      metrics: true,
      projections: true,
      sustainability: true
    });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        swpAPI.getSWPPerformance(activeAccount, timeframe),
        swpAPI.getWithdrawalHistory(activeAccount),
        swpAPI.getPortfolioAllocation(activeAccount),
        swpAPI.getPerformanceMetrics(activeAccount),
        swpAPI.getProjections(activeAccount, period),
        swpAPI.getSustainabilityAnalysis(activeAccount, strategy)
      ]);

      if (responses[0].status === 'fulfilled') setAccountPerformance(responses[0].value.data || {});
      if (responses[1].status === 'fulfilled') setWithdrawalHistory(responses[1].value.data || []);
      if (responses[2].status === 'fulfilled') setPortfolioAllocation(responses[2].value.data || {});
      if (responses[3].status === 'fulfilled') setPerformanceMetrics(responses[3].value.data || {});
      if (responses[4].status === 'fulfilled') setProjections(responses[4].value.data || {});
      if (responses[5].status === 'fulfilled') setSustainability(responses[5].value.data || {});

      const rejected = responses.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        setError('Some SWP data failed to load. Please try refreshing.');
      }
    } catch (err) {
      setError('Failed to load SWP data');
    } finally {
      setLoading(prev => ({
        ...prev,
        performance: false,
        withdrawals: false,
        allocation: false,
        metrics: false,
        projections: false,
        sustainability: false
      }));
    }
  };

  const handleCreateAccount = async (values) => {
    try {
      const result = await swpAPI.createSWPAccount(values);
      setSwpAccounts(prev => [...prev, result.data]);
      setActiveAccount(result.data.id);
      setShowAccountModal(false);
      accountForm.resetFields();
    } catch (err) {
      setError('Failed to create SWP account');
    }
  };

  const handleAddWithdrawal = async (values) => {
    try {
      const result = await swpAPI.addWithdrawal(activeAccount, values);
      setWithdrawalHistory(prev => [result.data, ...prev]);
      setShowWithdrawalModal(false);
      withdrawalForm.resetFields();
    } catch (err) {
      setError('Failed to add withdrawal');
    }
  };

  const handleUpdateAccount = async (values) => {
    try {
      const result = await swpAPI.updateSWPAccount(activeAccount, values);
      setSwpAccounts(prev => 
        prev.map(acc => acc.id === activeAccount ? { ...acc, ...result.data } : acc)
      );
      setShowEditModal(false);
      editForm.resetFields();
    } catch (err) {
      setError('Failed to update SWP account');
    }
  };

  const handleDeleteAccount = (account) => {
    confirm({
      title: 'Delete SWP Account?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this SWP account? This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await swpAPI.deleteSWPAccount(account.id);
          const newAccounts = swpAccounts.filter(acc => acc.id !== account.id);
          setSwpAccounts(newAccounts);
          setActiveAccount(newAccounts[0]?.id || null);
        } catch (err) {
          setError('Failed to delete SWP account');
        }
      },
    });
  };

  const toggleMonitoring = () => setIsMonitoring(!isMonitoring);

  const performanceChartConfig = useMemo(() => ({
    data: accountPerformance.equityCurve || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    lineStyle: ({ type }) => {
      return type === 'equity' 
        ? { lineWidth: 3, stroke: '#1890ff' } 
        : { lineWidth: 2, stroke: '#52c41a', lineDash: [5, 5] };
    },
    point: { size: 3, shape: 'circle' },
    legend: { position: 'top' },
    yAxis: { label: { formatter: (v) => `$${v?.toLocaleString()}` } },
    tooltip: {
      formatter: (datum) => ({
        name: datum.type,
        value: `$${datum.value?.toLocaleString()}`,
      }),
    },
  }), [accountPerformance.equityCurve]);

  const withdrawalChartConfig = useMemo(() => ({
    data: withdrawalHistory,
    xField: 'date',
    yField: 'amount',
    point: { size: 4, shape: 'circle' },
    lineStyle: { lineWidth: 2 },
    yAxis: { label: { formatter: (v) => `$${v}` } },
  }), [withdrawalHistory]);

  const allocationConfig = useMemo(() => ({
    data: Object.entries(portfolioAllocation).map(([asset, value]) => ({
      type: asset,
      value: value
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      content: '{type}: {percentage}',
      offset: '30%',
    },
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: { formatter: () => 'Portfolio Allocation' },
      content: { formatter: () => `${withdrawalHistory.reduce((sum, w) => sum + (w.amount || 0), 0).toLocaleString()} Total` },
    },
  }), [portfolioAllocation, withdrawalHistory]);

  // UI rendering data
  const sustainabilityData = [
    {
      title: '4% Rule Success',
      value: sustainability.rule4PercentSuccess,
      suffix: '%',
      color: sustainability.rule4PercentSuccess > 80 ? '#52c41a' : sustainability.rule4PercentSuccess > 50 ? '#faad14' : '#ff4d4f'
    },
    {
      title: 'Current Withdrawal Rate',
      value: sustainability.currentWithdrawalRate,
      suffix: '%',
      color: sustainability.currentWithdrawalRate > 4 ? '#ff4d4f' : '#52c41a'
    },
    {
      title: 'Recommended Rate',
      value: sustainability.recommendedRate,
      suffix: '%',
      color: '#1890ff'
    },
    {
      title: 'Sustainability Score',
      value: sustainability.sustainabilityScore,
      suffix: '/10',
      color: sustainability.sustainabilityScore > 7 ? '#52c41a' : sustainability.sustainabilityScore > 5 ? '#faad14' : '#ff4d4f'
    },
    {
      title: 'Probability of Success',
      value: sustainability.probabilityOfSuccess,
      suffix: '%',
      color: sustainability.probabilityOfSuccess > 75 ? '#52c41a' : sustainability.probabilityOfSuccess > 50 ? '#faad14' : '#ff4d4f'
    },
    {
      title: 'Critical Period',
      value: sustainability.criticalPeriod,
      suffix: 'Years',
      color: (sustainability.criticalPeriod || 0) > 5 ? '#52c41a' : '#ff4d4f'
    }
  ];

  return (
    <div className="swp-dashboard">
      <div className="swp-header">
        <h1>
          <FundProjectionScreenOutlined /> Systematic Withdrawal Plan Dashboard
        </h1>
        <div className="header-controls">
          <Select
            value={activeAccount}
            style={{ width: 200 }}
            onChange={setActiveAccount}
            options={swpAccounts.map(account => ({
              value: account.id,
              label: account.name
            }))}
            placeholder="Select SWP account"
          />
          <Button 
            icon={<PlusOutlined />} 
            type="primary"
            onClick={() => setShowAccountModal(true)}
          >
            New Account
          </Button>
          <Button 
            icon={isMonitoring ? <StopOutlined /> : <PlayCircleOutlined />} 
            onClick={toggleMonitoring}
            danger={isMonitoring}
            type={isMonitoring ? 'default' : 'primary'}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={Object.values(loading).some(l => l)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {activeAccount && (
        <>
          <Row gutter={[24, 24]} className="summary-cards">
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card current-value">
                <Statistic
                  title="Current Value"
                  value={performanceMetrics.currentValue || 0}
                  precision={2}
                  valueStyle={{ color: (performanceMetrics.currentValue || 0) > 0 ? '#1890ff' : '#ff4d4f' }}
                  suffix="USD"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card withdrawal-rate">
                <Statistic
                  title="Annual Withdrawal Rate"
                  value={performanceMetrics.withdrawalRate || 0}
                  precision={2}
                  valueStyle={{ color: (performanceMetrics.withdrawalRate || 0) > 4 ? '#ff4d4f' : '#52c41a' }}
                  suffix="%"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card sustainability-period">
                <Statistic
                  title="Sustainability Period"
                  value={performanceMetrics.sustainabilityPeriod || 0}
                  precision={1}
                  valueStyle={{ color: (performanceMetrics.sustainabilityPeriod || 0) > 20 ? '#52c41a' : '#faad14' }}
                  suffix="Years"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card success-rate">
                <Statistic
                  title="Success Rate"
                  value={performanceMetrics.successRate || 0}
                  precision={1}
                  valueStyle={{ color: (performanceMetrics.successRate || 0) > 80 ? '#52c41a' : '#faad14' }}
                  suffix="%"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card max-drawdown">
                <Statistic
                  title="Max Drawdown"
                  value={performanceMetrics.maxDrawdown || 0}
                  precision={2}
                  valueStyle={{ color: (performanceMetrics.maxDrawdown || 0) < -20 ? '#ff4d4f' : '#52c41a' }}
                  suffix="%"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card className="summary-card sustainability-score">
                <Statistic
                  title="Sustainability Score"
                  value={sustainability.sustainabilityScore || 0}
                  precision={1}
                  valueStyle={{ color: (sustainability.sustainabilityScore || 0) > 7 ? '#52c41a' : '#faad14' }}
                  suffix="/10"
                />
              </Card>
            </Col>
          </Row>

          <Card className="swp-content-card">
            <Tabs 
              defaultActiveKey="dashboard" 
              activeKey={activeTab}
              onChange={setActiveTab}
              tabBarExtraContent={
                <Space>
                  {activeTab === 'dashboard' && <Select value={timeframe} style={{ width: 120 }} onChange={setTimeframe} options={timeframeOptions} />}
                  {activeTab === 'projections' && <Select value={period} style={{ width: 120 }} onChange={setPeriod} options={periodOptions} />}
                  {activeTab === 'sustainability' && <Select value={strategy} style={{ width: 150 }} onChange={setStrategy} options={strategyOptions} />}
                  <Button icon={<DownloadOutlined />}>Export</Button>
                </Space>
              }
            >
              <TabPane tab={<span><BarChartOutlined />Dashboard</span>} key="dashboard">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card title="Portfolio Performance" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowWithdrawalModal(true)}>New Withdrawal</Button>}>
                      {loading.performance ? <Spin className="chart-loading" /> : <Line {...performanceChartConfig} height={400} />}
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card title="Sustainability Metrics">
                      {loading.sustainability ? <Spin /> : (
                        <div className="sustainability-metrics">
                          {sustainabilityData.map((metric, i) => (
                            <div key={i} className="metric-item">
                              <div className="metric-label">{metric.title}</div>
                              <div className="metric-value" style={{ color: metric.color }}>{metric.value?.toFixed(2)}{metric.suffix}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                    <Card title="Portfolio Allocation" style={{ marginTop: 24 }}>
                      {loading.allocation ? <Spin /> : <Pie {...allocationConfig} height={300} />}
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title="Withdrawal History">
                      <Table
                        loading={loading.withdrawals}
                        dataSource={withdrawalHistory}
                        columns={[
                          { title: 'Date', dataIndex: 'date', render: d => new Date(d).toLocaleDateString() },
                          { title: 'Amount', dataIndex: 'amount', render: a => `$${a?.toLocaleString()}` },
                          { title: 'Status', dataIndex: 'status', render: s => <Tag color={s === 'completed' ? 'green' : 'blue'}>{s}</Tag> },
                          { title: 'Notes', dataIndex: 'notes' }
                        ]}
                        rowKey="id"
                      />
                    </Col>
                </Row>
              </TabPane>

              {/* Performance Tab */}
              <TabPane tab={<span><LineChartOutlined />Performance</span>} key="performance">
                 <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card title="Performance Analysis">
                       <Line {...performanceChartConfig} height={400} />
                       <Divider />
                       <div className="chart-title">Drawdown Analysis</div>
                       <Line
                          data={accountPerformance.drawdownCurve || []}
                          xField="date"
                          yField="drawdown"
                          smooth={true}
                          height={300}
                        />
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card title="Risk Metrics">
                       <div className="metric-item">
                          <div className="metric-label">Sharpe Ratio</div>
                          <div className="metric-value">{performanceMetrics.sharpeRatio?.toFixed(2) || '0.00'}</div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-label">Sortino Ratio</div>
                          <div className="metric-value">{performanceMetrics.sortinoRatio?.toFixed(2) || '0.00'}</div>
                        </div>
                    </Card>
                  </Col>
                 </Row>
              </TabPane>

              {/* Projections Tab */}
              <TabPane tab={<span><PieChartOutlined />Projections</span>} key="projections">
                <Row gutter={[24, 24]}>
                   <Col xs={24} lg={16}>
                      <Card title="Future Projections">
                        {loading.projections ? <Spin /> : (
                          <Line
                            data={projections.projections || []}
                            xField="date"
                            yField="value"
                            seriesField="type"
                            smooth={true}
                            height={400}
                          />
                        )}
                      </Card>
                   </Col>
                   <Col xs={24} lg={8}>
                      <Card title="Projection Summary">
                        <div className="summary-item">
                          <div className="summary-label">Projected Value</div>
                          <div className="summary-value">${projections.projectedValue?.toLocaleString()}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Success Prob.</div>
                          <div className="summary-value">{projections.successProbability?.toFixed(1)}%</div>
                        </div>
                      </Card>
                   </Col>
                </Row>
              </TabPane>

              {/* Sustainability Tab */}
              <TabPane tab={<span><SafetyCertificateOutlined />Sustainability</span>} key="sustainability">
                 <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                      <Card title="Simulation Analysis">
                         <Line
                            data={sustainability.probabilityByRate || []}
                            xField="rate"
                            yField="probability"
                            smooth={true}
                            height={400}
                          />
                      </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                       <Card title="Strategy Simulation">
                          <Form form={sustainabilityForm} layout="vertical">
                             <Form.Item name="strategy" label="Strategy"><Select options={strategyOptions} /></Form.Item>
                             <Form.Item name="amount" label="Amount"><InputNumber style={{ width: '100%' }} /></Form.Item>
                             <Button type="primary" block>Run Simulation</Button>
                          </Form>
                       </Card>
                    </Col>
                 </Row>
              </TabPane>

              {/* Account Management Tab */}
              <TabPane tab={<span><DatabaseOutlined />Management</span>} key="management">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card title="Account Settings" className="account-settings-card">
                      {loading.accounts ? (
                        <div className="loading-container"><Spin /></div>
                      ) : (
                        <div className="account-settings">
                          <Form form={editForm} layout="vertical" initialValues={swpAccounts.find(a => a.id === activeAccount)}>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item name="name" label="Account Name" rules={[{ required: true }]}><Input /></Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="description" label="Description"><Input /></Form.Item>
                              </Col>
                            </Row>
                            
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item name="riskTolerance" label="Risk Tolerance">
                                  <Select options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' }
                                  ]} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="targetDate" label="Target Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                              </Col>
                            </Row>
                            
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item name="withdrawalDay" label="Withdrawal Day"><InputNumber min={1} max={31} /></Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="autoRebalance" valuePropName="checked"><Checkbox>Auto Rebalancing</Checkbox></Form.Item>
                              </Col>
                            </Row>
                          </Form>
                          
                          <div className="account-actions">
                            <Button type="primary" onClick={() => setShowEditModal(true)}>Edit Details</Button>
                            <Button danger onClick={() => handleDeleteAccount(swpAccounts.find(a => a.id === activeAccount))}>Delete Account</Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card title="Account Summary" className="account-summary-card">
                      <div className="account-summary">
                        {[
                          { label: 'Account ID', value: activeAccount },
                          { label: 'Type', value: 'Systematic Withdrawal Plan' },
                          { label: 'Status', value: swpAccounts.find(a => a.id === activeAccount)?.status?.toUpperCase(), color: '#52c41a' }
                        ].map((s, i) => (
                          <div key={i} className="summary-item">
                            <div className="summary-label">{s.label}</div>
                            <div className="summary-value" style={{ color: s.color }}>{s.value || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card title="Security" style={{ marginTop: 24 }}>
                       <List size="small" dataSource={["Use 2FA", "Review history", "Monitor metrics"]} renderItem={item => <List.Item>• {item}</List.Item>} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}

      {/* Modals */}
      <Modal title="New SWP Account" open={showAccountModal} onCancel={() => setShowAccountModal(false)} onOk={() => accountForm.submit()} okText="Create">
        <Form form={accountForm} layout="vertical" onFinish={handleCreateAccount}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="initialAmount" label="Initial Amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="withdrawalAmount" label="Annual Withdrawal" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}><Select options={frequencyOptions} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Withdrawal" open={showWithdrawalModal} onCancel={() => setShowWithdrawalModal(false)} onOk={() => withdrawalForm.submit()}>
        <Form form={withdrawalForm} layout="vertical" onFinish={handleAddWithdrawal}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Edit Account" open={showEditModal} onCancel={() => setShowEditModal(false)} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateAccount}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="withdrawalAmount" label="Annual Withdrawal"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="frequency" label="Frequency"><Select options={frequencyOptions} /></Form.Item>
        </Form>
      </Modal>

      {error && <Alert message="Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default SWPDashboard;
