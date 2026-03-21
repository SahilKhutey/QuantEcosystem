import numpy as np
import pandas as pd

class StatisticalSignalGenerator:
    """
    Generates trading signals based on statistical thresholds and anomalies.
    Combines Z-Score, RSI, and Volatility adjustments.
    """
    def __init__(self, window=20, threshold=2.0):
        self.window = window
        self.threshold = threshold

    def generate(self, data: pd.Series):
        """
        Generates buy/sell signals.
        1: Buy (oversold/undervalued)
        -1: Sell (overbought/overvalued)
        """
        # 1. Z-Score Signal
        mu = data.rolling(window=self.window).mean()
        sigma = data.rolling(window=self.window).std()
        zscore = (data - mu) / sigma
        
        # 2. RSI Signal
        delta = data.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # 3. Combine signals
        signals = pd.Series(0, index=data.index)
        
        # Mean Reversion Logic
        signals.loc[zscore < -self.threshold] = 1   # Oversold
        signals.loc[zscore > self.threshold] = -1   # Overbought
        
        # Momentum adjustment (don't buy if RSI is extremely low? or do?)
        # Let's say we only buy if zscore is low AND RSI is below 30
        strict_signals = pd.Series(0, index=data.index)
        strict_signals.loc[(zscore < -self.threshold) & (rsi < 30)] = 1
        strict_signals.loc[(zscore > self.threshold) & (rsi > 70)] = -1
        
        return signals, strict_signals

if __name__ == "__main__":
    np.random.seed(42)
    prices = pd.Series(100 + np.cumsum(np.random.normal(0, 1, 1000)))
    gen = StatisticalSignalGenerator()
    signals, strict = gen.generate(prices)
    print("Signals summary:\n", signals.value_counts())
