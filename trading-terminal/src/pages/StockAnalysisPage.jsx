import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiBarChart2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarketData } from '../services/data/marketData';

const AnalysisContainer = styled.div`
  .analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      font-weight: 700;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      
      button {
        background: var(--secondary-dark);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          background: var(--tertiary-dark);
        }
        
        &.active {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }
      }
    }
  }
  
  .stock-search {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    
    .search-box {
      position: relative;
      flex: 1;
      
      input {
        width: 100%;
        padding: 8px 15px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--tertiary-dark);
        color: var(--text-primary);
        
        &:focus {
          outline: none;
          border-color: var(--accent-blue);
        }
      }
      
      svg {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-tertiary);
      }
    }
    
    button {
      background: var(--accent-blue);
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background: var(--accent-blue-dark);
      }
    }
  }
  
  .stock-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    
    .stock-info {
      background: var(--secondary-dark);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      padding: 20px;
      
      .stock-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h2 {
          font-size: 18px;
          font-weight: 600;
        }
        
        .stock-price {
          display: flex;
          align-items: center;
          gap: 5px;
          
          .price-value {
            font-size: 24px;
            font-weight: 700;
          }
          
          .price-change {
            font-size: 14px;
            color: var(--text-tertiary);
            
            &.positive {
              color: var(--accent-green);
            }
            
            &.negative {
              color: var(--accent-red);
            }
          }
        }
      }
      
      .stock-meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        
        .meta-item {
          display: flex;
          flex-direction: column;
          
          .meta-value {
            font-weight: 600;
          }
          
          .meta-label {
            font-size: 12px;
            color: var(--text-tertiary);
          }
        }
      }
    }
    
    .stock-chart {
      background: var(--secondary-dark);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      padding: 20px;
      
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h3 {
          font-size: 16px;
          font-weight: 600;
        }
        
        .chart-controls {
          display: flex;
          gap: 5px;
          
          button {
            background: var(--tertiary-dark);
            border: 1px solid var(--border-color);
            color: var(--text-tertiary);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }
      
      .chart-container {
        height: 300px;
      }
    }
  }
  
  .analysis-panels {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
    
    .panel {
      background: var(--secondary-dark);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      padding: 20px;
      
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h3 {
          font-size: 16px;
          font-weight: 600;
        }
        
        .panel-controls {
          display: flex; gap: 5px;
          button {
            background: var(--tertiary-dark); border: 1px solid var(--border-color);
            color: var(--text-tertiary); padding: 4px 10px; border-radius: 4px; font-size: 12px;
          }
        }
      }
      
      .panel-content {
        min-height: 200px;
        .indicator-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
          .indicator-item {
            display: flex; flex-direction: column;
            .indicator-value { font-weight: 600; font-size: 16px; }
            .indicator-label { font-size: 12px; color: var(--text-tertiary); }
          }
        }
      }
    }
  }
  
  .signal-section {
    margin-top: 20px;
    .signal-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
      h2 { font-size: 18px; font-weight: 600; }
    }
    .signal-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;
      .signal-card {
        background: var(--secondary-dark); border-radius: 8px; border: 1px solid var(--border-color); padding: 15px;
        .signal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
          .signal-title { font-weight: 600; }
          .signal-score {
            display: flex; align-items: center; gap: 5px;
            &.positive { color: var(--accent-green); }
            &.negative { color: var(--accent-red); }
          }
        }
        .signal-description { font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px; }
        .signal-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary); }
      }
    }
  }
`;

