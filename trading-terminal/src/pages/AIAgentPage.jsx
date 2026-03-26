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
  Slider,
  InputNumber,
  Checkbox,
  Collapse,
  List,
  Timeline
} from 'antd';
import { 
  RobotOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FireOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  NotificationOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { aiAgentAPI } from '../services/api/aiAgent';
import './AIAgentPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;
const { Search } = Input;

const AIAgentPage = () => {
  // State Management
  const [agentConfigs, setAgentConfigs] = useState([]);
  const [agentStatus, setAgentStatus] = useState({});
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState({});
  const [tradingSignals, setTradingSignals] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({});
  const [agentPositions, setAgentPositions] = useState([]);
  const [agentOrders, setAgentOrders] = useState([]);
  const [agentStatistics, setAgentStatistics] = useState({});
  const [agentAlerts, setAgentAlerts] = useState([]);
  const [loading, setLoading] = useState({
    configs: true,
    status: true,
    logs: true,
    performance: true,
    signals: true,
    risk: true,
    positions: true,
    orders: true,
    statistics: true,
    alerts: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState('alpha_falcon_1');
  const [logFilters, setLogFilters] = useState({ level: 'all', search: '' });
  const [performanceTimeframe, setPerformanceTimeframe] = useState('24h');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [configForm] = useForm();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const wsRef = useRef(null);

  // Available agent options
  const agentOptions = useMemo(() => agentConfigs.map(a => ({ value: a.id, label: a.name })), [agentConfigs]);

  // Connect WebSocket
  useEffect(() => {
    if (isMonitoring && selectedAgent) {
      connectWebSocket();
    } else if (wsRef.current) {
      wsRef.current.close();
    }
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [isMonitoring, selectedAgent]);

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();
    try {
      const ws = aiAgentAPI.subscribeToAgentUpdates(selectedAgent, (data) => {
        switch (data.type) {
          case 'agent_status': setAgentStatus(prev => ({ ...prev, ...data.payload })); break;
          case 'log_entry': setAgentLogs(prev => [data.payload, ...prev.slice(0, 99)]); break;
          case 'performance_update': setAgentPerformance(prev => ({ ...prev, ...data.payload })); break;
          case 'risk_update': setRiskMetrics(prev => ({ ...prev, ...data.payload })); break;
          default: break;
        }
      });
      wsRef.current = ws;
    } catch (e) { console.error("WS error", e); }
  };

  // Fetch initial data
  useEffect(() => {
    if (selectedAgent) fetchData();
  }, [selectedAgent, logFilters, performanceTimeframe]);

  const fetchData = async () => {
    setLoading(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    try {
      const [configs, status, logs, perf, risk, positions, orders, stats, alerts] = await Promise.allSettled([
        aiAgentAPI.getAgentConfigs(),
        aiAgentAPI.getAgentStatus(selectedAgent),
        aiAgentAPI.getAgentLogs(selectedAgent, logFilters),
        aiAgentAPI.getAgentPerformance(selectedAgent, performanceTimeframe),
        aiAgentAPI.getRiskMetrics(selectedAgent),
        aiAgentAPI.getAgentPositions(selectedAgent),
        aiAgentAPI.getAgentOrders(selectedAgent),
        aiAgentAPI.getAgentStatistics(selectedAgent),
        aiAgentAPI.getAgentAlerts(selectedAgent)
      ]);

      if (configs.status === 'fulfilled') setAgentConfigs(configs.value.data || []);
      if (status.status === 'fulfilled') setAgentStatus(status.value.data || {});
      if (logs.status === 'fulfilled') setAgentLogs(logs.value.data || []);
      if (perf.status === 'fulfilled') setAgentPerformance(perf.value.data || {});
      if (risk.status === 'fulfilled') setRiskMetrics(risk.value.data || {});
      if (positions.status === 'fulfilled') setAgentPositions(positions.value.data || []);
      if (orders.status === 'fulfilled') setAgentOrders(orders.value.data || []);
      if (stats.status === 'fulfilled') setAgentStatistics(stats.value.data || {});
      if (alerts.status === 'fulfilled') setAgentAlerts(alerts.value.data || []);

      setLoading(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {}));
    } catch (err) { setError('Data link failure'); }
  };

  const performanceChartConfig = useMemo(() => ({
    data: agentPerformance.data || [],
    xField: 'time',
    yField: 'value',
    smooth: true,
    lineStyle: { lineWidth: 2, stroke: '#1890ff' },
    yAxis: { label: { formatter: (v) => `${(v * 100).toFixed(2)}%` } }
  }), [agentPerformance]);

  const updateAgentConfig = async (values) => {
    try {
      await aiAgentAPI.updateAgentConfig(selectedAgent, values);
      setShowConfigModal(false);
      fetchData();
    } catch (e) { setError('Configuration update failed'); }
  };

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'red';
      case 'error': return 'volcano';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'cyan';
    }
  };

  return (
    <div className="ai-agent-page">
      <div className="agent-header">
        <h1><RobotOutlined /> AI Autonomous Agents</h1>
        <div className="header-controls">
          <Space>
            <Select value={selectedAgent} onChange={setSelectedAgent} style={{ width: 220 }} options={agentOptions} />
            <Button 
                type={agentStatus.state === 'running' ? 'danger' : 'primary'}
                icon={agentStatus.state === 'running' ? <StopOutlined /> : <PlayCircleOutlined />}
                onClick={() => aiAgentAPI.toggleAgent(selectedAgent, agentStatus.state === 'running' ? 'stop' : 'start').then(fetchData)}
            >
                {agentStatus.state === 'running' ? 'Stop Agent' : 'Start Agent'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={Object.values(loading).some(l => l)}>Refresh</Button>
            <Switch checked={isMonitoring} onChange={setIsMonitoring} checkedChildren="LIVE" unCheckedChildren="IDLE" />
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]} className="agent-stats-row">
        <Col span={6}><Card className="stat-card"><Statistic title="State" value={agentStatus.state?.toUpperCase() || 'OFFLINE'} valueStyle={{ color: agentStatus.state === 'running' ? '#52c41a' : '#ff4d4f' }} /><div className="stat-detail">Uptime: {agentStatus.uptime || '0h'}</div></Card></Col>
        <Col span={6}><Card className="stat-card"><Statistic title="Win Rate" value={agentStatistics.winRate || 0} precision={1} suffix="%" /><Progress percent={agentStatistics.winRate} size="small" showInfo={false} /></Card></Col>
        <Col span={6}><Card className="stat-card"><Statistic title="Profit Factor" value={agentStatistics.profitFactor || 0} precision={2} /><div className="stat-detail">Trades: {agentStatistics.totalTrades}</div></Card></Col>
        <Col span={6}><Card className="stat-card"><Statistic title="Max Drawdown" value={riskMetrics.maxDrawdown || 0} precision={2} suffix="%" valueStyle={{ color: '#ff4d4f' }} /><div className="stat-detail">Limit: -5.00%</div></Card></Col>
      </Row>

      <Card className="agent-workspace">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
          <Space>
             {activeTab === 'performance' && <Select value={performanceTimeframe} style={{ width: 140 }} onChange={setPerformanceTimeframe} options={[{value: '1h', label: '1 Hour'}, {value: '24h', label: '24 Hours'}, {value: '7d', label: '7 Days'}]} />}
             {activeTab === 'logs' && <Search placeholder="Search reasoning logic..." onSearch={v => setLogFilters(prev => ({...prev, search: v}))} style={{ width: 250 }} />}
             <Button icon={<SettingOutlined />} onClick={() => { configForm.setFieldsValue(agentConfigs.find(c => c.id === selectedAgent) || {}); setShowConfigModal(true); }}>Config Center</Button>
          </Space>
        }>
          <TabPane tab={<span><BarChartOutlined /> Dashboard</span>} key="dashboard">
             <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card title="Performance Attribution (Live)"><Line {...performanceChartConfig} height={350} /></Card>
                    <Card title="Alert Audit Stream" style={{ marginTop: 24 }}>
                        <Timeline>
                            {agentAlerts.slice(0, 5).map((alert, i) => (
                                <Timeline.Item key={i} color={alert.level === 'critical' ? 'red' : 'blue'}>
                                    <Tag color={getLogLevelColor(alert.level)}>{alert.level.toUpperCase()}</Tag>
                                    <span className="log-time">[{new Date(alert.timestamp).toLocaleTimeString()}]</span>
                                    <div className="alert-msg">{alert.message}</div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Risk Topology" size="small">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="VaR (95%)">${riskMetrics.var95?.toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Volatility">{(riskMetrics.volatility * 100)?.toFixed(2)}%</Descriptions.Item>
                            <Descriptions.Item label="Sharpe">{agentStatistics.sharpeRatio || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <div className="decision-box">
                            <strong>Last Reasoned Decision:</strong>
                            <p className="decision-text">{agentStatus.lastDecision}</p>
                        </div>
                    </Card>
                </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined /> Positions</span>} key="positions">
             <Table dataSource={agentPositions} columns={[
                { title: 'Asset', dataIndex: 'symbol' },
                { title: 'Side', dataIndex: 'side', render: (s) => <Tag color={s === 'long' ? 'green' : 'red'}>{s.toUpperCase()}</Tag> },
                { title: 'Qty', dataIndex: 'quantity' },
                { title: 'Entry', dataIndex: 'entryPrice', render: (p) => `$${p.toFixed(2)}` },
                { title: 'P&L', dataIndex: 'pnl', render: (p) => <span style={{ color: p >= 0 ? '#52c41a' : '#ff4d4f' }}>${p.toFixed(2)}</span> },
                { title: 'Status', dataIndex: 'status', render: (s) => <Tag>{s.toUpperCase()}</Tag> }
             ]} pagination={{ pageSize: 12 }} />
          </TabPane>

          <TabPane tab={<span><InfoCircleOutlined /> Reasoning Logs</span>} key="logs">
              <div className="logs-terminal">
                  <div className="terminal-header"><Tag color="cyan">AI_PROTOCOL_CORE_V4</Tag></div>
                  <div className="terminal-body">
                      {agentLogs.map((log, i) => (
                          <div key={i} className={`log-line ${log.level.toLowerCase()}`} onClick={() => { setSelectedLog(log); setShowLogsModal(true); }}>
                              <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                              <span className="log-level">[{log.level}]</span>
                              <span className="log-module">{log.module}:</span>
                              <span className="log-msg">{log.message}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Agent Tactical Configuration" open={showConfigModal} onOk={() => configForm.submit()} onCancel={() => setShowConfigModal(false)} width={800}>
        <Form form={configForm} layout="vertical" onFinish={updateAgentConfig}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Agent Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="strategy" label="Strategy" rules={[{ required: true }]}><Select options={[{ value: 'mean_reversion', label: 'Mean Reversion' }, { value: 'momentum', label: 'Momentum' }, { value: 'ml_forecast', label: 'ML Forecast' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
             <Col span={12}><Form.Item name="riskMode" label="Risk Mode" rules={[{ required: true }]}><Select options={[{value: 'conservative', label: 'Conservative'}, {value: 'balanced', label: 'Balanced'}, {value: 'aggressive', label: 'Aggressive'}]} /></Form.Item></Col>
             <Col span={12}><Form.Item name="maxPositions" label="Max Open Positions" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="stopLoss" label="Stop Loss (%)" rules={[{ required: true }]}><InputNumber step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="takeProfit" label="Take Profit (%)" rules={[{ required: true }]}><InputNumber step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="mlEnabled" valuePropName="checked"><Checkbox>Enable Machine Learning Inference</Checkbox></Form.Item>
          <Form.Item label="ML Model Type" name="mlModelType" style={{ display: configForm.getFieldValue('mlEnabled') ? 'block' : 'none' }}>
            <Select options={[{value: 'lstm', label: 'LSTM'}, {value: 'transformer', label: 'Transformer'}]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Audit Log Intelligence" open={showLogsModal} onCancel={() => setShowLogsModal(false)} footer={null} width={800}>
        {selectedLog && (
          <div className="log-detail-viewer">
            <div className="log-meta"><Tag color={getLogLevelColor(selectedLog.level)}>{selectedLog.level.toUpperCase()}</Tag><span>{new Date(selectedLog.timestamp).toLocaleString()}</span></div>
            <Divider />
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Source Module">{selectedLog.module}</Descriptions.Item>
              <Descriptions.Item label="System Message">{selectedLog.message}</Descriptions.Item>
              {selectedLog.details && Object.entries(selectedLog.details).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>{v.toString()}</Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        )}
      </Modal>

      {error && <Alert message="Agent Protocol Bridge Error" description={error} type="error" showIcon style={{ marginTop: 16 }} />}
    </div>
  );
};

export default AIAgentPage;
