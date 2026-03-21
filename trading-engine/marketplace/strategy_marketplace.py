import json
from typing import Dict, List
from datetime import datetime

class StrategyRegistry:
    """
    Central repository tracking all custom algorithms developed in the Quantitative Ecosystem.
    Acts as the backend data store for the Strategy Marketplace.
    """
    def __init__(self):
        # Master dictionary simulating database instances of deployed proprietary strategies
        self.strategies = {
            "ai_signal_fusion": {
                "id": "ai_signal_fusion",
                "name": "LSTM Signal Fusion Engine",
                "author": "Antigravity Research",
                "category": "Machine Learning",
                "market_regime": "Any",
                "description": "Fuses Tensor LSTMs, Attention Transformers, and XGBoost tree outputs into a singular dynamic signal edge.",
                "metrics": {
                    "win_rate": 0.62,
                    "sharpe_ratio": 2.15,
                    "max_drawdown": 0.12,
                    "trades_per_month": 45
                },
                "status": "active"
            },
            "intraday_scalper": {
                "id": "intraday_scalper",
                "name": "Intraday Volatility Scalper",
                "author": "Antigravity Research",
                "category": "HFT / Mean Reversion",
                "market_regime": "Choppy / High Volatility",
                "description": "Exploits 5-minute Opening Range Breakouts and strict VWAP deviations to scrape momentary inefficiencies.",
                "metrics": {
                    "win_rate": 0.48,
                    "sharpe_ratio": 1.45,
                    "max_drawdown": 0.08,
                    "trades_per_month": 320
                },
                "status": "active"
            },
            "macro_swing": {
                "id": "macro_swing",
                "name": "Macro Regime Swing",
                "author": "Antigravity Research",
                "category": "Trend Following",
                "market_regime": "Trending (Bull/Bear)",
                "description": "Multi-week positional engine relying heavily on Chandelier Exits and Federal Treasury metrics.",
                "metrics": {
                    "win_rate": 0.38,
                    "sharpe_ratio": 2.80,
                    "max_drawdown": 0.18,
                    "trades_per_month": 6
                },
                "status": "active"
            },
            "sentiment_ai": {
                "id": "sentiment_ai",
                "name": "GPT-4 Event Arbitrage",
                "author": "OpenAI / OpenBB",
                "category": "NLP Sentiment",
                "market_regime": "Earnings / News Spikes",
                "description": "Live parsing of corporate structural events measuring positive/negative asymmetric sentiment scores.",
                "metrics": {
                    "win_rate": 0.71,
                    "sharpe_ratio": 3.10,
                    "max_drawdown": 0.05,
                    "trades_per_month": 12
                },
                "status": "active"
            }
        }
    
    def get_catalog(self) -> List[Dict]:
        """Returns the structural metadata array for frontend display."""
        return list(self.strategies.values())
        
    def deploy_strategy(self, strategy_id: str) -> Dict:
        """Simulates licensing and spinning up a containerized Strategy Engine."""
        if strategy_id not in self.strategies:
            raise ValueError(f"Strategy {strategy_id} not found in the registry.")
            
        strat = self.strategies[strategy_id]
        
        return {
            "strategy": strat['name'],
            "deployment_id": f"inst_{datetime.utcnow().timestamp()}",
            "status": "Deploying into Orchestration Pipeline",
            "required_margin": 10000.00
        }
