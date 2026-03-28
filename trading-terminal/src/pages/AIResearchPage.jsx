import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Input, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Statistic, Form, Select, Alert, Modal, Empty, Avatar } from 'antd';
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
import { Area, Column, Line, Pie, Radar, Scatter, Heatmap, DualAxes } from '@ant-design/plots';
import { aiResearchAPI } from '../services/api/ai_research';
import MetricCard from '../components/Analytics/MetricCard';
import './AIResearchPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const AIResearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState('AI_INFRA');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clusterData, setClusterData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await aiResearchAPI.getThematicClusters();
        if (res.status === 'success') {
          setClusterData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch thematic clusters:", err);
      }
    };
    fetchThemes();
  }, []);

  const handleResearchTrigger = async (value) => {
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiResearchAPI.analyzeStock(value);
      if (res.status === 'success') {
        setAnalysisResult(res.data);
      } else {
        setError(res.message || "Failed to generate research");
      }
    } catch (err) {
      setError("Network error: Institutional API connectivity failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
              {analysisResult ? (
                <div className="ai-output">
                   <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.1)' }}>
                      <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1d4ed8', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text strong style={{ color: '#f0f6fc' }}>Lead AI Strategist (Core-Engine)</Text>
                            <Tooltip title={analysisResult.timestamp}><Text type="secondary" style={{ fontSize: 11 }}>{new Date(analysisResult.timestamp).toLocaleTimeString()}</Text></Tooltip>
                         </div>
                         <Paragraph style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: 0, color: '#e6edf3' }}>{analysisResult.analysisText}</Paragraph>
                      </div>
                   </div>
                   <Row gutter={16} style={{ marginTop: 24 }}>
                      <Col span={8}>
                         <Card size="small" title="Technical Outlook" className="mini-card dark-card">
                            <Tag color={analysisResult.sentiment === 'Bullish' ? 'green' : 'red'}>{analysisResult.technicalOutlook}</Tag>
                            <Paragraph style={{ fontSize: '11px', marginTop: 8, color: '#8b949e' }}>Confidence: {analysisResult.sentimentScore}%</Paragraph>
                         </Card>
                      </Col>
                      <Col span={8}>
                         <Card size="small" title="Sentiment Score" className="mini-card dark-card">
                            <Progress 
                              type="circle" 
                              percent={analysisResult.sentimentScore} 
                              strokeColor={analysisResult.sentiment === 'Bullish' ? '#10b981' : '#ef4444'} 
                              width={60} 
                              trailColor="rgba(255,255,255,0.05)"
                            />
                         </Card>
                      </Col>
                      <Col span={8}>
                         <Card size="small" title="Scenario Impact" className="mini-card dark-card">
                            <Statistic 
                              title="VaR Impact (Est)" 
                              value={analysisResult.varImpact} 
                              suffix="%" 
                              valueStyle={{ fontSize: 18, color: '#3b82f6' }} 
                            />
                         </Card>
                      </Col>
                   </Row>
                </div>
              ) : (
                <Empty description={<span style={{ color: '#8b949e' }}>Enter a symbol to begin institutional AI research</span>} />
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
