import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Collapse,
  Statistic,
  Slider,
  Input,
  Switch,
  Typography,
  Avatar,
  Timeline,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Divider,
  List
} from 'antd';
import { 
  WalletOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  HeartOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  AuditOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Pie, Column, Line, DualAxes, RingProgress } from '@ant-design/plots';
import { globalWealthAPI } from '../services/api/globalWealth';
import './GlobalWealthPage.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text } = Typography;
const { useForm } = Form;
const { confirm } = Modal;
const { TextArea } = Input;

const GlobalWealthPage = () => {
  // State Management
  const [wealthOverview, setWealthOverview] = useState({ 
    totalAssets: 15450000.0, netWorth: 14450000.0, liquidAssets: 8500000.0, 
    totalDebt: 1000000.0, change24h: 2.45, liquidityRatio: 0.55, debtToAssetRatio: 0.06,
    annualReturn: 18.5, threeYearCagr: 16.2, volatility: 8.4, bestMonth: 4.2,
    sipReturns: 14.5, benchmarkReturns: 12.2, swpSustainability: 0.85, costEfficiency: 0.92, annualFees: 12500,
    currentAge: 45, retirementAge: 65, yearsToRetirement: 20, retirementCorpusNeeded: 50000000, 
    currentRetirementSavings: 12000000, retirementGap: 38000000
  });
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [sipSwpSchedules, setSipSwpSchedules] = useState([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState({ 
    portfolioGrowth: [], cumulativeReturn: 42.5, annualizedReturn: 18.2, volatility: 8.4, 
    sharpeRatio: 1.45, maxDrawdown: 12.5, beta: 0.85, sp500Return: 12.5, msciWorldReturn: 10.2, 
    bondIndexReturn: 4.5, portfolioReturn: 18.2,
    assetClassPerformance: [
      { assetClass: 'Equities', allocation: 55, return: 22.4, contribution: 12.3, riskAdjustedReturn: 1.8 },
      { assetClass: 'Fixed Income', allocation: 25, return: 5.2, contribution: 1.3, riskAdjustedReturn: 1.2 }
    ]
  });
  const [taxOptimization, setTaxOptimization] = useState({ 
    potential_savings: 45000, efficiencyRatio: 0.85, annualTaxLiability: 150000, 
    taxSaved: 45000, effectiveTaxRate: 0.28,
    lossHarvestingOpportunities: [
      { asset: 'Tech ETF', loss: -12.5, potentialSavings: 3500 },
      { asset: 'Small Cap Fund', loss: -8.2, potentialSavings: 1200 }
    ]
  });
  const [goalPlanning, setGoalPlanning] = useState([
    { id: 1, name: 'Retirement Fund', category: 'Retirement', targetAmount: 50000000, currentValue: 12000000, progress: 24, targetDate: '2040-01-01', priority: 'high' }
  ]);
  const [estatePlanning, setEstatePlanning] = useState({
    grossEstateValue: 15450000, applicableExclusion: 12920000, taxableEstate: 2530000, estimatedEstateTax: 1012000,
    coreDocuments: [{ name: 'Last Will & Testament', status: 'complete' }],
    beneficiaries: [{ name: 'Jane Doe', relationship: 'Spouse', percentage: 50 }]
  });
  const [familyOfficeServices, setFamilyOfficeServices] = useState({
    investmentManagement: ['Portfolio Optimization', 'Direct Private Equity', 'Venture Capital'],
    administrativeServices: ['Bill Pay', 'Concierge Services', 'Entity Management'],
    advisoryServices: ['Estate Planning', 'Tax Strategy', 'Risk Management'],
    specializedServices: ['Education Planning', 'Art Advisory', 'Philanthropy'],
    familyMembers: [{ name: 'Sahil Khutey', role: 'Principal', email: 'sahil@office.com', phone: '+1-555-0199' }],
    serviceProviders: [{ company: 'Goldman Sachs', service: 'Custody', contact: 'Mark Wilson' }],
    familyCouncilMeetings: [{ date: '2024-03-20', topic: 'Annual Strategic Review', completed: true }],
    educationPrograms: [{ name: 'Next-Gen Financial Literacy', description: 'Wealth transfer preparedness for heirs.', participants: ['Sahil Jr.'] }]
  });
  const [philanthropyData, setPhilanthropyData] = useState({
    totalDonationsYTD: 250000, lifetimeDonations: 1200000, percentageOfNetWorth: 7.5, causesSupported: ['Education', 'Heath'],
    donationsByCause: [{ cause: 'Education', amount: 150000 }, { cause: 'Health', amount: 100000 }],
    activeCharities: [{ name: 'Global Education Fund', category: 'Education', totalDonated: 500000, impactDescription: 'Built 10 schools in developing regions.' }],
    givingVehicles: [{ name: 'Khutey Foundation', type: 'Private Foundation', balance: 5000000 }],
    plannedInitiatives: [{ id: 1, name: 'Clean Water Project', targetAmount: 200000, currentCommitments: 150000, progress: 75, targetDate: '2024-12-31' }]
  });

  const [loading, setLoading] = useState({ overview: true, allocation: true, performance: true, schedules: true, family: true, philanthropy: true });
  const [clientId, setClientId] = useState('client_12345');
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceTimeframe, setPerformanceTimeframe] = useState('ytd');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showSipSwpModal, setShowSipSwpModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [sipSwpForm] = useForm();
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading({ overview: true, allocation: true, performance: true, schedules: true, family: true, philanthropy: true });
    try {
      const responses = await Promise.allSettled([
        globalWealthAPI.getWealthOverview(),
        globalWealthAPI.getAssetAllocation(clientId),
        globalWealthAPI.getSipSwpSchedules(clientId),
        globalWealthAPI.getPerformanceAnalytics(clientId, performanceTimeframe),
        globalWealthAPI.getFamilyOfficeServices(clientId),
        globalWealthAPI.getPhilanthropyData(clientId)
      ]);

      if (responses[0].status === 'fulfilled') setWealthOverview(prev => ({ ...prev, ...responses[0].value.data }));
      if (responses[1].status === 'fulfilled') setAssetAllocation(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setSipSwpSchedules(responses[2].value.data.sip.concat(responses[2].value.data.swp.map(s => ({ ...s, type: 'SWP' }))));
      if (responses[3].status === 'fulfilled') setPerformanceAnalytics(prev => ({ ...prev, ...responses[3].value.data }));
      if (responses[4].status === 'fulfilled') setFamilyOfficeServices(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setPhilanthropyData(responses[5].value.data);

      setLoading({ overview: false, allocation: false, performance: false, schedules: false, family: false, philanthropy: false });
    } catch (err) {
      console.error(err);
    }
  }, [clientId, performanceTimeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allocationConfig = useMemo(() => ({
    data: assetAllocation, angleField: 'value', colorField: 'asset_class',
    radius: 0.8, innerRadius: 0.6,
    statistic: { title: false, content: { formatter: () => `Total\n$${(wealthOverview.totalAssets / 1000000).toFixed(1)}M` } }
  }), [assetAllocation, wealthOverview]);

  const handleSipSwpSubmit = (values) => {
     console.log('SIP/SWP Submitted:', values);
     setShowSipSwpModal(false);
  };

  return (
    <div className="global-wealth-page">
      <div className="wealth-header">
        <Title level={2}><WalletOutlined /> Global Wealth Management</Title>
        <div className="header-controls">
          <Select value={clientId} onChange={setClientId} style={{ width: 220 }} options={[{ value: 'client_12345', label: 'Sahil Khutey Family Office' }]} />
          <Button icon={<CalendarOutlined />} type="primary" onClick={() => { setModalMode('create'); setShowSipSwpModal(true); }}>Manage SIP/SWP</Button>
          <Switch checked={isMonitoring} onChange={setIsMonitoring} checkedChildren="Live" unCheckedChildren="Static" style={{ margin: '0 16px' }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="overview-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card className="overview-card total-assets"><Statistic title="Total Assets" value={wealthOverview.totalAssets} prefix={<DollarCircleOutlined />} precision={2} /><div className={wealthOverview.change24h >= 0 ? 'positive' : 'negative'}>{wealthOverview.change24h}% (YTD)</div></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overview-card net-worth"><Statistic title="Net Worth" value={wealthOverview.netWorth} prefix={<TrophyOutlined />} precision={2} /><Text type="secondary">Institutional Class</Text></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overview-card liquidity"><Statistic title="Liquid Assets" value={wealthOverview.liquidAssets} prefix={<WalletOutlined />} precision={2} /><Progress percent={wealthOverview.liquidityRatio * 100} size="small" /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overview-card goals"><Statistic title="Plan Coverage" value={sipSwpSchedules.length} prefix={<AuditOutlined />} /><Tag color="blue">Optimized</Tag></Card>
        </Col>
      </Row>

      <Card className="wealth-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><PieChartOutlined />Overview</span>} key="overview">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={16}><Card title="Current Asset Allocation"><Pie {...allocationConfig} height={400} /></Card></Col>
               <Col xs={24} lg={8}>
                  <Card title="Quick Actions">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button type="primary" block icon={<SendOutlined />}>Initiate Disbursement</Button>
                      <Button block icon={<HeartOutlined />}>Direct Philanthropy</Button>
                      <Button block icon={<TeamOutlined />}>Council Sync</Button>
                    </Space>
                  </Card>
               </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><TeamOutlined />Family Office</span>} key="family">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Institutional Services" className="family-services-card">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Title level={5}>Investment Management</Title>
                      <List size="small" dataSource={familyOfficeServices.investmentManagement} renderItem={item => <List.Item>{item}</List.Item>} />
                    </Col>
                    <Col span={12}>
                      <Title level={5}>Advisory Services</Title>
                      <List size="small" dataSource={familyOfficeServices.advisoryServices} renderItem={item => <List.Item>{item}</List.Item>} />
                    </Col>
                  </Row>
                </Card>
                <Card title="Family Governance" style={{ marginTop: 24 }}>
                   <Timeline>
                     {familyOfficeServices.familyCouncilMeetings.map((m, i) => (
                       <Timeline.Item key={i} color={m.completed ? 'green' : 'blue'}>
                         <Text strong>{m.date}</Text> - {m.topic} <Tag>{m.completed ? 'Done' : 'Planned'}</Tag>
                       </Timeline.Item>
                     ))}
                   </Timeline>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Family Members">
                   {familyOfficeServices.familyMembers.map((m, i) => (
                     <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                       <Avatar size="large">{m.name.charAt(0)}</Avatar>
                       <div><Text strong>{m.name}</Text><br /><Text type="secondary">{m.role}</Text></div>
                     </div>
                   ))}
                </Card>
                <Card title="Custodians & Providers" style={{ marginTop: 16 }}>
                   {familyOfficeServices.serviceProviders.map((p, i) => (
                     <div key={i}><Text strong>{p.company}</Text><br /><Text type="secondary">{p.service}</Text></div>
                   ))}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HeartOutlined />Philanthropy</span>} key="philanthropy">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={16}>
                 <Card title="Giving Analytics">
                    <Row gutter={24}>
                      <Col span={8}><Statistic title="YTD Giving" value={philanthropyData.totalDonationsYTD} prefix="$" /></Col>
                      <Col span={8}><Statistic title="Lifetime Impact" value={philanthropyData.lifetimeDonations} prefix="$" /></Col>
                      <Col span={8}><Statistic title="% Net Worth" value={philanthropyData.percentageOfNetWorth} suffix="%" /></Col>
                    </Row>
                    <Divider />
                    <Pie data={philanthropyData.donationsByCause} angleField="amount" colorField="cause" height={300} />
                 </Card>
               </Col>
               <Col xs={24} lg={8}>
                 <Card title="Active Charities">
                    {philanthropyData.activeCharities.map((c, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <Text strong>{c.name}</Text> <Tag color="blue">{c.category}</Tag>
                        <br /><Text type="secondary">Impact: {c.impactDescription}</Text>
                      </div>
                    ))}
                 </Card>
                 <Card title="Giving Vehicles" style={{ marginTop: 16 }}>
                    {philanthropyData.givingVehicles.map((v, i) => (
                      <div key={i}><Text strong>{v.name}</Text><br /><Text type="secondary">Balance: ${v.balance.toLocaleString()}</Text></div>
                    ))}
                 </Card>
               </Col>
             </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title={`${modalMode === 'create' ? 'Schedule' : 'Edit'} Wealth Plan`} open={showSipSwpModal} onCancel={() => setShowSipSwpModal(false)} footer={null} width={600}>
        <Form form={sipSwpForm} layout="vertical" onFinish={handleSipSwpSubmit}>
          <Form.Item name="type" label="Plan Type" rules={[{ required: true }]} initialValue="SIP">
            <Select><Select.Option value="SIP">Systematic Investment (SIP)</Select.Option><Select.Option value="SWP">Systematic Withdrawal (SWP)</Select.Option></Select>
          </Form.Item>
          <Form.Item name="asset" label="Asset" rules={[{ required: true }]}><Input placeholder="Asset Symbol or Name" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="amount" label="Amount ($)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="frequency" label="Frequency" initialValue="monthly"><Select><Select.Option value="monthly">Monthly</Select.Option><Select.Option value="quarterly">Quarterly</Select.Option></Select></Form.Item></Col>
          </Row>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="notes" label="Notes"><TextArea rows={3} /></Form.Item>
          <Button type="primary" block htmlType="submit">Activate Schedule</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default GlobalWealthPage;
