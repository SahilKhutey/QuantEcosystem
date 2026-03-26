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
  Modal,
  Descriptions,
  Divider,
  Statistic,
  Slider,
  Input,
  Switch,
  Typography,
  Checkbox,
  Collapse,
  DatePicker
} from 'antd';
import { 
  ThunderboltOutlined,
  SignalFilled,
  BarChartOutlined,
  LineChartOutlined,
  RadarChartOutlined,
  DatabaseOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SettingOutlined,
  FireOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Column, Line, Radar, DualAxes } from '@ant-design/plots';
import { signalsAPI } from '../services/api/signals';
import './SignalsPage.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Search } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

const SignalsPage = () => {
  // State Management
  const [signals, setSignals] = useState([]);
  const [modelPerformance, setModelPerformance] = useState({});
  const [backtestingResults, setBacktestingResults] = useState({ equityCurve: [], trades: [] });
  const [technicalIndicators, setTechnicalIndicators] = useState({});
  const [featureImportance, setFeatureImportance] = useState([]);
  const [ensemblePredictions, setEnsemblePredictions] = useState({});
  const [loading, setLoading] = useState({ signals: true, performance: true, backtesting: true, indicators: true, features: true, ensemble: true });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('signals');
  const [signalFilters, setSignalFilters] = useState({ model: 'all', confidence: 70, timeframe: '1h', status: 'active', search: '' });
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [modelType, setModelType] = useState('lstm');
  const [signalModalVisible, setSignalModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading({ signals: true, performance: true, backtesting: true, indicators: true, features: true, ensemble: true });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        signalsAPI.getSignals(signalFilters),
        signalsAPI.getModelPerformance(modelType),
        signalsAPI.getBacktestingResults({ model: modelType }),
        signalsAPI.getTechnicalIndicators('BTC/USD'),
        signalsAPI.getFeatureImportance('sig_1'),
        signalsAPI.getEnsemblePredictions('BTC/USD')
      ]);

      if (responses[0].status === 'fulfilled') setSignals(responses[0].value.data);
      if (responses[1].status === 'fulfilled') setModelPerformance(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setBacktestingResults(responses[2].value.data);
      if (responses[3].status === 'fulfilled') setTechnicalIndicators(responses[3].value.data);
      if (responses[4].status === 'fulfilled') setFeatureImportance(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setEnsemblePredictions(responses[5].value.data);

      setLoading({ signals: false, performance: false, backtesting: false, indicators: false, features: false, ensemble: false });
    } catch (err) {
      setError('Failed to load signal data');
    }
  }, [modelType, signalFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const matchesModel = signalFilters.model === 'all' || s.model.toLowerCase() === signalFilters.model.toLowerCase();
      const matchesConfidence = (s.strength * 100) >= signalFilters.confidence;
      const matchesStatus = signalFilters.status === 'all' || s.status === signalFilters.status;
      const matchesSearch = !signalFilters.search || s.symbol.toLowerCase().includes(signalFilters.search.toLowerCase());
      return matchesModel && matchesConfidence && matchesStatus && matchesSearch;
    });
  }, [signals, signalFilters]);

  // Chart Configs
  const signalStrengthConfig = useMemo(() => ({
    data: signals.slice(0, 20).map(s => ({ time: new Date(s.timestamp).toLocaleTimeString(), strength: s.strength * 100, symbol: s.symbol })),
    xField: 'time', yField: 'strength', seriesField: 'symbol', smooth: true,
  }), [signals]);

  const backtestingConfig = useMemo(() => ({
    data: [backtestingResults.equity_curve || [], backtestingResults.equity_curve || []],
    xField: 'date', yField: ['value', 'value'],
    geometryOptions: [{ geometry: 'line', color: '#1890ff' }, { geometry: 'line', color: '#52c41a' }],
  }), [backtestingResults]);

  const signalColumns = [
    { title: 'Time', dataIndex: 'timestamp', render: t => new Date(t).toLocaleTimeString() },
    { title: 'Symbol', dataIndex: 'symbol', fixed: 'left', width: 100 },
    { title: 'Signal', dataIndex: 'type', render: (t, r) => <Space direction="vertical" size={0}><Tag color={t === 'BUY' ? 'green' : 'red'}>{t}</Tag><small>{r.model}</small></Space> },
    { title: 'Confidence', dataIndex: 'strength', render: s => <Progress percent={s * 100} size="small" /> },
    { title: 'Target', dataIndex: 'target', align: 'right', render: v => `$${v?.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color="blue">{s.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', fixed: 'right', width: 120, render: (_, r) => (
      <Space>
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSignalModalVisible(true)} />
        <Button type="primary" size="small">Trade</Button>
      </Space>
    )}
  ];

  return (
    <div className="signals-page">
      <div className="signals-header">
        <Title level={2}><ThunderboltOutlined /> AI Trading Signals</Title>
        <div className="header-controls">
          <Badge count={signals.filter(s => s.status === 'active').length} showZero><Button icon={<SignalFilled />} type="primary">Active</Button></Badge>
          <Switch checked={isMonitoring} onChange={setIsMonitoring} checkedChildren="Live" unCheckedChildren="Offline" style={{ margin: '0 16px' }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="model-summary">
        <Col xs={24} md={4}><Card className="summary-card"><Statistic title="Accuracy" value={modelPerformance.accuracy * 100} suffix="%" /></Card></Col>
        <Col xs={24} md={4}><Card className="summary-card"><Statistic title="Sharpe" value={modelPerformance.sharpe_ratio} precision={2} /></Card></Col>
        <Col xs={24} md={4}><Card className="summary-card"><Statistic title="Win Rate" value={modelPerformance.win_rate * 100} suffix="%" /></Card></Col>
        <Col xs={24} md={4}><Card className="summary-card"><Statistic title="Return" value={modelPerformance.cumulative_return} prefix="+" suffix="%" /></Card></Col>
        <Col xs={24} md={8}><Card className="summary-card"><Statistic title="Status" value="OPERATIONAL" valueStyle={{ color: '#3f8600' }} /></Card></Col>
      </Row>

      <Card className="signals-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
          <Space>
            {activeTab === 'signals' && (
              <Space>
                <Select value={signalFilters.timeframe} onChange={v => setSignalFilters(p => ({ ...p, timeframe: v }))} options={[{ value: '1h', label: '1 Hour' }]} />
                <Slider value={signalFilters.confidence} onChange={v => setSignalFilters(p => ({ ...p, confidence: v }))} min={0} max={100} style={{ width: 100 }} />
                <Search placeholder="Search..." onSearch={v => setSignalFilters(p => ({ ...p, search: v }))} style={{ width: 150 }} />
              </Space>
            )}
          </Space>
        }>
          <TabPane tab={<span><FireOutlined />Active Signals</span>} key="signals">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={18}>
                 <Table dataSource={filteredSignals} columns={signalColumns} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
              </Col>
              <Col xs={24} lg={6}>
                 <Card title="Confidence Trend"><Line {...signalStrengthConfig} height={250} /></Card>
                 <Card title="Quick Actions" style={{ marginTop: 16 }}>
                   <Button type="primary" block icon={<ThunderboltOutlined />}>Auto-Execute High Conf</Button>
                   <Button block icon={<DownloadOutlined />} style={{ marginTop: 8 }}>Export CSV</Button>
                 </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined />Performance</span>} key="performance">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={12}><Card title="Model Radar"><Radar data={[{ name: 'Accuracy', value: 0.8 }, { name: 'WinRate', value: 0.6 }]} xField="name" yField="value" /></Card></Col>
               <Col xs={24} lg={12}><Card title="Backtesting"><DualAxes {...backtestingConfig} height={350} /></Card></Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><LineChartOutlined />Technical Analysis</span>} key="technical">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={16}>
                  <Card title="Indicator Matrix">
                    <Row gutter={[16, 16]}>
                      {Object.entries(technicalIndicators).map(([k, v]) => (
                        <Col span={8} key={k}><Statistic title={k} value={typeof v === 'object' ? v.line : v} /></Col>
                      ))}
                    </Row>
                  </Card>
               </Col>
               <Col xs={24} lg={8}>
                  <Collapse defaultActiveKey={['1']}>
                    <Panel header="RSI Analysis" key="1"><p>Momentum is bullish above 60.</p></Panel>
                  </Collapse>
               </Col>
             </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Signal Details" open={signalModalVisible} onCancel={() => setSignalModalVisible(false)} footer={<Button type="primary">Execute Signal</Button>}>
        <Descriptions bordered column={1}>
           <Descriptions.Item label="Symbol">BTC/USD</Descriptions.Item>
           <Descriptions.Item label="Action"><Tag color="green">BUY</Tag></Descriptions.Item>
           <Descriptions.Item label="Confidence">88%</Descriptions.Item>
           <Descriptions.Item label="Model">LSTM Ensemble</Descriptions.Item>
        </Descriptions>
      </Modal>

      {error && <Alert message="Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default SignalsPage;
