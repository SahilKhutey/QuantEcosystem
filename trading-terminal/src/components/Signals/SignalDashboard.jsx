// src/components/Signals/SignalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Space, Button, Select } from 'antd';
import { SignalOutlined, AlertOutlined } from '@ant-design/icons';
import SignalIndicator from './SignalIndicator';
import ConfidenceTicker from './ConfidenceTicker';
import SignalStrengthBar from './SignalStrengthBar';
import SignalHistory from './SignalHistory';
import SignalAlerts from './SignalAlerts';
import SignalMetrics from './SignalMetrics';
import './Signals.css';

const { TabPane } = Tabs;

const SignalDashboard = ({ 
  title = "Signal Monitoring Dashboard",
  signalType = "technical",
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  onSignalTypeChange,
  onTimeframeChange,
  onConfidenceChange,
  onAlertResolve
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [signalTypeState, setSignalTypeState] = useState(signalType);
  const [timeframe, setTimeframe] = useState('1h');
  const [confidenceLevel, setConfidenceLevel] = useState(0.75);
  const [signalData, setSignalData] = useState({
    signalStrength: 0.85,
    confidence: 0.75,
    direction: 'bullish',
    source: 'technical',
    timestamp: new Date().toISOString(),
    history: [],
    alerts: [],
    metrics: {
      accuracy: 0.78,
      winRate: 0.65,
      avgHoldingPeriod: 5.2,
      sharpeRatio: 1.8
    }
  });

  // Signal type options
  const signalTypes = [
    { value: 'technical', label: 'Technical Indicators' },
    { value: 'fundamental', label: 'Fundamental Analysis' },
    { value: 'sentiment', label: 'Market Sentiment' },
    { value: 'ai', label: 'AI Prediction' },
    { value: 'news', label: 'News Analysis' }
  ];

  // Timeframe options
  const timeframes = [
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' }
  ];

  useEffect(() => {
    const fetchData = () => {
      // Simulate data fetch
      setSignalData(prev => ({
        ...prev,
        signalStrength: Math.random() * 0.5 + 0.5,
        confidence: Math.random() * 0.4 + 0.6,
        direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        timestamp: new Date().toISOString()
      }));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, [signalTypeState, timeframe]);

  const handleSignalTypeChange = (value) => {
    setSignalTypeState(value);
    if (onSignalTypeChange) onSignalTypeChange(value);
  };

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    if (onTimeframeChange) onTimeframeChange(value);
  };

  return (
    <div className={`signal-dashboard ${className}`} style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh', ...style }}>
      <Card className="signal-header" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...cardStyle }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="dashboard-title" style={{ fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <SignalOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            {title}
          </div>
          
          <div className="dashboard-controls">
            <Space>
              <Select value={signalTypeState} onChange={handleSignalTypeChange} options={signalTypes} style={{ width: 200 }} />
              <Select value={timeframe} onChange={handleTimeframeChange} options={timeframes} style={{ width: 150 }} />
              <Button type="primary" icon={<AlertOutlined />}>Signal Alerts</Button>
            </Space>
          </div>
        </div>
        
        <div className="dashboard-tabs">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="Overview" key="overview">
              <div className="dashboard-overview" style={{ paddingTop: '16px' }}>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <SignalIndicator 
                      strength={signalData.signalStrength} 
                      direction={signalData.direction} 
                      source={signalData.source}
                      timestamp={signalData.timestamp}
                    />
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <ConfidenceTicker confidence={confidenceLevel} title="Signal Confidence" />
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <SignalMetrics metrics={signalData.metrics} />
                  </Col>
                  
                  <Col span={24}>
                    <SignalStrengthBar 
                      strength={signalData.signalStrength} 
                      direction={signalData.direction}
                      title="Signal Strength"
                    />
                  </Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="History" key="history">
              <SignalHistory history={signalData.history} title="Signal History" />
            </TabPane>
            
            <TabPane tab="Alerts" key="alerts">
              <SignalAlerts alerts={signalData.alerts} onResolve={onAlertResolve} />
            </TabPane>
            
            <TabPane tab="Performance" key="performance">
              <div className="performance-metrics" style={{ paddingTop: '16px' }}>
                <Row gutter={[24, 24]}>
                  {[
                    { title: 'Accuracy', value: `${(signalData.metrics.accuracy * 100).toFixed(1)}%`, color: signalData.metrics.accuracy > 0.75 ? '#52c41a' : '#faad14' },
                    { title: 'Win Rate', value: `${(signalData.metrics.winRate * 100).toFixed(1)}%`, color: signalData.metrics.winRate > 0.65 ? '#52c41a' : '#faad14' },
                    { title: 'Avg. Holding', value: `${signalData.metrics.avgHoldingPeriod.toFixed(1)} days`, color: '#1890ff' },
                    { title: 'Sharpe Ratio', value: signalData.metrics.sharpeRatio.toFixed(2), color: signalData.metrics.sharpeRatio > 1.5 ? '#52c41a' : '#1890ff' }
                  ].map((m, i) => (
                    <Col xs={12} lg={6} key={i}>
                      <Card style={{ textAlign: 'center', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{m.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: m.color }}>{m.value}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default SignalDashboard;
