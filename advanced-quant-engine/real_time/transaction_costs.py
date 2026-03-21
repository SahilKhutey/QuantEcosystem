import numpy as np
import pandas as pd

class TransactionCostModel:
    """
    Models realistic transaction costs including slippage, commissions, and market impact.
    """
    def __init__(self, commission_bps=5, slippage_pct=0.01, impact_coefficient=0.1):
        self.commission_bps = commission_bps / 10000.0
        self.slippage_pct = slippage_pct / 100.0
        self.impact_coefficient = impact_coefficient

    def calculate_costs(self, trade_size, price, daily_volume=None):
        """
        Calculates total cost for a trade.
        """
        # 1. Fixed Commission
        commission = trade_size * price * self.commission_bps
        
        # 2. Linear Slippage
        slippage = trade_size * price * self.slippage_pct
        
        # 3. Market Impact (simplified Square-root model)
        impact = 0
        if daily_volume:
             participation = trade_size / daily_volume
             impact = price * self.impact_coefficient * np.sqrt(participation)
             
        return commission + slippage + impact

if __name__ == "__main__":
    model = TransactionCostModel()
    cost = model.calculate_costs(trade_size=1000, price=150, daily_volume=1e6)
    print(f"Total transaction cost: ${cost:.2f}")
