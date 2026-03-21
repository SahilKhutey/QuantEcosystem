import numpy as np
import pandas as pd
from typing import List, Dict

class Indicator:
    """Base class for all indicators"""
    def __init__(self, name: str):
        self.name = name
        self.value = 0.0
        self.is_ready = False

    def update(self, *args, **kwargs):
        raise NotImplementedError
        
class SMA(Indicator):
    """Simple Moving Average (SMA)"""
    def __init__(self, period: int):
        super().__init__(f"SMA({period})")
        self.period = period
        self.history = []

    def update(self, value: float):
        self.history.append(value)
        if len(self.history) > self.period:
            self.history.pop(0)

        if len(self.history) == self.period:
            self.is_ready = True
            self.value = sum(self.history) / self.period
        return self.is_ready
        
class EMA(Indicator):
    """Exponential Moving Average (EMA)"""
    def __init__(self, period: int):
        super().__init__(f"EMA({period})")
        self.period = period
        self.multiplier = 2 / (period + 1)
        self.history = []
        
    def update(self, value: float):
        self.history.append(value)
        if not self.is_ready:
            if len(self.history) == self.period:
                self.is_ready = True
                self.value = sum(self.history) / self.period
        else:
            self.value = (value - self.value) * self.multiplier + self.value
        return self.is_ready

class RSI(Indicator):
    """Relative Strength Index (RSI)"""
    def __init__(self, period: int = 14):
        super().__init__(f"RSI({period})")
        self.period = period
        self.history = []
        self.gains = []
        self.losses = []
        self.avg_gain = 0.0
        self.avg_loss = 0.0

    def update(self, value: float):
        self.history.append(value)
        if len(self.history) > 1:
            diff = self.history[-1] - self.history[-2]
            if diff >= 0:
                self.gains.append(diff)
                self.losses.append(0)
            else:
                self.gains.append(0)
                self.losses.append(abs(diff))

            if len(self.history) == self.period + 1:
                self.avg_gain = sum(self.gains) / self.period
                self.avg_loss = sum(self.losses) / self.period
                self.is_ready = True
            elif len(self.history) > self.period + 1:
                self.gains.pop(0)
                self.losses.pop(0)
                self.avg_gain = (self.avg_gain * (self.period - 1) + (diff if diff > 0 else 0)) / self.period
                self.avg_loss = (self.avg_loss * (self.period - 1) + (abs(diff) if diff < 0 else 0)) / self.period

            if self.is_ready:
                if self.avg_loss == 0:
                    self.value = 100.0
                else:
                    rs = self.avg_gain / self.avg_loss
                    self.value = 100.0 - (100.0 / (1.0 + rs))

        return self.is_ready

class MACD(Indicator):
    """Moving Average Convergence Divergence (MACD)"""
    def __init__(self, fast_period: int = 12, slow_period: int = 26, signal_period: int = 9):
        super().__init__(f"MACD({fast_period},{slow_period},{signal_period})")
        self.fast_ema = EMA(fast_period)
        self.slow_ema = EMA(slow_period)
        self.signal_ema = EMA(signal_period)
        self.macd_value = 0.0
        self.signal_value = 0.0
        self.histogram = 0.0

    def update(self, value: float):
        fast_ready = self.fast_ema.update(value)
        slow_ready = self.slow_ema.update(value)

        if fast_ready and slow_ready:
            self.macd_value = self.fast_ema.value - self.slow_ema.value
            self.signal_ready = self.signal_ema.update(self.macd_value)
            
            if self.signal_ready:
                self.is_ready = True
                self.signal_value = self.signal_ema.value
                self.histogram = self.macd_value - self.signal_value
                # Setting base self.value to macd_value to maintain inheritance properties
                self.value = self.macd_value
        
        return self.is_ready

class BollingerBands(Indicator):
    """Bollinger Bands"""
    def __init__(self, period: int = 20, num_std: float = 2.0):
        super().__init__(f"BB({period},{num_std})")
        self.period = period
        self.num_std = num_std
        self.history = []
        self.middle_band = 0.0
        self.upper_band = 0.0
        self.lower_band = 0.0

    def update(self, value: float):
        self.history.append(value)
        if len(self.history) > self.period:
            self.history.pop(0)

        if len(self.history) == self.period:
            self.is_ready = True
            std_dev = np.std(self.history)
            self.middle_band = np.mean(self.history)
            self.upper_band = self.middle_band + (std_dev * self.num_std)
            self.lower_band = self.middle_band - (std_dev * self.num_std)
            self.value = self.middle_band # Typical representation
            
        return self.is_ready

class IndicatorManager:
    """Manages indicators for a given strategy making it easy to register and automatically update."""
    def __init__(self):
        self._indicators = {}

    def register(self, symbol: str, indicator_name: str, indicator: Indicator):
        if symbol not in self._indicators:
            self._indicators[symbol] = {}
        self._indicators[symbol][indicator_name] = indicator
        return indicator

    def update(self, symbol: str, price: float):
        if symbol in self._indicators:
            for ind_name, ind in self._indicators[symbol].items():
                ind.update(price)

    def get(self, symbol: str, indicator_name: str) -> Indicator:
        return self._indicators.get(symbol, {}).get(indicator_name)
