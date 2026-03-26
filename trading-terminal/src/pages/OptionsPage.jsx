import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, InputNumber, Select, Form, Statistic, Divider, Badge, Tooltip, Progress } from 'antd';
import { 
  CalculatorOutlined, 
  DotChartOutlined, 
  RadarChartOutlined, 
  StockOutlined, 
  SlidersOutlined,
  AreaChartOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  ArrowsAltOutlined,
  NodeExpandOutlined,
  LineOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { Line, Heatmap, DualAxes, Area, Scatter } from '@ant-design/plots';
import { optionsAPI } from '../services/api/options';
import MetricCard from '../components/Analytics/MetricCard';
import './OptionsPage.css';

const OptionsPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [optionChain, setOptionChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calcParams, setCalcParams] = useState({
    underlying: 185.40,
    strike: 185.00,
    expiry: 30, // days
    volatility: 0.22,
    rate: 0.045
  });
  const [greeks, setGreeks] = useState({
    delta: 0.52,
    gamma: 0.08,
    theta: -0.15,
    vega: 0.24,
    rho: 0.05
  });

  useEffect(() => {
    fetchData();
  }, [selectedSymbol]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mocking data for now, replace with actual API calls
      const mockChain = Array.from({ length: 10 }).map((_, i) => ({
        strike: 180 + i * 2.5,
        callBid: 5.20 - i * 0.5,
        callAsk: 5.30 - i * 0.5,
        callVol: 1200 + i * 100,
        callOI: 5000 + i * 200,
        putBid: 1.20 + i * 0.5,
        putAsk: 1.30 + i * 0.5,
        putVol: 800 + i * 50,
        putOI: 3000 + i * 150,
        iv: 0.22 + i * 0.01
      }));
      setOptionChain(mockChain);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch options data", err);
    }
  };

  const greeksConfig = {
    data: [
      { type: 'Delta', value: greeks.delta },
      { type: 'Gamma', value: greeks.gamma },
      { type: 'Theta', value: Math.abs(greeks.theta) },
      { type: 'Vega', value: greeks.vega },
      { type: 'Rho', value: greeks.rho }
    ],
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ({ type }) => {
      if (type === 'Theta') return '#f5222d';
      return '#1890ff';
    }
  };

  const columns = [
    {
      title: 'Calls',
      children: [
        { title: 'Vol', dataIndex: 'callVol', key: 'callVol' },
        { title: 'OI', dataIndex: 'callOI', key: 'callOI' },
        { title: 'Bid', dataIndex: 'callBid', key: 'callBid', render: (val) => val.toFixed(2) },
        { title: 'Ask', dataIndex: 'callAsk', key: 'callAsk', render: (val) => val.toFixed(2) },
      ]
    },
    {
      title: 'Strike',
      dataIndex: 'strike',
      key: 'strike',
      align: 'center',
      render: (val) => <Tag color="blue" style={{ fontWeight: 800 }}>{val.toFixed(1)}</Tag>
    },
    {
      title: 'Puts',
      children: [
        { title: 'Bid', dataIndex: 'putBid', key: 'putBid', render: (val) => val.toFixed(2) },
        { title: 'Ask', dataIndex: 'putAsk', key: 'putAsk', render: (val) => val.toFixed(2) },
        { title: 'Vol', dataIndex: 'putVol', key: 'putVol' },
        { title: 'OI', dataIndex: 'putOI', key: 'putOI' },
      ]
    }
  ];

  return (
    <div className="options-page">
      <div className="options-header">
        <h1><CalculatorOutlined /> Options Intelligence Workbench</h1>
        <Space>
          <Select 
            value={selectedSymbol} 
            onChange={setSelectedSymbol}
            style={{ width: 120 }}
            options={['AAPL', 'TSLA', 'SPY', 'QQQ', 'BTC/USD'].map(s => ({ value: s, label: s }))}
          />
          <Button type="primary" icon={<ArrowsAltOutlined />}>IV Surface Analyst</Button>
          <Button icon={<DotChartOutlined />}>Strategy Builder</Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Greeks Dashboard */}
        <Col span={6}>
          <MetricCard title="Delta (Conviction)" value={greeks.delta.toFixed(3)} icon={<RadarChartOutlined />} color="#1890ff" />
        </Col>
        <Col span={6}>
          <MetricCard title="Theta (Time Decay)" value={greeks.theta.toFixed(3)} icon={<ThunderboltOutlined />} color="#f5222d" trend={-2.5} />
        </Col>
        <Col span={6}>
          <MetricCard title="Vega (Vol Sensitivity)" value={greeks.vega.toFixed(3)} icon={<AreaChartOutlined />} color="#722ed1" />
        </Col>
        <Col span={6}>
          <MetricCard title="Gamma (Accel)" value={greeks.gamma.toFixed(3)} icon={<SlidersOutlined />} color="#52c41a" />
        </Col>

        {/* Pricing Calculator */}
        <Col span={8}>
          <Card title={<span><CalculatorOutlined /> Black-Scholes Engine</span>}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}><Form.Item label="Underlying Price"><InputNumber prefix="$" style={{ width: '100%' }} value={calcParams.underlying} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Strike Price"><InputNumber prefix="$" style={{ width: '100%' }} value={calcParams.strike} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Days to Expiry"><InputNumber suffix="D" style={{ width: '100%' }} value={calcParams.expiry} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Implied Vol (%)"><InputNumber suffix="%" style={{ width: '100%' }} value={calcParams.volatility * 100} /></Form.Item></Col>
                <Col span={24}><Form.Item label="Risk-Free Rate (%)"><InputNumber suffix="%" style={{ width: '100%' }} value={calcParams.rate * 100} /></Form.Item></Col>
              </Row>
              <Button type="primary" block size="large" icon={<ExperimentOutlined />}>Recalculate Price</Button>
            </Form>
            <Divider />
            <div className="calc-results">
              <Statistic title="Theoretical Call Price" value={6.42} prefix="$" valueStyle={{ color: '#52c41a' }} />
              <Statistic title="Theoretical Put Price" value={4.15} prefix="$" valueStyle={{ color: '#1890ff' }} />
            </div>
          </Card>
        </Col>

        {/* Option Chain */}
        <Col span={16}>
          <Card 
            title={<span><StockOutlined /> Active Option Chain (Monthly Expiry)</span>}
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              dataSource={optionChain} 
              columns={columns} 
              pagination={false} 
              size="small" 
              loading={loading}
              className="option-chain-table"
            />
          </Card>
        </Col>

        {/* Analytics Section */}
        <Col span={12}>
          <Card title="Greeks Sensitivity Analysis">
            <Line 
              data={Array.from({ length: 20 }).map((_, i) => ({
                strike: 160 + i * 2,
                delta: 1 / (1 + Math.exp(-( (160 + i * 2) - 180 ) / 5)),
                gamma: Math.exp(-Math.pow((160 + i * 2) - 180, 2) / 20) / 10
              }))}
              xField="strike"
              yField="delta"
              smooth
              color="#1890ff"
              height={300}
              annotations={[{ type: 'line', start: [185.4, 'min'], end: [185.4, 'max'], style: { stroke: '#f5222d', lineDash: [4, 4] } }]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="IV Surface Dispersion (Heatmap)">
             <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                <Heatmap 
                  data={Array.from({ length: 5 }).flatMap((_, strike) => 
                    Array.from({ length: 5 }).map((_, time) => ({
                      strike: 170 + strike * 10,
                      expiry: 30 + time * 30,
                      iv: 0.15 + (Math.abs(strike - 2) * 0.05) + (time * 0.01)
                    }))
                  )}
                  xField="expiry"
                  yField="strike"
                  colorField="iv"
                  color={['#f6ffed', '#52c41a', '#237804']}
                  height={300}
                />
             </div>
          </Card>
        </Col>

        {/* Strategy Payoff Simulator */}
        <Col span={24}>
           <Card 
            title={<span><NodeExpandOutlined /> Multi-Leg Strategy Payoff Simulator</span>}
            extra={
              <Space>
                <Select defaultValue="bull_call_spread" style={{ width: 200 }}>
                  <Select.Option value="bull_call_spread">Bull Call Spread</Select.Option>
                  <Select.Option value="bear_put_spread">Bear Put Spread</Select.Option>
                  <Select.Option value="iron_condor">Iron Condor</Select.Option>
                  <Select.Option value="butterfly">Butterfly Spread</Select.Option>
                </Select>
                <Button type="primary" icon={<LineOutlined />}>Simulate P&L At Expiry</Button>
              </Space>
            }
           >
              <Row gutter={24}>
                <Col span={18}>
                   <div style={{ height: 400 }}>
                      <Area 
                        data={Array.from({ length: 100 }).map((_, i) => {
                          const spot = 170 + i * 0.4;
                          const strike1 = 180;
                          const strike2 = 190;
                          const cost = 2.50;
                          // Bull Call Spread payoff logic
                          const payoff = Math.max(0, Math.min(spot - strike1, strike2 - strike1)) - cost;
                          return { spot, payoff };
                        })}
                        xField="spot"
                        yField="payoff"
                        smooth
                        color="#52c41a"
                        areaStyle={{ fill: 'l(270) 0:#ffffff 0.5:#52c41a 1:#52c41a' }}
                        annotations={[
                          { type: 'line', start: [180 + 2.5, 'min'], end: [180 + 2.5, 'max'], style: { stroke: '#faad14', lineDash: [4, 4] }, label: { content: 'Breakeven' } },
                          { type: 'line', start: [185.4, 'min'], end: [185.4, 'max'], style: { stroke: '#1890ff' }, label: { content: 'Current Price' } }
                        ]}
                      />
                   </div>
                </Col>
                <Col span={6}>
                   <Card size="small" title="Strategy Audit">
                      <Statistic title="Max Profit" value={7.50} prefix="$" valueStyle={{ color: '#52c41a' }} />
                      <Statistic title="Max Loss" value={2.50} prefix="$" valueStyle={{ color: '#f5222d' }} />
                      <Statistic title="Risk/Reward" value="1:3" />
                      <Divider style={{ margin: '12px 0' }} />
                      <div className="signal-strength-list">
                         <span>Delta (Portfolio Neutral)</span>
                         <Progress percent={35} size="small" />
                         <span>Theta (Decay Benefit)</span>
                         <Progress percent={12} size="small" strokeColor="#f5222d" />
                      </div>
                   </Card>
                </Col>
              </Row>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OptionsPage;
