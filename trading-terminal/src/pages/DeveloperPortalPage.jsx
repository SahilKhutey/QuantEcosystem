import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Table, Tag, Button, Input, Space, Typography, 
  Divider, Badge, Tabs, Form, Tooltip, Switch, List, Statistic, 
  Modal, Progress, Alert, Select, Checkbox 
} from 'antd';
import { 
  ApiOutlined, 
  KeyOutlined, 
  CloudSyncOutlined, 
  CodeOutlined, 
  ThunderboltOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Line, Area, Radar, Column } from '@ant-design/plots';
import { developerAPI } from '../services/api/developer';
import MetricCard from '../components/Analytics/MetricCard';
import './DeveloperPortalPage.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const DeveloperPortalPage = () => {
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Standard Developer', key: 'dev_key_123****************', status: 'active', limit: 1000, usage: 245, created: '2026-03-20' },
    { id: '2', name: 'High-Frequency Quant', key: 'quant_key_456****************', status: 'active', limit: 5000, usage: 120, created: '2026-03-24' }
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.myfund.com/v1/signals', event: 'SIGNAL_CONVERGENCE', status: 'active' },
    { id: '2', url: 'https://hooks.slack.com/services/...', event: 'RISK_BREACH', status: 'paused' }
  ]);
  const [activeTab, setActiveTab] = useState('keys');

  const copyToClipboard = (text) => {
     navigator.clipboard.writeText(text);
     // In a real app, show a toast here
  };

  const apiKeyColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <strong>{text}</strong> },
    { title: 'API Key', dataIndex: 'key', key: 'key', render: (text) => (
      <Space>
        <code>{text}</code>
        <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyToClipboard(text)} />
      </Space>
    )},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (text) => <Badge status={text === 'active' ? 'success' : 'default'} text={text.toUpperCase()} /> },
    { title: 'Rate Limit', dataIndex: 'limit', key: 'limit', render: (text) => `${text} req/min` },
    { title: 'Usage', dataIndex: 'usage', key: 'usage', render: (text, record) => <Progress percent={(text/record.limit)*100} size="small" format={() => `${text}/${record.limit}`} /> },
    { title: 'Created', dataIndex: 'created', key: 'created' },
    { title: 'Actions', key: 'actions', render: () => (
      <Space>
        <Button type="text" danger icon={<DeleteOutlined />} />
        <Button type="text" icon={<SettingOutlined />} />
      </Space>
    )}
  ];

  const explorerEndpoints = [
    { method: 'GET', path: '/market-data/{symbol}', description: 'Retrieve high-fidelity raw market data streams' },
    { method: 'POST', path: '/backtest', description: 'Trigger remote quantitative strategy backtests' },
    { method: 'GET', path: '/indicators/{symbol}', description: 'Fetch technical indicator output for algorithmic consumption' },
    { method: 'POST', path: '/webhook', description: 'Register real-time event delivery targets' }
  ];

  return (
    <div className="developer-portal">
      <div className="portal-header">
        <h1><ApiOutlined /> Quantitative Developer Portal</h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>Generate New API Key</Button>
          <Button icon={<CloudSyncOutlined />}>Sync SDK Status</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="Programmatic API Calls (24h)" value="45,200" icon={<ThunderboltOutlined />} color="#1890ff" trend={12.4} />
        </Col>
        <Col span={6}>
          <MetricCard title="Active Webhooks" value="12" icon={<GlobalOutlined />} color="#52c41a" />
        </Col>
        <Col span={6}>
          <MetricCard title="System Performance" value="99.98%" icon={<SafetyCertificateOutlined />} color="#722ed1" />
        </Col>
        <Col span={6}>
          <MetricCard title="Developer Satisfaction" value="4.9/5" icon={<ExperimentOutlined />} color="#faad14" />
        </Col>

        <Col span={24}>
           <Card className="portal-tabs-card">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane 
                  tab={<span><KeyOutlined /> API Keys Management</span>} 
                  key="keys"
                >
                  <Paragraph style={{ color: '#8c8c8c' }}>
                    Manage your secure access tokens. These keys allow programmatic execution and research against the institutional data engine.
                  </Paragraph>
                  <Table dataSource={apiKeys} columns={apiKeyColumns} pagination={false} size="middle" />
                  <Divider />
                  <Alert 
                    message="Security Alert" 
                    description="Never share your API keys or expose them in client-side code. Use environment variables and standard secret management practices." 
                    type="warning" 
                    showIcon 
                  />
                </TabPane>

                <TabPane 
                  tab={<span><CodeOutlined /> Interactive API Explorer</span>} 
                  key="explorer"
                >
                  <Row gutter={24}>
                    <Col span={10}>
                      <Title level={4}>Available Endpoints</Title>
                      <List
                        dataSource={explorerEndpoints}
                        renderItem={item => (
                          <List.Item className="endpoint-item">
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Space>
                                <Tag color={item.method === 'GET' ? 'green' : 'blue'}>{item.method}</Tag>
                                <strong>{item.path}</strong>
                              </Space>
                              <Text type="secondary">{item.description}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Col>
                    <Col span={14}>
                       <Card title="Request Playground" extra={<Tag color="purple">V1 DEVELOPER SDK</Tag>}>
                          <Form layout="vertical">
                            <Form.Item label="Endpoint">
                               <Select defaultValue="/market-data/AAPL">
                                  <Select.Option value="/market-data/AAPL">GET /market-data/AAPL</Select.Option>
                                  <Select.Option value="/backtest">POST /backtest</Select.Option>
                               </Select>
                            </Form.Item>
                            <Form.Item label="API Key">
                               <Select defaultValue="dev_key_123">
                                  <Select.Option value="dev_key_123">Standard Developer (dev_key_123)</Select.Option>
                               </Select>
                            </Form.Item>
                            <Button type="primary" block icon={<PlayCircleOutlined />}>Execute Test Request</Button>
                          </Form>
                          <Divider />
                          <div className="json-output">
                             <pre style={{ background: '#001529', color: '#fff', padding: '16px', borderRadius: '8px', fontSize: '12px' }}>
{JSON.stringify({
  "status": "success",
  "data": {
    "symbol": "AAPL",
    "interval": "1d",
    "authenticated": true,
    "timestamp": "2026-03-26T17:07:09Z"
  }
}, null, 2)}
                             </pre>
                          </div>
                       </Card>
                    </Col>
                  </Row>
                </TabPane>
              <TabPane tab={<span><ApiOutlined /> SDK Documentation</span>} key="sdk">
                <Paragraph>
                  The Trading Terminal SDK allows for seamless integration of quantitative models into our high-performance execution backbone.
                </Paragraph>
                <Title level={5}>Quick Start (Python) / Alpha Integration</Title>
                <pre style={{ background: '#f6f8fa', padding: '16px', borderRadius: '8px' }}>
{`from quantum_sdk import TerminalClient

client = TerminalClient(api_key="YOUR_KEY")
positions = client.get_positions()
print(f"Total Portfolio Value: {positions.total_value}")`}
                </pre>
              </TabPane>

              <TabPane tab={<span><GlobalOutlined /> Webhook Orchestrator</span>} key="webhooks">
                 <Row gutter={24}>
                   <Col span={10}>
                      <Card title="Register New Webhook" size="small">
                         <Form layout="vertical">
                            <Form.Item label="Target Destination URL">
                               <Input placeholder="https://api.yourdomain.com/webhooks/signals" />
                            </Form.Item>
                            <Form.Item label="Event Triggers (Multi-Select)">
                               <Checkbox.Group options={['Trade Execution', 'Risk Alert', 'Signal Alpha', 'System Health']} />
                            </Form.Item>
                            <Form.Item label="HMAC Secret Key">
                               <Input.Password placeholder="Secret key for signature verification" />
                            </Form.Item>
                            <Button type="primary" block icon={<ApiOutlined />}>Activate Webhook</Button>
                         </Form>
                      </Card>
                   </Col>
                   <Col span={14}>
                      <Title level={5}>Active Institutional Webhook Streams</Title>
                      <List
                        size="small"
                        dataSource={[
                          { id: 'wh_4421', url: 'https://webhook.site/quant-signals', status: 'Active', events: ['Signal Alpha'] },
                          { id: 'wh_8829', url: 'https://staging.internal.net/alerts', status: 'Active', events: ['Risk Alert', 'System Health'] }
                        ]}
                        renderItem={item => (
                          <List.Item>
                             <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space direction="vertical" size={0}>
                                   <Text strong>{item.url}</Text>
                                   <Text type="secondary" style={{ fontSize: '10px' }}>ID: {item.id} | Events: {item.events.join(', ')}</Text>
                                </Space>
                                <Tag color="green">ACTIVE</Tag>
                             </Space>
                          </List.Item>
                        )}
                      />
                   </Col>
                 </Row>
              </TabPane>

              <TabPane tab={<span><DashboardOutlined /> Rate-Limit Audit</span>} key="rate-limit">
                 <Row gutter={24}>
                   <Col span={24}>
                      <Title level={5}>Real-Time Rate-Limit Consumption (Institutional Tiers)</Title>
                      <div style={{ height: 350 }}>
                         <Column 
                           data={[
                             { endpoint: 'Market Data', used: 450, limit: 1000 },
                             { endpoint: 'Backtest', used: 12, limit: 100 },
                             { endpoint: 'Trading', used: 2450, limit: 5000 },
                             { endpoint: 'Risk Audit', used: 85, limit: 200 }
                           ].flatMap(e => [
                             { type: 'Used', endpoint: e.endpoint, value: e.used },
                             { type: 'Limit', endpoint: e.endpoint, value: e.limit }
                           ])}
                           xField="endpoint"
                           yField="value"
                           seriesField="type"
                           isGroup={true}
                           color={['#1890ff', '#f0f2f5']}
                         />
                      </div>
                      <Divider />
                      <Alert message="Current Gateway Load: Stable" description="Rate limit consumption is within 60% of institutional quotas across all edge gateways." type="success" showIcon />
                   </Col>
                 </Row>
              </TabPane>
            </Tabs>
           </Card>
        </Col>

        {/* Developer Growth Analytics */}
        <Col span={12}>
          <Card title="API Traffic Topology">
             <Area 
               data={Array.from({ length: 24 }).map((_, i) => ({
                 time: `${i}:00`,
                 requests: 1000 + Math.sin(i / 3) * 500 + Math.random() * 200
               }))}
               xField="time"
               yField="requests"
               smooth
               color="#1890ff"
               height={300}
             />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Endpoint Performance (p99 Latency)">
             <Column 
               data={[
                 { endpoint: '/market-data', latency: 45 },
                 { endpoint: '/backtest', latency: 120 },
                 { endpoint: '/indicators', latency: 32 },
                 { endpoint: '/correlations', latency: 85 }
               ]}
               xField="endpoint"
               yField="latency"
               color="#52c41a"
               height={300}
               label={{ position: 'top', content: (d) => `${d.latency}ms` }}
             />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeveloperPortalPage;
