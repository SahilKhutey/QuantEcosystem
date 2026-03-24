import sys
import os
import time
import logging

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.risk.manager import RiskManager
from services.broker.broker_interface import GlobalBrokerRouter
from services.broker.alpaca_api import AlpacaAPI
from config.settings import API_KEYS

def verify_bayesian_sizing():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('Verification')
    
    # Initialize components
    alpaca = AlpacaAPI(API_KEYS['alpaca_key'], API_KEYS['alpaca_secret'])
    broker = GlobalBrokerRouter()
    broker.add_broker('alpaca', alpaca)
    risk = RiskManager(broker)
    
    logger.info("--- Phase 1: Initial Bull Regime ---")
    # Simulate bull market returns
    bull_returns = [0.005, 0.012, 0.008, 0.015, -0.002]
    for r in bull_returns:
        risk.update_market_regime([r])
    
    status = risk.bayesian_sizer.get_current_regime()
    logger.info(f"Regime: {status['current_regime']} | Probs: {status['regime_probabilities']}")
    
    size = risk.get_position_size("AAPL", 150.0, 145.0, use_bayesian=True)
    logger.info(f"Bull Position Size (AAPL @ 150, SL 145): {size} shares")
    
    logger.info("\n--- Phase 2: Transition to Volatile Regime ---")
    # Simulate high volatility
    volatile_returns = [0.05, -0.04, 0.06, -0.05, 0.03]
    for r in volatile_returns:
        risk.update_market_regime([r])
    
    status = risk.bayesian_sizer.get_current_regime()
    logger.info(f"Regime: {status['current_regime']} | Probs: {status['regime_probabilities']}")
    
    size = risk.get_position_size("AAPL", 150.0, 145.0, use_bayesian=True)
    logger.info(f"Volatile Position Size (AAPL @ 150, SL 145): {size} shares (Should be smaller)")
    
    logger.info("\n--- Phase 3: Trade Feedback (Learning) ---")
    # Record some losses in the 'bull' regime to shift probabilities
    for _ in range(10):
        risk.record_trade_result(-500.0, 0.8) # Heavy losses with high confidence
    
    status = risk.bayesian_sizer.get_current_regime()
    logger.info(f"Regime After Losses: {status['current_regime']} | Probs: {status['regime_probabilities']}")

if __name__ == "__main__":
    verify_bayesian_sizing()
