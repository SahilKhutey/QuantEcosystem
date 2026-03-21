import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiActivity, FiLayers, FiList } from 'react-icons/fi';
import { useMarketData } from '../services/data/marketData';
import useAppStore from '../services/store/appStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TradingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  height: 100%;
  
  .main-chart-area {
    grid-column: 1;
    grid-row: 1 / span 2;
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .order-book-area {
    grid-column: 2;
    grid-row: 1;
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    height: 450px;
    display: flex;
    flex-direction: column;
  }
  
  .order-entry-area {
    grid-column: 2;
    grid-row: 2;
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
  }
  
  .trade-history-area {
    grid-column: 1 / span 2;
    grid-row: 3;
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  
  svg {
    color: var(--accent-blue);
  }
`;

const OrderBookTable = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 4px 0;
    position: relative;
    
    .price { font-weight: 600; }
    .amount { text-align: right; color: var(--text-tertiary); }
    .total { text-align: right; color: var(--text-tertiary); }
    
    &.ask .price { color: var(--accent-red); }
    &.bid .price { color: var(--accent-green); }
    
    .depth-bar {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      opacity: 0.15;
    }
  }
  
  .spread {
    text-align: center;
    padding: 8px 0;
    margin: 4px 0;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const OrderEntryForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    
    button {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--tertiary-dark);
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      
      &.active.buy { background: var(--accent-green); color: white; border-color: var(--accent-green); }
      &.active.sell { background: var(--accent-red); color: white; border-color: var(--accent-red); }
    }
  }
  
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    label { font-size: 12px; color: var(--text-tertiary); }
    input {
      background: var(--tertiary-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 10px;
      color: var(--text-primary);
      outline: none;
      
      &:focus { border-color: var(--accent-blue); }
    }
  }
  
  .btn-submit {
    margin-top: 5px;
    padding: 12px;
    border-radius: 4px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    text-transform: uppercase;
    
    &.buy { background: var(--accent-green); color: white; }
    &.sell { background: var(--accent-red); color: white; }
  }
`;

const TradingPage = () => {
  const { addToPortfolio } = useAppStore();
  const { getLatestPrice, getPriceHistory, selectedSymbol } = useMarketData();
  const [orderType, setOrderType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('0.00');
  const [chartData, setChartData] = useState([]);
  
  // Mock order book state
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [lastPrice, setLastPrice] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      try {
        const currentPrice = await getLatestPrice();
        if (!isMounted) return;
        
        const validPrice = typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 0;
        setLastPrice(validPrice);
        setPrice(validPrice.toFixed(2));
        
        const hist = await getPriceHistory();
        if (!isMounted) return;
        setChartData(Array.isArray(hist) ? hist : []);
        
        generateBook(validPrice);
      } catch (err) {
        console.error("TradingPage init failed", err);
      }
    };

    const generateBook = (basePrice) => {
      const p = basePrice || 1500;
      const newAsks = Array.from({ length: 12 }, (_, i) => ({
        price: p + (i + 1) * (p * 0.0001),
        amount: Math.random() * 500,
        total: 1000 + Math.random() * 5000
      })).reverse();
      
      const newBids = Array.from({ length: 12 }, (_, i) => ({
        price: p - (i + 1) * (p * 0.0001),
        amount: Math.random() * 500,
        total: 1000 + Math.random() * 5000
      }));
      
      setAsks(newAsks);
      setBids(newBids);
    };

    initData();
    
    const interval = setInterval(async () => {
      try {
        const p = await getLatestPrice();
        if (isMounted && typeof p === 'number' && !isNaN(p) && p > 0) {
          setLastPrice(p);
          generateBook(p);
        }
      } catch (err) { /* ignore periodic errors */ }
    }, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSymbol]);

  return (
    <TradingContainer className="page-container">
      <div className="main-chart-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{selectedSymbol}</h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{lastPrice.toFixed(2)}</span>
              <span style={{ color: 'var(--accent-green)' }}>+24.12 (1.14%)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['1m', '5m', '15m', '1h', '1D'].map(tf => (
              <button key={tf} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>{tf}</button>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" hide />
            <YAxis domain={['auto', 'auto']} stroke="#666" />
            <Tooltip 
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
              itemStyle={{ color: 'var(--accent-blue)' }}
            />
            <Area type="monotone" dataKey="price" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        
        <div style={{ marginTop: 'auto', display: 'flex', gap: '30px', padding: '15px 0', borderTop: '1px solid var(--border-color)' }}>
          <div><div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>24H HIGH</div><div style={{ fontWeight: '600' }}>22,512.00</div></div>
          <div><div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>24H LOW</div><div style={{ fontWeight: '600' }}>22,340.50</div></div>
          <div><div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>24H VOLUME</div><div style={{ fontWeight: '600' }}>842.12M</div></div>
        </div>
      </div>
      
      <div className="order-book-area">
        <SectionTitle><FiLayers size={16} /> Order Book</SectionTitle>
        <OrderBookTable>
          <div className="row header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="price">Price</div>
            <div className="amount">Amt</div>
            <div className="total">Total</div>
          </div>
          
          {asks.map((ask, idx) => (
            <div key={`ask-${idx}`} className="row ask">
              <div className="price">{ask.price.toFixed(2)}</div>
              <div className="amount">{ask.amount.toFixed(2)}</div>
              <div className="total">{ask.total.toLocaleString()}</div>
              <div className="depth-bar" style={{ width: `${(ask.amount / 500) * 100}%`, background: 'var(--accent-red)' }}></div>
            </div>
          ))}
          
          <div className="spread">Spread: 0.5 (0.002%)</div>
          
          {bids.map((bid, idx) => (
            <div key={`bid-${idx}`} className="row bid">
              <div className="price">{bid.price.toFixed(2)}</div>
              <div className="amount">{bid.amount.toFixed(2)}</div>
              <div className="total">{bid.total.toLocaleString()}</div>
              <div className="depth-bar" style={{ width: `${(bid.amount / 500) * 100}%`, background: 'var(--accent-green)' }}></div>
            </div>
          ))}
        </OrderBookTable>
      </div>
      
      <div className="order-entry-area">
        <SectionTitle><FiActivity size={16} /> Place Order</SectionTitle>
        <OrderEntryForm>
          <div className="tabs">
            <button 
              className={`buy ${orderType === 'buy' ? 'active' : ''}`}
              onClick={() => setOrderType('buy')}
            >BUY</button>
            <button 
              className={`sell ${orderType === 'sell' ? 'active' : ''}`}
              onClick={() => setOrderType('sell')}
            >SELL</button>
          </div>
          
          <div className="input-group">
            <label>Price ({selectedSymbol})</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label>Amount (Lots)</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Available</span>
            <span>1.24 BTC / ₹4.50L</span>
          </div>
          
          <button className={`btn-submit ${orderType}`}>
            {orderType === 'buy' ? 'Execute Buy' : 'Execute Sell'}
          </button>

          <button 
            onClick={() => addToPortfolio({
              symbol: selectedSymbol,
              qty: parseFloat(amount) || 1,
              avg: parseFloat(price) || lastPrice
            })}
            style={{ 
              marginTop: '10px', 
              padding: '10px', 
              borderRadius: '4px', 
              background: 'transparent', 
              border: '1px solid var(--accent-blue)', 
              color: 'var(--accent-blue)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add to Portfolio
          </button>
        </OrderEntryForm>
      </div>
      
      <div className="trade-history-area">
        <SectionTitle><FiList size={16} /> Market History</SectionTitle>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '10px 0' }}>Time</th>
                <th style={{ padding: '10px 0' }}>Type</th>
                <th style={{ padding: '10px 0' }}>Price</th>
                <th style={{ padding: '10px 0' }}>Size</th>
                <th style={{ padding: '10px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 0' }}>15:34:2{i}</td>
                  <td style={{ padding: '10px 0', color: i % 2 === 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {i % 2 === 0 ? 'BUY' : 'SELL'}
                  </td>
                  <td style={{ padding: '10px 0' }}>{lastPrice.toFixed(2)}</td>
                  <td style={{ padding: '10px 0' }}>{(Math.random() * 10).toFixed(4)}</td>
                  <td style={{ padding: '10px 0' }}>₹{(Math.random() * 100000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TradingContainer>
  );
};

export default TradingPage;
