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
  Timeline,
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
  List,
  Typography
} from 'antd';
import { 
  StockOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FundProjectionScreenOutlined,
  DollarCircleOutlined,
  FireOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  SettingOutlined,
  EyeOutlined,
  LikeOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { stockAnalysisAPI } from '../services/api/stockAnalysis';
import './StockAnalysisPage.css';

const { TabPane } = Tabs;
const { Search } = Input;
const { Title, Text } = Typography;

const StockAnalysisPage = () => {
  // State Management
  const [stockInfo, setStockInfo] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [technicalIndicators, setTechnicalIndicators] = useState([]);
  const [fundamentals, setFundamentals] = useState({});
  const [newsSentiment, setNewsSentiment] = useState({ recentNews: [], sentimentTrend: [] });
  const [optionsChain, setOptionsChain] = useState({ chain: [] });
  const [analystRatings, setAnalystRatings] = useState({ history: [] });
  const [ownership, setOwnership] = useState({});
  const [institutionalHoldings, setInstitutionalHoldings] = useState([]);
  const [dividendInfo, setDividendInfo] = useState({});
  const [peerComparison, setPeerComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionModalVisible, setOptionModalVisible] = useState(false);

  useEffect(() => {
    fetchStockData(selectedSymbol);
  }, [selectedSymbol]);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled([
        stockAnalysisAPI.getStockInfo(symbol),
        stockAnalysisAPI.getHistoricalData(symbol),
        stockAnalysisAPI.getTechnicalIndicators(symbol),
        stockAnalysisAPI.getFundamentals(symbol),
        stockAnalysisAPI.getNewsSentiment(symbol),
        stockAnalysisAPI.getOptionsChain(symbol),
        stockAnalysisAPI.getAnalystRatings(symbol),
        stockAnalysisAPI.getOwnership(symbol),
        stockAnalysisAPI.getPeerComparison(symbol),
        stockAnalysisAPI.getInstitutionalHoldings(symbol),
        stockAnalysisAPI.getDividendInfo(symbol)
      ]);

      if (responses[0].status === 'fulfilled') setStockInfo(responses[0].value.data);
      if (responses[1].status === 'fulfilled') setHistoricalData(responses[1].value.data || []);
      if (responses[2].status === 'fulfilled') setTechnicalIndicators(responses[2].value.data || []);
      if (responses[3].status === 'fulfilled') setFundamentals(responses[3].value.data || {});
      if (responses[4].status === 'fulfilled') setNewsSentiment(responses[4].value.data || { recentNews: [], sentimentTrend: [] });
      if (responses[5].status === 'fulfilled') setOptionsChain(responses[5].value.data || { chain: [] });
      if (responses[6].status === 'fulfilled') setAnalystRatings(responses[6].value.data || { history: [] });
      if (responses[7].status === 'fulfilled') setOwnership(responses[7].value.data || {});
      if (responses[8].status === 'fulfilled') setPeerComparison(responses[8].value.data || []);
      if (responses[9].status === 'fulfilled') setInstitutionalHoldings(responses[9].value.data || []);
      if (responses[10].status === 'fulfilled') setDividendInfo(responses[10].value.data || {});

    } catch (err) {
      console.error('Failed to orchestrate stock intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    return num?.toLocaleString();
  };

  const analystPieConfig = useMemo(() => ({
    data: [
      { type: 'Buy', value: analystRatings.buy || 0 },
      { type: 'Hold', value: analystRatings.hold || 0 },
      { type: 'Sell', value: analystRatings.sell || 0 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
  }), [analystRatings]);

  const ownershipConfig = useMemo(() => ({
    data: [
      { type: 'Institutional', value: ownership.institutional || 0 },
      { type: 'Insiders', value: ownership.insiders || 0 },
      { type: 'Public', value: ownership.public || 0 }
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
  }), [ownership]);

  if (loading) return <div className="loading-container"><Spin size="large" tip="Orchestrating Market Intelligence..." /></div>;

  return (
    <div className="stock-analysis-page">
      <div className="analysis-header">
        <Space size="large">
          <Title level={2} style={{ margin: 0 }}>{stockInfo.companyName} ({stockInfo.symbol})</Title>
          <Search placeholder="Search Ticker..." onSearch={setSelectedSymbol} style={{ width: 250 }} size="large" enterButton />
        </Space>
        <div className="header-metrics">
          <Statistic title="Price" value={stockInfo.price} prefix="$" valueStyle={{ color: stockInfo.change >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 700 }} />
          <Statistic title="24h Change" value={stockInfo.change} prefix={stockInfo.change >= 0 ? '+' : ''} suffix={`(${stockInfo.percentChange}%)`} valueStyle={{ color: stockInfo.change >= 0 ? '#52c41a' : '#ff4d4f' }} />
          <Statistic title="Market Cap" value={stockInfo.marketCap} formatter={v => formatNumber(v)} />
        </div>
      </div>

      <Card className="analysis-content-card" style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><BarChartOutlined />Overview</span>} key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Historical Performance" size="small"><Area data={historicalData} xField="date" yField="close" height={350} /></Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Key Fundamentals" size="small">
                  <div className="key-metrics">
                    <div className="metric-item"><span>P/E Ratio</span><strong>{stockInfo.peRatio}</strong></div>
                    <div className="metric-item"><span>EPS</span><strong>${fundamentals.eps}</strong></div>
                    <div className="metric-item"><span>ROE</span><strong>{(fundamentals.roe * 100).toFixed(1)}%</strong></div>
                    <div className="metric-item"><span>Div Yield</span><strong>{stockInfo.dividendYield}%</strong></div>
                  </div>
                </Card>
                <Card title="Analyst Ratings" size="small" style={{ marginTop: 16 }}>
                  <Pie {...analystPieConfig} height={180} />
                  <div style={{ textAlign: 'center', marginTop: 8 }}><Tag color="blue">{analystRatings.summary}</Tag></div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><UserOutlined />Analyst Detail</span>} key="analysts">
             <Table dataSource={analystRatings.history} columns={[
               { title: 'Date', dataIndex: 'date', render: d => formatDate(d) },
               { title: 'Buy', dataIndex: 'buy' },
               { title: 'Hold', dataIndex: 'hold' },
               { title: 'Sell', dataIndex: 'sell' },
               { title: 'Consensus', dataIndex: 'consensus', render: v => <Tag color={v === 'Strong Buy' ? 'green' : 'blue'}>{v}</Tag> },
               { title: 'Target', dataIndex: 'targetPrice', render: v => `$${v}` }
             ]} pagination={{ pageSize: 8 }} size="small" />
          </TabPane>

          <TabPane tab={<span><TeamOutlined />Ownership</span>} key="ownership">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}><Card title="Ownership Structure"><Pie {...ownershipConfig} height={350} /></Card></Col>
              <Col xs={24} lg={8}>
                <Card title="Top Institutions">
                  <Table dataSource={institutionalHoldings.slice(0, 5)} columns={[{ title: 'Name', dataIndex: 'name' }, { title: 'Shares', dataIndex: 'shares', render: v => formatNumber(v) }]} pagination={false} size="small" />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><GlobalOutlined />Peer Comparison</span>} key="peers">
            <Table dataSource={peerComparison} columns={[
              { title: 'Company', dataIndex: 'symbol', render: (s, r) => <div><strong>{s}</strong><br/><small>{r.name}</small></div> },
              { title: 'Market Cap', dataIndex: 'marketCap', render: v => formatNumber(v) },
              { title: 'P/E', dataIndex: 'peRatio' },
              { title: 'Div Yield', dataIndex: 'dividendYield', render: v => `${(v * 100).toFixed(1)}%` },
              { title: 'ROE', dataIndex: 'roe', render: v => `${(v * 100).toFixed(1)}%` }
            ]} pagination={false} size="small" />
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Option Analysis" open={optionModalVisible} onCancel={() => setOptionModalVisible(false)} footer={null}>
        {selectedOption && <div><h3>Strike: ${selectedOption.strike}</h3><Divider /><div>Type: {selectedOption.type}</div><div>IV: {selectedOption.iv}%</div></div>}
      </Modal>
    </div>
  );
};

export default StockAnalysisPage;
