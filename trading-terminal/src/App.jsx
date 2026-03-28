import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './styles/globals.css';
import styled from 'styled-components';

import { Sidebar, Header } from './components/Sidebar';

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
import GlobalWealthPage from './pages/GlobalWealthPage';
import SIPDashboard from './pages/SIPDashboard';
import SWPDashboard from './pages/SWPDashboard';
import EquityAnalysisPage from './pages/EquityAnalysisPage';
import MultiStrategyPage from './pages/MultiStrategyPage';
import OptionsPage from './pages/OptionsPage';
import DeveloperPortalPage from './pages/DeveloperPortalPage';
import SystemHealthPage from './pages/SystemHealthPage';
import OptimizationPage from './pages/OptimizationPage';
import DRLStudioPage from './pages/DRLStudioPage';
import AdvancedEvaluationPage from './pages/AdvancedEvaluationPage';
import CommoditiesPage from './pages/CommoditiesPage';
import MacroPage from './pages/MacroPage';
import DevOpsPage from './pages/DevOpsPage';
import PerformanceAuditPage from './pages/PerformanceAuditPage';
import PipelinePage from './pages/PipelinePage';
import BacktestStudioPage from './pages/BacktestStudioPage';
import AllocatorPage from './pages/AllocatorPage';
import OrchestratorPage from './pages/OrchestratorPage';
import StressTestPage from './pages/StressTestPage';
import CommodityAlphaPage from './pages/CommodityAlphaPage';
import ModelZooPage from './pages/ModelZooPage';
import SentimentTopologyPage from './pages/SentimentTopologyPage';
import RLAgentStudioPage from './pages/RLAgentStudioPage';
import HFTBacktestPage from './pages/HFTBacktestPage';
import AIResearchPage from './pages/AIResearchPage';
import AssetAllocationPage from './pages/AssetAllocationPage';
import SignalMonitorPage from './pages/SignalMonitorPage';
import MacroHubPage from './pages/MacroHubPage';
import SovereignRiskPage from './pages/SovereignRiskPage';
import DeploymentPage from './pages/DeploymentPage';

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

import { Layout } from 'antd';
import useAppStore from './services/store/appStore';

const { Content } = Layout;

function App() {
  const { selectedSymbol, setSelectedSymbol } = useAppStore();
  const [collapsed, setCollapsed] = React.useState(false);

  useEffect(() => {
    console.log("Initializing trade terminal metadata...");
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar collapsed={collapsed} />
          <Layout>
            <Header 
              collapsed={collapsed} 
              onCollapse={setCollapsed} 
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
            />
            <Content style={{ padding: '0', background: '#f0f2f5', overflow: 'auto' }}>
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
                
                {/* Advanced Strategy Execution */}
                <Route path="/multi-strategy" element={<MultiStrategyPage />} />
                <Route path="/options" element={<OptionsPage />} />
                <Route path="/developer" element={<DeveloperPortalPage />} />
                <Route path="/system-health" element={<SystemHealthPage />} />
                <Route path="/optimization" element={<OptimizationPage />} />
                <Route path="/drl-studio" element={<DRLStudioPage />} />
                <Route path="/advanced-eval" element={<AdvancedEvaluationPage />} />
                <Route path="/commodities" element={<CommoditiesPage />} />
                <Route path="/macro" element={<MacroPage />} />
                <Route path="/devops" element={<DevOpsPage />} />
                <Route path="/performance-audit" element={<PerformanceAuditPage />} />
                <Route path="/pipeline" element={<PipelinePage />} />
                <Route path="/backtest-studio" element={<BacktestStudioPage />} />
                <Route path="/allocator" element={<AllocatorPage />} />
                <Route path="/orchestrator" element={<OrchestratorPage />} />
                <Route path="/stress-test" element={<StressTestPage />} />
                <Route path="/commodity-alpha" element={<CommodityAlphaPage />} />
                <Route path="/model-zoo" element={<ModelZooPage />} />
                <Route path="/sentiment-topology" element={<SentimentTopologyPage />} />
                <Route path="/rl-agent-studio" element={<RLAgentStudioPage />} />
                <Route path="/hft-backtest-lab" element={<HFTBacktestPage />} />
                <Route path="/ai-research" element={<AIResearchPage />} />
                <Route path="/asset-allocation-lab" element={<AssetAllocationPage />} />
                <Route path="/signal-monitor" element={<SignalMonitorPage />} />
                <Route path="/macro-hub" element={<MacroHubPage />} />
                <Route path="/sovereign-risk" element={<SovereignRiskPage />} />
                <Route path="/infrastructure" element={<DeploymentPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
