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
  Timeline,
  Statistic,
  Input,
  Switch,
  Typography,
  Avatar,
  Divider,
  Drawer
} from 'antd';
import { 
  GlobalOutlined,
  BarChartOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  FundProjectionScreenOutlined,
  CalendarOutlined,
  BankOutlined,
  PropertySafetyOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SearchOutlined,
  FilterOutlined,
  NotificationOutlined,
  DatabaseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Heatmap, Column, Line, Scatter } from '@ant-design/plots';
import { globalMarketAPI } from '../services/api/globalMarket';
import './GlobalMarketPage.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Search } = Input;

const GlobalMarketPage = () => {
  // State Management
  const [globalOverview, setGlobalOverview] = useState({ 
    sp500: { price: 5200.5, change24h: 45.3, change24hPct: 0.85 },
    nasdaq: { price: 16400.2, change24h: 195.4, change24hPct: 1.20 },
    dow: { price: 39400.1, change24h: 120.5, change24hPct: 0.31 },
    gold: { price: 2170.5, change24h: 12.4, change24hPct: 0.57 },
    oil: { price: 81.2, change24h: -0.65, change24hPct: -0.80 },
    bitcoin: { price: 65000.0, change24h: 1200.5, change24hPct: 1.88 },
    usdIndex: { value: 104.2, change24h: 0.15 },
    portfolioCorrelation: 0.45
  });
  const [correlations, setCorrelations] = useState([]);
  const [macroeconomicData, setMacroeconomicData] = useState({});
  const [marketSentiment, setMarketSentiment] = useState({ fearGreedIndex: 72, fearGreedLabel: 'Greed', fearGreedDescription: 'Market participants are optimistic.' });
  const [economicCalendar, setEconomicCalendar] = useState([]);
  const [sectorPerformance, setSectorPerformance] = useState([]);
  const [commodityPrices, setCommodityPrices] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [bondYields, setBondYields] = useState([]);
  const [volatilitySurface, setVolatilitySurface] = useState({ surface: [] });
  const [centralBankPolicies, setCentralBankPolicies] = useState([]);
  const [loading, setLoading] = useState({ overview: true, correlations: true, macro: true, sentiment: true, calendar: true, sectors: true, commodities: true, currencies: true, bonds: true, volatility: true, policies: true });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [marketNews, setMarketNews] = useState([]);
  const [correlationFilters, setCorrelationFilters] = useState({ assets: ['SPY', 'TLT', 'GLD', 'USO', 'BTC/USD'], timeframe: '30d' });
  const [sentimentFilters, setSentimentFilters] = useState({ assets: ['SPY', 'QQQ', 'BTC'] });
  const [newsDrawerVisible, setNewsDrawerVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading({ overview: true, correlations: true, macro: true, sentiment: true, calendar: true, sectors: true, commodities: true, currencies: true, bonds: true, volatility: true, policies: true });
    try {
      const responses = await Promise.allSettled([
        globalMarketAPI.getGlobalOverview(),
        globalMarketAPI.getAssetCorrelations(correlationFilters.assets, correlationFilters.timeframe),
        globalMarketAPI.getMacroeconomicData(),
        globalMarketAPI.getMarketSentiment(sentimentFilters.assets),
        globalMarketAPI.getEconomicCalendar(),
        globalMarketAPI.getSectorPerformance(selectedRegion),
        globalMarketAPI.getCommodityPrices(),
        globalMarketAPI.getCurrencyData(),
        globalMarketAPI.getBondYields(),
        globalMarketAPI.getVolatilitySurface('SPY'),
        globalMarketAPI.getCentralBankPolicies()
      ]);

      if (responses[0].status === 'fulfilled') setGlobalOverview(prev => ({ ...prev, ...responses[0].value.data }));
      if (responses[1].status === 'fulfilled') setCorrelations(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setMacroeconomicData(responses[2].value.data);
      if (responses[3].status === 'fulfilled') setMarketSentiment(prev => ({ ...prev, ...responses[3].value.data }));
      if (responses[4].status === 'fulfilled') setEconomicCalendar(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setSectorPerformance(responses[5].value.data);
      if (responses[6].status === 'fulfilled') setCommodityPrices(responses[6].value.data);
      if (responses[7].status === 'fulfilled') setCurrencyData(responses[7].value.data);
      if (responses[8].status === 'fulfilled') setBondYields(responses[8].value.data);
      if (responses[9].status === 'fulfilled') setVolatilitySurface(responses[9].value.data);
      if (responses[10].status === 'fulfilled') setCentralBankPolicies(responses[10].value.data);

      setLoading({ overview: false, correlations: false, macro: false, sentiment: false, calendar: false, sectors: false, commodities: false, currencies: false, bonds: false, volatility: false, policies: false });
    } catch (err) {
      setError('Failed to load global market data');
    }
  }, [correlationFilters, selectedRegion, sentimentFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper function for economic health score
  const calculateHealthScore = (data) => {
    let score = 50;
    const gdpValue = parseFloat(data.gdp) || 0;
    const inflationValue = parseFloat(data.inflation) || 0;
    const unemploymentValue = parseFloat(data.unemployment) || 0;

    if (gdpValue > 3) score += 15;
    else if (gdpValue > 0) score += 5;
    else score -= 10;

    if (inflationValue > 5) score -= 15;
    else if (inflationValue > 3) score -= 5;

    if (unemploymentValue > 6) score -= 10;
    else if (unemploymentValue < 4) score += 5;

    return Math.max(0, Math.min(100, score));
  };

  const overviewCards = useMemo(() => [
    { title: 'S&P 500', value: globalOverview.sp500?.price, change: globalOverview.sp500?.change24h, changePct: globalOverview.sp500?.change24hPct, icon: <BarChartOutlined />, color: '#52c41a' },
    { title: 'NASDAQ', value: globalOverview.nasdaq?.price, change: globalOverview.nasdaq?.change24h, changePct: globalOverview.nasdaq?.change24hPct, icon: <LineChartOutlined />, color: '#52c41a' },
    { title: 'DOW JONES', value: globalOverview.dow?.price, change: globalOverview.dow?.change24h, changePct: globalOverview.dow?.change24hPct, icon: <FundProjectionScreenOutlined />, color: '#52c41a' },
    { title: 'GOLD', value: globalOverview.gold?.price, change: globalOverview.gold?.change24h, changePct: globalOverview.gold?.change24hPct, icon: <PropertySafetyOutlined />, color: '#faad14' },
    { title: 'OIL (WTI)', value: globalOverview.oil?.price, change: globalOverview.oil?.change24h, changePct: globalOverview.oil?.change24hPct, icon: <DatabaseOutlined />, color: '#ff4d4f' },
    { title: 'BITCOIN', value: globalOverview.bitcoin?.price, change: globalOverview.bitcoin?.change24h, changePct: globalOverview.bitcoin?.change24hPct, icon: <DollarOutlined />, color: '#1890ff' }
  ], [globalOverview]);

  const heatmapConfig = useMemo(() => ({
    data: correlations, xField: 'asset1', yField: 'asset2', colorField: 'correlation',
    color: ['#ff4d4f', '#ffffff', '#1890ff'],
  }), [correlations]);

  const sectorColumns = [
    { title: 'Sector', dataIndex: 'sector', key: 'sector' },
    { title: 'Performance', dataIndex: 'change', key: 'change', sorter: (a, b) => a.change - b.change, render: v => <span className={v >= 0 ? 'positive' : 'negative'}>{v >= 0 ? <RiseOutlined /> : <FallOutlined />} {v}%</span> },
    { title: 'Weight', dataIndex: 'weight', key: 'weight', render: v => `${(v * 100).toFixed(1)}%` }
  ];

  const calendarColumns = [
    { title: 'Date/Time', dataIndex: 'date', key: 'date', sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    { title: 'Event', dataIndex: 'event', key: 'event', render: (t, r) => <Space><Avatar size="small" src={`/flags/${r.country?.toLowerCase()}.png`} />{t}</Space> },
    { title: 'Impact', dataIndex: 'impact', key: 'impact', render: v => <Tag color={v === 'High' ? 'red' : 'blue'}>{v}</Tag> },
    { title: 'Forecast', dataIndex: 'forecast', key: 'forecast' },
    { title: 'Actual', dataIndex: 'actual', key: 'actual', render: v => v || '---' }
  ];

  const commodityColumns = [
    { title: 'Commodity', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', align: 'right', render: v => `$${v?.toLocaleString()}` },
    { title: 'Change 24h', dataIndex: 'change', align: 'right', render: v => <span className={v >= 0 ? 'positive' : 'negative'}>{v}%</span> }
  ];

  return (
    <div className="global-market-page">
      <div className="market-header">
        <Title level={2}><GlobalOutlined /> Global Markets Dashboard</Title>
        <div className="header-controls">
          <Badge count={marketNews.length} showZero><Button icon={<NotificationOutlined />} type="primary" onClick={() => setNewsDrawerVisible(true)}>Market News</Button></Badge>
          <Switch checked={isMonitoring} onChange={setIsMonitoring} checkedChildren="Live" unCheckedChildren="Static" style={{ margin: '0 16px' }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="overview-cards">
        {overviewCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={4} key={idx}>
            <Card className="overview-card" loading={loading.overview}>
              <div className="card-header"><div className="card-icon" style={{ color: card.color }}>{card.icon}</div><div className="card-title">{card.title}</div></div>
              <div className="card-value">${card.value?.toLocaleString()}</div>
              <div className={`card-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                {card.change >= 0 ? <RiseOutlined /> : <FallOutlined />} {card.changePct}%
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="market-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
          activeTab === 'correlations' ? (
            <Space>
              <Select mode="multiple" value={correlationFilters.assets} style={{ width: 250 }} onChange={v => setCorrelationFilters(p => ({ ...p, assets: v }))} options={['SPY', 'QQQ', 'BTC', 'GLD', 'TLT', 'USO'].map(a => ({ value: a, label: a }))} />
              <Select value={correlationFilters.timeframe} onChange={v => setCorrelationFilters(p => ({ ...p, timeframe: v }))} options={[{ value: '30d', label: '30 Days' }, { value: '90d', label: '90 Days' }]} />
            </Space>
          ) : null
        }>
          <TabPane tab={<span><FundProjectionScreenOutlined />Overview</span>} key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Sector Performance Matrix"><Column data={sectorPerformance} xField="sector" yField="change" colorField="sector" /></Card>
                <Card title="Volatility Surface (SPY)" style={{ marginTop: 24 }}>
                   <Scatter data={volatilitySurface.surface || []} xField="strike" yField="impliedVolatility" colorField="expiration" size={4} height={350} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Fear & Greed Index" className="fear-greed-card">
                   <div style={{ textAlign: 'center' }}>
                    <Progress type="circle" percent={marketSentiment.fearGreedIndex} strokeColor={marketSentiment.fearGreedIndex > 50 ? '#52c41a' : '#ff4d4f'} width={120} />
                     <Title level={3}>{marketSentiment.fearGreedIndex}/100</Title>
                     <Text strong>{marketSentiment.fearGreedLabel}</Text>
                     <p>{marketSentiment.fearGreedDescription}</p>
                   </div>
                </Card>
                <Card title="Market Leaders" style={{ marginTop: 16 }}>
                   {globalOverview.indices?.slice(0, 4).map(idx => (
                     <div key={idx.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <Text strong>{idx.name}</Text>
                       <Text className={idx.change >= 0 ? 'positive' : 'negative'}>{idx.change}%</Text>
                     </div>
                   ))}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HeatMapOutlined />Correlations</span>} key="correlations">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={18}><Card title="Correlation Matrix"><Heatmap {...heatmapConfig} height={500} /></Card></Col>
              <Col xs={24} lg={6}>
                <Card title="Diversification Insights" className="insights-card">
                   <div className="insight-recommendation">
                     <h4>Advice</h4>
                     <p>{globalOverview.portfolioCorrelation > 0.6 ? 'High portfolio correlation detected. Consider safe havens like Gold or TLT.' : 'Portfolio is well-diversified.'}</p>
                   </div>
                   <Divider />
                   <div className="insight-item"><Text type="secondary">Avg Correlation</Text><div>42.5%</div></div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BankOutlined />Macro Indicators</span>} key="macro">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={16}>
                  <Card title="Global Economic Indicators">
                    <Table dataSource={Object.entries(macroeconomicData).map(([k, v]) => ({ key: k, country: k, ...v }))}
                           columns={[
                             { title: 'Country', dataIndex: 'country', render: c => <Space><Avatar size="small" src={`/flags/${c.toLowerCase()}.png`} />{c}</Space> },
                             { title: 'GDP', dataIndex: 'gdp', render: v => <span className={v >= 0 ? 'positive' : 'negative'}>{v}%</span> },
                             { title: 'Inflation', dataIndex: 'inflation' },
                             { title: 'Rates', dataIndex: 'interest_rate' }
                           ]} pagination={false} />
                  </Card>
               </Col>
               <Col xs={24} lg={8}>
                  <Card title="Central Bank Policies">
                    {centralBankPolicies.map(p => (
                      <div key={p.bank} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong>{p.bank}</Text><Tag color="blue">{p.stance}</Tag></div>
                        <Text type="secondary">Next Meeting: {p.next_meeting}</Text>
                      </div>
                    ))}
                  </Card>
                  <Card title="Economic Health Scores" style={{ marginTop: 16 }}>
                     {Object.entries(macroeconomicData).map(([k, v]) => (
                       <div key={k} style={{ marginBottom: 8 }}>
                         <Text>{k}</Text><Progress percent={calculateHealthScore(v)} size="small" />
                       </div>
                     ))}
                  </Card>
               </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><PropertySafetyOutlined />Commodities</span>} key="commodities">
             <Row gutter={[24, 24]}>
               <Col xs={24} lg={16}><Card title="Commodity Table"><Table dataSource={commodityPrices} columns={commodityColumns} pagination={false} /></Card></Col>
               <Col xs={24} lg={8}>
                  <Card title="Energy Summary">
                     {commodityPrices.filter(c => c.name.includes('Crude') || c.name.includes('Natural')).map(c => (
                       <Statistic key={c.name} title={c.name} value={c.price} prefix="$" suffix={<Text className={c.change >= 0 ? 'positive' : 'negative'} style={{ fontSize: 12, marginLeft: 8 }}>{c.change}%</Text>} />
                     ))}
                  </Card>
               </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><CalendarOutlined />Economic Calendar</span>} key="calendar">
             <Table dataSource={economicCalendar} columns={calendarColumns} pagination={{ pageSize: 10 }} />
          </TabPane>
        </Tabs>
      </Card>

      <Drawer title="Market News & Analysis" placement="right" onClose={() => setNewsDrawerVisible(false)} open={newsDrawerVisible} width={400}>
        <Timeline>
          {marketNews.map((n, i) => (
            <Timeline.Item key={i}><Text strong>{n.title}</Text><br /><Text type="secondary">{n.source} • {new Date(n.timestamp).toLocaleTimeString()}</Text></Timeline.Item>
          ))}
        </Timeline>
      </Drawer>

      {error && <Alert message="Error" description={error} type="error" showIcon closable style={{ marginTop: 16 }} />}
    </div>
  );
};

export default GlobalMarketPage;
