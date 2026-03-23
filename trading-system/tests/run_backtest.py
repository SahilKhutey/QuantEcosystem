import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from services.trading.momentum_strategy import MomentumStrategy
from services.trading.backtester import Backtester

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('BacktestDemo')

def generate_mock_data(symbol: str, periods: int = 500):
    """Generate mock historical price data with a trend"""
    np.random.seed(42)
    start_date = datetime.now() - timedelta(days=periods)
    dates = [start_date + timedelta(days=i) for i in range(periods)]
    
    # Random walk with drift
    returns = np.random.normal(0, 0.02, periods) + 0.001
    price = 100 * np.exp(np.cumsum(returns))
    
    df = pd.DataFrame({
        'open': price * (1 + np.random.normal(0, 0.001, periods)),
        'high': price * (1 + abs(np.random.normal(0, 0.005, periods))),
        'low': price * (1 - abs(np.random.normal(0, 0.005, periods))),
        'close': price,
        'volume': np.random.randint(1000, 10000, periods)
    }, index=dates)
    
    return df

def main():
    symbol = "AAPL"
    logger.info(f"Generating mock data for {symbol}...")
    df = generate_mock_data(symbol)
    
    logger.info("Initializing strategy and backtester...")
    strategy = MomentumStrategy(symbol)
    backtester = Backtester(initial_capital=100000.0)
    
    logger.info("Running backtest...")
    results = backtester.run(strategy, df)
    
    logger.info("Backtest Results:")
    for key, value in results.items():
        logger.info(f"  {key}: {value}")
        
    backtester.plot_results("backtest_demo.png")
    logger.info("Backtest demonstration complete.")

if __name__ == "__main__":
    main()
