import sys
import os
import numpy as np
import logging

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.risk.manager import RiskManager
from services.broker.broker_interface import GlobalBrokerRouter
from services.broker.alpaca_api import AlpacaAPI
from config.settings import API_KEYS

def verify_evt_risk():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('EVTVerification')
    
    # Initialize components
    alpaca = AlpacaAPI(API_KEYS['alpaca_key'], API_KEYS['alpaca_secret'])
    broker = GlobalBrokerRouter()
    broker.add_broker('alpaca', alpaca)
    risk = RiskManager(broker)
    
    logger.info("--- Phase 1: Normal Market Returns ---")
    # Simulate 100 days of normal returns (~1% vol)
    normal_returns = np.random.normal(0.0005, 0.01, 100).tolist()
    risk.evt_manager.update_returns(normal_returns)
    
    metrics = risk.evt_manager.get_risk_metrics()
    logger.info(f"Normal VaR 99%: {metrics['var_99']:.2%}")
    logger.info(f"Normal CVaR 99%: {metrics['cvar_99']:.2%}")
    
    logger.info("\n--- Phase 2: Extreme tail event simulation ---")
    # Simulate a "Flash Crash" or tail event (-7%, -8%, -10%)
    tail_events = [-0.07, -0.08, -0.12, -0.05, -0.06]
    risk.evt_manager.update_returns(tail_events)
    
    metrics = risk.evt_manager.get_risk_metrics()
    logger.info(f"Tail Event VaR 99%: {metrics['var_99']:.2%}")
    logger.info(f"Tail Event CVaR 99%: {metrics['cvar_99']:.2%}")
    logger.info(f"Shape Parameter (xi): {metrics['xi']:.4f} (Higher = fatter tails)")
    
    if metrics['xi'] > 0.1:
        logger.info("VALIDATION SUCCESS: Model correctly identified fat-tail characteristics.")
    else:
        logger.warning("VALIDATION WARNING: Model shape parameter lower than expected for tail events.")

if __name__ == "__main__":
    verify_evt_risk()
