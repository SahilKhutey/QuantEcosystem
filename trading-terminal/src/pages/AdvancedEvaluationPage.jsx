import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Progress, Tabs, List, Divider, Tooltip, Alert, Statistic, Modal, Form, Select, DatePicker } from 'antd';
import { 
  AreaChartOutlined, 
  DotChartOutlined, 
  LineChartOutlined, 
  BarChartOutlined, 
  ExperimentOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  ProjectOutlined,
  BranchesOutlined,
  CloudSyncOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { Area, Line, Heatmap, Scatter, Bullet } from '@ant-design/plots';
import { backtestAPI } from '../services/api/backtest';
import MetricCard from '../components/Analytics/MetricCard';
import './AdvancedEvaluationPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AdvancedEvaluationPage = () => {
  const [activeTab, setActiveTab] = useState('walk-forward');
  const [isSimulating, setIsSimulating] = useState(false);

  const wfData = useMemo(() => {
    const assets = ['AAPL', 'BTC', 'ETH', 'TSLA', 'GOLD'];
    const params = ['W:10', 'W:20', 'W:50', 'W:100'];
    return assets.flatMap(a => params.map(p => ({
      asset: a,
      param: p,
      stability: 0.5 + Math.random() * 0.4
    })));
  }, []);

  const mcPaths = useMemo(() => {
    return Array.from({ length: 50 }).flatMap((_, pathIdx) => {
      let val = 100000;
      return Array.from({ length: 20 }).map((__, step) => {
        val *= (1 + np.random.normal(0.0005, 0.01));
        return { path: `Path ${pathIdx}`, step, value: val };
      });
    });
  }, []);

  const stressResults = [
    { scenario: '2008 Financial Crisis', impact: -24.5, recovery: '420d', status: 'critical' },
    { scenario: '2020 COVID Crash', impact: -18.2, recovery: '95d', status: 'critical' },
    { scenario: 'Flash Crash (5min)', impact: -4.5, recovery: '0.5d', status: 'warning' },
    { scenario: 'Rate Hike +2% (Aggressive)', impact: -12.4, recovery: '180d', status: 'warning' }
  ];

  return (
    <div className="advanced-eval-page">
      <div className="eval-header">
        <Title level={2}><SafetyCertificateOutlined /> Advanced Backtest & Evaluation Hub</Title>
        <Space>
          <Button icon={<ProjectOutlined />}>Configure Cross-Validation</Button>
          <Button type="primary" icon={<ExperimentOutlined />} loading={isSimulating} onClick={() => setIsSimulating(true)}>
            Execute Composite Audit
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <MetricCard title="Composite Health Score" value={86} icon={<SafetyCertificateOutlined />} color="#52c41a" suffix="/100" />
        </Col>
        <Col span={6}>
          <MetricCard title="Walk-Forward Stability" value={0.82} icon={<BranchesOutlined />} color="#1890ff" precision={2} />
        </Col>
        <Col span={6}>
          <MetricCard title="Prob. of Ruin (MC)" value="1.4%" icon={<ThunderboltOutlined />} color="#ff4d4f" />
        </Col>
        <Col span={6}>
          <MetricCard title="Sharpe Confidence" value="95%" icon={<AuditOutlined />} color="#722ed1" />
        </Col>

        <Col span={24}>
          <Card className="eval-content-card">
             <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><BranchesOutlined /> Walk-Forward Stability Matrix</span>} key="walk-forward">
                  <Row gutter={24}>
                    <Col span={16}>
                       <Title level={4}>Stability Heatmap: Parametric Robustness Across Time-Windows</Title>
                       <div style={{ height: 450 }}>
                          <Heatmap 
                            data={wfData}
                            xField="asset"
                            yField="param"
                            colorField="stability"
                            color={['#f5222d', '#faad14', '#52c41a']}
                            label={{
                               style: { fill: '#fff' },
                               formatter: (d) => d.stability.toFixed(2)
                            }}
                          />
                       </div>
                    </Col>
                    <Col span={8}>
                       <Card title="Optimization Audit" size="small">
                          <Paragraph style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Walk-forward analysis verifies if strategy parameters remain stable as new market regimes emerge.
                          </Paragraph>
                          <Divider />
                          <Statistic title="Anchored OOS Return" value={14.2} suffix="%" valueStyle={{ color: '#52c41a' }} />
                          <Divider />
                          <Statistic title="Parameter Lifetime" value="14.5 days" />
                       </Card>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab={<span><AreaChartOutlined /> Monte Carlo Stress-Simulations</span>} key="monte-carlo">
                   <Row gutter={24}>
                      <Col span={16}>
                         <Title level={4}>Probabilistic Equity Distribution (10,000 Iterations)</Title>
                         <div style={{ height: 450 }}>
                            <Line 
                              data={mcPaths}
                              xField="step"
                              yField="value"
                              seriesField="path"
                              smooth
                              lineStyle={{ opacity: 0.1, lineWidth: 1 }}
                              legend={false}
                              title="Path Resampling Simulation"
                            />
                         </div>
                      </Col>
                      <Col span={8}>
                         <Card title="Distribution Metrics" size="small">
                            <Statistic title="Median Final Equity" value={142500} prefix="$" />
                            <Divider />
                            <Statistic title="5th Percentile Drawdown" value={-22.4} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
                            <Divider />
                            <Statistic title="Risk of Ruin" value={0.014} precision={3} valueStyle={{ color: '#52c41a' }} />
                         </Card>
                      </Col>
                   </Row>
                </TabPane>

                <TabPane tab={<span><DotChartOutlined /> Tail-Risk Stress Matrix</span>} key="stress">
                   <Row gutter={24}>
                     <Col span={24}>
                        <Table 
                          dataSource={stressResults}
                          columns={[
                            { title: 'Scenario', dataIndex: 'scenario', render: (t) => <strong>{t}</strong> },
                            { title: 'Portfolio Impact', dataIndex: 'impact', render: (v) => <Tag color={v < -15 ? 'red' : 'orange'}>{v}%</Tag> },
                            { title: 'Recovery Duration', dataIndex: 'recovery' },
                            { title: 'Severity', dataIndex: 'status', render: (s) => <Badge status={s === 'critical' ? 'error' : 'warning'} text={s.toUpperCase()} /> },
                            { title: 'Action', render: () => <Button size="small">Run Deep Audit</Button> }
                          ]}
                          pagination={false}
                        />
                     </Col>
                   </Row>
                </TabPane>
             </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedEvaluationPage;
