import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta

logger = logging.getLogger("BacktestEngine")

class BacktestEngine:
    """Historical simulation engine with realistic slippage and fees"""
    
    def __init__(self, initial_capital=100000.0):
        self.initial_capital = initial_capital
        self.logger = logger
        self.slippage_model = 0.0005 # 5 bps
        self.fee_model = 0.001 # 0.1% transaction fee
        
    def run_simulation(self, strategy_logic, historical_data):
        """Run a historical simulation of a strategy"""
        capital = self.initial_capital
        position = 0
        equity_curve = []
        trades = []
        
        self.logger.info(f"Starting backtest simulation with ${capital} capital")
        
        # Simulation loop
        for timestamp, row in historical_data.iterrows():
            price = row['close']
            
            # Simple placeholder for strategy logic signal
            signal = strategy_logic(row) # 'buy', 'sell', or 'hold'
            
            if signal == 'buy' and position == 0:
                qty = int(capital / (price * (1 + self.slippage_model + self.fee_model)))
                capital -= qty * price * (1 + self.slippage_model + self.fee_model)
                position = qty
                trades.append({'time': timestamp, 'type': 'BUY', 'price': price, 'qty': qty})
                
            elif signal == 'sell' and position > 0:
                capital += position * price * (1 - self.slippage_model - self.fee_model)
                trades.append({'time': timestamp, 'type': 'SELL', 'price': price, 'qty': position})
                position = 0
                
            current_value = capital + (position * price)
            equity_curve.append({'timestamp': timestamp, 'value': current_value})
            
        return {
            'final_value': current_value,
            'total_return': (current_value - self.initial_capital) / self.initial_capital,
            'equity_curve': equity_curve,
            'trades': trades
        }
