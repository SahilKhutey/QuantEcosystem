// src/components/TradingView/TradingViewStudies.jsx
import React, { useState } from 'react';
import { Space, Button, Select, Tag, Input, Modal } from 'antd';
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const TradingViewStudies = ({ 
  studies = [],
  onAddStudy,
  className = '',
  style = {}
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [searchText, setSearchText] = useState('');

  const studiesList = [
    { value: 'ma', label: 'Moving Average', category: 'Trend' },
    { value: 'ema', label: 'Exponential Moving Average', category: 'Trend' },
    { value: 'sma', label: 'Simple Moving Average', category: 'Trend' },
    { value: 'bollinger', label: 'Bollinger Bands', category: 'Volatility' },
    { value: 'rsi', label: 'Relative Strength Index', category: 'Momentum' },
    { value: 'macd', label: 'MACD', category: 'Momentum' },
    { value: 'ichimoku', label: 'Ichimoku Cloud', category: 'Trend' }
  ];

  const filteredStudies = studiesList.filter(study => 
    study.label.toLowerCase().includes(searchText.toLowerCase()) ||
    study.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddStudy = (study) => {
    if (onAddStudy && study) {
      onAddStudy(study.value);
    }
    setIsModalVisible(false);
    setSelectedStudy(null);
  };

  return (
    <div className={`tradingview-studies ${className}`} style={style}>
      <Space wrap>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>Studies:</div>
        {studies.map((study, index) => (
          <Tag key={index} color="blue" closable style={{ borderRadius: '4px' }}>
            {studiesList.find(s => s.value === study)?.label || study}
          </Tag>
        ))}
        <Button 
          type="dashed" 
          size="small" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          style={{ borderRadius: '4px' }}
        >
          Add Study
        </Button>
      </Space>
      
      <Modal
        title="Add Technical Study"
        open={isModalVisible}
        onOk={() => handleAddStudy(selectedStudy)}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ disabled: !selectedStudy }}
        width={400}
      >
        <Input 
          placeholder="Search studies..." 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <div className="studies-grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredStudies.map((study, index) => (
            <div 
              key={index} 
              className="study-card"
              onClick={() => setSelectedStudy(study)}
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                background: selectedStudy?.value === study.value ? '#e6f7ff' : '#fff',
                borderColor: selectedStudy?.value === study.value ? '#1890ff' : '#f0f0f0'
              }}
            >
              <div style={{ fontWeight: 600 }}>{study.label}</div>
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{study.category}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TradingViewStudies;
