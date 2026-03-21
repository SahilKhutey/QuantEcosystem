import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './styles/globals.css';
import styled from 'styled-components';

import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

// Page imports
import DashboardPage from './pages/DashboardPage';
import TradingPage from './pages/TradingPage';
import SignalsPage from './pages/SignalsPage';
import PortfolioPage from './pages/PortfolioPage';
import RiskPage from './pages/RiskPage';
import NewsPage from './pages/NewsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import GlobalMarketPage from './pages/GlobalMarketPage';
import StockAnalysisPage from './pages/StockAnalysisPage';
import QuantEnginePage from './pages/QuantEnginePage';
import AIAgentPage from './pages/AIAgentPage';
import TradingEnginePage from './pages/TradingEnginePage';
import GlobalWealthPage from './pages/GlobalWealthPage.jsx';
import SIPDashboard from './pages/SIPDashboard.jsx';
import SWPDashboard from './pages/SWPDashboard.jsx';
import EquityAnalysisPage from './pages/EquityAnalysisPage.jsx';

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
    console.log("Initializing trading terminal data services...");
    
    return () => {
      console.log("Cleaning up data subscriptions");
    };
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          <Sidebar />
          <div className="main-content">
            <Header />
            <Routes>
              {/* Core Terminal Routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trading" element={<TradingPage />} />
              <Route path="/signals" element={<SignalsPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Quant Ecosystem Routes */}
              <Route path="/global-market" element={<GlobalMarketPage />} />
              <Route path="/stock-analysis" element={<StockAnalysisPage />} />
              <Route path="/quant-engine" element={<QuantEnginePage />} />
              <Route path="/ai-agent" element={<AIAgentPage />} />
              <Route path="/trading-engine" element={<TradingEnginePage />} />
              
              {/* Wealth Management Routes */}
              <Route path="/wealth" element={<GlobalWealthPage />} />
              <Route path="/wealth/sip" element={<SIPDashboard />} />
              <Route path="/wealth/swp" element={<SWPDashboard />} />
              <Route path="/wealth/equity" element={<EquityAnalysisPage />} />
            </Routes>
          </div>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
