// src/pages/EquityAnalysisPage.jsx
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
  StockOutlined,
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
  SafetyCertificateOutlined,
  ExperimentOutlined,
  HeatMapOutlined,
  FieldNumberOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Heatmap, DualAxes } from '@ant-design/plots';
import { equityAnalysisAPI } from '../api/equityAnalysis';
import './EquityAnalysisPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { useForm } = Form;
const { Panel } = Collapse;

const EquityAnalysisPage = () => {
  // State Management
  const [symbol, setSymbol] = useState('AAPL');
  const [fundamentals, setFundamentals] = useState({});
  const [valuationMetrics, setValuationMetrics] = useState({});
  const [factorModel, setFactorModel] = useState({});
  const [historicalValuation, setHistoricalValuation] = useState({});
  const [peerGroup, setPeerGroup] = useState([]);
  const [factorExposures, setFactorExposures] = useState({});
  const [valuationPercentile, setValuationPercentile] = useState({});
  const [financials, setFinancials] = useState({});
  const [loading, setLoading] = useState({
    fundamentals: true,
    valuation: true,
    factors: true,
    historical: true,
    peers: true,
    exposures: true,
    percentile: true,
    financials: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [timeframe, setTimeframe] = useState('5y');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [wsConnection, setWsConnection] = useState(null);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [valuationForm] = useForm();
  const [factorForm] = useForm();
  const [financialsForm] = useForm();
  const [valuationConfig, setValuationConfig] = useState({
    model: 'DCF',
    discountRate: 0.08,
    growthRate: 0.05,
    terminalGrowth: 0.03,
    years: 5
  });
  const [factorConfig, setFactorConfig] = useState({
    factors: ['value', 'growth', 'quality', 'momentum'],
    weights: [0.25, 0.25, 0.25, 0.25],
    lookback: '5y'
  });

  const wsRef = useRef(null);

  // Available symbols
  const availableSymbols = [
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft Corporation' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'AMZN', label: 'Amazon.com Inc.' },
    { value: 'TSLA', label: 'Tesla Inc.' },
    { value: 'NVDA', label: 'NVIDIA Corporation' },
    { value: 'JPM', label: 'JPMorgan Chase & Co.' },
    { value: 'JNJ', label: 'Johnson & Johnson' },
    { value: 'V', label: 'Visa Inc.' },
    { value: 'MA', label: 'Mastercard Incorporated' }
  ];

  // Timeframe options
  const timeframeOptions = [
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
    { value: '10y', label: '10 Years' },
    { value: '15y', label: '15 Years' },
    { value: '20y', label: '20 Years' }
  ];

  // Valuation model options
  const modelOptions = [
    { value: 'DCF', label: 'Discounted Cash Flow' },
    { value: 'DDM', label: 'Dividend Discount Model' },
    { value: 'Relative', label: 'Relative Valuation' },
    { value: 'Earnings', label: 'Earnings-based' }
  ];

  // Factor options
  const factorOptions = [
    { value: 'value', label: 'Value' },
    { value: 'growth', label: 'Growth' },
    { value: 'quality', label: 'Quality' },
    { value: 'momentum', label: 'Momentum' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'size', label: 'Size' },
    { value: 'profitability', label: 'Profitability' },
    { value: 'investment', label: 'Investment' }
  ];

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (symbol && isMonitoring) {
      connectWebSocket();
    } else if (wsRef.current) {
      wsRef.current.close();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol, isMonitoring]);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = equityAnalysisAPI.subscribeToEquityUpdates(symbol, handleWebSocketMessage);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Equity Analysis WebSocket');
    };

    ws.onclose = () => {
      console.log('Equity Analysis WebSocket disconnected');
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };

    setWsConnection(ws);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'fundamental_update':
        setFundamentals(data.payload);
        break;
      case 'valuation_update':
        setValuationMetrics(data.payload);
        break;
      case 'factor_update':
        setFactorModel(data.payload);
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount and parameter changes
  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  const fetchData = async () => {
    setLoading({
      fundamentals: true,
      valuation: true,
      factors: true,
      historical: true,
      peers: true,
      exposures: true,
      percentile: true,
      financials: true
    });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        equityAnalysisAPI.getCompanyFundamentals(symbol),
        equityAnalysisAPI.getValuationMetrics(symbol),
        equityAnalysisAPI.getFactorModel(symbol),
        equityAnalysisAPI.getHistoricalValuation(symbol, timeframe),
        equityAnalysisAPI.getPeerGroup(symbol),
        equityAnalysisAPI.getFactorExposures(symbol),
        equityAnalysisAPI.getValuationPercentile(symbol),
        equityAnalysisAPI.getFinancials(symbol, timeframe)
      ]);

      if (responses[0].status === 'fulfilled') setFundamentals(responses[0].value.data);
      if (responses[1].status === 'fulfilled') setValuationMetrics(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setFactorModel(responses[2].value.data);
      if (responses[3].status === 'fulfilled') setHistoricalValuation(responses[3].value.data);
      if (responses[4].status === 'fulfilled') setPeerGroup(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setFactorExposures(responses[5].value.data);
      if (responses[6].status === 'fulfilled') setValuationPercentile(responses[6].value.data);
      if (responses[7].status === 'fulfilled') setFinancials(responses[7].value.data);

      setLoading({
        fundamentals: false,
        valuation: false,
        factors: false,
        historical: false,
        peers: false,
        exposures: false,
        percentile: false,
        financials: false
      });

      const rejected = responses.filter(r => r.status === 'rejected');
      if (rejected.length > 0) setError('Some data failed to load.');
    } catch (err) {
      setError('Failed to load equity data');
      setLoading({ fundamentals: false, valuation: false, factors: false, historical: false, peers: false, exposures: false, percentile: false, financials: false });
    }
  };

  const toggleMonitoring = () => setIsMonitoring(!isMonitoring);

  // Data mappings for cards
  const valuationMetricsData = [
    { title: 'Fair Value', value: valuationMetrics.fairValue, suffix: ' USD', color: valuationMetrics.fairValue > valuationMetrics.currentPrice ? '#52c41a' : '#ff4d4f', description: 'Model-derived fair value' },
    { title: 'Current Price', value: valuationMetrics.currentPrice, suffix: ' USD', color: '#1890ff', description: 'Current market price' },
    { title: 'Price Target', value: valuationMetrics.priceTarget, suffix: ' USD', color: valuationMetrics.priceTarget > valuationMetrics.currentPrice ? '#52c41a' : '#ff4d4f', description: '12-month target' },
    { title: 'Upside', value: valuationMetrics.upside, suffix: '%', color: valuationMetrics.upside >= 0 ? '#52c41a' : '#ff4d4f', description: 'Potential move' },
    { title: 'Rating', value: valuationMetrics.rating, suffix: '', color: valuationMetrics.rating === 'undervalued' ? '#52c41a' : '#faad14', description: 'Valuation rating' },
    { title: 'P/E Ratio', value: valuationMetrics.peRatio, suffix: '', color: valuationMetrics.peRatio > valuationMetrics.industryPe ? '#ff4d4f' : '#52c41a', description: 'Price/Earnings' }
  ];

  const factorMetricsData = [
    { title: 'Value Score', value: factorModel.valueScore, suffix: '/10', color: factorModel.valueScore > 7 ? '#52c41a' : '#faad14', description: 'Value attractiveness' },
    { title: 'Growth Score', value: factorModel.growthScore, suffix: '/10', color: factorModel.growthScore > 7 ? '#52c41a' : '#faad14', description: 'Growth potential' },
    { title: 'Quality Score', value: factorModel.qualityScore, suffix: '/10', color: factorModel.qualityScore > 7 ? '#52c41a' : '#faad14', description: 'Business quality' },
    { title: 'Momentum', value: factorModel.momentumScore, suffix: '/10', color: factorModel.momentumScore > 7 ? '#52c41a' : '#faad14', description: 'Price momentum' },
    { title: 'Overall Score', value: factorModel.overallScore, suffix: '/10', color: factorModel.overallScore > 7 ? '#52c41a' : '#faad14', description: 'Composite score' },
    { title: 'Ranking', value: factorModel.ranking, suffix: `/${factorModel.totalCount}`, color: '#1890ff', description: 'Peer rank' }
  ];

  const factorExposuresData = [
    { title: 'Value', value: factorExposures.valueExposure, color: '#52c41a', description: 'Value exposure' },
    { title: 'Growth', value: factorExposures.growthExposure, color: '#1890ff', description: 'Growth exposure' },
    { title: 'Quality', value: factorExposures.qualityExposure, color: '#722ed1', description: 'Quality exposure' },
    { title: 'Momentum', value: factorExposures.momentumExposure, color: '#faad14', description: 'Momentum exposure' },
    { title: 'Volatility', value: factorExposures.volatilityExposure, color: '#ff4d4f', description: 'Volatility sensitivity' },
    { title: 'Size', value: factorExposures.sizeExposure, color: '#13c2c2', description: 'Size exposure' }
  ];

  // Chart configs
  const valuationChartConfig = useMemo(() => ({
    data: [
      { type: 'Current Price', value: valuationMetrics.currentPrice },
      { type: 'Fair Value', value: valuationMetrics.fairValue },
      { type: 'Price Target', value: valuationMetrics.priceTarget }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    statistic: { title: false, content: { formatter: () => `${symbol}` } }
  }), [valuationMetrics, symbol]);

  const historicalValuationConfig = useMemo(() => ({
    data: historicalValuation.valuationHistory || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    yAxis: { label: { formatter: (v) => `$${v?.toLocaleString()}` } }
  }), [historicalValuation]);

  const factorExposureConfig = useMemo(() => ({
    data: factorExposures.factorMatrix || [],
    xField: 'factor',
    yField: 'exposure',
    colorField: 'value',
    color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'],
    tooltip: {
      formatter: (datum) => ({
        name: datum.factor,
        value: `${(datum.value * 100).toFixed(1)}%`
      })
    }
  }), [factorExposures]);

  const financialsChartConfig = useMemo(() => ({
    data: [
      ...(financials.revenueHistory?.map(d => ({ ...d, type: 'Revenue' })) || []),
      ...(financials.netIncomeHistory?.map(d => ({ ...d, type: 'Net Income' })) || []),
      ...(financials.fcfHistory?.map(d => ({ ...d, type: 'Free Cash Flow' })) || [])
    ],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    yAxis: { label: { formatter: (v) => `$${v?.toLocaleString()}` } }
  }), [financials]);

  return (
    <div className="equity-analysis-page">
      <div className="equity-header">
        <h1><StockOutlined /> Equity Analysis & Valuation</h1>
        <div className="header-controls">
          <Select value={symbol} style={{ width: 180 }} onChange={setSymbol} options={availableSymbols} showSearch />
          <Select value={timeframe} style={{ width: 120 }} onChange={setTimeframe} options={timeframeOptions} />
          <Button icon={isMonitoring ? <StopOutlined /> : <PlayCircleOutlined />} danger={isMonitoring} onClick={toggleMonitoring}>
            {isMonitoring ? 'Stop' : 'Start'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="summary-cards">
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card current-price">
            <Statistic title="Price" value={valuationMetrics.currentPrice} precision={2} suffix="USD" />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card fair-value" style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Fair Value" value={valuationMetrics.fairValue} precision={2} suffix="USD" />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card rating">
            <Statistic title="Rating" value={valuationMetrics.rating?.toUpperCase()} />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card market-cap">
            <Statistic title="Market Cap" value={fundamentals.marketCap} suffix="B" />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card pe-ratio">
            <Statistic title="P/E Ratio" value={valuationMetrics.peRatio} precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={4}>
          <Card className="summary-card factor-score">
            <Statistic title="Factor Score" value={factorModel.overallScore} precision={1} suffix="/10" />
          </Card>
        </Col>
      </Row>

      <Card className="equity-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={<Button icon={<DownloadOutlined />}>Export</Button>}>
          <TabPane tab={<span><FieldNumberOutlined /> Fundamentals</span>} key="fundamentals">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Key Financial Metrics" className="financials-card">
                  {loading.fundamentals ? <Spin /> : (
                    <div className="financials-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div className="metric-item"><span className="label">Revenue (TTM):</span> <span className="value">${fundamentals.revenue?.toFixed(2)}B</span></div>
                      <div className="metric-item"><span className="label">Net Income:</span> <span className="value">${fundamentals.netIncome?.toFixed(2)}B</span></div>
                      <div className="metric-item"><span className="label">Gross Margin:</span> <span className="value">{(fundamentals.grossMargin * 100)?.toFixed(1)}%</span></div>
                      <div className="metric-item"><span className="label">Op. Margin:</span> <span className="value">{(fundamentals.operatingMargin * 100)?.toFixed(1)}%</span></div>
                      <div className="metric-item"><span className="label">ROE:</span> <span className="value">{(fundamentals.roe * 100)?.toFixed(1)}%</span></div>
                      <div className="metric-item"><span className="label">ROIC:</span> <span className="value">{(fundamentals.roic * 100)?.toFixed(1)}%</span></div>
                    </div>
                  )}
                </Card>
                <Card title="Performance History" style={{ marginTop: 24 }}>
                   <Line {...financialsChartConfig} height={350} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Company Profile">
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={80}>{symbol}</Avatar>
                    <h3 style={{ marginTop: 12 }}>{fundamentals.companyName}</h3>
                    <Space><Tag color="blue">{fundamentals.sector}</Tag><Tag color="purple">{fundamentals.industry}</Tag></Space>
                  </div>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="CEO">{fundamentals.ceo}</Descriptions.Item>
                    <Descriptions.Item label="Employees">{fundamentals.employees?.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="52W High">${fundamentals.week52High?.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="52W Low">${fundamentals.week52Low?.toFixed(2)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><DollarCircleOutlined /> Valuation</span>} key="valuation">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}><Card title="Current Valuation"><Pie {...valuationChartConfig} height={300} /></Card></Col>
              <Col xs={24} lg={12}><Card title="Valuation History"><Line {...historicalValuationConfig} height={300} /></Card></Col>
              <Col xs={24}><Card title="Valuation Metrics">
                <Row gutter={16}>
                  {valuationMetricsData.map((m, i) => (
                    <Col span={4} key={i}><Statistic title={m.title} value={m.value} precision={2} valueStyle={{ color: m.color }} /></Col>
                  ))}
                </Row>
              </Card></Col>
              <Col xs={24}>
                <Card title="Peer Group Comparison">
                   <Table dataSource={peerGroup} columns={[
                     { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
                     { title: 'P/E', dataIndex: 'peRatio', key: 'pe', render: v => v?.toFixed(2) },
                     { title: 'P/B', dataIndex: 'pbRatio', key: 'pb', render: v => v?.toFixed(2) },
                     { title: 'ROIC', dataIndex: 'roic', key: 'roic', render: v => (v * 100).toFixed(1) + '%' }
                   ]} pagination={false} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HeatMapOutlined /> Factor Modeling</span>} key="factors">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Factor Exposure Matrix"><Heatmap {...factorExposureConfig} height={400} /></Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Factor Scores">
                  <List dataSource={factorMetricsData} renderItem={item => (
                    <List.Item>
                      <Statistic title={item.title} value={item.value} suffix={item.suffix} valueStyle={{ color: item.color, fontSize: '16px' }} />
                    </List.Item>
                  )} />
                </Card>
                <Card title="Factor Simulation" style={{ marginTop: 24 }}>
                  <Form layout="vertical">
                    <Form.Item label="Factors"><Select mode="multiple" options={factorOptions} defaultValue={['value', 'quality']} /></Form.Item>
                    <Button type="primary" block icon={<ExperimentOutlined />}>Run Simulation</Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginTop: 16 }} />}
    </div>
  );
};

export default EquityAnalysisPage;
