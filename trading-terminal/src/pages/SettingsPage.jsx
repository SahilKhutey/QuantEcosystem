import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
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
  List,
  Table
} from 'antd';
import { 
  SettingOutlined,
  ApiOutlined,
  NotificationOutlined,
  SecurityScanOutlined,
  UserOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { settingsAPI } from '../services/api/settings';
import './SettingsPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;

const SettingsPage = () => {
  // State Management
  const [apiKeys, setApiKeys] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [loading, setLoading] = useState({
    apiKeys: true,
    alerts: true,
    system: true,
    profile: true,
    notifications: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('api');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [apiKeyForm] = useForm();
  const [alertForm] = useForm();
  const [profileForm] = useForm();
  const [notificationForm] = useForm();
  const [systemConfigForm] = useForm();
  const [passwordForm] = useForm();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [apiKeyToDelete, setApiKeyToDelete] = useState(null);
  const [alertToDelete, setAlertToDelete] = useState(null);

  // Constants
  const permissionOptions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'trade', label: 'Trade' },
    { value: 'admin', label: 'Admin' }
  ];

  const alertTypes = [
    { value: 'price', label: 'Price Alert' },
    { value: 'volatility', label: 'Volatility Alert' },
    { value: 'volume', label: 'Volume Alert' },
    { value: 'drawdown', label: 'Drawdown Alert' }
  ];

  const timezones = [
    { value: 'UTC', label: 'Universal (UTC)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'Greenwich Time (GMT)' }
  ];

  const notificationTypes = [
    { value: 'system', label: 'System Notifications' },
    { value: 'trade', label: 'Trade Notifications' },
    { value: 'market', label: 'Market Updates' },
    { value: 'news', label: 'News Alerts' },
    { value: 'security', label: 'Security Alerts' }
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    try {
      const [keys, alrts, sys, prof, notifs] = await Promise.allSettled([
        settingsAPI.getAPIKeys(),
        settingsAPI.getAlerts(),
        settingsAPI.getSystemConfig(),
        settingsAPI.getUserProfile(),
        settingsAPI.getNotificationPreferences()
      ]);

      if (keys.status === 'fulfilled') setApiKeys(keys.value.data || []);
      if (alrts.status === 'fulfilled') setAlerts(alrts.value.data || []);
      if (sys.status === 'fulfilled') {
        setSystemConfig(sys.value.data || {});
        systemConfigForm.setFieldsValue(sys.value.data);
      }
      if (prof.status === 'fulfilled') {
        setUserProfile(prof.value.data || {});
        profileForm.setFieldsValue(prof.value.data);
      }
      if (notifs.status === 'fulfilled') {
        setNotificationPrefs(notifs.value.data || {});
        notificationForm.setFieldsValue(notifs.value.data);
      }
      setLoading(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {}));
    } catch (err) { setError('Configuration hub sync failure'); }
  };

  const handleNotificationPrefs = async (values) => {
    try {
      await settingsAPI.updateNotificationPreferences(values);
      setShowNotificationModal(false);
      fetchData();
    } catch (err) { setError('Failed to update preferences'); }
  };

  const filteredApiKeys = useMemo(() => apiKeys.filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase())), [apiKeys, searchQuery]);
  const filteredAlerts = useMemo(() => alerts.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())), [alerts, searchQuery]);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1><SettingOutlined /> Terminal Settings</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={Object.values(loading).some(l => l)}>Refresh</Button>
      </div>

      <Card className="settings-container">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* API Management */}
          <TabPane tab={<span><ApiOutlined /> API Management</span>} key="api">
             <Row gutter={[24, 24]}>
                <Col span={18}>
                   <Card title="API Key Infrastructure" extra={
                      <Space>
                        <Input placeholder="Search keys..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setApiKeyToDelete(null); apiKeyForm.resetFields(); setShowApiKeyModal(true); }}>New Key</Button>
                      </Space>
                   }>
                      <Table 
                        dataSource={filteredApiKeys}
                        columns={[
                           { title: 'Identity', dataIndex: 'name', render: (n, r) => <div className="key-name">{n}<br/><small>{r.keyId}</small></div> },
                           { title: 'Privileges', dataIndex: 'permissions', render: p => p.map(x => <Tag key={x} color="blue">{x.toUpperCase()}</Tag>) },
                           { title: 'Status', render: () => <Badge status="success" text="ACTIVE" /> },
                           { title: 'Actions', render: (_, r) => <Button danger size="small" icon={<DeleteOutlined />} onClick={() => settingsAPI.deleteAPIKey(r.id).then(fetchData)} /> }
                        ]}
                      />
                   </Card>
                </Col>
                <Col span={6}>
                   <Card title="Usage Statistics" size="small">
                      <Statistic title="Total Active Keys" value={apiKeys.length} />
                      <Divider />
                      <div className="security-protocols">
                         <InfoCircleOutlined /> <strong>Security Protocol:</strong>
                         <p>Keys are encrypted. Rotation is recommended every 90 days.</p>
                      </div>
                   </Card>
                </Col>
             </Row>
          </TabPane>

          {/* Alerts Management */}
          <TabPane tab={<span><NotificationOutlined /> Alerts</span>} key="alerts">
             <Card title="Threshold Alert Governance" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setAlertToDelete(null); alertForm.resetFields(); setShowAlertModal(true); }}>Configure Trigger</Button>}>
                <Table 
                   dataSource={filteredAlerts}
                   columns={[
                      { title: 'Trigger Name', dataIndex: 'name' },
                      { title: 'Type', dataIndex: 'type', render: t => <Tag color="cyan">{t.toUpperCase()}</Tag> },
                      { title: 'Logic', dataIndex: 'condition' },
                      { title: 'Threshold', dataIndex: 'threshold' },
                      { title: 'Channels', dataIndex: 'channels', render: c => c.map(x => <Tag key={x}>{x.toUpperCase()}</Tag>) },
                      { title: 'State', dataIndex: 'enabled', render: e => <Switch checked={e} /> },
                      { title: 'Actions', render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => settingsAPI.deleteAlert(r.id).then(fetchData)} /> }
                   ]}
                />
             </Card>
          </TabPane>

          {/* Profile Tab */}
          <TabPane tab={<span><UserOutlined /> Profile</span>} key="profile">
            <Row gutter={[24, 24]}>
              <Col span={8}>
                <Card style={{ textAlign: 'center' }}>
                  <Avatar size={100} icon={<UserOutlined />} src={userProfile.avatar} />
                  <h3 style={{ marginTop: 16 }}>{userProfile.fullName}</h3>
                  <p>{userProfile.email}</p>
                  <Tag color="gold">{userProfile.role}</Tag>
                  <Divider />
                  <Button block type="primary" onClick={() => setShowProfileModal(true)}>Edit Profile</Button>
                  <Button block type="danger" style={{ marginTop: 12 }} onClick={() => setShowPasswordModal(true)}>Rotate Password</Button>
                </Card>
              </Col>
              <Col span={16}>
                <Card title="Detailed Information">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Account Type"><Tag color="blue">Professional</Tag></Descriptions.Item>
                    <Descriptions.Item label="Institutional Email">{userProfile.email}</Descriptions.Item>
                    <Descriptions.Item label="Contact Number">{userProfile.phone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Primary Timezone">{userProfile.timezone || 'UTC'}</Descriptions.Item>
                    <Descriptions.Item label="Security Tier"><Tag color="purple">LEVEL_03</Tag></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* System Tab */}
          <TabPane tab={<span><GlobalOutlined /> System</span>} key="system">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card title="Interface & Regional">
                  <Form form={systemConfigForm} layout="vertical" onFinish={(v) => settingsAPI.updateSystemConfig(v).then(fetchData)}>
                    <Form.Item name="theme" label="Theme"><Select options={[{value: 'dark', label: 'Institutional Dark'}, {value: 'light', label: 'High Contrast Light'}]} /></Form.Item>
                    <Form.Item name="language" label="Language"><Select options={[{value: 'en', label: 'English'}]} /></Form.Item>
                    <Form.Item name="refreshRate" label="UI Refresh Cycle"><Select options={[{value: '5s', label: '5 Seconds'}, {value: '30s', label: '30 Seconds'}]} /></Form.Item>
                    <Button type="primary" htmlType="submit">Apply System Sync</Button>
                  </Form>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Global Risk Parameters">
                   <Form form={systemConfigForm} layout="vertical">
                      <Form.Item name="maxLeverage" label="Portfolio Leverage Cap"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item>
                      <Form.Item name="circuitBreakerThreshold" label="Loss Circuit Breaker (%)"><InputNumber style={{ width: '100%' }} /></Form.Item>
                   </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Notifications Tab */}
          <TabPane tab={<span><NotificationOutlined /> Notifications</span>} key="notifications">
            <Card title="Preferential Routing" extra={<Button onClick={() => setShowNotificationModal(true)}>Configure Granular Preferences</Button>}>
               <Row gutter={48}>
                  <Col span={12}>
                     <h3>Channel Status</h3>
                     <List itemLayout="horizontal">
                        <List.Item extra={<Switch checked={notificationPrefs.email} />}>Email Dispatches</List.Item>
                        <List.Item extra={<Switch checked={notificationPrefs.push} />}>Push Notifications</List.Item>
                        <List.Item extra={<Switch checked={notificationPrefs.webhook} />}>Webhook Integration</List.Item>
                     </List>
                  </Col>
                  <Col span={12}>
                     <h3>Contextual Groups</h3>
                     <Checkbox.Group options={['trades', 'security', 'system']} value={notificationPrefs.types} disabled />
                  </Col>
               </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      <Modal title={apiKeyToDelete ? "Edit API Gateway" : "Generate API Gateway"} open={showApiKeyModal} onCancel={() => setShowApiKeyModal(false)} onOk={() => apiKeyForm.submit()}>
        <Form form={apiKeyForm} layout="vertical" onFinish={(v) => settingsAPI.createAPIKey(v).then(() => { setShowApiKeyModal(false); fetchData(); })}>
          <Form.Item name="name" label="Identity Label" rules={[{required: true}]}><Input placeholder="e.g. Binance Production" /></Form.Item>
          <Form.Item name="description" label="Meta Description"><Input.TextArea /></Form.Item>
          <Form.Item name="permissions" label="Scopes"><Checkbox.Group options={['read', 'write', 'trade', 'admin']} /></Form.Item>
          <Form.Item name="expiry" label="Lifecycle Termination"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Configure Analytics Alert" open={showAlertModal} onCancel={() => setShowAlertModal(false)} onOk={() => alertForm.submit()}>
        <Form form={alertForm} layout="vertical" onFinish={(v) => settingsAPI.createAlert(v).then(() => { setShowAlertModal(false); fetchData(); })}>
          <Form.Item name="name" label="Metric Identity" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="type" label="Dimension"><Select options={alertTypes} /></Form.Item>
          <Form.Item name="condition" label="Trigger Logic"><Select options={[{value: '>', label: 'Greater Than'}, {value: '<', label: 'Less Than'}]} /></Form.Item>
          <Form.Item name="threshold" label="Activation Magnitude"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="asset" label="Substrate Asset"><Input placeholder="e.g. MSFT" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Institutional Profile Modification" open={showProfileModal} onCancel={() => setShowProfileModal(false)} onOk={() => profileForm.submit()}>
        <Form form={profileForm} layout="vertical" onFinish={(v) => settingsAPI.updateUserProfile(v).then(() => { setShowProfileModal(false); fetchData(); })}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="Given Name" rules={[{required: true}]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Family Name" rules={[{required: true}]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="email" label="Contact Cipher (Email)" rules={[{required: true, type: 'email'}]}><Input /></Form.Item>
          <Form.Item name="timezone" label="Market Context (Timezone)"><Select options={timezones} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Rotate Security Cipher" open={showPasswordModal} onCancel={() => setShowPasswordModal(false)} onOk={() => passwordForm.submit()}>
        <Form form={passwordForm} layout="vertical" onFinish={(v) => settingsAPI.changePassword(v).then(() => { setShowPasswordModal(false); fetchData(); })}>
          <Form.Item name="currentPassword" label="Origin Cipher" rules={[{required: true}]}><Input.Password /></Form.Item>
          <Form.Item name="newPassword" label="Target Cipher" rules={[{required: true, min: 8}]}><Input.Password /></Form.Item>
          <Form.Item name="confirmPassword" label="Verify Target" dependencies={['newPassword']} rules={[{required: true}, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('Cipher mismatch')); }})]}><Input.Password /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Granular Routing Protocol" open={showNotificationModal} onCancel={() => setShowNotificationModal(false)} onOk={() => notificationForm.submit()}>
        <Form form={notificationForm} layout="vertical" onFinish={(v) => handleNotificationPrefs(v)}>
          {notificationTypes.map(t => (
            <div key={t.value} className="notification-type">
              <div className="type-header">
                <h3>{t.label}</h3>
                <Form.Item name={t.value} valuePropName="checked" style={{ margin: 0 }}><Switch /></Form.Item>
              </div>
              <p className="type-description">Configure dispatches for {t.label.toLowerCase()} events.</p>
            </div>
          ))}
          <Divider />
          <h3>Primary Channels</h3>
          <Form.Item name="email" label="Email Dispatches" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="push" label="Mobile Push" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="webhook" label="Webhook Integration" valuePropName="checked"><Switch /></Form.Item>
          {notificationPrefs.webhook && (
            <Form.Item name="webhookUrl" label="Destination URL"><Input placeholder="https://..." /></Form.Item>
          )}
        </Form>
      </Modal>

      {error && <Alert message="Configuration Core Sync Failure" description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginTop: 16 }} />}
    </div>
  );
};

export default SettingsPage;
