import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Tooltip,
  Slider,
  InputNumber,
  Switch,
  Descriptions,
  Collapse,
  Badge,
  Modal,
  Form,
  Input,
  Typography,
  Divider
} from 'antd';
import { 
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SettingOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Column, Line, Heatmap } from '@ant-design/plots';
import { riskAPI } from '../services/api/risk';
import './RiskPage.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { confirm } = Modal;
const { Title, Text } = Typography;

const RiskPage = () => {
  // State Management
  const [riskExposure, setRiskExposure] = useState({ 
    exposureByAsset: [], 
    portfolioVar: 0,
    varStatus: 'safe',
    topAssetConcentration: 0,
    topAssetName: 'N/A',
    concentrationRisk: 'low',
    liquidityRiskScore: 0,
    liquidityRiskLevel: 'low',
    leverageRatio: 0,
    varExposure: 0,
    currentDrawdown: 0,
    portfolioCorrelation: 0
  });
  const [greeksData, setGreeksData] = useState([]);
  const [varData, setVarData] = useState({ distribution: [], portfolioVar: 0, method: 'historical', confidence: 95, timeframe: '1d', expectedShortfall: 0, historicalMaxLoss: 0, backtestAccuracy: 0.98, breakdown: [] });
  const [stressTestData, setStressTestData] = useState({ scenarioName: 'Market Crash', portfolioLoss: 0, lossPercentage: 0, varIncrease: 0, recoveryTime: 0, assetImpacts: [] });
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [riskLimits, setRiskLimits] = useState({ varLimit: 10000, concentrationLimit: 0.3, leverageLimit: 2, drawdownLimit: 0.12 });
  const [complianceData, setComplianceData] = useState({ status: 'compliant', score: 95, violations: 0 });
  const [loading, setLoading] = useState({
    exposure: true, greeks: true, var: true,
    stress: true, correlation: true, limits: true, compliance: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exposure');
  const [varParams, setVarParams] = useState({ method: 'historical', confidence: 95, timeframe: '1d' });
  const [stressTestParams, setStressTestParams] = useState({ scenario: 'market_crash', severity: 'moderate' });
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [scenarioForm] = Form.useForm();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading({ exposure: true, greeks: true, var: true, stress: true, correlation: true, limits: true, compliance: true });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        riskAPI.getRiskExposure(),
        riskAPI.getGreeks(selectedAsset),
        riskAPI.getValueAtRisk(varParams.method, varParams.confidence, varParams.timeframe),
        riskAPI.getStressTests(stressTestParams.scenario),
        riskAPI.getCorrelationMatrix(['BTC', 'ETH', 'AAPL', 'MSFT']),
        riskAPI.getRiskLimits(),
        riskAPI.getComplianceReport()
      ]);

      if (responses[0].status === 'fulfilled') setRiskExposure(prev => ({ ...prev, ...responses[0].value.data, exposureByAsset: responses[0].value.data }));
      if (responses[1].status === 'fulfilled') setGreeksData(Array.isArray(responses[1].value.data) ? responses[1].value.data : [responses[1].value.data]);
      if (responses[2].status === 'fulfilled') setVarData(prev => ({ ...prev, ...responses[2].value.data }));
      if (responses[3].status === 'fulfilled') setStressTestData(responses[3].value.data);
      if (responses[4].status === 'fulfilled') setCorrelationMatrix(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setRiskLimits(responses[5].value.data);
      if (responses[6].status === 'fulfilled') setComplianceData(responses[6].value.data);

      setLoading({ exposure: false, greeks: false, var: false, stress: false, correlation: false, limits: false, compliance: false });
    } catch (err) {
      setError('Failed to load risk data');
    }
  }, [selectedAsset, varParams, stressTestParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart Configs
  const exposureChartConfig = useMemo(() => ({
    data: riskExposure.exposureByAsset || [],
    xField: 'symbol',
    yField: 'market_value',
    seriesField: 'symbol',
    label: { position: 'middle' },
  }), [riskExposure.exposureByAsset]);

  const varDistributionConfig = useMemo(() => ({
    data: varData.distribution || [],
    xField: 'confidence',
    yField: 'loss',
    point: { size: 5, shape: 'diamond' },
  }), [varData.distribution]);

  const correlationHeatmapConfig = useMemo(() => {
    const data = [];
    const assets = ['BTC', 'ETH', 'AAPL', 'MSFT'];
    if (correlationMatrix.length > 0) {
      correlationMatrix.forEach((row, i) => {
        row.forEach((val, j) => {
          data.push({ asset1: assets[i], asset2: assets[j], correlation: val });
        });
      });
    }
    return {
      data,
      xField: 'asset1',
      yField: 'asset2',
      colorField: 'correlation',
      color: ['#1890ff', '#ffffff', '#ff4d4f'],
    };
  }, [correlationMatrix]);

  const greeksHeatmapConfig = useMemo(() => {
    const data = greeksData.flatMap(item => [
      { asset: item.symbol || item.asset, metric: 'Delta', value: item.delta },
      { asset: item.symbol || item.asset, metric: 'Gamma', value: item.gamma },
      { asset: item.symbol || item.asset, metric: 'Theta', value: item.theta },
      { asset: item.symbol || item.asset, metric: 'Vega', value: item.vega }
    ]);
    return { data, xField: 'metric', yField: 'asset', colorField: 'value' };
  }, [greeksData]);

  const runCustomScenario = () => {
    confirm({
      title: 'Run Custom Scenario Analysis',
      icon: <ExperimentOutlined />,
      content: 'This will simulate a custom market scenario. Are you sure?',
      onOk: async () => {
        try {
          const values = await scenarioForm.validateFields();
          await riskAPI.runScenarioAnalysis(values);
          fetchData();
        } catch (err) {
          setError('Failed to run scenario analysis');
        }
      },
    });
  };

  return (
    <div className="risk-page">
      <div className="risk-header">
        <Title level={2}>Risk Management Dashboard</Title>
        <div className="header-controls">
          <Badge count={alerts.length} showZero><Button icon={<BellOutlined />} onClick={() => setAlerts([])}>Alerts</Button></Badge>
          <Switch checked={isMonitoring} onChange={setIsMonitoring} checkedChildren="Monitoring ON" unCheckedChildren="Monitoring OFF" style={{ margin: '0 16px' }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={Object.values(loading).some(l => l)}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="summary-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card var-exposure">
            <Statistic title="Portfolio VaR (95%)" value={varData.portfolioVar || 2450.50} precision={2} valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} suffix="USD" />
            <Tag color="green">SAFE</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card concentration-risk">
            <Statistic title="Top Asset Concentration" value={riskExposure.topAssetConcentration * 100 || 12.5} precision={1} suffix="%" />
            <Text type="secondary">{riskExposure.topAssetName || 'BTC'}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card liquidity-risk">
            <Statistic title="Liquidity Risk Score" value={riskExposure.liquidityRiskScore || 1.2} precision={1} suffix="/10" />
            <Tag color="green">LOW RISK</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card compliance">
            <Statistic title="Compliance Score" value={complianceData.score} precision={1} prefix={<SafetyCertificateOutlined />} suffix="/100" />
            <Text type="secondary">{complianceData.violations} violations</Text>
          </Card>
        </Col>
      </Row>

      <Card className="risk-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
          <Space>
            {activeTab === 'var' && (
              <Space>
                <span>Method:</span>
                <Select value={varParams.method} onChange={m => setVarParams(p => ({ ...p, method: m }))} options={[{ value: 'historical', label: 'Historical' }]} />
                <span>Confidence:</span>
                <Slider value={varParams.confidence} onChange={c => setVarParams(p => ({ ...p, confidence: c }))} min={90} max={99} step={0.5} style={{ width: 100 }} />
                <span>{varParams.confidence}%</span>
              </Space>
            )}
            {activeTab === 'stress' && (
              <Space>
                <Select value={stressTestParams.scenario} onChange={s => setStressTestParams(p => ({ ...p, scenario: s }))} options={[{ value: 'market_crash', label: 'Market Crash' }]} />
                <Button icon={<ExperimentOutlined />} onClick={() => setIsScenarioModalOpen(true)}>Custom Scenario</Button>
              </Space>
            )}
          </Space>
        }>
          <TabPane tab={<span><BarChartOutlined />Risk Exposure</span>} key="exposure">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Exposure by Asset Class"><Column {...exposureChartConfig} height={400} /></Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Risk Limits">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="VaR Limit"><Progress percent={24} status="normal" format={() => "$2,450 / $10,000"} /></Descriptions.Item>
                    <Descriptions.Item label="Concentration"><Progress percent={12.5} status="normal" format={() => "12.5%"} /></Descriptions.Item>
                    <Descriptions.Item label="Leverage"><Progress percent={riskExposure.leverageRatio * 50} status="normal" format={() => `${riskExposure.leverageRatio}x`} /></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><LineChartOutlined />VaR Analysis</span>} key="var">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="VaR Distribution"><Line {...varDistributionConfig} height={400} /></Card></Col>
              <Col xs={24} lg={8}>
                <Card title="VaR Metrics">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Method">{varData.method?.toUpperCase()}</Descriptions.Item>
                    <Descriptions.Item label="Portfolio VaR"><Text type="danger">${varData.portfolioVar?.toLocaleString()}</Text></Descriptions.Item>
                    <Descriptions.Item label="Backtesting"><Progress percent={varData.backtestAccuracy * 100} status="success" /></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="VaR Breakdown by Asset">
                  <Table dataSource={varData.breakdown} pagination={false} columns={[
                    { title: 'Asset', dataIndex: 'asset' },
                    { title: 'Individual VaR', dataIndex: 'individualVar', align: 'right', render: v => `$${v?.toLocaleString()}` },
                    { title: 'Contribution %', dataIndex: 'contribution', align: 'right', render: v => `${(v * 100).toFixed(2)}%` }
                  ]} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><ExperimentOutlined />Stress Testing</span>} key="stress">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Stress Test Results">
                  <div className="stress-results">
                    <h3>{stressTestData.scenarioName}</h3>
                    <Row gutter={16}>
                      <Col span={8}><Statistic title="Portfolio Loss" value={stressTestData.portfolioLoss} prefix="$" valueStyle={{ color: '#cf1322' }} /></Col>
                      <Col span={8}><Statistic title="Loss %" value={stressTestData.lossPercentage} suffix="%" /></Col>
                      <Col span={8}><Statistic title="Recovery Time" value={stressTestData.recoveryTime} suffix=" days" /></Col>
                    </Row>
                    <Divider />
                    <Table size="small" dataSource={stressTestData.assetImpacts} columns={[
                      { title: 'Asset', dataIndex: 'asset' },
                      { title: 'Loss', dataIndex: 'loss', render: v => <Text type="danger">-${v?.toLocaleString()}</Text> },
                      { title: 'Loss %', dataIndex: 'lossPercentage', render: v => <Text type="danger">{v?.toFixed(2)}%</Text> }
                    ]} pagination={false} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Risk Mitigation">
                  <div className="mitigation-strategies">
                    <div className="strategy-item"><h4>Hedging</h4><p>Purchase put options to protect downside.</p><Button size="small" type="primary">Execute</Button></div>
                    <Divider />
                    <div className="strategy-item"><h4>Liquidity Buffer</h4><p>Maintain 10% cash buffer.</p><Tag color="green">Active</Tag></div>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HeatMapOutlined />Correlation Analysis</span>} key="correlation">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Correlation Matrix"><Heatmap {...correlationHeatmapConfig} height={500} /></Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Correlation Insights">
                   <div className="insight-item"><span>Portfolio Correlation:</span> <strong>{(riskExposure.portfolioCorrelation * 100).toFixed(1)}%</strong></div>
                   <Divider />
                   <p>{riskExposure.portfolioCorrelation > 0.6 ? 'High correlation detected. Consider diversification.' : 'Good diversification.'}</p>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Create Custom Scenario" open={isScenarioModalOpen} onCancel={() => setIsScenarioModalOpen(false)} onOk={runCustomScenario}>
        <Form form={scenarioForm} layout="vertical">
          <Form.Item name="name" label="Scenario Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="duration" label="Duration (days)"><InputNumber min={1} defaultValue={30} /></Form.Item>
        </Form>
      </Modal>

      {error && <Alert message="Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default RiskPage;
