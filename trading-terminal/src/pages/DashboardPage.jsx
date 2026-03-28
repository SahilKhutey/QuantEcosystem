import React, { useState, useEffect } from 'react';
import { Row, Col, Space, Typography, Tag, Button } from 'antd';
import { 
  RocketOutlined, 
  DashboardOutlined, 
  LineChartOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined 
} from '@ant-design/icons';
import { DashboardLayout } from '../components/Dashboard';
import { MetricCard } from '../components/Analytics';
import { CandlestickChart, HeatmapChart } from '../components/Visualizations';
import { NewsSummary } from '../components/News';
import useAppStore from '../services/store/appStore';
import { useMarketData } from '../services/data/marketData';
import { runModelFusion } from '../services/api/quantEngine';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { selectedSymbol, portfolio } = useAppStore();
  const { prices, getLatestPrice } = useMarketData();
  const [fusion, setFusion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived Metrics
  const totalValue = (portfolio || []).reduce((acc, h) => {
    const qty = h?.qty || 0;
    const price = prices?.[h?.symbol] || h?.avg || 0;
    return acc + (qty * price);
  }, 0);
  const totalChange = 38420; // Mock change
  const changePct = 1.58;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    runModelFusion(selectedSymbol)
      .then(res => {
        if (isMounted) {
          setFusion(res || null);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Fusion signal failed:", err);
        if (isMounted) {
          setLoading(false);
          // Fallback or keep null
        }
      });

    // Prime indices
    ['^NSEI', '^BSESN'].forEach(getLatestPrice);
    
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Institutional Command Center</Title>
          <Text type="secondary">Real-time cross-asset intelligence & execution desk</Text>
        </div>
        <Space>
          <Tag color="cyan" icon={<ThunderboltOutlined />}>LIVE FEED ACTIVE</Tag>
          <Button type="primary" icon={<RocketOutlined />}>EXECUTE STRATEGY</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <MetricCard 
            title="Portfolio Net Liquidity" 
            value={`₹${(totalValue / 100000).toFixed(2)}L`}
            trend="+1.58%"
            isPositive={true}
            description="Across all managed sub-accounts"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Model Conviction" 
            value={fusion?.fusion_signal ? `${Math.round(fusion.fusion_signal * 100)}%` : '--'}
            trend="Strong"
            isPositive={true}
            description="Consensus signal: BULLISH"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Risk Exposure (VaR)" 
            value="-2.34%"
            trend="Stable"
            isPositive={false}
            description="95% Confidence Interval"
          />
        </Col>
        <Col span={6}>
          <MetricCard 
            title="Avg. Signal Alpha" 
            value="12.4 bps"
            trend="+2.1 bps"
            isPositive={true}
            description="Post-slippage attribution"
          />
        </Col>

        {/* Primary Analysis Row */}
        <Col span={16}>
          <CandlestickChart 
            title={`${selectedSymbol} Market Intelligence`} 
            loading={loading}
            data={[]} // Will be populated by real-time hook
            height={450}
          />
        </Col>
        <Col span={8}>
          <NewsSummary title="Global Sentiment Analytics" />
          <div style={{ marginTop: '16px' }}>
            <HeatmapChart title="Cross-Asset Correlation" height={280} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
