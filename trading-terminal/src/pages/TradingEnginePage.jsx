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
  Timeline,
  List
} from 'antd';
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApiOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FireOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Heatmap, DualAxes } from '@ant-design/plots';
import { tradingEngineAPI } from '../services/api/tradingEngine';
import './TradingEnginePage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;

const TradingEnginePage = () => {
  // State Management
  const [systemStatus, setSystemStatus] = useState({});
  const [latencyMetrics, setLatencyMetrics] = useState({});
  const [orderExecutionStats, setOrderExecutionStats] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [orderRouting, setOrderRouting] = useState({});
  const [latencyTrends, setLatencyTrends] = useState([]);
  const [errorRates, setErrorRates] = useState({});
  const [resourceMetrics, setResourceMetrics] = useState({});
  const [settlementStatus, setSettlementStatus] = useState({});
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState({
    status: true,
    latency: true,
    orders: true,
    health: true,
    routing: true,
    trends: true,
    errors: true,
    resources: true,
    settlement: true,
    alerts: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('status');
  const [timeframe, setTimeframe] = useState('1h');
  const [period, setPeriod] = useState('7d');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [wsConnection, setWsConnection] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const wsRef = useRef(null);

  // Timeframe options for monitoring
  const timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' }
  ];

  // Period options for historical trends
  const periodOptions = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '180d', label: '6 Months' },
    { value: '365d', label: '1 Year' }
  ];

  // Connect to WebSocket for real-time system updates
  useEffect(() => {
    if (isMonitoring) {
      connectWebSocket();
    } else if (wsRef.current) {
      wsRef.current.close();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isMonitoring]);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = tradingEngineAPI.subscribeToSystemUpdates(handleWebSocketMessage);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to trading engine WebSocket');
    };

    ws.onclose = () => {
      console.log('Trading engine WebSocket disconnected');
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };

    setWsConnection(ws);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'system_status':
        setSystemStatus(data.payload);
        break;
      case 'latency_update':
        setLatencyMetrics(prev => ({ ...prev, ...data.payload }));
        break;
      case 'order_execution':
        setOrderExecutionStats(prev => ({ ...prev, ...data.payload }));
        break;
      case 'system_health':
        setSystemHealth(prev => ({ ...prev, ...data.payload }));
        break;
      case 'error_rate':
        setErrorRates(prev => ({ ...prev, ...data.payload }));
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount and parameter changes
  useEffect(() => {
    fetchData();
  }, [timeframe, period]);

  const fetchData = async () => {
    setLoading({
      status: true,
      latency: true,
      orders: true,
      health: true,
      routing: true,
      trends: true,
      errors: true,
      resources: true,
      settlement: true,
      alerts: true
    });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        tradingEngineAPI.getSystemStatus(),
        tradingEngineAPI.getLatencyMetrics(timeframe),
        tradingEngineAPI.getOrderExecutionStats(timeframe),
        tradingEngineAPI.getSystemHealth(),
        tradingEngineAPI.getOrderRouting(timeframe),
        tradingEngineAPI.getLatencyTrends(period),
        tradingEngineAPI.getErrorRates(timeframe),
        tradingEngineAPI.getResourceMetrics(),
        tradingEngineAPI.getSettlementStatus(),
        tradingEngineAPI.getSystemAlerts()
      ]);

      // Process responses
      if (responses[0].status === 'fulfilled') {
        setSystemStatus(responses[0].value.data);
        setLoading(prev => ({ ...prev, status: false }));
      }

      if (responses[1].status === 'fulfilled') {
        setLatencyMetrics(responses[1].value.data);
        setLoading(prev => ({ ...prev, latency: false }));
      }

      if (responses[2].status === 'fulfilled') {
        setOrderExecutionStats(responses[2].value.data);
        setLoading(prev => ({ ...prev, orders: false }));
      }

      if (responses[3].status === 'fulfilled') {
        setSystemHealth(responses[3].value.data);
        setLoading(prev => ({ ...prev, health: false }));
      }

      if (responses[4].status === 'fulfilled') {
        setOrderRouting(responses[4].value.data);
        setLoading(prev => ({ ...prev, routing: false }));
      }

      if (responses[5].status === 'fulfilled') {
        setLatencyTrends(responses[5].value.data);
        setLoading(prev => ({ ...prev, trends: false }));
      }

      if (responses[6].status === 'fulfilled') {
        setErrorRates(responses[6].value.data);
        setLoading(prev => ({ ...prev, errors: false }));
      }

      if (responses[7].status === 'fulfilled') {
        setResourceMetrics(responses[7].value.data);
        setLoading(prev => ({ ...prev, resources: false }));
      }

      if (responses[8].status === 'fulfilled') {
        setSettlementStatus(responses[8].value.data);
        setLoading(prev => ({ ...prev, settlement: false }));
      }

      if (responses[9].status === 'fulfilled') {
        setSystemAlerts(responses[9].value.data);
        setLoading(prev => ({ ...prev, alerts: false }));
      }

      // Check for any rejected promises
      const rejected = responses.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        setError('Some trading engine data failed to load. Please try refreshing.');
        console.error('Rejected requests:', rejected);
      }
    } catch (err) {
      setError('Failed to load trading engine data');
      console.error('Trading engine fetch error:', err);
      setLoading({
        status: false,
        latency: false,
        orders: false,
        health: false,
        routing: false,
        trends: false,
        errors: false,
        resources: false,
        settlement: false,
        alerts: false
      });
    }
  };

  // System Status Chart Configuration
  const systemStatusConfig = useMemo(() => ({
    data: [
      { type: 'Connected', value: systemStatus.connectedSystems || 5 },
      { type: 'Disconnected', value: systemStatus.disconnectedSystems || 0 },
      { type: 'Degraded', value: systemStatus.degradedSystems || 0 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      content: '{type}: {value}',
      offset: '30%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        formatter: () => 'System Connectivity',
      },
      content: {
        formatter: () => `${systemStatus.systemCount || 10} Systems`,
      },
    },
  }), [systemStatus]);

  // Latency Distribution Chart Configuration
  const latencyChartConfig = useMemo(() => ({
    data: latencyMetrics.distribution || [],
    xField: 'latency',
    yField: 'count',
    point: {
      size: 4,
      shape: 'circle',
    },
    lineStyle: {
      lineWidth: 2,
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}ms`,
      },
    },
    annotations: [
      {
        type: 'line',
        start: ['median', '0'],
        end: ['median', 'max'],
        style: {
          stroke: '#1890ff',
          lineWidth: 2,
          lineDash: [5, 5],
        },
      },
      {
        type: 'text',
        position: ['median', 'max'],
        content: 'Median: ' + (latencyMetrics.medianLatency || 0).toFixed(2) + 'ms',
        style: {
          fontSize: 12,
        },
      },
    ],
  }), [latencyMetrics]);

  // Order Execution Status Configuration
  const orderStatusConfig = useMemo(() => ({
    data: [
      { type: 'Executed', value: orderExecutionStats.executed || 0 },
      { type: 'Pending', value: orderExecutionStats.pending || 0 },
      { type: 'Rejected', value: orderExecutionStats.rejected || 0 },
      { type: 'Cancelled', value: orderExecutionStats.cancelled || 0 },
      { type: 'Expired', value: orderExecutionStats.expired || 0 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      content: '{type}: {value}',
      offset: '30%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        formatter: () => 'Order Status',
      },
      content: {
        formatter: () => `${orderExecutionStats.totalOrders || 0} Orders`,
      },
    },
  }), [orderExecutionStats]);

  // System Health Metrics
  const systemHealthMetrics = [
    {
      title: 'CPU Utilization',
      value: systemHealth.cpuUtilization || 0,
      status: (systemHealth.cpuUtilization > 90) ? 'critical' : (systemHealth.cpuUtilization > 75) ? 'warning' : 'normal',
      unit: '%'
    },
    {
      title: 'Memory Usage',
      value: systemHealth.memoryUsage || 0,
      status: (systemHealth.memoryUsage > 90) ? 'critical' : (systemHealth.memoryUsage > 75) ? 'warning' : 'normal',
      unit: '%'
    },
    {
      title: 'Disk I/O',
      value: systemHealth.diskIo || 0,
      status: (systemHealth.diskIo > 80) ? 'critical' : (systemHealth.diskIo > 60) ? 'warning' : 'normal',
      unit: 'MB/s'
    },
    {
      title: 'Network Latency',
      value: systemHealth.networkLatency || 0,
      status: (systemHealth.networkLatency > 50) ? 'critical' : (systemHealth.networkLatency > 25) ? 'warning' : 'normal',
      unit: 'ms'
    },
    {
      title: 'System Uptime',
      value: systemHealth.uptime || 0,
      status: 'normal',
      unit: 'days'
    },
    {
      title: 'Active Connections',
      value: systemHealth.activeConnections || 0,
      status: (systemHealth.activeConnections > 1000) ? 'warning' : 'normal',
      unit: ''
    }
  ];

  // System Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'degraded': return '#faad14';
      case 'offline': return '#ff4d4f';
      case 'critical': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  // Status indicator
  const StatusIndicator = ({ status }) => (
    <span style={{ color: getStatusColor(status) }}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );

  // Error Rate Color
  const getErrorRateColor = (rate) => {
    if (rate > 0.05) return '#ff4d4f';
    if (rate > 0.02) return '#faad14';
    return '#52c41a';
  };

  // Toggle real-time monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  // Open alert details
  const openAlertDetails = (alert) => {
    setSelectedAlert(alert);
    setAlertModalVisible(true);
  };

  return (
    <div className="trading-engine-page">
      {/* Page Header */}
      <div className="engine-header">
        <h1>
          <ApiOutlined /> Trading Engine Monitoring
        </h1>
        <div className="header-controls">
          <Badge count={systemAlerts.filter(a => a.severity === 'critical').length} showZero>
            <Button 
              icon={<WarningOutlined />} 
              type={systemAlerts.some(a => a.severity === 'critical') ? 'danger' : 'primary'}
            >
              System Alerts
            </Button>
          </Badge>
          <Select
            value={timeframe}
            style={{ width: 120 }}
            onChange={setTimeframe}
            options={timeframeOptions}
          />
          <Switch
            checked={isMonitoring}
            onChange={toggleMonitoring}
            checkedChildren="Live"
            unCheckedChildren="Static"
            style={{ marginRight: 16 }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={Object.values(loading).some(l => l)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <Row gutter={[24, 24]} className="status-cards">
        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.status}>
            <Statistic
              title="System Uptime"
              value={systemStatus.uptime}
              suffix="days"
              valueStyle={{ color: systemStatus.uptime > 30 ? '#52c41a' : systemStatus.uptime > 7 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.status}>
            <Statistic
              title="Connected"
              value={systemStatus.connectedSystems}
              suffix={`/ ${systemStatus.systemCount || 10}`}
              valueStyle={{ color: systemStatus.connectedSystems === (systemStatus.systemCount || 10) ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.latency}>
            <Statistic
              title="Avg. Execution"
              value={latencyMetrics.avgExecutionTime}
              suffix="ms"
              valueStyle={{ color: latencyMetrics.avgExecutionTime > 100 ? '#ff4d4f' : latencyMetrics.avgExecutionTime > 50 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.orders}>
            <Statistic
              title="Fill Rate"
              value={orderExecutionStats.fillRate}
              suffix="%"
              valueStyle={{ color: orderExecutionStats.fillRate > 95 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.health}>
            <Statistic
              title="CPU Load"
              value={systemHealth.cpuUsage}
              suffix="%"
              valueStyle={{ color: systemHealth.cpuUsage > 80 ? '#ff4d4f' : '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card className="status-card" loading={loading.settlement}>
            <Statistic
              title="Settlement"
              value={settlementStatus.settlementRate}
              suffix="%"
              valueStyle={{ color: settlementStatus.settlementRate > 99 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card className="engine-content-card">
        <Tabs 
          defaultActiveKey="status" 
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          {/* System Status Tab */}
          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                System Status
              </span>
            } 
            key="status"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card 
                  title="System Health Overview" 
                  className="system-health-card"
                  extra={<Tag color={systemStatus.overallStatus === 'online' ? 'green' : 'orange'}>{systemStatus.overallStatus?.toUpperCase()}</Tag>}
                >
                  <div className="health-metrics">
                    {systemHealthMetrics.map((metric, index) => (
                      <div key={index} className="health-metric">
                        <div className="metric-label">{metric.title}</div>
                        <div className="metric-value">{metric.value} {metric.unit}</div>
                        <Progress percent={metric.value} status={metric.status} />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="System Components" className="components-card" loading={loading.status}>
                  <div className="components-list">
                    {systemStatus.components?.map((component, index) => (
                      <div key={index} className="component-item">
                        <div className="component-info">
                          <div className="component-name">{component.name}</div>
                          <div className="component-status"><StatusIndicator status={component.status} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent Alerts" className="alerts-card" loading={loading.alerts}>
                  <List
                    dataSource={systemAlerts.slice(0, 5)}
                    renderItem={(alert) => (
                      <List.Item
                        actions={[
                          <Button type="link" icon={<EyeOutlined />} key="view" onClick={() => openAlertDetails(alert)} />,
                          <Button type="link" icon={<CloseCircleOutlined />} key="dismiss" danger onClick={() => {}} />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            alert.severity === 'critical' ? (
                              <Avatar style={{ backgroundColor: '#ff4d4f' }}><ExclamationCircleOutlined /></Avatar>
                            ) : alert.severity === 'warning' ? (
                              <Avatar style={{ backgroundColor: '#faad14' }}><WarningOutlined /></Avatar>
                            ) : (
                              <Avatar style={{ backgroundColor: '#1890ff' }}><InfoCircleOutlined /></Avatar>
                            )
                          }
                          title={
                            <div className="alert-title">
                              <span className={`alert-severity ${alert.severity}`}>{alert.severity.toUpperCase()}</span>
                              {alert.title}
                            </div>
                          }
                          description={
                            <div className="alert-description">
                              <div className="alert-message">{alert.message}</div>
                              <div className="alert-timestamp">{new Date(alert.timestamp).toLocaleString()}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Latency Monitoring Tab */}
          <TabPane tab={<span><ClockCircleOutlined />Latency</span>} key="latency">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Latency Distribution">
                  {loading.latency ? <Spin /> : <Column {...latencyChartConfig} height={400} />}
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Latency Breakdown" loading={loading.latency}>
                  <div className="latency-metrics">
                    <div className="metric-item">
                      <div className="metric-label">P99 Latency</div>
                      <div className="metric-value">{latencyMetrics.p99Latency || 0} ms</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Median Latency</div>
                      <div className="metric-value">{latencyMetrics.medianLatency || 0} ms</div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Order Execution Tab */}
          <TabPane tab={<span><DatabaseOutlined />Order Execution</span>} key="execution">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Success Rate Overview" loading={loading.orders}>
                   <Pie {...orderStatusConfig} height={300} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Routing Efficiency" loading={loading.routing}>
                  <div className="routing-destinations">
                    {orderRouting.destinations?.map((dest, i) => (
                      <div key={i} className="destination-item">
                        <div className="destination-info">{dest.exchange}: {(dest.rate * 100).toFixed(1)}%</div>
                        <Progress percent={dest.rate * 100} size="small" />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* System Health Tab */}
          <TabPane tab={<span><SettingOutlined />Resource Health</span>} key="health">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="CPU & Memory Utilization" loading={loading.resources}>
                  <div className="resource-metrics">
                    <div className="metric-item">
                      <div className="metric-label">CPU Load</div>
                      <Progress percent={resourceMetrics.cpuUsage} status={resourceMetrics.cpuUsage > 80 ? 'exception' : 'success'} />
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Memory Utilization</div>
                      <Progress percent={resourceMetrics.memoryUsage} status={resourceMetrics.memoryUsage > 80 ? 'exception' : 'success'} />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                 <Card title="Active Services" loading={loading.resources}>
                    <Statistic title="Threads" value={resourceMetrics.activeThreads} />
                    <Statistic title="Connections" value={resourceMetrics.activeConnections} />
                 </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Alert Modal */}
      <Modal
        title="Alert Details"
        open={alertModalVisible}
        onCancel={() => setAlertModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAlert && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Severity"><Tag color={getStatusColor(selectedAlert.severity)}>{selectedAlert.severity.toUpperCase()}</Tag></Descriptions.Item>
            <Descriptions.Item label="Message">{selectedAlert.message}</Descriptions.Item>
            <Descriptions.Item label="Impact">{selectedAlert.impact}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TradingEnginePage;
