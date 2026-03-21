import numpy as np
import pandas as pd

class PureMarketMakingStrategy:
    """
    Simulates Hummingbot's core Pure Market Making (PMM) logic.
    Instead of OHLCV bars, it operates on current Mid Price, placing continuous Ask and Bid blocks.
    """
    def __init__(self, bid_spread: float, ask_spread: float, order_amount: float):
        self.bid_spread = bid_spread
        self.ask_spread = ask_spread
        self.order_amount = order_amount
        
        # Simulate base inventory skew (e.g. holding 55% BTC, 45% USDT)
        self.base_inventory = 1.0 # BTC
        self.quote_inventory = 65000.0 # USDT
        
    def generate_depth_chart(self, mid_price: float):
        """
        Calculates the exact limit levels that Hummingbot would broadcast to the open exchange.
        Creates an array mirroring standard Depth Chart plotting.
        """
        # Calculate optimal top of book
        best_bid = mid_price * (1 - self.bid_spread)
        best_ask = mid_price * (1 + self.ask_spread)
        
        # Generate cascading depth levels deeper into the order book
        num_levels = 15
        depth = []
        
        # Generate Bids (Left side, lower than mid price)
        cum_bid_vol = 0
        for i in range(num_levels, 0, -1):
            price_level = best_bid * (1 - (i * 0.001)) # Drops by 0.1% per level
            vol = np.random.uniform(self.order_amount * 0.5, self.order_amount * 2.0)
            cum_bid_vol += vol
            depth.append({
                "price": float(price_level),
                "bidDepth": float(cum_bid_vol), # Cumulative Bid Support
                "askDepth": 0
            })
            
        # Ensure perfect separation at exactly the mid price
        depth.append({"price": float(mid_price), "bidDepth": 0, "askDepth": 0})
            
        # Generate Asks (Right side, higher than mid price)
        cum_ask_vol = 0
        for i in range(1, num_levels + 1):
            price_level = best_ask * (1 + (i * 0.001)) # Rises by 0.1% per level
            vol = np.random.uniform(self.order_amount * 0.5, self.order_amount * 2.0)
            cum_ask_vol += vol
            depth.append({
                "price": float(price_level),
                "bidDepth": 0,
                "askDepth": float(cum_ask_vol) # Cumulative Ask Resistance
            })
            
        return depth, best_bid, best_ask
        
    def get_inventory_status(self, mid_price: float):
        """Simulates Hummingbot's balancing algorithms evaluating whether to skew the spread."""
        base_value_in_quote = self.base_inventory * mid_price
        total_value = base_value_in_quote + self.quote_inventory
        
        base_pct = base_value_in_quote / total_value
        quote_pct = self.quote_inventory / total_value
        
        return {
            "total_value": total_value,
            "base_pct": base_pct * 100,
            "quote_pct": quote_pct * 100
        }
