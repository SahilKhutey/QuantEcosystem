import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  List, 
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
  Input,
  Avatar,
  Divider,
  Timeline,
  Statistic,
  Switch,
  Dropdown,
  Menu,
  Modal,
  Form,
  DatePicker
} from 'antd';
import { 
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  TwitterOutlined,
  RedditOutlined,
  YoutubeOutlined,
  LinkedinOutlined,
  GlobalOutlined,
  FilterOutlined,
  SearchOutlined,
  StarOutlined,
  ShareAltOutlined,
  BookOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  RetweetOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, WordCloud } from '@ant-design/plots';
import { newsAPI } from '../services/api/news';
import './NewsPage.css';

const { TabPane } = Tabs;
const { Search } = Input;

const NewsPage = () => {
  // State Management
  const [newsFeed, setNewsFeed] = useState([]);
  const [socialTrends, setSocialTrends] = useState([]);
  const [assetSentiment, setAssetSentiment] = useState({});
  const [marketMovingNews, setMarketMovingNews] = useState([]);
  const [sentimentTimeline, setSentimentTimeline] = useState({ data: [] });
  const [newsSources, setNewsSources] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState({ news: true, social: true, sentiment: true, market: true, timeline: true, sources: true, topics: true });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('news');
  const [newsFilters, setNewsFilters] = useState({ category: 'all', sentiment: 'all', timeframe: '24h' });
  const [socialPlatform, setSocialPlatform] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);

  const wsRef = useRef(null);

  const availableAssets = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

  useEffect(() => {
    fetchData();
  }, [newsFilters, socialPlatform, selectedAsset]);

  const fetchData = async () => {
    setLoading({ news: true, social: true, sentiment: true, market: true, timeline: true, sources: true, topics: true });
    try {
      const responses = await Promise.allSettled([
        newsAPI.getNewsFeed(newsFilters),
        newsAPI.getSocialTrends(socialPlatform, newsFilters.timeframe),
        newsAPI.getAssetSentiment(availableAssets),
        newsAPI.getMarketMovingNews('high'),
        newsAPI.getSentimentTimeline(selectedAsset, '7d'),
        newsAPI.getNewsSources(),
        newsAPI.getTrendingTopics(newsFilters.timeframe)
      ]);

      if (responses[0].status === 'fulfilled') setNewsFeed(responses[0].value.data);
      if (responses[1].status === 'fulfilled') setSocialTrends(responses[1].value.data);
      if (responses[2].status === 'fulfilled') setAssetSentiment(responses[2].value.data);
      if (responses[3].status === 'fulfilled') setMarketMovingNews(responses[3].value.data);
      if (responses[4].status === 'fulfilled') setSentimentTimeline(responses[4].value.data);
      if (responses[5].status === 'fulfilled') setNewsSources(responses[5].value.data);
      if (responses[6].status === 'fulfilled') setTrendingTopics(responses[6].value.data);

      setLoading({ news: false, social: false, sentiment: false, market: false, timeline: false, sources: false, topics: false });
    } catch (err) {
      setError('Failed to orchestrate intelligence feeds.');
    }
  };

  const sentimentTimelineConfig = useMemo(() => ({
    data: sentimentTimeline.data || [],
    xField: 'date', yField: 'sentiment', smooth: true,
    point: { size: 4, shape: 'circle' },
    yAxis: { min: -1, max: 1 }
  }), [sentimentTimeline]);

  const wordCloudConfig = useMemo(() => ({
    data: trendingTopics.map(t => ({ text: t.topic, value: t.mentions || t.volume || 10 })),
    wordField: 'text', weightField: 'value', colorField: 'text',
    wordStyle: { fontSize: [20, 60] }
  }), [trendingTopics]);

  const getSentimentProps = (sentiment) => {
    if (sentiment > 0.5) return { color: '#52c41a', icon: <RiseOutlined />, label: 'Bullish' };
    if (sentiment < -0.1) return { color: '#ff4d4f', icon: <FallOutlined />, label: 'Bearish' };
    return { color: '#faad14', icon: <GlobalOutlined />, label: 'Neutral' };
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <h1><ThunderboltOutlined /> Market Intelligence & News</h1>
        <div className="header-controls">
          <Badge count={marketMovingNews.length} showZero><Button icon={<ThunderboltOutlined />} type="primary">Breaking</Button></Badge>
          <Switch checked={isMonitoring} onChange={() => setIsMonitoring(!isMonitoring)} checkedChildren="Live" unCheckedChildren="Static" style={{ marginRight: 16 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Card className="filters-card" size="small">
        <Space wrap>
          <Search placeholder="Search news..." style={{ width: 250 }} onSearch={v => console.log(v)} />
          <Select value={newsFilters.category} style={{ width: 150 }} onChange={v => setNewsFilters(p => ({ ...p, category: v }))} options={[{ value: 'all', label: 'All Categories' }, { value: 'macro', label: 'Macro' }]} />
          <Select value={newsFilters.timeframe} style={{ width: 120 }} onChange={v => setNewsFilters(p => ({ ...p, timeframe: v }))} options={[{ value: '24h', label: 'Last 24h' }, { value: '7d', label: 'Last 7d' }]} />
        </Space>
      </Card>

      <Row gutter={[24, 24]} className="sentiment-cards" style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Bullish Assets" value={5} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Bearish Assets" value={2} prefix={<FallOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Mentions (24h)" value={12540} prefix={<CommentOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Sentiment Alpha" value={4.2} suffix="%" precision={1} /></Card></Col>
      </Row>

      <Card className="news-content-card" style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={<Space>{activeTab === 'sentiment' && <Select value={selectedAsset} onChange={setSelectedAsset} options={availableAssets.map(a => ({ value: a, label: a }))} style={{ width: 150 }} />}</Space>}>
          <TabPane tab={<span><GlobalOutlined />News Feed</span>} key="news">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <List dataSource={newsFeed} loading={loading.news} renderItem={item => (
                  <List.Item className={`news-item ${item.impact === 'High' ? 'breaking-news' : ''}`} actions={[<Button type="link" onClick={() => { setSelectedNews(item); setNewsModalVisible(true); }}>View</Button>]}>
                    <List.Item.Meta title={item.title} description={<div className="news-meta"><span>{item.source}</span><span>{item.timestamp}</span><Tag color={getSentimentProps(item.sentiment_score).color}>{getSentimentProps(item.sentiment_score).label}</Tag></div>} />
                    <div className="news-summary">{item.summary}</div>
                  </List.Item>
                )} pagination={{ pageSize: 10 }} />
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Market Moving News">
                  <Timeline>{marketMovingNews.map((n, i) => <Timeline.Item key={i} color="red" dot={<ThunderboltOutlined />}>{n.title}</Timeline.Item>)}</Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><TwitterOutlined />Social Trends</span>} key="social">
             <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}><Card title="Social Sentiment Trends">{loading.social ? <Spin /> : <WordCloud {...wordCloudConfig} height={400} />}</Card></Col>
                <Col xs={24} lg={8}>
                   <Card title="Trending Topics">{socialTrends.map((t, i) => (
                     <div key={i} className="platform-item"><span>{t.topic}</span><Badge count={t.mentions} overflowCount={99999} style={{ backgroundColor: '#52c41a' }} /></div>
                   ))}</Card>
                </Col>
             </Row>
          </TabPane>

          <TabPane tab={<span><RiseOutlined />Sentiment Analysis</span>} key="sentiment">
             <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}><Card title={`Sentiment Timeline: ${selectedAsset}`}>{loading.timeline ? <Spin /> : <Line {...sentimentTimelineConfig} height={400} />}</Card></Col>
                <Col xs={24} lg={8}>
                   <Card title="Asset Sentiment Breakdown">{Object.entries(assetSentiment).map(([s, d]) => (
                     <div key={s} className="asset-sentiment-item"><div>{s}</div><Progress percent={((d.score + 1) / 2) * 100} size="small" strokeColor={getSentimentProps(d.score).color} /></div>
                   ))}</Card>
                </Col>
             </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Intelligence Briefing" open={newsModalVisible} onCancel={() => setNewsModalVisible(false)} footer={null}>
        {selectedNews && <div><h3>{selectedNews.title}</h3><p>{selectedNews.summary}</p><Divider /><div className="news-detail-meta"><span>Source: {selectedNews.source}</span><br /><span>Category: {selectedNews.category}</span></div></div>}
      </Modal>
    </div>
  );
};

export default NewsPage;
