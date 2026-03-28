// src/pages/GlobalMarketDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Statistic,
  Modal,
  Form,
  DatePicker,
  Checkbox
} from 'antd';
import { 
  GlobalOutlined,
  HeatMapOutlined,
  LineChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { Line, Column, Heatmap } from '@ant-design/plots';
import { globalMarketAPI } from '../services/api/globalMarket';
import './GlobalMarketDashboard.css';

const { TabPane } = Tabs;
const { useForm } = Form;

const GlobalMarketDashboard = () => {
  // State Management
  const [globalData, setGlobalData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [correlations, setCorrelations] = useState({});
  const [loading, setLoading] = useState({
    global: true,
    sentiment: true,
    historical: true,
    correlations: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [timeframe, setTimeframe] = useState('24h');
  const [region, setRegion] = useState('global');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeConfig, setTimeConfig] = useState({
    timeframe: '24h',
    animationSpeed: 1,
    showTrend: true,
    includeVolatility: true
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryForm] = useForm();
  const [mapData, setMapData] = useState([]);

  const wsRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Available regions
  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
    { value: 'latam', label: 'Latin America' },
    { value: 'me', label: 'Middle East' },
    { value: 'africa', label: 'Africa' }
  ];

  // Timeframe options
  const timeframeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Animation speed options
  const speedOptions = [
    { value: 0.5, label: 'Slow' },
    { value: 1, label: 'Normal' },
    { value: 2, label: 'Fast' }
  ];

  // Connect to WebSocket for real-time updates
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

    const ws = globalMarketAPI.subscribeToMarketUpdates(handleWebSocketMessage);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Global Market WebSocket');
    };

    ws.onclose = () => {
      console.log('Global Market WebSocket disconnected');
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'market_update':
        setGlobalData(prev => ({ ...prev, ...data.payload }));
        break;
      case 'sentiment_update':
        setSentimentData(prev => ({ ...prev, ...data.payload }));
        break;
      case 'historical_update':
        setHistoricalData(prev => ({ ...prev, ...data.payload }));
        break;
      case 'correlation_update':
        setCorrelations(prev => ({ ...prev, ...data.payload }));
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount and parameter changes
  useEffect(() => {
    fetchData();
  }, [region, timeframe]);

  const fetchData = async () => {
    setLoading({
      global: true,
      sentiment: true,
      historical: true,
      correlations: true
    });
    setError(null);

    try {
      const responses = await Promise.allSettled([
        globalMarketAPI.getGlobalMarketData(timeframe),
        globalMarketAPI.getMarketSentiment(region, timeframe),
        globalMarketAPI.getHistoricalData(region, timeframe),
        globalMarketAPI.getMarketCorrelations(region)
      ]);

      // Process responses
      if (responses[0].status === 'fulfilled') {
        setGlobalData(responses[0].value.data || {});
        setLoading(prev => ({ ...prev, global: false }));
      }

      if (responses[1].status === 'fulfilled') {
        setSentimentData(responses[1].value.data || {});
        setLoading(prev => ({ ...prev, sentiment: false }));
      }

      if (responses[2].status === 'fulfilled') {
        setHistoricalData(responses[2].value.data || {});
        setLoading(prev => ({ ...prev, historical: false }));
      }

      if (responses[3].status === 'fulfilled') {
        setCorrelations(responses[3].value.data || {});
        setLoading(prev => ({ ...prev, correlations: false }));
      }

      // Check for any rejected promises
      const rejected = responses.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        setError('Some global market data failed to load. Please try refreshing.');
      }
    } catch (err) {
      setError('Failed to load global market data');
      setLoading({
        global: false,
        sentiment: false,
        historical: false,
        correlations: false
      });
    }
  };

  // Toggle real-time monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  // Handle country click on map
  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    const countryInfo = {
      ...country,
      marketData: globalData?.countries?.[country.id] || {}
    };
    setCountryData(countryInfo);
    setShowCountryModal(true);
  };

  // Run time animation
  const runTimeAnimation = async () => {
    try {
      const response = await globalMarketAPI.getHistoricalData(region, timeframe);
      setHistoricalData(response.data);
      setShowTimeModal(false);
    } catch (err) {
      setError('Failed to start time animation');
    }
  };

  // Market Sentiment Chart Configuration
  const sentimentChartConfig = useMemo(() => ({
    data: historicalData.sentimentHistory || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'region',
    smooth: true,
    lineStyle: ({ region }) => ({
      lineWidth: 3,
      stroke: region === 'global' ? '#1890ff' : region === 'na' ? '#52c41a' : '#faad14',
      lineDash: region === 'global' ? [0, 0] : [5, 5],
    }),
    point: {
      size: 4,
      shape: 'circle',
    },
    legend: {
      position: 'top',
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}%`,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.region,
          value: `${datum.value.toFixed(2)}%`,
        };
      },
    },
  }), [historicalData.sentimentHistory]);

  // Correlation Matrix Configuration
  const correlationConfig = useMemo(() => ({
    data: correlations.matrix || [],
    xField: 'region1',
    yField: 'region2',
    colorField: 'value',
    color: ({ value }) => {
      return value > 0.7 ? '#ff4d4f' :
             value > 0.3 ? '#faad14' :
             value > -0.3 ? '#52c41a' : '#1890ff';
    },
    legend: {
      position: 'right',
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: `${datum.region1} vs ${datum.region2}`,
          value: `Correlation: ${datum.value.toFixed(2)}`,
        };
      },
    },
  }), [correlations.matrix]);

  // Render map data update
  useEffect(() => {
    if (globalData.countries) {
      const countries = Object.keys(globalData.countries).map(country => ({
        id: country,
        name: globalData.countries[country].name || country,
        centroid: globalData.countries[country].centroid || [0, 0],
        sentiment: globalData.countries[country].sentiment || 0,
        marketValue: globalData.countries[country].marketValue || 0,
      }));
      
      setMapData(countries);
    }
  }, [globalData]);

  return (
    <div className="global-market-dashboard">
      <div className="market-header">
        <h1>
          <GlobalOutlined /> Global Market Intelligence
        </h1>
        <div className="header-controls">
          <Space>
            <Select
              value={region}
              style={{ width: 150 }}
              onChange={setRegion}
              options={regions}
            />
            <Select
              value={timeframe}
              style={{ width: 150 }}
              onChange={setTimeframe}
              options={timeframeOptions}
            />
            <Button 
              icon={isMonitoring ? <StopOutlined /> : <PlayCircleOutlined />} 
              danger={isMonitoring}
              type={isMonitoring ? 'default' : 'primary'}
              onClick={toggleMonitoring}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={Object.values(loading).some(l => l)}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      <Card className="market-content-card">
        <Tabs 
          defaultActiveKey="map" 
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              {activeTab === 'map' && (
                <Button 
                  type="primary" 
                  icon={<AreaChartOutlined />} 
                  onClick={() => setShowTimeModal(true)}
                >
                  Run Time Animation
                </Button>
              )}
              {activeTab === 'sentiment' && (
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => {}}
                >
                  Export Data
                </Button>
              )}
            </Space>
          }
        >
          <TabPane 
            tab={<span><HeatMapOutlined /> Global Market Map</span>} 
            key="map"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={18}>
                <Card 
                  title="Global Market Sentiment" 
                  className="map-card"
                  extra={
                    <Space>
                      <Tag color="blue">
                        {globalData.overallSentiment ? `${globalData.overallSentiment.toFixed(1)}%` : 'N/A'}
                      </Tag>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => {}}>
                        Add Overlay
                      </Button>
                    </Space>
                  }
                >
                  {loading.global ? (
                    <div className="map-loading"><Spin /></div>
                  ) : (
                    <div className="map-container" ref={mapContainerRef}>
                      <div className="map-viz-overlay">
                         <div className="viz-stats">
                            <Statistic title="Hot Nodes" value={4} prefix={<ThunderboltOutlined />} />
                            <Statistic title="Cold Nodes" value={12} prefix={<StopOutlined />} />
                         </div>
                      </div>
                      <div className="map-placeholder">
                        <Heatmap 
                           data={mapData.flatMap(c => [
                              { country: c.name, type: 'Sentiment', value: c.sentiment },
                              { country: c.name, type: 'Vol', value: Math.random() }
                           ])}
                           xField="country"
                           yField="type"
                           colorField="value"
                           color={['#1890ff', '#ffffff', '#ff4d4f']}
                           height={450}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={6}>
                <Card title="Sentiment Overview" className="sentiment-overview-card">
                  {loading.sentiment ? (
                    <div className="loading-container"><Spin /></div>
                  ) : (
                    <div className="sentiment-overview">
                      <div className="sentiment-metrics">
                        <Statistic title="Global Sentiment" value={globalData.overallSentiment || 0} suffix="%" valueStyle={{ color: globalData.overallSentiment > 0 ? '#52c41a' : '#ff4d4f' }} />
                        <Divider />
                        <Statistic title="Bullish Regions" value={globalData.bullishRegions || 0} suffix={`(${globalData.bullishPercentage?.toFixed(1) || 0}%)`} valueStyle={{ color: '#52c41a', fontSize: '18px' }} />
                        <Statistic title="Bearish Regions" value={globalData.bearishRegions || 0} suffix={`(${globalData.bearishPercentage?.toFixed(1) || 0}%)`} valueStyle={{ color: '#ff4d4f', fontSize: '18px' }} />
                        <Statistic title="Volatility" value={globalData.volatility || 0} precision={2} valueStyle={{ color: '#faad14', fontSize: '18px' }} />
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              <Col xs={24}>
                <Card title="Regional Sentiment Analysis" className="regional-analysis-card">
                  {loading.sentiment ? (
                    <div className="chart-loading"><Spin /></div>
                  ) : (
                    <div className="regional-analysis">
                      <Line {...sentimentChartConfig} height={400} />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={<span><LineChartOutlined /> Sentiment Analysis</span>} 
            key="sentiment"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Market Sentiment Trends" className="sentiment-trends-card">
                  {loading.sentiment ? (
                    <div className="chart-loading"><Spin /></div>
                  ) : (
                    <div className="sentiment-trends">
                      <Line {...sentimentChartConfig} height={400} />
                      <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col span={12}>
                          <Card size="small" title="Bullish Percentage">
                            <Statistic value={sentimentData.bullishPercentage || 0} suffix="%" valueStyle={{ color: '#52c41a' }} />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card size="small" title="Bearish Percentage">
                            <Statistic value={sentimentData.bearishPercentage || 0} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Correlation Matrix" className="correlation-matrix-card">
                  {loading.correlations ? (
                    <div className="chart-loading"><Spin /></div>
                  ) : (
                    <Heatmap {...correlationConfig} height={300} />
                  )}
                </Card>
              </Col>

              <Col xs={24}>
                <Card title="Market Conditions" className="market-conditions-card">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic title="Condition" value={sentimentData.marketConditions?.toUpperCase() || 'N/A'} valueStyle={{ color: '#faad14' }} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Volatility Index" value={sentimentData.volatility || 0} precision={2} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Liquidity" value={sentimentData.liquidity || 0} precision={2} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Risk Appetite" value={sentimentData.riskAppetite || 0} precision={2} />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={<span><BarChartOutlined /> Regional Analysis</span>} 
            key="regional"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Regional Performance & Capital Flow" className="regional-performance-card">
                  {loading.sentiment ? (
                    <div className="chart-loading"><Spin /></div>
                  ) : (
                    <DualAxes
                      data={[
                        Object.keys(globalData.regions || {}).map(region => ({
                          region: globalData.regions[region].name,
                          value: globalData.regions[region].performance,
                        })),
                        Object.keys(globalData.regions || {}).map(region => ({
                          region: globalData.regions[region].name,
                          flow: Math.random() * 1000 - 500,
                        }))
                      ]}
                      xField="region"
                      yField={['value', 'flow']}
                      geometryOptions={[
                        { geometry: 'column', color: '#1890ff' },
                        { geometry: 'line', color: '#52c41a', smooth: true }
                      ]}
                      height={400}
                    />
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Global Liquidity Distribution" className="regional-correlations-card">
                   <div style={{ height: 400 }}>
                      <Radar 
                        data={Object.keys(globalData.regions || {}).map(r => ({
                          name: globalData.regions[r].name,
                          value: Math.random() * 100
                        }))}
                        xField="name"
                        yField="value"
                        meta={{ value: { min: 0, max: 100 } }}
                        area={{ style: { fillOpacity: 0.3 } }}
                      />
                   </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={<span><HeatMapOutlined /> Cross-Asset Heat Map</span>} 
            key="asset-heat"
          >
             <Row gutter={[24, 24]}>
                <Col span={24}>
                   <Card title="Global Asset Class Correlation (Multi-Exchange Convergence)">
                      <Heatmap 
                        data={[
                           { a: 'Equities', b: 'Bonds', v: 0.45 },
                           { a: 'Equities', b: 'FX', v: -0.12 },
                           { a: 'Equities', b: 'Crypto', v: 0.78 },
                           { a: 'Bonds', b: 'FX', v: 0.32 },
                           { a: 'Bonds', b: 'Crypto', v: -0.45 },
                           { a: 'FX', b: 'Crypto', v: 0.15 }
                        ]}
                        xField="a"
                        yField="b"
                        colorField="v"
                        color={['#1890ff', '#ffffff', '#ff4d4f']}
                        height={450}
                        label={{
                           style: { fill: '#fff' },
                           formatter: (datum) => datum.v.toFixed(2)
                        }}
                      />
                   </Card>
                </Col>
             </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={countryData ? `${countryData.name} Market Details` : 'Country Details'}
        open={showCountryModal}
        onCancel={() => setShowCountryModal(false)}
        width={800}
        footer={null}
      >
        {countryData && (
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="Overview">
                <Statistic title="Sentiment" value={(countryData.sentiment * 100).toFixed(1)} suffix="%" />
                <Statistic title="Market Value" value={countryData.marketValue} prefix="$" />
                <Statistic title="Volatility" value={countryData.volatility} precision={2} />
              </Card>
            </Col>
            <Col span={16}>
              <Card title="Performance History">
                <Line
                  data={countryData.marketData?.performanceHistory || []}
                  xField="date"
                  yField="value"
                  height={250}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Modal>

      <Modal
        title="Time Animation Settings"
        open={showTimeModal}
        onCancel={() => setShowTimeModal(false)}
        onOk={runTimeAnimation}
        okText="Start Animation"
      >
        <Form layout="vertical">
          <Form.Item label="Time Range">
            <Select options={timeframeOptions} value={timeConfig.timeframe} onChange={v => setTimeConfig(p => ({...p, timeframe: v}))} />
          </Form.Item>
          <Form.Item label="Animation Speed">
            <Select options={speedOptions} value={timeConfig.animationSpeed} onChange={v => setTimeConfig(p => ({...p, animationSpeed: v}))} />
          </Form.Item>
        </Form>
      </Modal>

      {error && <Alert message="Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default GlobalMarketDashboard;