const StockAnalysisPage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('technical');
  
  const { getLatestPrice, getPriceHistory } = useMarketData();
  
  const mockAnalysisData = {
    symbol: 'AAPL', name: 'Apple Inc.', price: 195.43, change: 2.45, change_percent: 1.27,
    open: 193.20, high: 196.80, low: 192.50, volume: 52000000, market_cap: 2850000000000,
    pe_ratio: 28.5, dividend_yield: 0.54,
    price_history: Array.from({ length: 12 }, (_, i) => ({ name: `${9+i}:30`, price: 193 + Math.random() * 4 })),
    technical_indicators: {
      rsi: 58,
      macd: { macd: 0.85, signal: 0.75, histogram: 0.10 },
      bollinger_bands: { upper: 198.50, middle: 195.00, lower: 191.50 },
      stoch: { k: 65, d: 58 }
    },
    fundamental_indicators: { revenue: 117.15, eps: 1.95, profit_margin: 25.3, roe: 15.2, debt_to_equity: 1.45, current_ratio: 1.15 },
    signals: [
      { id: '1', name: 'RSI', score: 65, direction: 'bullish', description: 'RSI indicates strong upward momentum', confidence: 0.85 },
      { id: '2', name: 'MACD', score: 70, direction: 'bullish', description: 'MACD histogram shows increasing momentum', confidence: 0.78 },
      { id: '3', name: 'Volume', score: 85, direction: 'bullish', description: 'Volume is significantly higher than average', confidence: 0.92 }
    ],
    sentiment: { news: 0.65, social: 0.72, analyst: 0.85 }
  };

  const fetchStockData = async (sym) => {
    setLoading(true);
    try {
      setTimeout(() => {
        setAnalysisData(mockAnalysisData);
        setError(null);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError("Failed to load data.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchStockData(symbol); }, [symbol]);

  const handleSearch = (e) => { e.preventDefault(); fetchStockData(symbol.toUpperCase()); };

  return (
    <AnalysisContainer className="page-container">
      <div className="analysis-header">
        <h1>Stock Analysis</h1>
        <div className="controls">
          <button className={activeTab === 'technical' ? 'active' : ''} onClick={() => setActiveTab('technical')}>Technical</button>
          <button className={activeTab === 'fundamental' ? 'active' : ''} onClick={() => setActiveTab('fundamental')}>Fundamental</button>
          <button className={activeTab === 'sentiment' ? 'active' : ''} onClick={() => setActiveTab('sentiment')}>Sentiment</button>
        </div>
      </div>
      
      <div className="stock-search">
        <form onSubmit={handleSearch} style={{ flex: 1 }}>
          <div className="search-box">
            <FiSearch />
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Search symbol..." />
          </div>
        </form>
        <button className="btn-secondary"><FiRefreshCw /> Refresh</button>
      </div>
      
      {!loading && !error && analysisData && (
        <>
          <div className="stock-header">
            <div className="stock-info">
              <div className="stock-title">
                <h2>{analysisData.name} ({analysisData.symbol})</h2>
                <div className="stock-price">
                  <div className="price-value">${analysisData.price}</div>
                  <div className={`price-change positive`}>+{analysisData.change} ({analysisData.change_percent}%)</div>
                </div>
              </div>
              <div className="stock-meta">
                <div className="meta-item"><span className="meta-value">${analysisData.open}</span><span className="meta-label">Open</span></div>
                <div className="meta-item"><span className="meta-value">${analysisData.high}</span><span className="meta-label">High</span></div>
                <div className="meta-item"><span className="meta-value">${analysisData.low}</span><span className="meta-label">Low</span></div>
                <div className="meta-item"><span className="meta-value">2.85T</span><span className="meta-label">Mkt Cap</span></div>
              </div>
            </div>
            
            <div className="stock-chart">
              <div className="chart-header"><h3>Price Chart</h3></div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisData.price_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                    <Line type="monotone" dataKey="price" stroke="#00cc66" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="analysis-panels">
            <div className="panel">
              <div className="panel-header"><h3>Technical Indicators</h3></div>
              <div className="panel-content">
                <div className="indicator-grid">
                  <div className="indicator-item"><span className="indicator-value">{analysisData.technical_indicators.rsi}</span><span className="indicator-label">RSI</span></div>
                  <div className="indicator-item"><span className="indicator-value">{analysisData.technical_indicators.macd.macd.toFixed(2)}</span><span className="indicator-label">MACD</span></div>
                  <div className="indicator-item"><span className="indicator-value">{analysisData.technical_indicators.bollinger_bands.upper}</span><span className="indicator-label">BB Upper</span></div>
                  <div className="indicator-item"><span className="indicator-value">{analysisData.technical_indicators.bollinger_bands.lower}</span><span className="indicator-label">BB Lower</span></div>
                </div>
              </div>
            </div>
            
            <div className="panel">
              <div className="panel-header"><h3>Sentiment Analysis</h3></div>
              <div className="panel-content">
                <div className="indicator-grid">
                  <div className="indicator-item"><span className="indicator-value" style={{color:'#0c6'}}>{analysisData.sentiment.news}</span><span className="indicator-label">News</span></div>
                  <div className="indicator-item"><span className="indicator-value" style={{color:'#0c6'}}>{analysisData.sentiment.social}</span><span className="indicator-label">Social</span></div>
                  <div className="indicator-item"><span className="indicator-value" style={{color:'#0c6'}}>{analysisData.sentiment.analyst}</span><span className="indicator-label">Analyst</span></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="signal-section">
            <div className="signal-header"><h2>Trading Signals</h2></div>
            <div className="signal-grid">
              {analysisData.signals.map(s => (
                <div key={s.id} className="signal-card">
                  <div className="signal-header">
                    <span className="signal-title">{s.name}</span>
                    <span className="signal-score positive">{s.score}</span>
                  </div>
                  <p className="signal-description">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AnalysisContainer>
  );
};

export default StockAnalysisPage;
