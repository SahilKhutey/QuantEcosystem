# ⚡ Quantum Trading Terminal
### Institutional Intelligence Platform · v2.0

> A production-grade institutional trading terminal combining real-time market data, multi-modal AI signal generation, quantitative research, and intelligent portfolio management — all in one unified dark-mode dashboard.

---

## 🚀 Quick Start

### Prerequisites
| Dependency | Minimum Version |
|---|---|
| Python | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |

### One-Click Launch (Windows)
```bash
# From the Quant root directory
./Launch_Terminal.bat
```

Opens automatically at **http://localhost:5173**

### Manual Launch
```bash
# 1. Start the Flask API backend (Terminal 1)
cd trading-terminal
python main.py         # Serves on http://localhost:5000

# 2. Start the React frontend (Terminal 2)
cd trading-terminal
npm run dev            # Serves on http://localhost:5173
```

### Install Dependencies (first time only)
```bash
# Backend
cd trading-terminal
pip install -r requirements.txt

# Frontend
cd trading-terminal
npm install
```

---

## 🗂️ Project Architecture

```
Quant/
├── Launch_Terminal.bat          ← One-click launcher
├── trading-terminal/            ← Main application
│   ├── main.py                  ← Flask API server (Port 5000)
│   ├── api/
│   │   └── endpoints/           ← All Flask blueprint endpoints
│   │       ├── dashboard.py     ← Portfolio & market overview
│   │       ├── market.py        ← Real-time market data (yfinance)
│   │       ├── quant_engine.py  ← Quant signals & model fusion
│   │       ├── signals.py       ← Trading signals
│   │       ├── risk.py          ← Risk management (VaR, drawdown)
│   │       ├── portfolio.py     ← Portfolio analytics
│   │       └── ...              ← 35+ additional endpoints
│   ├── services/
│   │   ├── data/
│   │   │   └── market_data_service.py  ← Multi-source data engine
│   │   └── market_integration.py
│   ├── src/                     ← React frontend (Vite)
│   │   ├── App.jsx              ← Root layout (Sidebar + Header + Routes)
│   │   ├── main.jsx             ← React entry point
│   │   ├── pages/               ← 40+ page components
│   │   ├── components/
│   │   │   ├── Sidebar/         ← Navigation, Header, System Status
│   │   │   ├── Dashboard/       ← Dashboard widgets
│   │   │   ├── Analytics/       ← MetricCard, charts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api/             ← API client layer (49 service files)
│   │   │   │   └── apiConfig.js ← Centralized API URL config
│   │   │   └── store/
│   │   │       └── appStore.js  ← Zustand global state
│   │   └── styles/
│   │       ├── globals.css      ← Design tokens + AntD overrides
│   │       └── theme.js         ← Styled-components theme
│   ├── public/
│   │   ├── favicon.svg          ← App icon (SVG)
│   │   └── icon-512.png         ← App icon (PNG 512x512)
│   ├── index.html               ← Entry HTML with meta & OG tags
│   ├── vite.config.js           ← Vite config + API proxy
│   └── requirements.txt         ← Python dependencies
└── README.md                    ← This file
```

---

## 🖥️ Feature Modules

### Core Trading Desk
| Module | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Institutional Command Center with live metrics |
| **Order Desk** | `/trading` | Order entry and management |
| **Signals** | `/signals` | Real-time signal monitor |
| **Options** | `/options` | Derivatives workbench |
| **Multi-Strategy** | `/multi-strategy` | Multi-strategy command center |

### Portfolio & Risk
| Module | Route | Description |
|---|---|---|
| **Portfolio** | `/portfolio` | Portfolio overview and attribution |
| **Risk Dashboard** | `/risk` | VaR, CVaR, drawdown analytics |
| **Stress Testing** | `/stress-test` | Systemic stress lab |
| **Allocator** | `/allocator` | Institutional portfolio architect |
| **Asset Allocation Lab** | `/asset-allocation-lab` | Bayesian allocation optimization |
| **Sovereign Risk** | `/sovereign-risk` | Country risk & HHI dashboard |

### Market Intelligence
| Module | Route | Description |
|---|---|---|
| **Global Market** | `/global-market` | Real-time global index map |
| **Commodities** | `/commodities` | Global commodities dashboard |
| **Commodity Alpha** | `/commodity-alpha` | Commodity alpha generation |
| **Macro Intelligence** | `/macro` | Macro economic indicators |
| **Global Macro Hub** | `/macro-hub` | Cross-asset macro intelligence |
| **News & Signals** | `/news` | Neural NLP news signals |
| **Sentiment Topology** | `/sentiment-topology` | NLP sentiment graph |
| **AI Research** | `/ai-research` | Institutional AI research engine |

### Quantitative Desk
| Module | Route | Description |
|---|---|---|
| **Quant Engine** | `/quant-engine` | Multi-model signal fusion |
| **Backtest Studio** | `/backtest-studio` | Strategy backtesting |
| **HFT Lab** | `/hft-backtest-lab` | High-frequency microstructure lab |
| **Signal Monitor** | `/signal-monitor` | HFT signal trace monitor |
| **Performance Audit** | `/performance-audit` | Attribution & performance audit |
| **Advanced Evaluation** | `/advanced-eval` | Sharpe, alpha, beta analytics |
| **Optimization** | `/optimization` | Strategy parameter optimization |
| **Model Zoo** | `/model-zoo` | Neural model library |

