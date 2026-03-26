// src/components/News/NewsSummary.jsx
import React from 'react';
import { Row, Col, Statistic, Progress, Space } from 'antd';
import { ThunderboltOutlined, RiseOutlined, FallOutlined, LineChartOutlined } from '@ant-design/icons';

const NewsSummary = ({ 
  newsItems = [],
  className = '',
  style = {}
}) => {
  const total = newsItems.length;
  const positive = newsItems.filter(item => item.sentiment > 0.6).length;
  const neutral = newsItems.filter(item => item.sentiment >= 0.4 && item.sentiment <= 0.6).length;
  const negative = newsItems.filter(item => item.sentiment < 0.4).length;
  
  const posPct = total ? Math.round((positive / total) * 100) : 0;
  const neuPct = total ? Math.round((neutral / total) * 100) : 0;
  const negPct = total ? Math.round((negative / total) * 100) : 0;
  
  const avgSent = total ? (newsItems.reduce((acc, i) => acc + i.sentiment, 0) / total) : 0.5;
  const highUrgency = newsItems.filter(item => item.urgency === 'high').length;

  return (
    <div className={`news-summary ${className}`} style={{ marginBottom: '24px', ...style }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Statistic title="GLOBAL BUZZ" value={total} prefix={<LineChartOutlined />} valueStyle={{ fontWeight: 700 }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '8px' }}>
            <Statistic title="SENTIMENT SCORE" value={Math.round(avgSent * 100)} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: '#3f8600', fontWeight: 700 }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ padding: '12px', background: '#fff1f0', borderRadius: '8px' }}>
            <Statistic title="URGENT ALERTS" value={highUrgency} prefix={<ThunderboltOutlined />} valueStyle={{ color: '#cf1322', fontWeight: 700 }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ padding: '4px 12px', background: '#e6f7ff', borderRadius: '8px', height: '100%' }}>
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '8px', fontWeight: 600 }}>DISTRIBUTION</div>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Progress percent={posPct} size={[100, 4]} showInfo={false} strokeColor="#52c41a" trailColor="transparent" />
              <Progress percent={neuPct} size={[100, 4]} showInfo={false} strokeColor="#1890ff" trailColor="transparent" />
              <Progress percent={negPct} size={[100, 4]} showInfo={false} strokeColor="#ff4d4f" trailColor="transparent" />
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default NewsSummary;
