import logging
from trading_system.services.trading.base_strategy import BaseStrategy
from datetime import datetime
import random

class HFTScalper(BaseStrategy):
    """
    High-Frequency Scalping Strategy leveraging Order Book Imbalance (OBI).
    Monitors bid/ask pressure to capture micro-momentum in sub-second intervals.
    """
    def __init__(self, name="HFTScalper", symbol="BTC/USD"):
        super().__init__(name, symbol)
        self.obi_threshold = 0.7
        self.tick_count = 0

    def generate_signal(self, data: dict) -> dict:
        """
        Processes real-time L2 data (bids/asks) to generate scalp signals.
        For demo purposes, we simulate the L2 input.
        """
        self.tick_count += 1
        
        # Simulate OBI calculation from L2 data
        # In production, 'data' would contain the full order book
        obi = data.get('obi', random.uniform(-1, 1))
        
        action = "HOLD"
        price = data.get('price', 150.0)
        
        if obi >= self.obi_threshold:
            action = "BUY"
        elif obi <= -self.obi_threshold:
            action = "SELL"
            
        if action != "HOLD":
            signal = {
                'symbol': self.symbol,
                'action': action,
                'price': price,
                'timestamp': datetime.utcnow().isoformat(),
                'reason': f"OBI Threshold Triggered: {obi:.4f}"
            }
            self.on_trade(signal)
            return signal
            
        return None

    def on_trade(self, signal: dict):
        """Callback for when a trade is executed."""
        self.metrics['total_trades'] += 1
        # Randomly simulate PnL for demo
        pnl = random.uniform(-10, 25)
        self.metrics['pnl'] += pnl
        if pnl > 0: self.metrics['wins'] += 1
        
        # Recalculate win rate
        self.metrics['win_rate'] = self.metrics['wins'] / self.metrics['total_trades']
        self.logger.info(f"HFT SCALP: {signal['action']} @ {signal['price']} | PnL: {pnl:.2f}")
