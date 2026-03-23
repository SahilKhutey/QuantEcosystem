# Quant Ecosystem: Institutional-Grade Multi-Broker Trading Terminal

An institutional-grade quantitative trading platform featuring unified broker abstraction, multi-strategy execution, and real-time risk-managed operations.

## 🚀 Key Features

### 1. Unified Broker API Core
- **Multi-Broker Routing**: Consistent interface for **Alpaca**, **Interactive Brokers**, and **TD Ameritrade**.
- **Global Broker Router**: Seamlessly switch between production (Alpaca) and simulated (IBKR/TDA) execution environments.

### 2. Specialized Execution Triad
- **High-Frequency Scalping (HFT)**: Sub-second analysis and rapid-fire (15s) trade execution across liquid symbols.
- **Intraday Engine**: Multi-session day trading with mandatory end-of-day position closure.
- **Swing Engine**: Medium-term trend following using institutional technical indicators (SMA, RSI, MACD).

### 3. Professional Risk Management
- **Centralized Guardrails**: 5% maximum daily loss limit and automated drawdown circuit breakers.
- **Unified Position Sizing**: Real-time allocation monitoring and institutional risk-adjusted sizing across all engines.

### 4. Graphical Trading Terminal
- **Real-Time Dashboard**: Streamlit-based UI for strategy oversight, P&L monitoring, and manual execution.
- **Unified Monitoring**: Integrated Prometheus scraping and alerting configuration for institutional SRE.

---

## 📂 Project Structure

```bash
├── config/              # Centralized environment & strategy settings
├── k8s/                 # Cloud-native Kubernetes manifests
├── monitoring/          # Prometheus & Alerting configurations
├── services/
│   ├── broker/          # Unified Broker API implementations (Alpaca, IBKR, TDA)
│   ├── trading/         # HFT, Swing, and Intraday Execution Engines
│   └── risk/            # Professional Risk Management & Circuit Breakers
├── web/                 # Streamlit-based Global Trading Terminal
├── Dockerfile           # Production container configuration
└── main.py              # System-wide orchestration loop
```

---

## 🛠️ Quick Start

### 1. Local Development
```bash
# Install system & Python dependencies
pip install -r requirements.txt

# Run the graphical terminal
streamlit run web/trading_terminal.py

# Run the production orchestration loop (optional)
python main.py
```

### 2. Docker Deployment
```bash
# Build the institutional-grade image
docker build -t quant-terminal:1.0 .

# Run the containerized terminal
docker run -p 8501:8501 --env-file .env quant-terminal:1.0
```

### 3. Kubernetes Orchestration
```bash
# Deploy to production cluster
kubectl apply -f k8s/deployment_terminal.yaml
```

---

## 📈 Monitoring & Reliability
Detailed operational guidelines, maintenance cycles, and disaster recovery plans are available in the [production_guide.md](production_guide.md).

---
*Developed for Institutional-Grade Quantitative Trading Operations*
