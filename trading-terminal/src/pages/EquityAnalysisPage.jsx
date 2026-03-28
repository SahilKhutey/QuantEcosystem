// src/pages/EquityAnalysisPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Card, Row, Col, Table, Tabs, Select, Button, Spin, Alert, Tag, Space, 
  Tooltip, Progress, Badge, Descriptions, Statistic, Input, Avatar, 
  Divider, Switch, Dropdown, Menu, Modal, Form, DatePicker, 
  InputNumber, Checkbox, Collapse, List 
} from 'antd';
import { 
  FundProjectionScreenOutlined, BarChartOutlined, LineChartOutlined, 
  PieChartOutlined, StockOutlined, DollarCircleOutlined, CalendarOutlined, 
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, 
  DownloadOutlined, FilterOutlined, SearchOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, 
  WarningOutlined, ThunderboltOutlined, SafetyCertificateOutlined, 
  ExperimentOutlined, HeatMapOutlined, FieldNumberOutlined, 
  StopOutlined, PlayCircleOutlined 
} from '@ant-design/icons';
import { Line, Column, Pie, Heatmap, DualAxes } from '@ant-design/plots';
import { equityAnalysisAPI } from '../services/api/equityAnalysis';
import './EquityAnalysisPage.css';

const { TabPane } = Tabs;
const { useForm } = Form;

const EquityAnalysisPage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [fundamentals, setFundamentals] = useState({});
  const [valuationMetrics, setValuationMetrics] = useState({});
  const [factorModel, setFactorModel] = useState({});
  const [historicalValuation, setHistoricalValuation] = useState({});
  const [peerGroup, setPeerGroup] = useState([]);
  const [factorExposures, setFactorExposures] = useState({});
  const [financials, setFinancials] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [timeframe, setTimeframe] = useState('5y');

  const availableSymbols = [
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft Corporation' },
    { value: 'GOOGL', label: 'Alphabet Inc.' }
  ];

  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled([
        equityAnalysisAPI.getCompanyFundamentals(symbol),
        equityAnalysisAPI.getValuationMetrics(symbol),
        equityAnalysisAPI.getFactorModel(symbol),
        equityAnalysisAPI.getHistoricalValuation(symbol, timeframe),
        equityAnalysisAPI.getPeerGroup(symbol),
        equityAnalysisAPI.getFactorExposures(symbol),
        equityAnalysisAPI.getFinancials(symbol, timeframe)
      ]);

      if (responses[0].status === 'fulfilled') setFundamentals(responses[0].value.data || {});
      if (responses[1].status === 'fulfilled') setValuationMetrics(responses[1].value.data || {});
      if (responses[2].status === 'fulfilled') setFactorModel(responses[2].value.data || {});
      if (responses[3].status === 'fulfilled') setHistoricalValuation(responses[3].value.data || {});
      if (responses[4].status === 'fulfilled') setPeerGroup(responses[4].value.data || []);
      if (responses[5].status === 'fulfilled') setFactorExposures(responses[5].value.data || {});
      if (responses[6].status === 'fulfilled') setFinancials(responses[6].value.data || {});

      setLoading(false);
    } catch (err) {
      setError('Failed to orchestrate intelligence feeds.');
      setLoading(false);
    }
  };

  const financialsChartConfig = useMemo(() => ({
    data: [
      ...(financials.revenueHistory?.map(d => ({ ...d, type: 'Revenue' })) || []),
      ...(financials.netIncomeHistory?.map(d => ({ ...d, type: 'Net Income' })) || [])
    ],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
  }), [financials]);

  return (
    <div className="equity-analysis-page">
      <div className="equity-header">
        <h1><StockOutlined /> Institutional Equity Analytics</h1>
        <Space>
          <Select value={symbol} style={{ width: 180 }} onChange={setSymbol} options={availableSymbols} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh Feed</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card><Statistic title="Target Price" value={valuationMetrics.fairValue} precision={2} prefix="$" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Alpha Potential" value={12.4} suffix="%" valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Factor Conviction" value={factorModel.overallScore} precision={1} suffix="/10" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Institutional Flow" value={840} prefix="$" suffix="M" /></Card>
        </Col>

        <Col span={24}>
          <Card title="Historical Performance Archetype">
            <Line {...financialsChartConfig} height={400} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EquityAnalysisPage;
