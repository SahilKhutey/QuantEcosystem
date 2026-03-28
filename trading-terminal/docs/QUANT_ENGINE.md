# Institutional Quantitative Engine: Technical Guide

This guide details the technical implementation of the **Quant Engine** in the Institutional Trading Terminal. The engine is designed for high-fidelity, data-driven research and strategy validation.

## 🚀 Engine Core (`quant_engine.py`)

The backend logic is implemented in `api/endpoints/quant_engine.py`, utilizing `yfinance`, `pandas`, and `numpy` for real-time financial modeling.

### 1. Portfolio Optimizer (`/optimization/portfolio`)
The terminal utilizes a robust **Inverse-Volatility Mean-Variance** weighting strategy.
- **Data Source**: Fetches 1 year of `Adj Close` historical price history via `yf.download`.
- **Methodology**:
    1. Calculate daily log returns.
    2. Compute annualized volatility (standard deviation * sqrt(252)).
    3. Generate weights by inverting volatility (1/vol) and normalizing to 100%.
- **Robustness**: Automatically handles `yfinance` MultiIndex DataFrames for multiple assets and falls back to Equal Weighting if data is insufficient.

### 2. Historical Backtesting (`/backtesting/<strategy_id>`)
The backtest engine performs a high-fidelity simulation of quantitative strategies on historical data.
- **Logic**: Implements a **Mean Reversion (MA Crossover)** strategy as a benchmark.
- **Metrics**:
    - **Sharpe Ratio**: Annualized (mean return / std deviation).
    - **Max Drawdown**: Highest peak-to-trough decline over 1 year.
    - **Win Rate**: Count of profitable daily returns.
- **Visualization**: Generates a synchronized **Equity vs Benchmark (Buy and Hold)** curve for visual comparison.

## 🎨 Frontend Integration (`QuantEnginePage.jsx`)

The React frontend utilizes **Ant Design** and **AntV G2Plot** for interactive visualization.
- **Signal Hub Radar**: Bound to `/signals/convergence`. Reflects live multi-modal fusion weights (LSTM, Transformers, XGBoost).
- **Model Zoo Pie**: Bound to `/optimization/portfolio`. Dynamically re-balances when "Compute Optimal Weights" is triggered.
- **RL Agent Area**: Bound to `/rl/metrics`. Displays real-time training reward convergence.

---

> [!IMPORTANT]
> **Data Latency Notice**: Real-world data fetching depends on external API availability. If a ticker is inaccessible, the engine will return a high-fidelity diagnostic simulation to maintain terminal responsiveness.
