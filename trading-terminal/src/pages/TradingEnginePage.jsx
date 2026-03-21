import React from 'react';
import { FiShield } from 'react-icons/fi';
import PortfolioOptimization from '../components/Dashboard/TradingEngine/PortfolioOptimization';
import RiskManagement from '../components/Dashboard/TradingEngine/RiskManagement';
import LeanBacktester from '../components/Dashboard/TradingEngine/LeanBacktester';
import BacktraderDashboard from '../components/dashboard/TradingEngine/BacktraderDashboard';
import ZiplineDashboard from '../components/dashboard/TradingEngine/ZiplineDashboard';
import FreqtradeDashboard from '../components/dashboard/TradingEngine/FreqtradeDashboard';
import BacktestingPyDashboard from '../components/dashboard/TradingEngine/BacktestingPyDashboard';
import VectorbtDashboard from '../components/dashboard/TradingEngine/VectorbtDashboard';
import BtDashboard from '../components/dashboard/TradingEngine/BtDashboard';
import FinRLDashboard from '../components/dashboard/TradingEngine/FinRLDashboard';
import TensortradeDashboard from '../components/dashboard/TradingEngine/TensortradeDashboard';
import QlibDashboard from '../components/dashboard/TradingEngine/QlibDashboard';
import ProphetDashboard from '../components/dashboard/TradingEngine/ProphetDashboard';
import CcxtDashboard from '../components/dashboard/TradingEngine/CcxtDashboard';
import YFinanceDashboard from '../components/dashboard/TradingEngine/YFinanceDashboard';
import PyPortfolioOptDashboard from '../components/dashboard/TradingEngine/PyPortfolioOptDashboard';
import AlphalensDashboard from '../components/dashboard/TradingEngine/AlphalensDashboard';
import QuantstatsDashboard from '../components/dashboard/TradingEngine/QuantstatsDashboard';
import OpenBBDashboard from '../components/dashboard/TradingEngine/OpenBBDashboard';
import HummingbotDashboard from '../components/dashboard/TradingEngine/HummingbotDashboard';
import UnifiedPipelineBuilder from '../components/dashboard/TradingEngine/UnifiedPipelineBuilder';
import StrategyMarketplace from '../components/dashboard/TradingEngine/StrategyMarketplace';
import AICopilotBar from '../components/dashboard/TradingEngine/AICopilotBar';

const TradingEnginePage = () => (
<div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '120px' }}>
  <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
    <div className="page-header">
      <div>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiShield color="var(--accent-amber)" size={22} />
          Trading Engine
        </div>
        <div className="page-subtitle">
          Portfolio optimization · Risk metrics · VaR/CVaR · Stress testing
        </div>
      </div>
      <span className="badge badge-amber">
        <span className="status-dot live" /> Position Monitor Active
      </span>
    </div>

    {/* The Ultimate Pipeline Orchestrator linking 19 Repos */}
    <UnifiedPipelineBuilder />

    {/* The Proprietary Algorithm App Store */}
    <StrategyMarketplace />

    {/* Portfolio + Risk side by side (Responsive) */}
    <div className="responsive-grid-2">
      <PortfolioOptimization />
      <RiskManagement />
    </div>

    {/* Lean Engine Backtester */}
    <LeanBacktester />

    {/* Backtrader Engine Simulator */}
    <BacktraderDashboard />

    {/* Zipline Engine Simulator */}
    <ZiplineDashboard />

    {/* Freqtrade Engine Simulator */}
    <FreqtradeDashboard />

    {/* Backtesting.py Engine Simulator */}
    <BacktestingPyDashboard />

    {/* VectorBT Engine Simulator */}
    <VectorbtDashboard />

    {/* bt Framework Engine Simulator */}
    <BtDashboard />

    {/* FinRL Deep Reinforcement Learning Agent Simulator */}
    <FinRLDashboard />

    {/* TensorTrade Environment Agent Simulator */}
    <TensortradeDashboard />

    {/* Microsoft Qlib ML Pipeline Engine */}
    <QlibDashboard />

    {/* Hummingbot High Frequency Pure Market Making */}
    <HummingbotDashboard />

    {/* Meta Prophet GAM Time-Series Forecaster */}
    <ProphetDashboard />

    {/* CCXT Market Data Connection Normalizer */}
    <CcxtDashboard />

    {/* OpenBB Unified Open Data Platform Abstractions */}
    <OpenBBDashboard />

    {/* YFinance Data Architecture Wrapper */}
    <YFinanceDashboard />

    {/* PyPortfolioOpt Markowitz Capital Optimizer */}
    <PyPortfolioOptDashboard />

    {/* Quantopian Alphalens Vector Evaluator */}
    <AlphalensDashboard />

    {/* Quantstats Comprehensive KPIs */}
    <QuantstatsDashboard />
  </div>

  {/* Pinned Intelligent Command Bar */}
  <AICopilotBar />
</div>);

export default TradingEnginePage;
