import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class RiskLevel(Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class RiskParameters:
    max_capital_risk: float = 0.02  # 2% max risk per trade
    max_portfolio_risk: float = 0.10  # 10% max portfolio risk
    max_daily_loss: float = 0.05  # 5% max daily loss
    max_concurrent_trades: int = 5
    max_correlation: float = 0.7  # Maximum allowed correlation between positions
    min_risk_reward: float = 1.5  # Minimum risk-reward ratio
    max_position_size_pct: float = 0.25  # 25% max of portfolio in one position
    stop_loss_type: str = "atr"  # atr, percentage, trailing

class RiskManager:
    def __init__(self, parameters: RiskParameters):
        self.parameters = parameters
        self.positions = {}
        self.trade_history = []
        self.daily_pnl = 0
        self.daily_trades = 0
        
    def calculate_position_size(self, capital: float,
                              entry_price: float,
                              stop_loss: float,
                              risk_per_trade: Optional[float] = None) -> float:
        """Calculate position size using 2% risk rule"""
        if risk_per_trade is None:
            risk_per_trade = self.parameters.max_capital_risk
        
        # Calculate stop loss distance
        stop_loss_distance = abs(entry_price - stop_loss)
        
        if stop_loss_distance == 0:
            return 0
        
        # Calculate risk amount
        risk_amount = capital * risk_per_trade
        
        # Calculate position size
        position_size = risk_amount / stop_loss_distance
        
        # Apply position size limits
        position_value = position_size * entry_price
        max_position_value = capital * self.parameters.max_position_size_pct
        
        if position_value > max_position_value:
            position_size = max_position_value / entry_price
        
        return position_size
    
    def check_trade_risk(self, trade: Dict, 
                        portfolio: Dict,
                        market_data: Dict) -> Tuple[bool, str]:
        """Check if trade meets risk requirements"""
        reasons = []
        
        # 1. Check risk-reward ratio
        if 'risk_reward_ratio' in trade:
            if trade['risk_reward_ratio'] < self.parameters.min_risk_reward:
                reasons.append(f"Risk-reward ratio {trade['risk_reward_ratio']:.2f} below minimum {self.parameters.min_risk_reward}")
        
        # 2. Check position size limit
        position_value = trade.get('position_size', 0) * trade.get('entry_price', 0)
        portfolio_value = portfolio.get('total_value', 0)
        
        if portfolio_value > 0:
            position_pct = position_value / portfolio_value
            if position_pct > self.parameters.max_position_size_pct:
                reasons.append(f"Position size {position_pct:.1%} exceeds maximum {self.parameters.max_position_size_pct:.1%}")
        
        # 3. Check daily loss limit
        if self.daily_pnl < -portfolio_value * self.parameters.max_daily_loss:
            reasons.append(f"Daily loss {self.daily_pnl:.2f} exceeds limit")
        
        # 4. Check concurrent trades limit
        active_positions = len([p for p in self.positions.values() if p.get('status') == 'active'])
        if active_positions >= self.parameters.max_concurrent_trades:
            reasons.append(f"Maximum concurrent trades ({self.parameters.max_concurrent_trades}) reached")
        
        # 5. Check correlation with existing positions
        correlation_risk = self._check_correlation_risk(trade, portfolio, market_data)
        if correlation_risk:
            reasons.append(correlation_risk)
        
        # 6. Check volatility
        volatility_risk = self._check_volatility_risk(trade, market_data)
        if volatility_risk:
            reasons.append(volatility_risk)
        
        if reasons:
            return False, "; ".join(reasons)
        
        return True, "Risk checks passed"
    
    def _check_correlation_risk(self, trade: Dict,
                              portfolio: Dict,
                              market_data: Dict) -> Optional[str]:
        """Check correlation risk with existing positions"""
        if 'symbol' not in trade:
            return None
        
        new_symbol = trade['symbol']
        
        # Calculate correlation with existing positions
        for position in self.positions.values():
            if position.get('status') != 'active':
                continue
            
            existing_symbol = position.get('symbol')
            if existing_symbol == new_symbol:
                return f"Already have position in {new_symbol}"
            
            # Check correlation (simplified - in production use actual correlation)
            if new_symbol in market_data and existing_symbol in market_data:
                # Simplified correlation check
                # In production, calculate actual correlation
                pass
        
        return None
    
    def _check_volatility_risk(self, trade: Dict,
                             market_data: Dict) -> Optional[str]:
        """Check volatility risk"""
        symbol = trade.get('symbol')
        
        if symbol not in market_data:
            return None
        
        # Get volatility data
        volatility = market_data[symbol].get('volatility', 0)
        
        # Check if volatility is too high
        if volatility > 0.5:  # 50% annualized volatility
            return f"High volatility ({volatility:.1%})"
        
        return None
    
    def update_daily_pnl(self, pnl: float):
        """Update daily P&L"""
        self.daily_pnl += pnl
    
    def reset_daily_stats(self):
        """Reset daily statistics"""
        self.daily_pnl = 0
        self.daily_trades = 0
    
    def calculate_portfolio_risk(self, portfolio: Dict,
                               market_data: Dict) -> Dict:
        """Calculate overall portfolio risk"""
        if not portfolio.get('positions'):
            return {'risk_level': RiskLevel.VERY_LOW, 'risk_score': 0}
        
        risk_score = 0
        max_score = 0
        
        # 1. Concentration risk
        positions = portfolio.get('positions', [])
        if positions:
            position_values = [p.get('value', 0) for p in positions]
            total_value = sum(position_values)
            
            if total_value > 0:
                # Herfindahl-Hirschman Index for concentration
                weights = [v / total_value for v in position_values]
                hhi = sum(w ** 2 for w in weights)
                
                # Convert to score (0-100, higher = more concentrated)
                concentration_score = hhi * 100
                risk_score += concentration_score * 0.3
                max_score += 30
        
        # 2. Volatility risk
        portfolio_volatility = self._calculate_portfolio_volatility(portfolio, market_data)
        volatility_score = portfolio_volatility * 100  # Convert to percentage
        risk_score += volatility_score * 0.4
        max_score += 40
        
        # 3. Correlation risk
        correlation_score = self._calculate_correlation_risk(portfolio, market_data)
        risk_score += correlation_score * 0.3
        max_score += 30
        
        # Normalize risk score
        normalized_score = risk_score / max_score * 100 if max_score > 0 else 0
        
        # Determine risk level
        if normalized_score < 20:
            risk_level = RiskLevel.VERY_LOW
        elif normalized_score < 40:
            risk_level = RiskLevel.LOW
        elif normalized_score < 60:
            risk_level = RiskLevel.MODERATE
        elif normalized_score < 80:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.VERY_HIGH
            
        return {'risk_level': risk_level, 'risk_score': normalized_score}

    def _calculate_portfolio_volatility(self, portfolio: Dict, market_data: Dict) -> float:
        """Calculate weighted average volatility of the portfolio"""
        positions = portfolio.get('positions', [])
        total_value = sum(p.get('value', 0) for p in positions)
        
        if total_value == 0:
            return 0
            
        weighted_volatility = 0
        for pos in positions:
            symbol = pos.get('symbol')
            vol = market_data.get(symbol, {}).get('volatility', 0.2) # Default 20%
            weight = pos.get('value', 0) / total_value
            weighted_volatility += vol * weight
            
        return weighted_volatility

    def _calculate_correlation_risk(self, portfolio: Dict, market_data: Dict) -> float:
        """Calculate correlation risk score (0-100)"""
        # In a real engine, this would use a correlation matrix
        # For now, we'll use a simplified version
        num_positions = len(portfolio.get('positions', []))
        if num_positions <= 1:
            return 0
            
        # Simplified baseline risk based on number of assets
        return min(100, num_positions * 10)
