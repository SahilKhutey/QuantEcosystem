import pandas as pd
import logging
from datetime import datetime
from services.trading.strategy import Strategy
from services.trading.signal_generator import SignalGenerator

logger = logging.getLogger('MomentumStrategy')

class MomentumStrategy(Strategy):
    """
    Momentum Strategy implementation using EMA crossovers and RSI filters
    """
    def __init__(self, symbol: str, fast_period: int = 9, slow_period: int = 21):
        super().__init__("MomentumCrossover", symbol)
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.signals_gen = SignalGenerator()
        self.data_history = pd.DataFrame()
        
    def on_start(self):
        super().on_start()
        self.logger.info(f"Initialized with EMA({self.fast_period}/{self.slow_period})")

    def on_stop(self):
        super().on_stop()

    def on_bar(self, bar: dict):
        """Process new bar and generate signals"""
        # Append new bar to history
        new_row = pd.DataFrame([bar])
        self.data_history = pd.concat([self.data_history, new_row]).tail(100)
        
        if len(self.data_history) < self.slow_period:
            return None
            
        # Calculate indicators
        self.data_history = self.signals_gen.calculate_indicators(self.data_history)
        
        # Get latest values
        current = self.data_history.iloc[-1]
        prev = self.data_history.iloc[-2]
        
        signal = "HOLD"
        confidence = 0.0
        
        # EMA Crossover Logic
        if prev['ema_9'] <= prev['ema_21'] and current['ema_9'] > current['ema_21']:
            # Bullish crossover - check RSI filter
            if current['rsi'] < 70:
                signal = "BUY"
                confidence = 0.8
        elif prev['ema_9'] >= prev['ema_21'] and current['ema_9'] < current['ema_21']:
            # Bearish crossover - check RSI filter
            if current['rsi'] > 30:
                signal = "SELL"
                confidence = 0.8
                
        if signal != "HOLD":
            return self.log_signal(signal, current['close'], confidence)
        
        return None

    def on_tick(self, tick: dict):
        """Pass ticks to bar logic if needed or handle stop losses"""
        pass

    def on_order_update(self, order: dict):
        self.logger.info(f"Order updated: {order['id']} -> {order['status']}")
