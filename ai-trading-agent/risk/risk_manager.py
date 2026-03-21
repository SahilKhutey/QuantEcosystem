from typing import Dict, List, Optional
import numpy as np
from loguru import logger

class ProductionRiskManager:
    def __init__(self):
        self.max_drawdown_limit = 0.15  # 15%
        self.daily_loss_limit = 0.05    # 5%
        self.position_limit = 0.1       # 10% per position
        
    def validate_trade(self, trade: Dict, portfolio: Dict) -> Dict:
        """Validate trade against risk parameters"""
        violations = []
        
        # Ensure portfolio has required keys
        total_value = portfolio.get('total_value', 0)
        if total_value <= 0:
            return {'is_valid': False, 'violations': ["Invalid portfolio value"], 'risk_score': 1.0}

        # Position size check
        notional = trade.get('notional', 0)
        position_size_pct = notional / total_value
        if position_size_pct > self.position_limit:
            violations.append(f"Position size {position_size_pct:.1%} exceeds limit of {self.position_limit:.1%}")
            
        # Drawdown check
        current_drawdown = self._calculate_drawdown(portfolio)
        if current_drawdown > self.max_drawdown_limit:
            violations.append(f"Maximum drawdown {current_drawdown:.1%} exceeded (limit {self.max_drawdown_limit:.1%})")
            
        # Daily loss check
        daily_pnl = portfolio.get('daily_pnl', 0)
        if daily_pnl < -self.daily_loss_limit * total_value:
            violations.append(f"Daily loss limit exceeded: {daily_pnl:.2f}")
            
        is_valid = len(violations) == 0
        allowed_size = min(notional, self.position_limit * total_value) if is_valid else 0
        
        return {
            'is_valid': is_valid,
            'violations': violations,
            'allowed_position_size': allowed_size,
            'risk_score': self._calculate_risk_score(trade, portfolio)
        }

    def _calculate_drawdown(self, portfolio: Dict) -> float:
        """Calculate current drawdown from peak equity."""
        peak = portfolio.get('peak_value', portfolio.get('total_value', 1))
        current = portfolio.get('total_value', 1)
        if peak <= 0: return 0.0
        return (peak - current) / peak

    def _calculate_risk_score(self, trade: Dict, portfolio: Dict) -> float:
        """Calculate a composite risk score (0-1)."""
        # Simplified risk score based on volatility and position size
        volatility = trade.get('volatility', 0.02)
        size_factor = trade.get('notional', 0) / portfolio.get('total_value', 1)
        return min(volatility * 10 * size_factor * 5, 1.0)
