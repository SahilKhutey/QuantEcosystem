/**
 * Global Equity Data Service
 */

// Simulated realistic historical data for global indices
const generateHistoricalData = (baseVal, volatility, count = 12) => {
  let val = baseVal;
  const data = [];
  const now = new Date();
  
  for (let i = count; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    data.push({
      date: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      value: Math.round(val)
    });
    // Random walk with slight upward drift
    val = val * (1 + (Math.random() * volatility * 2 - volatility + 0.005));
  }
  return data;
};

export const globalIndices = [
  {
    id: 'SPX',
    name: 'S&P 500',
    region: 'North America',
    marketCap: '$45.2 Trillion',
    peRatio: 26.4,
    dividendYield: 1.4,
    ytdReturn: 8.2,
    history: generateHistoricalData(5100, 0.04)
  },
  {
    id: 'NDX',
    name: 'Nasdaq 100',
    region: 'North America',
    marketCap: '$24.1 Trillion',
    peRatio: 32.1,
    dividendYield: 0.8,
    ytdReturn: 12.4,
    history: generateHistoricalData(18000, 0.06)
  },
  {
    id: 'NIFTY',
    name: 'NIFTY 50',
    region: 'Asia Pacific',
    marketCap: '$4.2 Trillion',
    peRatio: 22.8,
    dividendYield: 1.2,
    ytdReturn: 15.6,
    history: generateHistoricalData(22000, 0.05)
  },
  {
    id: 'STOXX',
    name: 'Euro Stoxx 50',
    region: 'Europe',
    marketCap: '$4.8 Trillion',
    peRatio: 14.5,
    dividendYield: 3.1,
    ytdReturn: 4.5,
    history: generateHistoricalData(4900, 0.03)
  },
  {
    id: 'NIKKEI',
    name: 'Nikkei 225',
    region: 'Asia Pacific',
    marketCap: '$6.2 Trillion',
    peRatio: 16.2,
    dividendYield: 2.1,
    ytdReturn: 9.8,
    history: generateHistoricalData(39000, 0.05)
  }
];

export const getEquityData = () => {
  return globalIndices;
};
