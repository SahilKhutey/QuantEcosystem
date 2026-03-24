import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uuid

class WealthManager:
    """
    Manages long-term wealth accumulation and distribution strategies (SIP/SWP).
    """
    def __init__(self, storage):
        self.logger = logging.getLogger("Wealth.WealthManager")
        self.storage = storage
        self.sips = {} # sip_id -> data
        self.swps = {} # swp_id -> data

    def create_sip(self, symbol: str, amount: float, frequency: str = "MONTHLY") -> str:
        sip_id = str(uuid.uuid4())[:8]
        self.sips[sip_id] = {
            'id': sip_id,
            'symbol': symbol,
            'amount': amount,
            'frequency': frequency,
            'total_invested': 0.0,
            'units_held': 0.0,
            'start_date': datetime.utcnow().isoformat(),
            'active': True
        }
        self.logger.info(f"SIP Created: {sip_id} for {symbol} (${amount} {frequency})")
        return sip_id

    def create_swp(self, symbol: str, amount: float, frequency: str = "MONTHLY") -> str:
        swp_id = str(uuid.uuid4())[:8]
        self.swps[swp_id] = {
            'id': swp_id,
            'symbol': symbol,
            'amount': amount,
            'frequency': frequency,
            'total_withdrawn': 0.0,
            'start_date': datetime.utcnow().isoformat(),
            'active': True
        }
        self.logger.info(f"SWP Created: {swp_id} for {symbol} (${amount} {frequency})")
        return swp_id

    def simulate_sip(self, amount: float, years: int, expected_return: float) -> dict:
        """Simple SIP future value calculator: FV = P * [((1 + i)^n - 1) / i] * (1 + i)"""
        i = expected_return / 12
        n = years * 12
        fv = amount * (((1 + i)**n - 1) / i) * (1 + i)
        total_invested = amount * n
        return {
            'future_value': round(fv, 2),
            'total_invested': round(total_invested, 2),
            'wealth_gain': round(fv - total_invested, 2),
            'years': years
        }

    def get_portfolio_summary(self) -> dict:
        return {
            'active_sips': len(self.sips),
            'active_swps': len(self.swps),
            'total_sip_notional': sum(s['amount'] for s in self.sips.values() if s['active']),
            'total_swp_notional': sum(s['amount'] for s in self.swps.values() if s['active'])
        }
