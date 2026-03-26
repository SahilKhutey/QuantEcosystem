// src/components/News/NewsFilters.jsx
import React, { useState } from 'react';
import { Card, Space, Button, Select, Input } from 'antd';
import { FilterOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';

const NewsFilters = ({ 
  selectedSource = "all",
  selectedSentiment = "all",
  selectedTimeRange = "24h",
  onSourceChange,
  onSentimentChange,
  onTimeRangeChange,
  onSearch,
  className = '',
  style = {}
}) => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'bloomberg', label: 'Bloomberg' },
    { value: 'reuters', label: 'Reuters' },
    { value: 'cnbc', label: 'CNBC' },
    { value: 'ft', label: 'Financial Times' },
    { value: 'wsj', label: 'Wall Street Journal' }
  ];
  
  const sentiments = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' }
  ];
  
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];
  
  const handleClearFilters = () => {
    onSourceChange('all');
    onSentimentChange('all');
    onTimeRangeChange('24h');
    setSearchText('');
    onSearch('');
  };
  
  return (
    <Card 
      className={`news-filters ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', ...style }}
      size="small"
      title={<Space><FilterOutlined /><span>FILTERS</span></Space>}
      extra={<Button type="link" size="small" onClick={handleClearFilters}>Clear All</Button>}
    >
      <div style={{ marginBottom: '16px' }}>
        <Input 
          placeholder="Search headlines..." 
          size="small"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            onSearch(e.target.value);
          }}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ borderRadius: '6px' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '4px' }}>SOURCE</div>
          <Select
            value={selectedSource}
            onChange={onSourceChange}
            options={sources}
            style={{ width: '100%' }}
            size="small"
          />
        </div>
        
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '4px' }}>SENTIMENT</div>
          <Select
            value={selectedSentiment}
            onChange={handleSentimentChange}
            options={sentiments}
            style={{ width: '100%' }}
            size="small"
          />
        </div>

        <Button 
          type="text" 
          size="small" 
          style={{ width: '100%', fontSize: '11px', color: '#1890ff', textAlign: 'left', padding: 0 }}
          onClick={() => setIsAdvanced(!isAdvanced)}
        >
          {isAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </Button>
        
        {isAdvanced && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#8c8c8c', marginBottom: '4px' }}>TIME RANGE</div>
            <Select
              value={selectedTimeRange}
              onChange={handleTimeRangeChange}
              options={timeRanges}
              style={{ width: '100%' }}
              size="small"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default NewsFilters;
