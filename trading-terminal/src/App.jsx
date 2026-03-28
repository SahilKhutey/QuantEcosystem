import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './styles/globals.css';

import { Sidebar, Header } from './components/Sidebar';
import useAppStore from './services/store/appStore';

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

function App() {
  const [collapsed, setCollapsed] = React.useState(false);

  useEffect(() => {
    console.log('Quantum Terminal: initializing...');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/*
          Root shell: full-viewport flex row.
          Sidebar occupies its natural width via Ant Design Sider.
          Right column = header + scrollable page area.
        */}
        <div
          style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Sidebar — rendered as Ant Design Sider, takes natural width */}
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />

          {/* Right column */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {/* Topbar */}
            <Header
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />

            {/* Page Content */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                background: 'var(--bg-primary)',
                backgroundImage:
                  'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.03) 0%, transparent 50%)',
              }}
            >
              <Routes>
                {/* Core Terminal */}
                <Route path="/"              element={<DashboardPage />} />
                <Route path="/trading"       element={<TradingPage />} />
                <Route path="/signals"       element={<SignalsPage />} />
                <Route path="/portfolio"     element={<PortfolioPage />} />
                <Route path="/risk"          element={<RiskPage />} />
                <Route path="/news"          element={<NewsPage />} />
                <Route path="/analytics"     element={<AnalyticsPage />} />
                <Route path="/settings"      element={<SettingsPage />} />

                {/* Quant Ecosystem */}
                <Route path="/global-market"   element={<GlobalMarketPage />} />
                <Route path="/stock-analysis"  element={<StockAnalysisPage />} />
                <Route path="/quant-engine"    element={<QuantEnginePage />} />
                <Route path="/ai-agent"        element={<AIAgentPage />} />
                <Route path="/trading-engine"  element={<TradingEnginePage />} />

                {/* Wealth Management */}
                <Route path="/wealth"         element={<GlobalWealthPage />} />
                <Route path="/wealth/sip"     element={<SIPDashboard />} />
                <Route path="/wealth/swp"     element={<SWPDashboard />} />
                <Route path="/wealth/equity"  element={<EquityAnalysisPage />} />

                {/* Strategy & Execution */}
                <Route path="/multi-strategy"      element={<MultiStrategyPage />} />
                <Route path="/options"             element={<OptionsPage />} />
                <Route path="/developer"           element={<DeveloperPortalPage />} />
                <Route path="/system-health"       element={<SystemHealthPage />} />
                <Route path="/optimization"        element={<OptimizationPage />} />
                <Route path="/drl-studio"          element={<DRLStudioPage />} />
                <Route path="/advanced-eval"       element={<AdvancedEvaluationPage />} />
                <Route path="/commodities"         element={<CommoditiesPage />} />
                <Route path="/macro"               element={<MacroPage />} />
                <Route path="/devops"              element={<DevOpsPage />} />
                <Route path="/performance-audit"   element={<PerformanceAuditPage />} />
                <Route path="/pipeline"            element={<PipelinePage />} />
                <Route path="/backtest-studio"     element={<BacktestStudioPage />} />
                <Route path="/allocator"           element={<AllocatorPage />} />
                <Route path="/orchestrator"        element={<OrchestratorPage />} />
                <Route path="/stress-test"         element={<StressTestPage />} />
                <Route path="/commodity-alpha"     element={<CommodityAlphaPage />} />
                <Route path="/model-zoo"           element={<ModelZooPage />} />
                <Route path="/sentiment-topology"  element={<SentimentTopologyPage />} />
                <Route path="/rl-agent-studio"     element={<RLAgentStudioPage />} />
                <Route path="/hft-backtest-lab"    element={<HFTBacktestPage />} />
                <Route path="/ai-research"         element={<AIResearchPage />} />
                <Route path="/asset-allocation-lab"element={<AssetAllocationPage />} />
                <Route path="/signal-monitor"      element={<SignalMonitorPage />} />
                <Route path="/macro-hub"           element={<MacroHubPage />} />
                <Route path="/sovereign-risk"      element={<SovereignRiskPage />} />
                <Route path="/infrastructure"      element={<DeploymentPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
