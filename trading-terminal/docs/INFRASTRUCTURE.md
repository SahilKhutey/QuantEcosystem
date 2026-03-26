# Institutional Infrastructure & Macro Documentation

## Overview
This document outlines the architecture and operational procedures for the newly integrated Macro Intelligence, Sovereign Risk, and Deployment Orchestration modules.

## Modules

### 1. Macro Intelligence Hub (`MacroHubPage.jsx`)
- **Purpose**: Provides a global command center for identifying macroeconomic regimes and monetary policy shifts.
- **Key Features**:
  - **Interest Rate Probability Curve**: Market-implied projections for central bank rate moves.
  - **Global Inflation Heatmap**: Cross-country CPI vs GDP growth mapping.
  - **Economic Calendar Forensics**: Real-time event stream with 'Surprise Status' tracking.
- **Backend Link**: Aligns with `macro_service.py` for data ingestion and risk-on/off composite scoring.

### 2. Sovereign Risk Dashboard (`SovereignRiskPage.jsx`)
- **Purpose**: High-fidelity forensic analysis of portfolio structural fragility and counterparty exposure.
- **Key Features**:
  - **HHI Concentration Matrix**: Herfindahl-Hirschman Index mapping of strategy and asset classes.
  - **Liquidity Stress Surface**: VaR modeling under varying volatility regimes.
  - **Counterparty Matrix Matrix**: Real-time monitoring of institutional credit limits.
- **Backend Link**: Aligns with `portfolio_risk.py` for parametric VaR and diversification ratios.

### 3. Institutional Deployment Orchestrator (`DeploymentPage.jsx`)
- **Purpose**: Control surface for the containerized strategy engine cluster.
- **Key Features**:
  - **Docker Topology Radar**: Visualizes pod resource pressure (CPU/Memory).
  - **CI/CD Pipeline Telemetry**: Monitoring deployment failure rates and push success.
  - **Horizontal Scaler Control**: Direct interaction with the auto-scaling group thresholds.
- **Backend Link**: Aligns with `deploy-strategy-engine.sh` for orchestration and node health.

## Developers
- **API SDK**: Programmatic access is available via the `developer_api.py` endpoints for custom integrations.
- **Webhooks**: Configure alert delivery via the Webhook Hub in the Developer Portal.