### AI / Reinforcement Learning Studio
| Module | Route | Description |
|---|---|---|
| **AI Agent** | `/ai-agent` | Autonomous trading AI agent |
| **DRL Studio** | `/drl-studio` | Deep RL training studio |
| **RL Agent Studio** | `/rl-agent-studio` | Adaptive RL agent studio |

### Wealth Management
| Module | Route | Description |
|---|---|---|
| **Wealth Overview** | `/wealth` | Global wealth management |
| **SIP Dashboard** | `/wealth/sip` | Systematic investment plans |
| **SWP Dashboard** | `/wealth/swp` | Systematic withdrawal plans |
| **Equity Analysis** | `/wealth/equity` | Equity return analysis |

### Infrastructure
| Module | Route | Description |
|---|---|---|
| **System Health** | `/system-health` | Service health & monitoring |
| **DevOps Console** | `/devops` | Infrastructure DevOps |
| **Pipeline Hub** | `/pipeline` | Strategy pipeline management |
| **Orchestrator** | `/orchestrator` | Docker strategy orchestrator |
| **Analytics** | `/analytics` | Advanced analytics & modeling |
| **Developer Portal** | `/developer` | API & SDK developer tools |
| **Settings** | `/settings` | System configuration |

---

## 🔌 Backend API Reference

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints

```http
GET  /health                           # Service health check
GET  /api/data/realtime/{symbol}       # Real-time price data (yfinance)
GET  /api/data/historical/{symbol}     # Historical OHLCV data
POST /api/quant-engine/signals/fusion/run  # Model fusion signal
GET  /api/dashboard/portfolio          # Portfolio overview
GET  /api/signals/                     # Trading signals
GET  /api/risk/                        # Risk metrics
GET  /api/market/indices               # Global indices
POST /api/backtest/run                 # Run strategy backtest
GET  /api/settings/system             # System configuration
```

### Data Sources
- **Yahoo Finance** (yfinance) — Primary: stocks, indices, crypto
- **Alpha Vantage** — Secondary: global stocks, forex
- **FRED API** — Economic indicators
- **News API** — Real-time financial news

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 4** | Build tool & dev server |
| **Ant Design 5** | Component library |
| **Styled Components** | Custom theming |
| **Zustand** | Lightweight global state |
| **React Router 6** | Client-side routing |
| **Recharts** | Data visualization |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.9+** | Runtime |
| **Flask** | REST API framework |
| **Flask-CORS** | Cross-origin support |
| **yFinance** | Market data |
| **NumPy / Pandas** | Quantitative compute |
| **aiohttp** | Async HTTP client |

### Design System
| Token | Value |
|---|---|
| Primary Background | `#070a0f` |
| Card Background | `#0d1117` |
| Sidebar | `#0a0d14` |
| Accent Blue | `#3b82f6` |
| Accent Green | `#10b981` |
| Text Primary | `#f0f6fc` |
| Text Secondary | `#8b949e` |
| Font | Inter + JetBrains Mono |

---

## ⚙️ Configuration

### Environment Variables
Create `trading-terminal/.env`:
```env
# Optional: external API keys
VITE_API_URL=http://localhost:5000/api
ALPHA_VANTAGE_KEY=your_key_here
NEWS_API_KEY=your_key_here
FRED_API_KEY=your_key_here
```

### Vite Proxy
The frontend proxies all `/api` requests to the Flask backend — no CORS issues in development:
```js
// vite.config.js
proxy: {
  '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true }
}
```

---

## 🐛 Troubleshooting

### Dashboard shows blank screen
- Ensure both backend (5000) and frontend (5173) are running
- Check the browser console for errors
- Confirm `trading-terminal/.env` exists (copy from `.env.example`)

### Port already in use
```powershell
# Kill processes on ports
$p = (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess
Stop-Process -Id $p -Force
```

### Backend 500 Errors
- Real-time data errors for Indian symbols like `RELIANCE` are expected — yfinance uses NSE notation (`RELIANCE.NS`)
- The frontend falls back to realistic mocks seamlessly
- Check `services/data/market_data_service.py` for source configuration

---

## 📋 Recent Changes (v2.0 — March 2026)

### 🔧 Bug Fixes
- **Fixed blank dashboard** — Removed duplicate `index.js`/`index.jsx` files that caused Vite bundling conflicts
- **Fixed API connectivity** — Centralized API configuration in `src/services/api/apiConfig.js`; all 49 service files updated
- **Fixed port mismatch** — Frontend now correctly proxies to backend on port 5000 (was 3001)
- **Fixed syntax errors** — Resolved `SyntaxError` in `api/endpoints/settings.py` (misplaced `global` declarations)
- **Fixed model fusion** — Added missing `/signals/fusion/run` endpoint to `quant_engine.py`

### ✨ New Features
- **Premium dark sidebar** — Complete redesign with Inter font, active route detection, collapsible submenus
- **Smart navigation** — `NavigationMenu` now auto-detects active route and opens correct submenu from `useLocation()`
- **Dark topbar** — Custom header with breadcrumb, live badge, real-time clock, symbol chips
- **App icon** — New Quantum Terminal SVG favicon and 512px PNG icon
- **AntD dark overrides** — Global Ant Design component overrides for consistent dark theming

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: your feature description"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Proprietary — Sahil Khutey / QuantEcosystem. All rights reserved.

---

*Built with ❤️ for institutional-grade quantitative trading.*
