import React, { useState, useEffect } from 'react';
import { FiGlobe, FiTrendingUp, FiTrendingDown, FiBarChart2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import styled from 'styled-components';
import GlobalMarketMap from '../components/GlobalMarketMap/GlobalMarketMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GlobalMarketContainer = styled.div`
  padding: 24px;
  background: var(--bg-dark, #0a0b10);
  min-height: 100vh;
  color: var(--text-primary, #f1f5f9);

  .global-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }
    
    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .search-wrapper {
        position: relative;
        input {
          padding: 8px 12px 8px 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          width: 220px;
          font-size: 14px;
          &:focus {
            outline: none;
            border-color: var(--accent-blue, #3b82f6);
            background: rgba(255, 255, 255, 0.08);
          }
        }
        svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
      }

      .btn-group {
        display: flex;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 2px;
        
        button {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          
          &:hover {
            color: #fff;
          }
          
          &.active {
            background: var(--accent-blue, #3b82f6);
            color: white;
          }
        }
      }

      button.refresh-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
    }
  }
  
  .map-container {
    height: 540px;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #111;
    
    .map-header {
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: #e2e8f0;
      }
      
      .map-view-toggle {
        display: flex;
        gap: 8px;
        button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          &:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
        }
      }
    }

    .map-wrapper {
      height: 486px;
    }
  }
  
  .market-regions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .region-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px;
    backdrop-filter: blur(8px);
    
    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: #fff;
      }
      
      .region-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        
        &.bullish { color: #10b981; }
        &.bearish { color: #ef4444; }
        &.moderate, &.weak { color: #f59e0b; }
      }
    }
    
    .region-data {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      
      .data-item {
        display: flex;
        flex-direction: column;
        
        .data-value {
          font-size: 16px;
          font-weight: 700;
          color: #f8fafc;
          
          &.positive { color: #10b981; }
          &.negative { color: #ef4444; }
        }
        
        .data-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 2px;
        }
      }
    }
    
    .region-chart {
      margin-top: 18px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      
      .chart-title {
        font-size: 12px;
        color: #475569;
        margin-bottom: 8px;
      }
    }
  }
  
  .global-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    
    .indicator-card {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 20px;
      
      .indicator-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .icon-box {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }
        
        h3 {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0;
        }
      }
      
      .indicator-value {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 4px;
      }
      
      .indicator-change {
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
        
        &.positive { color: #10b981; }
        &.negative { color: #ef4444; }
      }
    }
  }
  
  .market-trends {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 20px;
    margin-top: 24px;
    
    .trend-card {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 24px;
      
      .trend-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h3 {
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        
        .trend-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }
      }
      
      .trend-chart-container {
        height: 250px;
      }

      .correlation-matrix {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;
        
        .matrix-cell {
          background: #0a0b10;
          padding: 12px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #94a3b8;
          
          &.header {
            background: rgba(255, 255, 255, 0.03);
            font-weight: 700;
            color: #fff;
          }
          
          &.high { color: #10b981; font-weight: 600; }
          &.med { color: #3b82f6; }
        }
      }
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const GlobalMarketPage = () => {
  const [timeframe, setTimeframe] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data as specified in the request
  const mockGlobalData = {
    regions: {
      north_america: {
        id: 'north_america',
        name: 'North America',
        lat: 37.0902,
        lng: -95.7129,
        index: 'S&P 500',
        index_value: 4567.89,
        change: 1.2,
        status: 'Bullish',
        market_hours: '9:30 AM - 4:00 PM ET',
        currency: 'USD',
        data: [{ name: 'Jan', value: 4000 }, { name: 'Feb', value: 4100 }, { name: 'Mar', value: 4200 }, { name: 'Apr', value: 4300 }, { name: 'May', value: 4400 }, { name: 'Jun', value: 4500 }]
      },
      europe: {
        id: 'europe',
        name: 'Europe',
        lat: 54.5260,
        lng: 15.2551,
        index: 'STOXX 50',
        index_value: 4567.89,
        change: 0.5,
        status: 'Moderate',
        market_hours: '8:00 AM - 5:30 PM CET',
        currency: 'EUR',
        data: [{ name: 'Jan', value: 4000 }, { name: 'Feb', value: 4050 }, { name: 'Mar', value: 4100 }, { name: 'Apr', value: 4150 }, { name: 'May', value: 4200 }, { name: 'Jun', value: 4250 }]
      },
      asia: {
        id: 'asia',
        name: 'Asia',
        lat: 33.9992,
        lng: 136.5985,
        index: 'Nikkei 225',
        index_value: 32145.67,
        change: -0.2,
        status: 'Bearish',
        market_hours: '9:00 AM - 3:00 PM JST',
        currency: 'JPY',
        data: [{ name: 'Jan', value: 30000 }, { name: 'Feb', value: 30500 }, { name: 'Mar', value: 31000 }, { name: 'Apr', value: 31500 }, { name: 'May', value: 32000 }, { name: 'Jun', value: 32145 }]
      },
      emerging_markets: {
        id: 'emerging_markets',
        name: 'Emerging Markets',
        lat: 20.5937,
        lng: 78.9629,
        index: 'MSCI Emerging',
        index_value: 1156.78,
        change: -1.5,
        status: 'Weak',
        market_hours: 'Vary by country',
        currency: 'Varies',
        data: [{ name: 'Jan', value: 1200 }, { name: 'Feb', value: 1180 }, { name: 'Mar', value: 1160 }, { name: 'Apr', value: 1140 }, { name: 'May', value: 1130 }, { name: 'Jun', value: 1157 }]
      }
    },
    economic_indicators: {
      gdp: { name: 'GDP Growth', value: 2.5, change: 0.2 },
      inflation: { name: 'Inflation', value: 3.2, change: 0.5 },
      unemployment: { name: 'Unemployment', value: 3.8, change: -0.1 },
      interest_rates: { name: 'Interest Rates', value: 5.25, change: 0.25 }
    },
    market_trends: {
      sector_chart_data: [
        { name: 'Jan', tech: 100, finance: 100, energy: 100, healthcare: 100, consumer: 100 },
        { name: 'Feb', tech: 102.5, finance: 101.2, energy: 99.2, healthcare: 100.5, consumer: 101.8 },
        { name: 'Mar', tech: 105.5, finance: 102.1, energy: 98.0, healthcare: 101.2, consumer: 103.5 },
        { name: 'Apr', tech: 107.5, finance: 103.0, energy: 96.5, healthcare: 102.0, consumer: 105.0 },
        { name: 'May', tech: 110.0, finance: 104.2, energy: 95.0, healthcare: 103.0, consumer: 107.0 },
        { name: 'Jun', tech: 112.5, finance: 105.0, energy: 94.0, healthcare: 104.0, consumer: 108.5 }
      ]
    }
  };

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setGlobalData(mockGlobalData);
        setLoading(false);
      }, 800);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <GlobalMarketContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading global market intelligence...</p>
        </div>
      </GlobalMarketContainer>
    );
  }

  return (
    <GlobalMarketContainer>
      <div className="global-header">
        <h1>Global Market View</h1>
        <div className="controls">
          <div className="search-wrapper">
            <FiSearch size={16} />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={() => window.location.reload()}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <div className="btn-group">
            {['24h', '1w', '1m'].map(t => (
              <button 
                key={t} 
                className={timeframe === t ? 'active' : ''} 
                onClick={() => setTimeframe(t)}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="map-container">
        <div className="map-header">
          <h2>Global Market Activity</h2>
          <div className="map-view-toggle">
            <button>World</button>
            <button>Regions</button>
            <button>Sectors</button>
          </div>
        </div>
        <div className="map-wrapper">
          <GlobalMarketMap />
        </div>
      </div>
      
      <div className="market-regions">
        {Object.values(globalData.regions).map(region => (
          <div key={region.id} className="region-card">
            <div className="region-header">
              <h3>{region.name}</h3>
              <div className={`region-status ${region.status.toLowerCase()}`}>
                {region.status === 'Bullish' ? <FiTrendingUp /> : region.status === 'Bearish' ? <FiTrendingDown /> : <FiBarChart2 />}
                {region.status}
              </div>
            </div>
            
            <div className="region-data">
              <div className="data-item">
                <span className="data-value">{region.index_value.toLocaleString()}</span>
                <span className="data-label">Index ({region.index})</span>
              </div>
              <div className="data-item">
                <span className={`data-value ${region.change >= 0 ? 'positive' : 'negative'}`}>
                  {region.change >= 0 ? '+' : ''}{region.change}%
                </span>
                <span className="data-label">Change Today</span>
              </div>
              <div className="data-item">
                <span className="data-value">{region.currency}</span>
                <span className="data-label">Currency</span>
              </div>
              <div className="data-item">
                <span className="data-value" style={{ fontSize: '13px' }}>{region.market_hours}</span>
                <span className="data-label">Trading Hours</span>
              </div>
            </div>
            
            <div className="region-chart">
              <div className="chart-title">Historical Performance</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={region.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={region.change >= 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      
      <div className="global-indicators">
        {Object.values(globalData.economic_indicators).map(indicator => (
          <div key={indicator.name} className="indicator-card">
            <div className="indicator-header">
              <div className="icon-box">
                {indicator.name === 'GDP Growth' && <FiTrendingUp />}
                {indicator.name === 'Inflation' && <FiTrendingDown />}
                {indicator.name === 'Unemployment' && <FiBarChart2 />}
                {indicator.name === 'Interest Rates' && <FiGlobe />}
              </div>
              <h3>{indicator.name}</h3>
            </div>
            <div className="indicator-value">
              {indicator.value}{indicator.name.includes('Rate') || indicator.name.includes('Growth') || indicator.name.includes('Inflation') || indicator.name.includes('Unemployment') ? '%' : ''}
            </div>
            <div className={`indicator-change ${indicator.change >= 0 ? 'positive' : 'negative'}`}>
              {indicator.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {indicator.change}% change
            </div>
          </div>
        ))}
      </div>
      
      <div className="market-trends">
        <div className="trend-card">
          <div className="trend-header">
            <h3>Sector Performance</h3>
            <div className="trend-status">
              <FiTrendingUp /> Overall Bullish
            </div>
          </div>
          
          <div className="trend-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalData.market_trends.sector_chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="tech" stroke="#3b82f6" strokeWidth={2} dot={false} name="Tech" />
                <Line type="monotone" dataKey="finance" stroke="#10b981" strokeWidth={2} dot={false} name="Finance" />
                <Line type="monotone" dataKey="energy" stroke="#ef4444" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="healthcare" stroke="#f59e0b" strokeWidth={2} dot={false} name="Health" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="trend-card">
          <div className="trend-header">
            <h3>Global Correlation</h3>
            <div className="trend-status" style={{ color: '#3b82f6' }}>
              <FiBarChart2 /> High Integration
            </div>
          </div>
          
          <div className="correlation-matrix">
            <div className="matrix-cell header"></div>
            <div className="matrix-cell header">US</div>
            <div className="matrix-cell header">EU</div>
            <div className="matrix-cell header">Asia</div>
            <div className="matrix-cell header">EM</div>
            
            <div className="matrix-cell header">US</div>
            <div className="matrix-cell high">1.00</div>
            <div className="matrix-cell high">0.85</div>
            <div className="matrix-cell med">0.65</div>
            <div className="matrix-cell med">0.55</div>
            
            <div className="matrix-cell header">EU</div>
            <div className="matrix-cell high">0.85</div>
            <div className="matrix-cell high">1.00</div>
            <div className="matrix-cell high">0.75</div>
            <div className="matrix-cell med">0.65</div>
            
            <div className="matrix-cell header">Asia</div>
            <div className="matrix-cell med">0.65</div>
            <div className="matrix-cell high">0.75</div>
            <div className="matrix-cell high">1.00</div>
            <div className="matrix-cell med">0.60</div>
            
            <div className="matrix-cell header">EM</div>
            <div className="matrix-cell med">0.55</div>
            <div className="matrix-cell med">0.65</div>
            <div className="matrix-cell med">0.60</div>
            <div className="matrix-cell high">1.00</div>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
            Current market integration is <strong>High</strong> (0.74 avg index). 
            Cross-border risk spillover potential is elevated.
          </div>
        </div>
      </div>
    </GlobalMarketContainer>
  );
};

export default GlobalMarketPage;
