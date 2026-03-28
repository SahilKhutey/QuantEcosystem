# Institutional AI Research Console: Technical Guide

This guide details the technical implementation of the **AI Research Console** in the Institutional Trading Terminal. The console provides real-time market sentiment and thematic intelligence for high-conviction decision support.

## 🚀 Engine Core (`ai_research.py`)

The backend logic is implemented in `api/endpoints/ai_research.py`, utilizing `yfinance` and `pandas` for real-time market summarization and intelligence.

### 1. Lead Analyst Engine (`/api/research/analyze`)
The console performs automated real-time summarization of stock performance.
- **Data Source**: Fetched via `yf.Ticker`. Retrieves `longBusinessSummary`, `trailingPE`, and `priceToBook`.
- **Methodology**:
    1. Calculate RSI (Relative Strength Index) based on 14-day history.
    2. Determine technical outlook based on price vs 20-day/50-day moving averages.
    3. Calculate 1-year Price Channel position for value/growth classification.
- **Metrics**: Annualized Return, Volatility, Sharpe Ratio, and VaR (Value at Risk) impact for the specific ticker.

### 2. Thematic Market Topology (`/api/research/themes`)
The research console generates a dynamic scatter plot based on contemporary market themes.
- **Logic**: Clusters symbols into themes (AI, Energy, Macro, Tech).
- **Visualization**: Maps symbols based on Alpha (excess return) and Beta (volatility) relative to the broader market index.
- **Consensus Bias**: Provides a "Sentiment Consensus" (e.g., STRONG BULLISH) based on aggregated price action and volatility.

## 🎨 Frontend Integration (`AIResearchPage.jsx`)

The React frontend utilizes **Ant Design** and **AntV G2Plot** for interactive visualization.
- **Executive Analyst Terminal**: Bound to `/api/research/analyze`. Synchronizes the analyst "Executive Summary" with live market data.
- **Thematic Scatter Plot**: Bound to `/api/research/themes`. Reflects current market clusters and volatility.
- **Risk Metrics Progress**: Bound to `/api/research/analyze`. Visualizes alpha/beta and annual volatility.

---

> [!IMPORTANT]
> **Data Latency Notice**: Real-world data fetching depends on external API availability. If a ticker is inaccessible, the engine will return a high-fidelity diagnostic simulation to maintain terminal responsiveness.
