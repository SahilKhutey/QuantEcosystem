// src/components/Risk/RiskDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Space, Button, Select } from 'antd';
import { DashboardOutlined, WarningOutlined, HeatMapOutlined, AreaChartOutlined } from '@ant-design/icons';
import { globalRiskAPI } from '../../api/globalRisk';
import RiskSummary from './RiskSummary';
import HazardIndicator from './HazardIndicator';
import ExposureBar from './ExposureBar';
import RiskMatrix from './RiskMatrix';
import VolatilityChart from './VolatilityChart';
import CorrelationMatrix from './CorrelationMatrix';
import RiskTrendChart from './RiskTrendChart';
import RiskAlerts from './RiskAlerts';
import './Risk.css';

const { TabPane } = Tabs;

const RiskDashboard = ({ 
  title = "Risk Management Dashboard",
  portfolioId = "default", // Added a default ID for robustness
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  timeframe = '1y',
  onTimeframeChange
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [riskData, setRiskData] = useState({});
  const [hazardData, setHazardData] = useState({ market: {}, credit: {}, liquidity: {}, volatility: {} });
  const [exposureData, setExposureData] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [volatilityData, setVolatilityData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingState, setLoadingState] = useState(loading);
  const [errorState, setErrorState] = useState(error);
  const [timeframeState, setTimeframeState] = useState(timeframe);

  // Timeframe options
  const timeframeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  // Fetch risk data on component mount and timeframe changes
  useEffect(() => {
    fetchData();
  }, [timeframeState, portfolioId]);

  const fetchData = async () => {
    setLoadingState(true);
    setErrorState(null);
    
    try {
      const responses = await Promise.allSettled([
        globalRiskAPI.getPortfolioRisk(portfolioId, timeframeState),
        globalRiskAPI.getHazardIndicators(portfolioId, timeframeState),
        globalRiskAPI.getExposureLevels(portfolioId, timeframeState),
        globalRiskAPI.getRiskMatrix(portfolioId, timeframeState),
        globalRiskAPI.getVolatilityMetrics(portfolioId, timeframeState),
        globalRiskAPI.getCorrelationMatrix(portfolioId, timeframeState),
        globalRiskAPI.getRiskTrend(portfolioId, timeframeState),
        globalRiskAPI.getRiskAlerts(portfolioId, timeframeState)
      ]);

      // Process responses
      if (responses[0].status === 'fulfilled') setRiskData(responses[0].value.data || {});
      if (responses[1].status === 'fulfilled') setHazardData(responses[1].value.data || { market: {}, credit: {}, liquidity: {}, volatility: {} });
      if (responses[2].status === 'fulfilled') setExposureData(responses[2].value.data || []);
      if (responses[3].status === 'fulfilled') setMatrixData(responses[3].value.data || []);
      if (responses[4].status === 'fulfilled') setVolatilityData(responses[4].value.data || []);
      if (responses[5].status === 'fulfilled') setCorrelationData(responses[5].value.data || []);
      if (responses[6].status === 'fulfilled') setTrendData(responses[6].value.data || []);
      if (responses[7].status === 'fulfilled') setAlerts(responses[7].value.data || []);

      setLoadingState(false);
    } catch (err) {
      setErrorState('Failed to load risk data');
      console.error('Risk dashboard fetch error:', err);
      setLoadingState(false);
    }
  };

  const handleTimeframeChange = (value) => {
    setTimeframeState(value);
    if (onTimeframeChange) {
      onTimeframeChange(value);
    }
  };

  return (
    <div className={`risk-dashboard ${className}`} style={{ padding: '24px', background: '#f0f2f5', ...style }}>
      <Card className="risk-header" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...cardStyle }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="dashboard-title" style={{ fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            {title}
          </div>
          
          <div className="dashboard-controls">
            <Space>
              <Select
                value={timeframeState}
                onChange={handleTimeframeChange}
                options={timeframeOptions}
                style={{ width: 150 }}
              />
              <Button type="primary" danger icon={<WarningOutlined />}>
                Risk Alerts
              </Button>
              <Button icon={<HeatMapOutlined />}>
                Heatmap
              </Button>
              <Button icon={<AreaChartOutlined />}>
                Full Report
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="dashboard-tabs">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="Summary" key="summary">
              <RiskSummary 
                data={riskData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Hazard Indicators" key="hazards">
              <div className="hazard-grid" style={{ paddingTop: '16px' }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <HazardIndicator 
                      type="market" 
                      data={hazardData.market} 
                      title="Market Risk" 
                      color="#ff4d4f"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <HazardIndicator 
                      type="credit" 
                      data={hazardData.credit} 
                      title="Credit Risk" 
                      color="#faad14"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <HazardIndicator 
                      type="liquidity" 
                      data={hazardData.liquidity} 
                      title="Liquidity Risk" 
                      color="#1890ff"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <HazardIndicator 
                      type="volatility" 
                      data={hazardData.volatility} 
                      title="Volatility Risk" 
                      color="#722ed1"
                    />
                  </Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="Exposure" key="exposure">
              <ExposureBar 
                data={exposureData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Risk Matrix" key="matrix">
              <RiskMatrix 
                data={matrixData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Volatility" key="volatility">
              <VolatilityChart 
                data={volatilityData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Correlation" key="correlation">
              <CorrelationMatrix 
                data={correlationData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Risk Trend" key="trend">
              <RiskTrendChart 
                data={trendData} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Risk Alerts" key="alerts">
              <RiskAlerts 
                alerts={alerts} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default RiskDashboard;
