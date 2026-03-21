import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import warnings
from loguru import logger
warnings.filterwarnings('ignore')

@dataclass
class RiskAssessment:
    is_approved: bool
    risk_score: float
    violations: List[str]
    max_position_size: float
    required_hedge: Optional[str]
    confidence_penalty: float

class ProductionRiskManager:
    def __init__(self):
        self.risk_limits = {
            'max_drawdown': 0.15,      # 15% max drawdown
            'daily_loss_limit': 0.05,    # 5% daily loss
            'position_limit': 0.10,       # 10% per position
            'sector_limit': 0.25,        # 25% per sector
            'var_95_limit': 0.02,        # 2% VaR at 95% confidence
            'concentration_alert': 0.15    # 15% concentration alert
        }
        self.risk_history = []
        logger.info("ProductionRiskManager Initialized with Institutional Limits.")
        
    def validate_trade(self, trade: Dict, portfolio: Dict, market_conditions: Dict) -> RiskAssessment:
        """Comprehensive trade validation against all risk parameters"""
        violations = []
        risk_score = 1.0  # Start with perfect score, deduct for violations
        
        # 1. Position size validation
        position_size_risk = self._validate_position_size(trade, portfolio)
        if position_size_risk['violation']:
            violations.append(position_size_risk['message'])
            risk_score *= position_size_risk['penalty_multiplier']
        
        # 2. Drawdown protection
        drawdown_risk = self._validate_drawdown(portfolio)
        if drawdown_risk['violation']:
            violations.append(drawdown_risk['message'])
            risk_score *= drawdown_risk['penalty_multiplier']
        
        # 3. Concentration risk
        concentration_risk = self._validate_concentration(trade, portfolio)
        if concentration_risk['violation']:
            violations.append(concentration_risk['message'])
            risk_score *= concentration_risk['penalty_multiplier']
        
        # 4. Market condition risk
        market_risk = self._validate_market_conditions(trade, market_conditions)
        if market_risk['violation']:
            violations.append(market_risk['message'])
            risk_score *= market_risk['penalty_multiplier']
        
        # 5. Liquidity risk
        liquidity_risk = self._validate_liquidity(trade, market_conditions)
        if liquidity_risk['violation']:
            violations.append(liquidity_risk['message'])
            risk_score *= liquidity_risk['penalty_multiplier']
        
        # Calculate maximum allowed position size
        max_position = self._calculate_max_position(trade, portfolio, risk_score)
        
        return RiskAssessment(
            is_approved=len(violations) == 0,
            risk_score=max(0.1, risk_score),  # Minimum 10/100 risk score for deep caution
            violations=violations,
            max_position_size=max_position,
            required_hedge=self._determine_hedge_requirement(trade, risk_score),
            confidence_penalty=1 - risk_score
        )
    
    def _validate_position_size(self, trade: Dict, portfolio: Dict) -> Dict:
        """Validate position size against limits"""
        proposed_size = trade.get('notional_value', 0)
        portfolio_value = portfolio.get('total_value', 1)
        if portfolio_value <= 0: return {'violation': True, 'message': "Invalid portfolio value", 'penalty_multiplier': 0}
        
        size_pct = proposed_size / portfolio_value
        
        if size_pct > self.risk_limits['position_limit']:
            return {
                'violation': True,
                'message': f"Position size {size_pct:.1%} exceeds {self.risk_limits['position_limit']:.1%} limit",
                'penalty_multiplier': 0.5
            }
        elif size_pct > self.risk_limits['position_limit'] * 0.8:
            return {
                'violation': False,
                'message': "Position size approaching limit",
                'penalty_multiplier': 0.8
            }
        
        return {'violation': False, 'penalty_multiplier': 1.0}
    
    def _validate_drawdown(self, portfolio: Dict) -> Dict:
        """Validate against drawdown limits"""
        current_drawdown = portfolio.get('current_drawdown', 0)
        
        if current_drawdown > self.risk_limits['max_drawdown']:
            return {
                'violation': True,
                'message': f"Current drawdown {current_drawdown:.1%} exceeds limit",
                'penalty_multiplier': 0.3
            }
        elif current_drawdown > self.risk_limits['max_drawdown'] * 0.7:
            return {
                'violation': False,
                'message': "Drawdown approaching limit",
                'penalty_multiplier': 0.6
            }
        
        return {'violation': False, 'penalty_multiplier': 1.0}
    
    def _validate_concentration(self, trade: Dict, portfolio: Dict) -> Dict:
        """Check sector and asset concentration"""
        sector = trade.get('sector', 'UNKNOWN')
        sector_usage = portfolio.get('sector_exposure', {}).get(sector, 0)
        proposed_size = trade.get('notional_value', 0)
        portfolio_value = portfolio.get('total_value', 1)
        
        new_sector_pct = (sector_usage + proposed_size) / portfolio_value
        if new_sector_pct > self.risk_limits['sector_limit']:
            return {
                'violation': True,
                'message': f"Sector {sector} concentration {new_sector_pct:.1%} exceeds limit",
                'penalty_multiplier': 0.4
            }
        return {'violation': False, 'penalty_multiplier': 1.0}

    def _validate_market_conditions(self, trade: Dict, market: Dict) -> Dict:
        """Check if market volatility or conditions are extreme"""
        volatility = market.get('vix' if 'vix' in market else 'volatility', 20)
        if volatility > 40: # Arbitrary high-vol threshold
            return {
                'violation': True,
                'message': f"Extreme market volatility ({volatility})",
                'penalty_multiplier': 0.5
            }
        return {'violation': False, 'penalty_multiplier': 1.0}

    def _validate_liquidity(self, trade: Dict, market: Dict) -> Dict:
        """Check if trade size is too large for current liquidity"""
        avg_volume = market.get('avg_30d_volume', float('inf'))
        proposed_size = trade.get('shares' if 'shares' in trade else 'quantity', 0)
        
        if proposed_size > avg_volume * 0.05: # Warn if > 5% of daily volume
            return {
                'violation': False,
                'message': "Trade exceeds 5% of daily average volume",
                'penalty_multiplier': 0.7
            }
        return {'violation': False, 'penalty_multiplier': 1.0}

    def _calculate_max_position(self, trade: Dict, portfolio: Dict, score: float) -> float:
        """Calculate dynamic max position based on risk score"""
        base_limit = portfolio.get('total_value', 100000) * self.risk_limits['position_limit']
        return base_limit * score

    def _determine_hedge_requirement(self, trade: Dict, score: float) -> Optional[str]:
        """Suggest a hedge if risk score is low"""
        if score < 0.7:
            return f"Suggest Delta Hedge for {trade.get('symbol', 'Asset')}"
        return None

    def calculate_var(self, portfolio: Dict, confidence_level: float = 0.95) -> float:
        """Calculate Value at Risk for portfolio"""
        portfolio_returns = portfolio.get('historical_returns', [])
        if len(portfolio_returns) < 20:
            return 0.05
        
        # Empirical VaR
        return float(np.percentile(portfolio_returns, (1 - confidence_level) * 100))
