# Quant Project Directory & Module Report

This report provides a detailed breakdown of the `c:\Users\User\Documents\Quant` folder, categorizing its sub-projects, modules, and core libraries.

---

## 1. Advanced Quant Engine (`/advanced-quant-engine`)
**Purpose**: High-level quantitative modeling and machine learning.
- **Modules**:
  - `ml_advanced/`: AutoML, Ensemble Models, Reinforcement Learning.
  - `model_fusion/`: Bayesian Fusion, Adaptive Weighting, Confidence Calibration.
  - `optimization/`: Convex Optimization, Dynamic Programming, Kelly Criterion.
  - `regime_detection/`: Hidden Markov Models, Kalman Filters, Cointegration.
  - `statistical_arbitrage/`: Pairs Trading, PCA Factors, Statistical Signals.
  - `stochastic_models/`: Heston Model, GARCH, Copula Dependency, Extreme Value Theory.
  - `real_time/`: Live Monitoring, Performance Attribution.

## 2. AI Trading Agent (`/ai-trading-agent`)
**Purpose**: Intelligent agents for market analysis and news processing.
- **Key Modules**:
  - `agents/`: Macro Analyst, Market Analyst, News Intelligence.
  - `brain/`: Reasoning and decision-making logic.
  - `knowledge/`: Domain-specific knowledge base.
- **Main Libraries**: `Transformers`, `Torch`, `OpenAI`, `CCXT`, `FastAPI`, `Pandas`, `NumPy`, `TA-Lib`.

## 3. Quant Master Engine (`/quant-master-engine`)
**Purpose**: The core quantitative library powering other projects.
- **Modules**:
  - `time_series/`: ARIMA, LSTM, VAR models.
  - `ml_models/`: Regression, Z-Score detection, Bayesian updates.
  - `signal_fusion/`: Combining multiple alpha signals.
  - `probability/`: Monte Carlo simulations.
- **Main Libraries**: `QuantLib`, `PyPortfolioOpt`, `Arch`, `Statsmodels`, `Scikit-learn`.

## 4. Trading Engine (`/trading-engine`)
**Purpose**: Core execution and portfolio management system.
- **Modules**:
  - `backtesting/`: Strategy simulation framework.
  - `execution/`: Order management and routing.
  - `risk/`: Risk management and exposure tracking.
  - `portfolio/`: Optimization and rebalancing.
  - `strategies/`: Momentum, Mean Reversion, Sentiment-based.

## 5. Stock Analyzer Pro (`/stock-analyzer-pro`)
**Purpose**: Advanced stock analysis platform with AI integration.
- **Modules**:
  - `backend/`: FastAPI services, SQLAlchemy models.
  - `ai-engine/`: Sentiment analysis and predictive modeling.
  - `quant-engine/`: Technical and fundamental analysis.
- **Main Libraries**: `SQLAlchemy`, `Redis`, `Kafka-python`, `Passlib`, `Python-jose`.

## 6. Global Market Map (`/global-market-map`)
**Purpose**: Geospatial visualization of global market events.
- **Modules**:
  - `geo_parser/`: NLP-based geographic intelligence.
  - `realtime/`: Live event streams.
- **Main Libraries**: `Spacy`, `NLTK`, `FastAPI`, `Leaflet` (Frontend).

## 7. Trading Terminal (`/trading-terminal`)
**Purpose**: Graphical User Interface for the entire ecosystem.
- **Tech Stack**:
  - `backend/`: Flask API.
  - `frontend/`: React/Vite (inside `src/`).
  - `desktop/`: Electron wrapper.

---

## Shared Infrastructure & Utilities

- **`data_engine/`**: Data aggregation, processing pipelines, and storage logic.
- **`services/`**: Generic services like `data_monitoring.py`.
- **`scripts/`**: Utility scripts like `data_validation.py`.
- **`config/`**: Global settings and configuration files.
- **`data/`**: Local database files (`financial_data.db`, `test.db`).

## Core Libraries Used Across Project
| Category | Libraries |
| :--- | :--- |
| **Data Processing** | `Pandas`, `NumPy`, `Xarray` |
| **AI / ML** | `Scikit-learn`, `PyTorch`, `Transformers`, `OpenAI`, `Statsmodels` |
| **Quant / Finance** | `YFinance`, `TA-Lib`, `Alpha Vantage`, `QuantLib`, `CCXT`, `PyPortfolioOpt` |
| **API / Backend** | `FastAPI`, `Flask`, `Uvicorn`, `SQLAlchemy`, `Gunicorn` |
| **Visualization** | `Plotly`, `Matplotlib`, `Seaborn` |
| **Infrastructure** | `Redis`, `Kafka`, `Docker`, `Kubernetes`, `AWS CLI`, `Heroku CLI` |
