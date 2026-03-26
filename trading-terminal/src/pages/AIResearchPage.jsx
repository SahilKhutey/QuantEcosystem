import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Alert, Modal, Empty, Comment, Avatar } from 'antd';
import { 
  RobotOutlined, 
  SearchOutlined, 
  MessageOutlined, 
  LineChartOutlined, 
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  DeploymentUnitOutlined,
  BulbOutlined,
  PieChartOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  CloudUploadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes, Chord } from '@ant-design/plots';
import { aiResearchAPI } from '../services/api/ai_research';
import MetricCard from '../components/Analytics/MetricCard';
import './AIResearchPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const AIResearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState('AI_INFRA');
  const [analysisText, setAnalysisText] = useState('');

  const clusterData = [
    { theme: 'Gen AI', symbol: 'NVDA', value: 85, vol: 35 },
    { theme: 'Gen AI', symbol: 'MSFT', value: 72, vol: 22 },
    { theme: 'Yield Sens.', symbol: 'JPM', value: 65, vol: 18 },
    { theme: 'Yield Sens.', symbol: 'GS', value: 58, vol: 20 },
    { theme: 'Energy Frag.', symbol: 'XOM', value: 92, vol: 40 },
    { theme: 'Energy Frag.', symbol: 'CVX', value: 88, vol: 38 }
  ];

  const handleResearchTrigger = (value) => {
     setLoading(true);
     setTimeout(() => {
        setAnalysisText(`Deep Analysis for ${value}: Stock presents a strong bullish divergence on the weekly time-frame. Sentiment is overwhelmingly positive (+0.82) following the recent Q3 guidance beat. Institutional accumulation detected in Dark Pools. Recommend overweight position with 1.2x beta adjustment (aligning with 'ai_analyst.py').`);
        setLoading(false);
     }, 2000);
  };

  return (
    <div className="ai-research-page">
      <div className="research-header">
        <Title level={2}><RobotOutlined /> AI Institutional Research Console</Title>
        <Space>
           <Button icon={<CloudUploadOutlined />}>Upload Internal Reports</Button>
           <Button type="primary" icon={<ExperimentOutlined />}>Trigger Thematic Sweep</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Research Terminal */}
        <Col span={15}>
           <Card title="Executive AI Analyst Terminal" className="research-card shadow-sm">
              <Search 
                placeholder="Ask about a stock or theme (e.g., 'Analyze NVDA against peer group', 'Impact of Rate Cut on Tech')" 
                enterButton="Generate Research" 
                size="large"
                onSearch={handleResearchTrigger}
                loading={loading}
              />
              <Divider />
              {analysisText ? (
                <div className="ai-output">
                   <Comment
                    author={<Text strong>Lead AI Strategist (GPT-4)</Text>}
                    avatar={<Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    content={<Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>{analysisText}</Paragraph>}
                    datetime={<Tooltip title={new Date().toLocaleTimeString()}><Text type="secondary">{new Date().toLocaleTimeString()}</Text></Tooltip>}
                   />
                   <Row gutter={16} style={{ marginTop: 24 }}>
                      <Col span={8}>
                         <Card size="small" title="Technical Outlook" className="mini-card">
                            <Tag color="green">BULLISH DIVERGENCE</Tag>
                            <Paragraph style={{ fontSize: '11px', marginTop: 8 }}>RSI: 42. MACD: Crossover confirmed.</Paragraph>
                         </Card>
                      </Col>
                      <Col span={8}>
                         <Card size="small" title="News Sentiment" className="mini-card">
                            <Progress type="circle" percent={82} strokeColor="#52c41a" width={60} />
                            <div style={{ marginTop: 8 }}>High institutional coverage.</div>
                         </Card>
                      </Col>
                      <Col span={8}>
                         <Card size="small" title="Scenario Impact" className="mini-card">
                            <Statistic title="VaR Impact" value={2.4} suffix="%" valueStyle={{ fontSize: 18 }} />
                         </Card>
                      </Col>
                   </Row>
                </div>
              ) : (
                <Empty description="Enter a symbol to begin institutional AI research" />
              )}
           </Card>
        </Col>

        {/* Thematic Intelligence */}
        <Col span={9}>
           <Card title="Thematic Market Topology" className="research-card shadow-sm">
              <div style={{ height: 350 }}>
                 <Scatter 
                    data={clusterData}
                    xField="vol"
                    yField="value"
                    colorField="theme"
                    size={20}
                    shape="circle"
                    pointStyle={{ fillOpacity: 0.6 }}
                 />
              </div>
              <Paragraph style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', marginTop: 16 }}>
                 Clusters identified by NLP entity-mapping (aligning with `news_analyzer.py`). X: Volatility, Y: Alpha Sensitivity.
              </Paragraph>
           </Card>

           <Card title="Thematic Exposure Alerts" className="research-card shadow-sm" style={{ marginTop: 24 }}>
              <List
                size="small"
                dataSource={[
                  { title: 'Yield Curve Inversion', impact: 'Serious', status: 'Active' },
                  { title: 'Gen AI Overheat', impact: 'Moderate', status: 'Rising' },
                  { title: 'Logistics Fragility', impact: 'High', status: 'Stabilizing' }
                ]}
                renderItem={item => (
                  <List.Item>
                     <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{item.title}</Text>
                        <Tag color={item.impact === 'Serious' ? 'red' : 'orange'}>{item.impact}</Tag>
                     </div>
                  </List.Item>
                )}
              />
           </Card>
        </Col>

        {/* Diagnostic Reports */}
        <Col span={24}>
           <Card title={<Space><SearchOutlined /> Historic AI Research Archive</Space>} className="research-card shadow-sm">
              <Table 
                 size="small"
                 dataSource={[
                   { key: '1', date: '2026-03-24', asset: 'NVDA', rating: 'BUY', target: '$1240', confidence: '92%' },
                   { key: '2', date: '2026-03-22', asset: 'TSLA', rating: 'HOLD', target: '$180', confidence: '74%' },
                   { key: '3', date: '2026-03-20', asset: 'BTC/USD', rating: 'STRONG BUY', target: '$82,000', confidence: '88%' }
                 ]}
                 columns={[
                    { title: 'Report Date', dataIndex: 'date', key: 'date' },
                    { title: 'Asset Vector', dataIndex: 'asset', key: 'asset', render: (t) => <Text strong>{t}</Text> },
                    { title: 'AI Rating', dataIndex: 'rating', key: 'rating', render: (r) => <Tag color={r.includes('BUY') ? 'green' : 'gold'}>{r}</Tag> },
                    { title: 'Target Level', dataIndex: 'target', key: 'target' },
                    { title: 'Algorithmic Confidence', dataIndex: 'confidence', key: 'confidence' }
                 ]}
                 pagination={false}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIResearchPage;
