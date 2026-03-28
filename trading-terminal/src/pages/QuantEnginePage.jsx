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
  List
} from 'antd';
import { 
  ExperimentOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  CodeOutlined,
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
  SaveOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  DotChartOutlined,
  CloudUploadOutlined,
  RiseOutlined,
  StockOutlined,
  SafetyCertificateOutlined,
  AimOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Heatmap, DualAxes, Scatter, Area } from '@ant-design/plots';
import { quantEngineAPI } from '../services/api/quantEngine';
import './QuantEnginePage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;

const QuantEnginePage = () => {
  // State Management
  const [strategyTemplates, setStrategyTemplates] = useState([]);
  const [backtestingResults, setBacktestingResults] = useState({});
  const [optimizationResults, setOptimizationResults] = useState({});
  const [strategyParameters, setStrategyParameters] = useState({});
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [riskMetrics, setRiskMetrics] = useState({});
  const [loading, setLoading] = useState({
    templates: true,
    backtesting: false,
    optimization: false,
    strategies: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedStrategy, setSelectedStrategy] = useState('mean_reversion');
  const [isRunning, setIsRunning] = useState(false);
  const [rlTrainingData, setRlTrainingData] = useState([]);
  const [signalConvergence, setSignalConvergence] = useState([]);
  const [monteCarloData, setMonteCarloData] = useState([]);
  const [codeEditorValue, setCodeEditorValue] = useState('class MeanReversionStrategy:\n    def __init__(self, window=20, threshold=2.0):\n        self.window = window\n        self.threshold = threshold\n\n    def generate_signal(self, data):\n        # Bollinger Band Mean Reversion logic\n        rolling_mean = data["close"].rolling(window=self.window).mean()\n        rolling_std = data["close"].rolling(window=self.window).std()\n        upper_band = rolling_mean + (self.threshold * rolling_std)\n        lower_band = rolling_mean - (self.threshold * rolling_std)\n        \n        if data["close"].iloc[-1] > upper_band.iloc[-1]:\n            return "SELL"\n        elif data["close"].iloc[-1] < lower_band.iloc[-1]:\n            return "BUY"\n        return "HOLD"');
  const [optimizerWeights, setOptimizerWeights] = useState([
    { type: 'AAPL', value: 25 },
    { type: 'MSFT', value: 40 },
    { type: 'GOOGL', value: 15 },
    { type: 'AMZN', value: 20 }
  ]);
  const [fusionData, setFusionData] = useState([]);
  
  const [parameterForm] = useForm();
  const [backtestForm] = useForm();
  const [optimizationForm] = useForm();
  const [modelZooForm] = useForm();
  
  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);

  // Constants
  const availableSymbols = ['SPY', 'QQQ', 'DIA', 'IWM', 'AAPL', 'MSFT', 'TSLA', 'BTC/USD', 'ETH/USD'];
  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '1d', label: '1 Day' }
  ];
  const optimizationMethods = [
    { value: 'grid_search', label: 'Grid Search' },
    { value: 'random_search', label: 'Random Search' },
    { value: 'genetic', label: 'Genetic Algorithm' }
  ];
  const objectives = [
    { value: 'sharpe_ratio', label: 'Sharpe Ratio' },
    { value: 'max_drawdown', label: 'Max Drawdown' },
    { value: 'net_profit', label: 'Net Profit' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(prev => ({ ...prev, templates: true, strategies: true }));
    try {
      const [templatesRes, savedRes, paramsRes, rlRes, fusionRes] = await Promise.all([
        quantEngineAPI.getStrategyTemplates(),
        quantEngineAPI.getSavedStrategies(),
        quantEngineAPI.getStrategyParameters(selectedStrategy),
        quantEngineAPI.getRLTrainingMetrics('default'),
        quantEngineAPI.getSignalConvergence('NVDA')
      ]);
      setStrategyTemplates(templatesRes.data || []);
      setSavedStrategies(savedRes.data || []);
      setStrategyParameters(paramsRes.data || {});
      setRlTrainingData(rlRes.data || []);
      setFusionData(fusionRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch initial data');
    } finally {
      setLoading(prev => ({ ...prev, templates: false, strategies: false }));
    }
  };

  const handleOptimizationWeightsTrigger = async (assets) => {
    setLoading(prev => ({ ...prev, optimization: true }));
    try {
      const selectedAssets = assets || modelZooForm.getFieldValue('assets') || ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/quant-engine/optimization/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: selectedAssets })
      });
      const resJson = await response.json();
      if (resJson.status === 'success') {
         setOptimizerWeights(resJson.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, optimization: false }));
    }
  };

  // Run backtesting
  const runBacktesting = async () => {
    setIsRunning(true);
    setLoading(prev => ({ ...prev, backtesting: true }));
    try {
      const config = backtestForm.getFieldsValue();
      const res = await quantEngineAPI.getBacktestingResults(selectedStrategy, config);
      setBacktestingResults(res.data);
      setPerformanceMetrics(res.data.metrics || {});
      setActiveTab('results');
    } catch (err) {
      setError('Backtesting job failed');
    } finally {
      setIsRunning(false);
      setLoading(prev => ({ ...prev, backtesting: false }));
      setShowBacktestModal(false);
    }
  };

  // Run optimization
  const runOptimization = async () => {
    setIsRunning(true);
    setLoading(prev => ({ ...prev, optimization: true }));
    try {
      const config = optimizationForm.getFieldsValue();
      const res = await quantEngineAPI.getOptimizationResults(selectedStrategy, config);
      setOptimizationResults(res.data);
      setActiveTab('optimization');
    } catch (err) {
      setError('Optimization job failed');
    } finally {
      setIsRunning(false);
      setLoading(prev => ({ ...prev, optimization: false }));
      setShowOptimizationModal(false);
    }
  };

  // Plot Configurations
  const equityCurveConfig = useMemo(() => ({
    data: backtestingResults.equityCurve || [],
    xField: 'date',
    yField: 'equity',
    smooth: true,
    lineStyle: { lineWidth: 2, stroke: '#1890ff' },
    yAxis: { label: { formatter: (v) => `$${(v/1000).toFixed(0)}k` } },
    tooltip: { formatter: (v) => ({ name: 'Portfolio Value', value: `$${v.equity.toLocaleString()}` }) }
  }), [backtestingResults.equityCurve]);
  
  const rlRewardConfig = useMemo(() => ({
    data: rlTrainingData,
    xField: 'episode',
    yField: 'reward',
    smooth: true,
    color: '#10b981',
    area: { style: { fill: 'l(270) 0:rgba(16,185,129,0) 1:rgba(16,185,129,0.2)' } }
  }), [rlTrainingData]);

  const signalConvergenceConfig = useMemo(() => ({
    data: signalConvergence,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'source',
    smooth: true,
    animation: { appear: { animation: 'path-in', duration: 1000 } }
  }), [signalConvergence]);

  return (
    <div className="quant-engine-page">
      {/* Header Section */}
      <div className="quant-header">
        <h1><ExperimentOutlined /> Quantitative Strategy Terminal</h1>
        <div className="header-controls">
          <Select 
            value={selectedStrategy} 
            onChange={setSelectedStrategy}
            style={{ width: 220 }}
            options={strategyTemplates.map(t => ({ value: t.id, label: t.name }))}
          />
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setShowBacktestModal(true)} loading={isRunning}>Run Backtest</Button>
          <Button icon={<SettingOutlined />} onClick={() => setShowOptimizationModal(true)}>Optimize</Button>
          <Button icon={<SaveOutlined />}>Save Strategy</Button>
        </div>
      </div>

      {/* Strategy Performance Summary */}
      <Row gutter={[24, 24]} className="metrics-summary">
        <Col xs={12} lg={6}>
          <Card className="metric-card"><Statistic title="Sharpe Ratio" value={performanceMetrics.sharpeRatio || 0} precision={2} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="metric-card"><Statistic title="Annualized Return" value={performanceMetrics.annualizedReturn || 0} suffix="%" precision={2} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="metric-card"><Statistic title="Max Drawdown" value={performanceMetrics.maxDrawdown || 0} suffix="%" precision={2} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="metric-card"><Statistic title="Profit Factor" value={performanceMetrics.profitFactor || 0} precision={2} /></Card>
        </Col>
      </Row>

      {/* Main Content Workspace */}
      <Card className="quant-workspace">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Strategy Editor */}
          <TabPane tab={<span><CodeOutlined /> Strategy Editor</span>} key="editor">
            <Row gutter={24}>
              <Col span={16}>
                <div className="code-editor-container">
                  <div className="editor-header">
                    <Tag color="blue">PYTHON 3.9</Tag>
                    <Space>
                      <Button size="small" icon={<CopyOutlined />}>Copy</Button>
                      <Button size="small" icon={<ReloadOutlined />}>Reset</Button>
                    </Space>
                  </div>
                  <textarea 
                    className="strategy-code-area"
                    value={codeEditorValue}
                    onChange={(e) => setCodeEditorValue(e.target.value)}
                  />
                </div>
              </Col>
              <Col span={8}>
                <Card title="Strategy Hyperparameters" size="small" extra={<Button type="link" size="small" onClick={() => setShowParameterModal(true)}>Advanced</Button>}>
                  <Form form={parameterForm} layout="vertical">
                    <Form.Item label="Lookback Window" name="window"><Slider min={5} max={100} defaultValue={20} /></Form.Item>
                    <Form.Item label="Std Dev Threshold" name="threshold"><InputNumber step={0.1} style={{ width: '100%' }} defaultValue={2.0} /></Form.Item>
                    <Form.Item label="Position Sizing (%)" name="sizing"><Slider min={1} max={50} defaultValue={10} /></Form.Item>
                    <Form.Item label="ATR Stop Multiplier" name="atr_stop"><InputNumber step={0.5} style={{ width: '100%' }} defaultValue={2.5} /></Form.Item>
                  </Form>
                </Card>
                <Card title="Strategy Library" size="small" className="library-card">
                   <List
                    size="small"
                    dataSource={savedStrategies}
                    renderItem={item => (
                      <List.Item actions={[<Button type="link" size="small" icon={<EditOutlined />} />]}>
                        <List.Item.Meta title={item.name} description={item.template} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Backtesting Engine */}
          <TabPane tab={<span><BarChartOutlined /> Backtest Results</span>} key="results">
            {loading.backtesting ? <div className="engine-loading"><Spin size="large" tip="Processing quantitative logs..." /></div> : (
              <Row gutter={[24, 24]}>
                <Col span={16}>
                  <Card title="Portfolio Equity Curve"><Line {...equityCurveConfig} height={400} /></Card>
                </Col>
                <Col span={8}>
                  <Card title="Risk Statistics">
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Volatility (Ann.)">14.2%</Descriptions.Item>
                      <Descriptions.Item label="VaR (95%)">-$4,250</Descriptions.Item>
                      <Descriptions.Item label="Sortino Ratio">2.18</Descriptions.Item>
                      <Descriptions.Item label="Skewness">-0.45</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card title="Trade Distribution" className="distribution-card">
                     <Statistic title="Total Trades" value={performanceMetrics.totalTrades} />
                     <Divider />
                     <Progress percent={performanceMetrics.winRate} success={{ percent: performanceMetrics.winRate }} />
                     <div style={{ textAlign: 'center', marginTop: 8 }}>Win Rate: {performanceMetrics.winRate}%</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Trade Execution Audit">
                    <Table 
                      dataSource={backtestingResults.trades || []} 
                      size="small"
                      columns={[
                        { title: 'Date', dataIndex: 'date' },
                        { title: 'Action', dataIndex: 'type', render: (t) => <Tag color={t === 'BUY' ? 'green' : 'red'}>{t}</Tag> },
                        { title: 'Price', dataIndex: 'price', render: (p) => `$${p.toFixed(2)}` },
                        { title: 'P&L', dataIndex: 'pnl', render: (p) => <span style={{ color: p >= 0 ? '#52c41a' : '#ff4d4f' }}>${p.toFixed(2)}</span> }
                      ]}
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          {/* Parameter Optimization */}
          <TabPane tab={<span><DotChartOutlined /> Optimization</span>} key="optimization">
            {loading.optimization ? <div className="engine-loading"><Spin size="large" tip="Executing parallel grid search..." /></div> : (
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Row gutter={24}>
                    <Col span={8}><Card><Statistic title="Optimal Sharpe" value={2.84} precision={2} valueStyle={{ color: '#52c41a' }} /><div className="opt-params">params: window=25, thresh=2.2</div></Card></Col>
                    <Col span={8}><Card><Statistic title="Optimization Jobs" value={100} /></Card></Col>
                    <Col span={8}><Card><Statistic title="Search Method" value="Grid Search" /></Card></Col>
                  </Row>
                </Col>
                <Col span={16}>
                  <Card title="Parameter Sensitivity Heatmap">
                    <Heatmap 
                      data={optimizationResults.data || []}
                      xField="window"
                      yField="threshold"
                      colorField="sharpe"
                      color={['#f6ffed', '#52c41a', '#237804']}
                      height={400}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Convergence Audit">
                    <div className="convergence-list">
                      <div className="conv-item"><span>Iteration 10/100</span><Progress percent={10} size="small" /></div>
                      <div className="conv-item"><span>Iteration 50/100</span><Progress percent={50} size="small" /></div>
                      <div className="conv-item"><span>Iteration 95/100</span><Progress percent={95} size="small" /></div>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>
          {/* Reinforcement Learning Agent Monitor */}
          <TabPane 
            tab={<span><AimOutlined /> RL Agent Monitor</span>} 
            key="rl-monitor"
          >
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Card title="Episode Reward Convergence (Real-time Training)">
                  <Area {...rlRewardConfig} height={350} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Agent Hyperparameters" size="small">
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Alpha (Learning Rate)">0.0003</Descriptions.Item>
                    <Descriptions.Item label="Gamma (Discount)">0.99</Descriptions.Item>
                    <Descriptions.Item label="Epsilon (Exploration)">0.15</Descriptions.Item>
                    <Descriptions.Item label="Buffer Size">1,000,000</Descriptions.Item>
                    <Descriptions.Item label="Batch Size">256</Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: '12px 0' }} />
                  <Button type="primary" block icon={<ReloadOutlined />}>Retrain Agent</Button>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="State-Action Probability Heatmap">
                   <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <p style={{ color: '#8c8c8c' }}>Action Probability Distribution (Buy/Sell/Hold) over Neural Latent Space</p>
                   </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Neural Signal Hub (Enhanced) */}
          <TabPane 
            tab={<span><SafetyCertificateOutlined /> Neural Signal Hub</span>} 
            key="signal-hub"
          >
            <Row gutter={[24, 24]}>
               <Col span={16}>
                  <Card title="Multi-Modal Signal Fusion Audit (Real-time AI Streams)">
                     <Row gutter={16}>
                        <Col span={6}>
                           <Statistic 
                              title="Ensemble Confidence" 
                              value={89.4} 
                              precision={2} 
                              suffix="%" 
                              valueStyle={{ color: '#1890ff' }} 
                              prefix={<ThunderboltOutlined />}
                           />
                        </Col>
                        <Col span={6}>
                           <Statistic title="Consensus Bias" value="BULLISH" valueStyle={{ color: '#52c41a' }} />
                        </Col>
                        <Col span={6}>
                           <Statistic title="Meta-Weight (AI)" value={0.72} precision={2} />
                        </Col>
                        <Col span={6}>
                           <Statistic title="Current Regime" value="Trending Up" />
                        </Col>
                     </Row>
                     <Divider />
                     <div style={{ height: 350 }}>
                        <Radar 
                           data={fusionData}
                           xField="name"
                           yField="value"
                           meta={{ value: { min: 0, max: 1 } }}
                           area={{ style: { fillOpacity: 0.3 } }}
                        />
                     </div>
                  </Card>
               </Col>
               <Col span={8}>
                  <Card title="Model Contribution Audit" size="small">
                     <Paragraph style={{ color: '#8c8c8c' }}>
                       Weights are dynamically adjusted via <strong>Meta-Learning</strong> based on current regime performance.
                     </Paragraph>
                      <List
                         size="small"
                         dataSource={fusionData}
                         renderItem={item => (
                            <List.Item>
                               <div style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span>{item.name}</span>
                                     <Tag color={item.value > 0.6 ? 'green' : 'orange'}>{item.value.toFixed(2)}</Tag>
                                  </div>
                                  <Progress percent={(item.weight || 0.25) * 100} strokeColor={item.value > 0.6 ? '#1890ff' : '#faad14'} size="small" />
                               </div>
                            </List.Item>
                         )}
                      />
                  </Card>
                  <Card title="Execution Confidence Map" style={{ marginTop: 24 }}>
                     <Area 
                       data={Array.from({ length: 20 }).map((_, i) => ({
                         time: `${i}:00`,
                         confidence: 80 + Math.sin(i / 2) * 15
                       }))}
                       xField="time"
                       yField="confidence"
                       color="#1890ff"
                       height={150}
                       smooth
                     />
                  </Card>
               </Col>
            </Row>
          </TabPane>
          {/* Model Zoo: Quantitative Models Interface */}
          <TabPane 
            tab={<span><DatabaseOutlined /> Model Zoo</span>} 
            key="model-zoo"
          >
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card 
                  title="Markowitz Portfolio Optimizer" 
                  extra={<Tag color="blue">SCIPY OPTIMIZE</Tag>}
                >
                  <p style={{ color: '#8c8c8c', marginBottom: '16px' }}>Efficient Frontier computation based on mean-variance optimization.</p>
                  <Form form={modelZooForm} layout="vertical" initialValues={{ assets: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'] }}>
                    <Form.Item label="Asset Universe" name="assets">
                      <Select mode="multiple" style={{ width: '100%' }}>
                        {availableSymbols.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item label="Optimization Method">
                      <Select defaultValue="max_sharpe">
                        <Select.Option value="max_sharpe">Maximize Sharpe Ratio</Select.Option>
                        <Select.Option value="min_vol">Minimize Volatility</Select.Option>
                        <Select.Option value="erc">Equal Risk Contribution</Select.Option>
                      </Select>
                    </Form.Item>
                    <Button 
                      type="primary" 
                      block 
                      icon={<ExperimentOutlined />} 
                      onClick={() => handleOptimizationWeightsTrigger()}
                      loading={loading.optimization}
                    >
                      Compute Optimal Weights
                    </Button>
                  </Form>
                  <Divider />
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    <Pie 
                      data={optimizerWeights}
                      angleField="value"
                      colorField="type"
                      radius={0.7}
                      label={{ type: 'inner', offset: '-30%', content: '{value}%' }}
                    />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title="GARCH Volatility Forecaster" 
                  extra={<Tag color="purple">ARCH-PYTHON</Tag>}
                >
                   <p style={{ color: '#8c8c8c', marginBottom: '16px' }}>GARCH(1,1) model for conditional volatility and variance persistence.</p>
                   <Form layout="vertical">
                    <Form.Item label="Input Series (Returns)">
                      <Select defaultValue="SPY_L">
                        <Select.Option value="SPY_L">SPY Daily Log Returns</Select.Option>
                        <Select.Option value="BTC_L">BTC/USD Log Returns</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Convergence Alpha + Beta">
                       <Progress percent={98} strokeColor="#722ed1" status="active" />
                    </Form.Item>
                    <Button block icon={<LineChartOutlined />}>Fit GARCH Model</Button>
                   </Form>
                   <Divider />
                   <div style={{ height: 200 }}>
                      <Line 
                        data={[
                          { date: 'T-5', vol: 12 }, { date: 'T-4', vol: 14 }, { date: 'T-3', vol: 13 },
                          { date: 'T-2', vol: 18 }, { date: 'T-1', vol: 15 }, { date: 'Forecast', vol: 16 }
                        ]}
                        xField="date"
                        yField="vol"
                        smooth
                        color="#722ed1"
                        point={{ size: 4 }}
                      />
                   </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals for configurations */}
      <Modal title="Configure Backtest Engine" open={showBacktestModal} onOk={runBacktesting} onCancel={() => setShowBacktestModal(false)}>
        <Form form={backtestForm} layout="vertical">
          <Form.Item label="Symbol" name="symbol" initialValue="SPY"><Select options={availableSymbols.map(s => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item label="Resolution" name="timeframe" initialValue="1d"><Select options={timeframes} /></Form.Item>
          <Form.Item label="Date Range" name="dateRange"><RangePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Starting Cash" name="initialCapital" initialValue={100000}><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Configure Optimization Job" open={showOptimizationModal} onOk={runOptimization} onCancel={() => setShowOptimizationModal(false)}>
        <Form form={optimizationForm} layout="vertical">
          <Form.Item label="Optimization Method" name="method" initialValue="grid_search"><Select options={optimizationMethods} /></Form.Item>
          <Form.Item label="Objective Function" name="objective" initialValue="sharpe_ratio"><Select options={objectives} /></Form.Item>
          <Form.Item label="Iterations" name="iterations" initialValue={100}><Slider min={10} max={1000} /></Form.Item>
        </Form>
      </Modal>

      {error && <Alert message="Engine Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default QuantEnginePage;
