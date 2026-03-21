import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TradingPage from './pages/TradingPage';
import SignalsPage from './pages/SignalsPage';
import PortfolioPage from './pages/PortfolioPage';
import RiskPage from './pages/RiskPage';
import NewsPage from './pages/NewsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import GlobalMarketPage from './pages/GlobalMarketPage';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--primary-dark);
  overflow: hidden;
  color: var(--text-primary);
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }
  
  .page-container {
    padding: 20px;
    flex: 1;
    overflow: auto;
    background: var(--secondary-dark);
  }
`;

function App() {
  useEffect(() => {
    // Initialize global data services
    // In production, this would connect to real APIs
    console.log("Initializing trading terminal data services...");
    
    // Set up global market data subscription
    // This would connect to real-time data streams in production
    // Use dynamic import or direct import if possible.
    // The user's code uses require, which might be okay but let's stick to their pattern or adapt it.
    
    // Note: The user's code had a small bug in require usage if they are using Vite (common with React 19).
    // Let's assume they want the functionality.
    
    // I'll use common implementation check.
    const initializeData = async () => {
      try {
        const marketDataModule = await import('./services/data/marketData');
        const marketDataStore = marketDataModule.default;
        const unsub = marketDataStore.getState().subscribe('AAPL', (data) => {
          console.log('Real-time data update:', data);
        });
        
        return () => {
          unsub();
          console.log("Cleaning up data subscriptions");
        };
      } catch (e) {
        console.error("Failed to initialize data services:", e);
      }
    };
    
    const cleanupPromise = initializeData();
    
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);
  
  return (
    <Router>
      <AppContainer>
        <Sidebar />
        <div className="main-content">
          <Header />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/global-market" element={<GlobalMarketPage />} />
          </Routes>
        </div>
      </AppContainer>
    </Router>
  );
}

export default App;
