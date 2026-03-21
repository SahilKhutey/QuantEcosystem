import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedSymbol: 'RELIANCE',
  selectedTimeframe: '1D',
  assetType: 'stocks',
  portfolio: JSON.parse(localStorage.getItem('trading_portfolio') || '[]'),
  
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setAssetType: (type) => set({ assetType: type }),
  
  addToPortfolio: (asset) => set((state) => {
    const exists = state.portfolio.find(p => p.symbol === asset.symbol);
    if (exists) return state; // Already exists
    const newPortfolio = [...state.portfolio, { ...asset, addedAt: new Date().toISOString() }];
    localStorage.setItem('trading_portfolio', JSON.stringify(newPortfolio));
    return { portfolio: newPortfolio };
  }),
  
  removeFromPortfolio: (symbol) => set((state) => {
    const newPortfolio = state.portfolio.filter(p => p.symbol !== symbol);
    localStorage.setItem('trading_portfolio', JSON.stringify(newPortfolio));
    return { portfolio: newPortfolio };
  }),
  
  clearPortfolio: () => {
    localStorage.removeItem('trading_portfolio');
    set({ portfolio: [] });
  }
}));

export default useAppStore;
