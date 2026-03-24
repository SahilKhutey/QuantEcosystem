import pandas as pd
import numpy as np
import logging
from typing import List, Dict
from trading_system.services.data.market_data import MarketDataService

class SignalGenerator:
    """
    Advanced signal generation engine.
    Calculates technical indicators and generates buy/sell signals.
    """
    def __init__(self):
        self.market_data = MarketDataService()
        self.logger = logging.getLogger(__name__)

    def generate_technical_signals(self, symbol: str) -> List[Dict]:
        """Generates signals based on technical indicators (RSI, Moving Averages)."""
        df = self.market_data.get_equity_data(symbol, period="1mo", interval="1d")
        if df.empty:
            return []
            
        signals = []
        
        # Simple RSI implementation
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        latest_rsi = df['RSI'].iloc[-1]
        if latest_rsi < 30:
            signals.append({
                'symbol': symbol,
                'action': 'BUY',
                'type': 'Technical',
                'confidence': 0.75,
                'reason': f'RSI Oversold ({latest_rsi:.2f})'
            })
        elif latest_rsi > 70:
            signals.append({
                'symbol': symbol,
                'action': 'SELL',
                'type': 'Technical',
                'confidence': 0.75,
                'reason': f'RSI Overbought ({latest_rsi:.2f})'
            })
            
        return signals
