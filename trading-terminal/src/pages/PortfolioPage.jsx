import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPieChart, FiTrendingUp, FiBriefcase, FiArrowUpRight, FiArrowDownRight, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PortfolioContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 20px;
  height: 100%;
  
  .stats-row {
    grid-column: 1 / span 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .chart-card {
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .holdings-card {
    grid-column: 1 / span 2;
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
  }
`;

const StatCard = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  .label { color: var(--text-tertiary); font-size: 12px; margin-bottom: 8px; text-transform: uppercase; }
  .value { font-size: 24px; font-weight: 700; color: var(--text-primary); }
  .change { 
    display: flex; 
    align-items: center; 
    gap: 4px; 
    font-size: 14px; 
    margin-top: 8px;
    
    &.positive { color: var(--accent-green); }
    &.negative { color: var(--accent-red); }
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  
  svg { color: var(--accent-blue); }
`;

const HoldingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th { text-align: left; color: var(--text-tertiary); font-weight: 500; font-size: 13px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }
  td { padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
  
  .symbol { font-weight: 600; }
  .name { color: var(--text-tertiary); font-size: 12px; }
  .positive { color: var(--accent-green); }
  .negative { color: var(--accent-red); }
`;

import useAppStore from '../services/store/appStore';
import { useMarketData } from '../services/data/marketData';

const PortfolioPage = () => {
  const { portfolio, removeFromPortfolio, clearPortfolio } = useAppStore();
  const { prices, getLatestPrice } = useMarketData();
  const [performanceData, setPerformanceData] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculate live portfolio metrics
  const totalInvested = portfolio.reduce((acc, h) => acc + (h.qty * h.avg), 0);
  const currentValue = portfolio.reduce((acc, h) => acc + (h.qty * (prices[h.symbol] || h.avg)), 0);
  const totalPnL = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  useEffect(() => {
    // Fetch latest prices for all holdings
    portfolio.forEach(h => {
      getLatestPrice(h.symbol);
    });

    // Mock performance history based on portfolio size
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: `Week ${i + 1}`,
      value: (totalInvested || 2000000) + (Math.random() - 0.2) * 50000 + (i * 10000)
    }));
    setPerformanceData(data);
  }, [portfolio]);

  const allocationData = portfolio.length > 0 
    ? portfolio.map(h => ({ name: h.symbol, value: Math.round((h.qty * (prices[h.symbol] || h.avg) / (currentValue || 1)) * 100) }))
    : [{ name: 'Empty', value: 100 }];

  return (
    <PortfolioContainer className="page-container">
      <div className="stats-row">
        <StatCard>
          <div className="label">Total Portfolio Value</div>
          <div className="value">₹{currentValue.toLocaleString()}</div>
          <div className="change {totalPnL >= 0 ? 'positive' : 'negative'}">
            {totalPnL >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
            ₹{Math.abs(totalPnL).toLocaleString()} ({pnlPct.toFixed(2)}%)
          </div>
        </StatCard>
        <StatCard>
          <div className="label">Invested Value</div>
          <div className="value">₹{totalInvested.toLocaleString()}</div>
          <div className="change" style={{ color: 'var(--text-tertiary)' }}>Across {portfolio.length} assets</div>
        </StatCard>
        <StatCard>
          <div className="label">Available Cash</div>
          <div className="value">₹12,45,000</div>
          <div className="change positive"><FiTrendingUp /> Healthy Coverage</div>
        </StatCard>
        <StatCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="label">Management</div>
            <button 
              onClick={clearPortfolio}
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >Ditch All</button>
          </div>
          <div className="value" style={{ fontSize: '18px', marginTop: '5px' }}>Self-Directed</div>
          <div className="change" style={{ color: 'var(--text-tertiary)' }}>Personalized Strategy</div>
        </StatCard>
      </div>
      
      <div className="chart-card">
        <SectionTitle><FiTrendingUp /> Cumulative Performance</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis domain={['auto', 'auto']} stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }} />
            <Area type="monotone" dataKey="value" stroke="#0088FE" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-card">
        <SectionTitle><FiPieChart /> Asset Allocation</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <ResponsiveContainer width="50%" height={250}>
            <PieChart>
              <Pie
                data={allocationData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, paddingLeft: '20px' }}>
            {allocationData.length > 0 && allocationData[0].name !== 'Empty' ? allocationData.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                  {item.name}
                </span>
                <span style={{ fontWeight: '600' }}>{item.value}%</span>
              </div>
            )) : <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Add assets to see allocation</div>}
          </div>
        </div>
      </div>
      
      <div className="holdings-card">
        <SectionTitle><FiBriefcase /> Your Tracked Portfolio</SectionTitle>
        {portfolio.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <FiBriefcase size={40} style={{ marginBottom: '15px' }} />
            <p>Your portfolio is empty. Add stocks from the trading terminal.</p>
          </div>
        ) : (
          <HoldingsTable>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Qty</th>
                <th>Avg. Cost</th>
                <th>Current Price</th>
                <th>P&L</th>
                <th>P&L %</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((h, i) => {
                const current = prices[h.symbol] || h.avg;
                const pnl = (current - h.avg) * h.qty;
                const pnlP = ((current - h.avg) / h.avg) * 100;
                return (
                  <tr key={h.symbol}>
                    <td>
                      <div className="symbol">{h.symbol}</div>
                      <div className="name">User Selected Asset</div>
                    </td>
                    <td>{h.qty}</td>
                    <td>₹{h.avg.toLocaleString()}</td>
                    <td>₹{current.toLocaleString()}</td>
                    <td className={pnl >= 0 ? 'positive' : 'negative'}>
                      {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toLocaleString()}
                    </td>
                    <td className={pnl >= 0 ? 'positive' : 'negative'}>
                      {pnlP >= 0 ? '+' : ''}{pnlP.toFixed(2)}%
                    </td>
                    <td>
                      <button 
                        onClick={() => removeFromPortfolio(h.symbol)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                      >Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </HoldingsTable>
        )}
      </div>
    </PortfolioContainer>
  );
};

export default PortfolioPage;
