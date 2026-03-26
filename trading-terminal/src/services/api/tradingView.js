// src/api/tradingView.js
export const tradingViewAPI = {
  getStudies: async () => {
    return [
      { id: 'MA', name: 'Moving Average', type: 'overlay' },
      { id: 'EMA', name: 'Exponential Moving Average', type: 'overlay' },
      { id: 'BB', name: 'Bollinger Bands', type: 'overlay' },
      { id: 'RSI', name: 'Relative Strength Index', type: 'oscillator' },
      { id: 'MACD', name: 'MACD', type: 'oscillator' }
    ];
  },
  
  getIndicators: async () => {
    return [
      { id: 'VOL', name: 'Volume', type: 'panel' },
      { id: 'OBV', name: 'On-Balance Volume', type: 'panel' },
      { id: 'VWAP', name: 'VWAP', type: 'overlay' }
    ];
  },

  getConfig: async () => {
    return {
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
      symbols_types: [{ name: 'Stock', value: 'stock' }],
      exchanges: [{ value: 'NYSE', name: 'NYSE', desc: 'New York Stock Exchange' }]
    };
  }
};
