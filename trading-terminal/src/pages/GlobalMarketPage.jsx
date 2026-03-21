import React, { useState, useEffect } from 'react';
import { FiGlobe, FiTrendingUp, FiTrendingDown, FiBarChart2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import styled from 'styled-components';
import GlobalMarketMap from '../components/dashboard/GlobalMarketMap/GlobalMarketMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGeoData } from '../services/data/geoData';
import { useMarketData } from '../services/data/marketData';

const GlobalMarketContainer = styled.div`
  .global-header {
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
  
  .map-container {
    height: 500px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
    
    .map-title {
      padding: 10px 15px;
      background: var(--tertiary-dark);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        font-size: 18px;
        font-weight: 600;
      }
      
      .map-controls {
        display: flex;
        gap: 10px;
      }
    }
  }
  
  .market-regions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .region-card {
    background: var(--secondary-dark);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    padding: 20px;
    
    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        font-size: 16px;
        font-weight: 600;
      }
      
      .region-status {
        display: flex;
        align-items: center;
        gap: 5px;
        
        &.bullish {
          color: var(--accent-green);
        }
        
        &.bearish {
          color: var(--accent-red);
        }
      }
    }
    
    .region-data {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      
      .data-item {
        display: flex;
        flex-direction: column;
        
        .data-value {
          font-size: 16px;
          font-weight: 600;
          
          &.positive {
            color: var(--accent-green);
          }
          
          &.negative {
            color: var(--accent-red);
          }
        }
        
        .data-label {
          font-size: 12px;
          color: var(--text-tertiary);
        }
      }
    }
    
    .region-chart {
      margin-top: 15px;
      
      .chart-title {
        font-size: 14px;
        color: var(--text-tertiary);
        margin-bottom: 5px;
      }
    }
  }
  
  .global-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .indicator-card {
      background: var(--secondary-dark);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      padding: 20px;
      
      .indicator-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        
        .icon {
          width: 40px;
          height: 40px;
          background: var(--tertiary-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          svg {
            font-size: 20px;
          }
        }
        
        h3 {
          font-size: 16px;
          font-weight: 600;
        }
      }
      
      .indicator-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .indicator-change {
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
  
  .market-trends {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
    
    .trend-card {
      background: var(--secondary-dark);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      padding: 20px;
      
      .trend-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h3 {
          font-size: 16px;
          font-weight: 600;
        }
        
        .trend-status {
          display: flex;
          align-items: center;
          gap: 5px;
          
          &.bullish {
            color: var(--accent-green);
          }
          
          &.bearish {
            color: var(--accent-red);
          }
        }
      }
      
      .trend-chart {
        height: 200px;
      }
    }
  }
  
  .market-events {
    margin-top: 20px;
    
    .events-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h2 {
        font-size: 18px;
        font-weight: 600;
      }
      
      .event-filters {
        display: flex;
        gap: 10px;
        
        button {
          background: var(--tertiary-dark);
          border: 1px solid var(--border-color);
          color: var(--text-tertiary);
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          
          &.active {
            background: var(--accent-blue);
            color: white;
          }
        }
      }
    }
    
    .event-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      
      .event-card {
        background: var(--tertiary-dark);
        border-radius: 8px;
        border: 1px solid var(--border-color);
        padding: 15px;
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          
          .event-title {
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .event-impact {
            display: flex;
            align-items: center;
            gap: 5px;
            
            &.high {
              color: var(--accent-red);
            }
            
            &.medium {
              color: var(--accent-yellow);
            }
            
            &.low {
              color: var(--accent-green);
            }
          }
        }
        
        .event-details {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.4;
          margin-bottom: 10px;
        }
        
        .event-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-tertiary);
        }
      }
    }
  }
`;

const GlobalMarketPage = () => {
  const { getMarketEvents, subscribeToEvents } = useGeoData();
  const { getLatestPrice } = useMarketData();
  const [marketEvents, setMarketEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock global market data
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
        data: [
          { name: 'Jan', value: 4000 },
          { name: 'Feb', value: 4100 },
          { name: 'Mar', value: 4200 },
          { name: 'Apr', value: 4300 },
          { name: 'May', value: 4400 },
          { name: 'Jun', value: 4500 }
        ]
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
        data: [
          { name: 'Jan', value: 4000 },
          { name: 'Feb', value: 4050 },
          { name: 'Mar', value: 4100 },
          { name: 'Apr', value: 4150 },
          { name: 'May', value: 4200 },
          { name: 'Jun', value: 4250 }
        ]
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
        data: [
          { name: 'Jan', value: 30000 },
          { name: 'Feb', value: 30500 },
          { name: 'Mar', value: 31000 },
          { name: 'Apr', value: 31500 },
          { name: 'May', value: 32000 },
          { name: 'Jun', value: 32145 }
        ]
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
        data: [
          { name: 'Jan', value: 1200 },
          { name: 'Feb', value: 1180 },
          { name: 'Mar', value: 1160 },
          { name: 'Apr', value: 1140 },
          { name: 'May', value: 1130 },
          { name: 'Jun', value: 1157 }
        ]
      }
    },
    economic_indicators: {
      gdp: {
        name: 'GDP Growth',
        value: 2.5,
        change: 0.2
      },
      inflation: {
        name: 'Inflation',
        value: 3.2,
        change: 0.5
      },
      unemployment: {
        name: 'Unemployment',
        value: 3.8,
        change: -0.1
      },
      interest_rates: {
        name: 'Interest Rates',
        value: 5.25,
        change: 0.25
      }
    },
    market_trends: {
      sector_performance: [
        { name: 'Technology', value: 2.5, change: 0.3 },
        { name: 'Financials', value: 1.2, change: 0.1 },
        { name: 'Energy', value: -0.8, change: -0.5 },
        { name: 'Healthcare', value: 0.5, change: 0.2 },
        { name: 'Consumer', value: 1.8, change: 0.4 }
      ],
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API delay
        setTimeout(() => {
          setGlobalData(mockGlobalData);
          setLoading(false);
          setError(null);
        }, 1000);
      } catch (err) {
        setError("Failed to load global market data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time event subscription
    const unsubscribe = subscribeToEvents(event => {
      setMarketEvents(prevEvents => {
        const updated = [...prevEvents, event];
        return updated.slice(-50);
      });
    });
    
    // Initial market events
    setMarketEvents(getMarketEvents());
    
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (marketEvents.length > 0) {
      if (eventFilter === 'all') {
        setFilteredEvents(marketEvents);
      } else {
        setFilteredEvents(marketEvents.filter(event => event.impact === eventFilter));
      }
    }
  }, [marketEvents, eventFilter]);

  const handleEventFilter = (filter) => {
    setEventFilter(filter);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ display: 'inline-block' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderLeft: '4px solid var(--accent-blue)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Loading global market data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'var(--secondary-dark)', 
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '30px',
          width: '500px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent-red)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ color: 'white', fontSize: '20px' }}>!</span>
          </div>
          <h2 style={{ color: 'var(--accent-red)' }}>Error Loading Data</h2>
          <p style={{ color: 'var(--text-tertiary)', margin: '20px 0' }}>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <GlobalMarketContainer className="page-container">
      <div className="global-header">
        <h1>Global Market View</h1>
        <div className="controls">
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '30px',
                  padding: '8px 15px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  background: 'var(--tertiary-dark)',
                  color: 'var(--text-primary)',
                  width: '200px'
                }}
              />
            </div>
            <button className="btn-secondary">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
          <div>
            <button 
              className={timeframe === '24h' ? 'active' : ''}
              onClick={() => setTimeframe('24h')}
            >
              24h
            </button>
            <button 
              className={timeframe === '1w' ? 'active' : ''}
              onClick={() => setTimeframe('1w')}
            >
              1w
            </button>
            <button 
              className={timeframe === '1m' ? 'active' : ''}
              onClick={() => setTimeframe('1m')}
            >
              1m
            </button>
          </div>
        </div>
      </div>
      
      <div className="map-container">
        <div className="map-title">
          <h2>Global Market Activity</h2>
          <div className="map-controls">
            <button>World</button>
            <button>Regions</button>
            <button>Sectors</button>
          </div>
        </div>
        <GlobalMarketMap />
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
                <span className="data-label">Index Value</span>
              </div>
              <div className="data-item">
                <span className={`data-value ${region.change >= 0 ? 'positive' : 'negative'}`}>
                  {region.change >= 0 ? '+' : ''}{region.change}%
                </span>
                <span className="data-label">Today's Change</span>
              </div>
              <div className="data-item">
                <span className="data-value">{region.currency}</span>
                <span className="data-label">Currency</span>
              </div>
              <div className="data-item">
                <span className="data-value">{region.market_hours}</span>
                <span className="data-label">Trading Hours</span>
              </div>
            </div>
            
            <div className="region-chart">
              <div className="chart-title">{region.index} Performance</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={region.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={region.change >= 0 ? "#00cc66" : "#ff3333"} 
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
              <div className="icon" style={{ 
                background: indicator.change >= 0 ? 'rgba(0, 204, 102, 0.1)' : 'rgba(255, 51, 51, 0.1)'
              }}>
                {indicator.name === 'GDP Growth' && <FiTrendingUp />}
                {indicator.name === 'Inflation' && <FiTrendingDown />}
                {indicator.name === 'Unemployment' && <FiBarChart2 />}
                {indicator.name === 'Interest Rates' && <FiTrendingUp />}
              </div>
              <h3>{indicator.name}</h3>
            </div>
            <div className="indicator-value">
              {indicator.value}{indicator.name.includes('Rate') ? '%' : ''}
            </div>
            <div className={`indicator-change ${indicator.change >= 0 ? 'positive' : 'negative'}`}>
              {indicator.change >= 0 ? '+' : ''}{indicator.change}{indicator.name.includes('Rate') ? '%' : ''}
            </div>
          </div>
        ))}
      </div>
      
      <div className="market-trends">
        <div className="trend-card">
          <div className="trend-header">
            <h3>Sector Performance</h3>
            <div className="trend-status bullish">
              <FiTrendingUp /> Bullish
            </div>
          </div>
          
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalData.market_trends.sector_chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }} 
                />
                <Line type="monotone" dataKey="tech" stroke="#00cc66" strokeWidth={2} dot={false} name="Technology" />
                <Line type="monotone" dataKey="finance" stroke="#007acc" strokeWidth={2} dot={false} name="Financials" />
                <Line type="monotone" dataKey="energy" stroke="#ff3333" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="healthcare" stroke="#ffcc00" strokeWidth={2} dot={false} name="Healthcare" />
                <Line type="monotone" dataKey="consumer" stroke="#9933cc" strokeWidth={2} dot={false} name="Consumer" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="trend-card">
          <div className="trend-header">
            <h3>Global Market Correlation</h3>
            <div className="trend-status">
              <FiBarChart2 /> Moderate
            </div>
          </div>
          
          <div className="trend-chart">
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '14px',
              color: 'var(--text-tertiary)'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '10px',
                width: '100%',
                textAlign: 'center'
              }}>
                <div>US</div><div>EU</div><div>Asia</div><div>Emerging</div><div>Global</div>
                <div>1.0</div><div>0.85</div><div>0.65</div><div>0.55</div><div>0.75</div>
                <div>0.85</div><div>1.0</div><div>0.75</div><div>0.65</div><div>0.85</div>
                <div>0.65</div><div>0.75</div><div>1.0</div><div>0.60</div><div>0.70</div>
                <div>0.55</div><div>0.65</div><div>0.60</div><div>1.0</div><div>0.65</div>
                <div>0.75</div><div>0.85</div><div>0.70</div><div>0.65</div><div>1.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="market-events">
        <div className="events-header">
          <h2>Global Market Events</h2>
          <div className="event-filters">
            <button className={eventFilter === 'all' ? 'active' : ''} onClick={() => handleEventFilter('all')}>All</button>
            <button className={eventFilter === 'high' ? 'active' : ''} onClick={() => handleEventFilter('high')}>High Impact</button>
            <button className={eventFilter === 'medium' ? 'active' : ''} onClick={() => handleEventFilter('medium')}>Medium Impact</button>
            <button className={eventFilter === 'low' ? 'active' : ''} onClick={() => handleEventFilter('low')}>Low Impact</button>
          </div>
        </div>
        
        <div className="event-list">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-title">{event.title}</div>
                <div className={`event-impact ${event.impact}`}>
                  {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
                </div>
              </div>
              <div className="event-details">{event.description}</div>
              <div className="event-meta">
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span>{new Date(event.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlobalMarketContainer>
  ); 
};

export default GlobalMarketPage;
