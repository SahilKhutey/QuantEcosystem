// src/components/News/NewsFeed.jsx
import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Select, Input, List } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { newsAPI } from '../../services/api/news';
import NewsItem from './NewsItem';
import NewsSummary from './NewsSummary';
import './News.css';

const NewsFeed = ({ 
  title = "Market News",
  className = '',
  style = {},
  onNewsSelect
}) => {
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [source, setSource] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [source, sentiment]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const resp = await newsAPI.getNews({ source, sentiment });
      setNewsItems(resp.data);
      applyFilter(resp.data, searchText);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data, text) => {
    const filtered = (data || []).filter(item => 
      (item.title || '').toLowerCase().includes((text || '').toLowerCase()) ||
      (item.content || item.summary || '').toLowerCase().includes((text || '').toLowerCase())
    );
    setFilteredNews(filtered);
  };

  const handleSearch = (val) => {
    setSearchText(val);
    applyFilter(newsItems, val);
  };

  return (
    <div className={`news-feed ${className}`} style={style}>
      <Card 
        title={<div className="news-title">{title}</div>}
        extra={<Button icon={<ReloadOutlined />} onClick={fetchNews} loading={loading} />}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space style={{ marginBottom: '24px', width: '100%', justifyContent: 'space-between' }}>
          <Input 
            placeholder="Search news..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Space>
            <Select value={source} onChange={setSource} style={{ width: 150 }} options={[
              { value: 'all', label: 'All Sources' },
              { value: 'bloomberg', label: 'Bloomberg' },
              { value: 'reuters', label: 'Reuters' },
              { value: 'wsj', label: 'WSJ' }
            ]} />
            <Select value={sentiment} onChange={setSentiment} style={{ width: 130 }} options={[
              { value: 'all', label: 'All Sentiments' },
              { value: 'positive', label: 'Positive' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'negative', label: 'Negative' }
            ]} />
          </Space>
        </Space>

        <NewsSummary newsItems={newsItems} />

        <List
          dataSource={filteredNews}
          loading={loading}
          renderItem={item => (
            <NewsItem key={item.id} newsItem={item} onClick={() => onNewsSelect && onNewsSelect(item)} />
          )}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default NewsFeed;
