// src/utils/indicators.js

export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return [];
  const sma = [];
  for (let i = 0; i <= data.length - period; i++) {
    const sum = data.slice(i, i + period).reduce((acc, val) => acc + val.price, 0);
    sma.push({ timestamp: data[i + period - 1].timestamp, value: sum / period });
  }
  return sma;
};

export const calculateEMA = (data, period) => {
  if (!data || data.length < period) return [];
  const ema = [];
  const k = 2 / (period + 1);
  let prevEMA = data.slice(0, period).reduce((acc, val) => acc + val.price, 0) / period;
  
  for (let i = period - 1; i < data.length; i++) {
    const currentPrice = data[i].price;
    const currentEMA = (currentPrice - prevEMA) * k + prevEMA;
    ema.push({ timestamp: data[i].timestamp, value: currentEMA });
    prevEMA = currentEMA;
  }
  return ema;
};
