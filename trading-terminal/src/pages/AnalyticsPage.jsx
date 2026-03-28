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
  Dropdown,
  Menu,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Typography,
  Divider,
  List,
  Timeline
} from 'antd';
import { 
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  FundProjectionScreenOutlined,
  CalculatorOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  PlusOutlined,
  DownloadOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DotChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { Column, Line, Pie, Heatmap, Scatter, DualAxes } from '@ant-design/plots';
import { analyticsAPI } from '../services/api/analytics';
import './AnalyticsPage.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { useForm } = Form;

const AnalyticsPage = () => {
  // State Management
  const [performanceAttribution, setPerformanceAttribution] = useState({ 
    alpha: 4.25, benchmarkAlpha: 1.2, totalReturn: 18.5, benchmarkReturn: 12.2, activeReturn: 6.3,
    selectionEffect: 4.2, allocationEffect: 2.1, interactionEffect: 0.05, currencyEffect: -0.1,
    informationRatio: 1.45, trackingError: 3.2, detailedBreakdown: [], sector_attribution: []
  });
  const [monteCarloResults, setMonteCarloResults] = useState({ 
    probabilityOfSuccess: 88.5, simulations: 1000, medianValue: 12500000, 
    tenthPercentile: 9800000, ninetiethPercentile: 15400000, expectedShortfall: 450000,
    maxDrawdown: 12.5, volatility: 8.4, sharpeRatio: 1.45, sortinoRatio: 1.62,
    targetAchievedProbability: 82.4, moderateDeclineProbability: 12.5, severeDeclineProbability: 5.1,
    distribution: []
  });
  const [riskDecomposition, setRiskDecomposition] = useState({ 
    portfolioVar: 154000, expectedShortfall: 210000, components: [], decomposition: [] 
  });
  const [stressTesting, setStressTesting] = useState({ 
    worstCaseImpact: -28.4, averageImpact: -12.5, bestCaseImpact: 4.2, 
    riskBufferRequired: 1250000, scenarios: [], recoveryAnalysis: []
  });
  const [factorAnalysis, setFactorAnalysis] = useState({ 
    exposures: [], factorReturns: [], regressionResults: [], riskContributions: [], factorLoadings: [] 
  });
  const [performancePersistence, setPerformancePersistence] = useState({ 
    oneYear: 0.65, threeYear: 0.58, fiveYear: 0.52, tenYear: 0.45, halfLife: 4.2,
    quarterlyRankStability: 72, annualRankStability: 64, threeYearRankStability: 51,
    topQuartilePercentage: 45, bottomQuartilePercentage: 12, medianPerformance: 8.5, consistencyScore: 7.8
  });
  const [optimizationRecommendations, setOptimizationRecommendations] = useState({ 
    potentialImprovement: 2.45, numberOfChanges: 4, currentReturn: 12.2, currentRisk: 15.4,
    optimizedReturn: 14.65, optimizedRisk: 14.2, sectorConstraintsMet: true, 
    regionalConstraintsMet: true, liquidityConstraintsMet: true, changes: [],
    phase1Assets: ['AAPL', 'MSFT'], phase2Assets: ['TSLA', 'AMZN']
  });
  const [tailRiskAnalysis, setTailRiskAnalysis] = useState({ 
    var99: 125000, es99: 185000, var95: 95000, es95: 115000, var995: 145000, es995: 210000 
  });

  const [loading, setLoading] = useState({ attribution: true, montecarlo: true, risk: true, stress: true, factor: true, persistence: true, optimization: true });
  const [portfolioId, setPortfolioId] = useState('portfolio_12345');
  const [activeTab, setActiveTab] = useState('attribution');
  const [attributionTimeframe, setAttributionTimeframe] = useState('ytd');
  const [monteCarloParams, setMonteCarloParams] = useState({ simulations: 1000, horizon: 10, confidence: 95 });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showMonteCarloModal, setShowMonteCarloModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [monteCarloForm] = useForm();
  const [customScenarioForm] = useForm();
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading({ attribution: true, montecarlo: true, risk: true, stress: true, factor: true, persistence: true, optimization: true });
    try {
      const responses = await Promise.allSettled([
        analyticsAPI.getPerformanceAttribution(portfolioId, attributionTimeframe),
        analyticsAPI.runMonteCarloSimulation(portfolioId, monteCarloParams),
        analyticsAPI.getRiskDecomposition(portfolioId),
        analyticsAPI.getStressTesting(portfolioId),
        analyticsAPI.getFactorAnalysis(portfolioId),
        analyticsAPI.getPerformancePersistence(portfolioId),
        analyticsAPI.getOptimizationRecommendations(portfolioId),
        analyticsAPI.getTailRiskAnalysis(portfolioId)
      ]);

      if (responses[0].status === 'fulfilled') setPerformanceAttribution(prev => ({ ...prev, ...responses[0].value.data }));
      if (responses[1].status === 'fulfilled') setMonteCarloResults(prev => ({ ...prev, ...responses[1].value.data }));
      if (responses[2].status === 'fulfilled') setRiskDecomposition(prev => ({ ...prev, ...responses[2].value.data }));
      if (responses[3].status === 'fulfilled') setStressTesting(prev => ({ ...prev, ...responses[3].value.data }));
      if (responses[4].status === 'fulfilled') setFactorAnalysis(prev => ({ ...prev, ...responses[4].value.data }));
      if (responses[5].status === 'fulfilled') setPerformancePersistence(prev => ({ ...prev, ...responses[5].value.data }));
      if (responses[6].status === 'fulfilled') setOptimizationRecommendations(prev => ({ ...prev, ...responses[6].value.data }));
      if (responses[7].status === 'fulfilled') setTailRiskAnalysis(prev => ({ ...prev, ...responses[7].value.data }));

      setLoading({ attribution: false, montecarlo: false, risk: false, stress: false, factor: false, persistence: false, optimization: false });
    } catch (err) {
      setError('Quantitative models orchestration failed.');
    }
  }, [portfolioId, attributionTimeframe, monteCarloParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const attributionConfig = useMemo(() => ({ data: performanceAttribution.sector_attribution || [], xField: 'sector', yField: 'total', seriesField: 'sector', color: '#1890ff' }), [performanceAttribution]);
  const riskDecompositionConfig = useMemo(() => ({ data: riskDecomposition.decomposition || [], angleField: 'value', colorField: 'source', radius: 0.8, innerRadius: 0.6 }), [riskDecomposition]);
  const monteCarloConfig = useMemo(() => ({ data: monteCarloResults.distribution || [], xField: 'x', yField: 'y', size: 5, color: '#1890ff' }), [monteCarloResults]);
  const factorHeatmapConfig = useMemo(() => ({ data: factorAnalysis.factorLoadings || [], xField: 'factor', yField: 'asset', colorField: 'loading' }), [factorAnalysis]);
  const persistenceConfig = useMemo(() => ({ data: [{ period: '1Y', value: performancePersistence.oneYear }, { period: '3Y', value: performancePersistence.threeYear }, { period: '5Y', value: performancePersistence.fiveYear }], xField: 'period', yField: 'value', point: { size: 5 } }), [performancePersistence]);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1><CalculatorOutlined /> Advanced Analytics & Modeling</h1>
        <div className="header-controls">
          <Select value={portfolioId} onChange={setPortfolioId} style={{ width: 220 }} options={[{ value: 'portfolio_12345', label: 'Global Equities Portfolio' }]} />
          <Badge count={optimizationRecommendations.numberOfChanges} showZero><Button icon={<ThunderboltOutlined />} type="primary">Optimization</Button></Badge>
          <Dropdown menu={{ items: [{ key: 'pdf', label: 'Export PDF', onClick: () => {} }] }}><Button icon={<DownloadOutlined />}>Export</Button></Dropdown>
          <Switch checked={isMonitoring} onChange={() => setIsMonitoring(!isMonitoring)} checkedChildren="Live" unCheckedChildren="Static" style={{ marginRight: 16 }} />
          <Button icon={isMonitoring ? <StopOutlined /> : <PlayCircleOutlined />} onClick={() => setIsMonitoring(!isMonitoring)} type={isMonitoring ? 'danger' : 'primary'}>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading.attribution}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="summary-cards">
        <Col xs={24} sm={12} lg={4}><Card className="summary-card attribution"><Statistic title="Attribution Alpha" value={performanceAttribution.alpha} precision={2} valueStyle={{ color: '#52c41a' }} suffix="%" /><div>vs Benchmark: {performanceAttribution.benchmarkAlpha}%</div></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card className="summary-card montecarlo"><Statistic title="Prob. of Success" value={monteCarloResults.probabilityOfSuccess} precision={1} valueStyle={{ color: '#52c41a' }} suffix="%" /><div>{monteCarloParams.simulations} sims</div></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card className="summary-card risk"><Statistic title="Portfolio VaR (95%)" value={riskDecomposition.portfolioVar} prefix="$" valueStyle={{ color: '#ff4d4f' }} /><div>ES: ${riskDecomposition.expectedShortfall}</div></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card className="summary-card stress"><Statistic title="Stress Impact" value={stressTesting.worstCaseImpact} suffix="%" valueStyle={{ color: '#ff4d4f' }} /><div>Worst Case</div></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card className="summary-card optimization"><Statistic title="Opt. Potential" value={optimizationRecommendations.potentialImprovement} suffix="%" valueStyle={{ color: '#52c41a' }} /><div>{optimizationRecommendations.numberOfChanges} changes</div></Card></Col>
        <Col xs={24} sm={12} lg={4}><Card className="summary-card tail"><Statistic title="Tail Risk (99%)" value={tailRiskAnalysis.var99} prefix="$" valueStyle={{ color: '#ff4d4f' }} /><div>ES: ${tailRiskAnalysis.es99}</div></Card></Col>
      </Row>

      <Card className="analytics-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={<Space>{activeTab === 'attribution' && <Select value={attributionTimeframe} onChange={setAttributionTimeframe} options={[{ value: 'ytd', label: 'YTD' }]} style={{ width: 120 }} />}{activeTab === 'montecarlo' && <Button type="primary" onClick={() => setShowMonteCarloModal(true)}>Simulation</Button>}</Space>}>
          
          <TabPane tab={<span><PieChartOutlined />Performance Attribution</span>} key="attribution">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Attribution Analysis" extra={<Tag color="blue">Brinson Model</Tag>}>{loading.attribution ? <Spin /> : <Column {...attributionConfig} height={400} />}</Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Return Breakdown"><div className="summary-item"><div>Total Return</div><div className="positive">+{performanceAttribution.totalReturn}%</div></div><div className="summary-item"><div>Active Return</div><div className="positive">+{performanceAttribution.activeReturn}%</div></div></Card>
                <Card title="Key Drivers" style={{ marginTop: 16 }}><div className="driver-item"><div>Selection</div><div className="positive">+{performanceAttribution.selectionEffect}%</div></div><div className="driver-item"><div>Allocation</div><div className="positive">+{performanceAttribution.allocationEffect}%</div></div></Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><WarningOutlined />Risk Analysis</span>} key="risk">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Risk Component Analysis">{loading.risk ? <Spin /> : <Pie {...riskDecompositionConfig} height={400} />}</Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Risk Breakdown">{riskDecomposition.components?.map((c, i) => (
                  <div key={i} className="breakdown-item">
                    <div className="component-info"><div>{c.component}</div><div>${c.risk?.toLocaleString()}</div></div>
                    <Progress percent={c.percentage} size="small" status={c.percentage > 30 ? 'exception' : 'normal'} />
                  </div>
                ))}</Card>
                <Card title="Tail Risk" style={{ marginTop: 16 }}>
                  <div className="tail-risk-item"><div>95% Conf</div><div>VaR: ${tailRiskAnalysis.var95?.toLocaleString()} | ES: ${tailRiskAnalysis.es95?.toLocaleString()}</div></div>
                  <div className="tail-risk-item"><div>99% Conf</div><div>VaR: ${tailRiskAnalysis.var99?.toLocaleString()} | ES: ${tailRiskAnalysis.es99?.toLocaleString()}</div></div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined />Stress Testing</span>} key="stress">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Stress Test Results">{loading.stress ? <Spin /> : <Table dataSource={stressTesting.scenarios} pagination={{ pageSize: 5 }} columns={[{ title: 'Scenario', dataIndex: 'name' }, { title: 'Impact', dataIndex: 'impact', render: v => <span className="negative">{v}%</span> }]} />}</Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Stress Summary"><div className="summary-item"><div>Worst Impact</div><div className="negative">{stressTesting.worstCaseImpact}%</div></div><div className="summary-item"><div>Buffer Required</div><div>${stressTesting.riskBufferRequired?.toLocaleString()}</div></div></Card>
                <Card title="Recovery Analysis" style={{ marginTop: 16 }}>{stressTesting.recoveryAnalysis?.map((a, i) => (
                  <div key={i} className="recovery-item"><div>{a.scenario}</div><div>Time: {a.recoveryTime}m</div><Progress percent={a.recoveryConfidence} size="small" /></div>
                ))}</Card>
              </Col>
              <Col xs={24}>
                 <Card title="Scenario Builder" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowScenarioModal(true)}>Run Custom</Button>}>
                    <div className="scenario-controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                       <div><label>Market Drop</label><Slider min={-50} max={0} defaultValue={-20} /></div>
                       <div><label>Rate Shock</label><Slider min={-5} max={5} defaultValue={2} /></div>
                       <div><label>Credit Spread</label><Slider min={0} max={1000} defaultValue={300} /></div>
                       <div><label>Vol Multiplier</label><Slider min={1} max={5} step={0.1} defaultValue={2} /></div>
                    </div>
                 </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><FundProjectionScreenOutlined />Factor Analysis</span>} key="factor">
             <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}><Card title="Factor Loadings Heatmap">{loading.factor ? <Spin /> : <Heatmap {...factorHeatmapConfig} height={400} />}</Card></Col>
                <Col xs={24} lg={8}>
                   <Card title="Factor Exposures">{factorAnalysis.exposures?.map((e, i) => (
                     <div key={i} className="exposure-item"><div>{e.factor}</div><Progress percent={Math.abs(e.loading) * 100} size="small" /><span>{e.loading?.toFixed(3)}</span></div>
                   ))}</Card>
                   <Card title="Factor Performance" style={{ marginTop: 16 }}>{factorAnalysis.factorReturns?.map((f, i) => (
                     <div key={i} className="factor-item"><div>{f.name}</div><div className={f.return >= 0 ? 'positive' : 'negative'}>{f.return}%</div></div>
                   ))}</Card>
                </Col>
                <Col xs={24}>
                   <Card title="Regression Analysis">{loading.factor ? <Spin /> : <Table dataSource={factorAnalysis.regressionResults} pagination={false} columns={[{ title: 'Variable', dataIndex: 'variable' }, { title: 'Coefficient', dataIndex: 'coefficient', render: v => <span className={v >= 0 ? 'positive' : 'negative'}>{v?.toFixed(4)}</span> }, { title: 'P-Value', dataIndex: 'pValue', render: v => <span className={v < 0.05 ? 'significant' : ''}>{v?.toFixed(4)}</span> }]} />}</Card>
                </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><LineChartOutlined />Persistence Analysis</span>} key="persistence">
             <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}><Card title="Performance Persistence">{loading.persistence ? <Spin /> : <Line {...persistenceConfig} height={400} />}</Card></Col>
                <Col xs={24} lg={8}>
                   <Card title="Persistence Stats">
                      <div className="stat-item"><div>1Y Persistence</div><div>{(performancePersistence.oneYear * 100).toFixed(1)}%</div></div>
                      <div className="stat-item"><div>5Y Persistence</div><div>{(performancePersistence.fiveYear * 100).toFixed(1)}%</div></div>
                      <div className="stat-item"><div>Half-Life</div><div>{performancePersistence.halfLife}y</div></div>
                   </Card>
                   <Card title="Rank Stability" style={{ marginTop: 16 }}><Progress percent={performancePersistence.quarterlyRankStability} /><div>Quarterly Stability</div></Card>
                </Col>
                <Col xs={24}>
                   <Card title="Quartile Analysis"><div className="quartile-analysis" style={{ display: 'flex', justifyContent: 'space-around' }}><div>Top Quartile: {performancePersistence.topQuartilePercentage}%</div><div>Bottom: {performancePersistence.bottomQuartilePercentage}%</div><div>Consistency: {performancePersistence.consistencyScore}/10</div></div></Card>
                </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined />Optimization</span>} key="optimization">
             <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}><Card title="Portfolio Optimization" extra={<Button type="primary">Implement Optimization</Button>}>{loading.optimization ? <Spin /> : <Table dataSource={optimizationRecommendations.changes} columns={[{ title: 'Asset', dataIndex: 'asset' }, { title: 'Current', dataIndex: 'currentWeight' }, { title: 'New', dataIndex: 'recommendedWeight' }, { title: 'Impact', dataIndex: 'expectedImpact', render: v => <span className="positive">+{v}%</span> }]} />}</Card></Col>
                <Col xs={24} lg={8}>
                   <Card title="Optimization Metrics"><Statistic title="Enhanced Return" value={optimizationRecommendations.potentialImprovement} suffix="%" /><Divider /><div className="metric-item"><div>Sectors: <CheckCircleOutlined style={{ color: '#52c41a' }} /></div><div>Regional: <CheckCircleOutlined style={{ color: '#52c41a' }} /></div></div></Card>
                   <Card title="Roadmap" style={{ marginTop: 16 }}><Timeline><Timeline.Item color="green">Phase 1: High Conviction ({optimizationRecommendations.phase1Assets?.join(', ')})</Timeline.Item><Timeline.Item color="blue">Phase 2: Tactical ({optimizationRecommendations.phase2Assets?.join(', ')})</Timeline.Item></Timeline></Card>
                </Col>
             </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Simulation Parameters" open={showMonteCarloModal} onCancel={() => setShowMonteCarloModal(false)} footer={null}><Form form={monteCarloForm} layout="vertical" onFinish={(v) => { setMonteCarloParams(v); setShowMonteCarloModal(false); }}><Form.Item name="simulations" label="Simulations" initialValue={1000}><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="horizon" label="Horizon (Years)" initialValue={10}><Slider min={1} max={30} /></Form.Item><Button type="primary" block htmlType="submit">Run</Button></Form></Modal>
      <Modal title="Custom Scenario" open={showScenarioModal} onCancel={() => setShowScenarioModal(false)} footer={null}><Form form={customScenarioForm} layout="vertical" onFinish={() => setShowScenarioModal(false)}><Form.Item name="name" label="Scenario Name"><Input /></Form.Item><Form.Item name="marketDrop" label="Market Drop (%)"><InputNumber style={{ width: '100%' }} /></Form.Item><Button type="primary" block htmlType="submit">Execute Scenario</Button></Form></Modal>
    </div>
  );
};

export default AnalyticsPage;
