import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

print("Verifying Quant Ecosystem Imports...")

try:
    from services.broker.alpaca_api import AlpacaAPI, OrderRequest
    print("✓ AlpacaAPI imported")
    
    from services.risk.manager import RiskManager
    print("✓ RiskManager imported")
    
    from services.data.market_data import MarketDataService
    print("✓ MarketDataService imported")
    
    from services.trade_engine.engine import TradeEngine, TradeOrder
    print("✓ TradeEngine imported")
    
    from services.trading.momentum_strategy import MomentumStrategy
    print("✓ MomentumStrategy imported")
    
    from services.trading.backtester import Backtester
    print("✓ Backtester imported")
    
    import main
    print("✓ main.py imported and syntax-checked")
    
    print("\n[SUCCESS] All core modules are valid and imports are correctly mapped.")
    
except Exception as e:
    print(f"\n[FAILURE] Import error detected: {e}")
    sys.exit(1)
