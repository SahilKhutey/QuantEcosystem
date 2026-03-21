import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

class RiskProfile(Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"

class InvestmentGoal(Enum):
    RETIREMENT = "retirement"
    WEALTH_CREATION = "wealth_creation"
    INCOME_GENERATION = "income_generation"
    TAX_SAVING = "tax_saving"
    EDUCATION = "education"
    MARRIAGE = "marriage"
    HOUSE = "house"

@dataclass
class UserProfile:
    age: int
    income: float  # Monthly
    expenses: float  # Monthly
    risk_profile: RiskProfile
    investment_goal: InvestmentGoal
    goal_amount: float
    goal_years: int
    existing_investments: Dict[str, float] = None
    liabilities: float = 0

class PortfolioAllocator:
    def __init__(self):
        self.asset_classes = {
            'equity': {
                'min': 0,
                'max': 100,
                'subclasses': ['large_cap', 'mid_cap', 'small_cap', 'sectoral']
            },
            'debt': {
                'min': 0,
                'max': 100,
                'subclasses': ['corporate_bonds', 'government_bonds', 'fixed_deposits']
            },
            'gold': {
                'min': 0,
                'max': 30,
                'subclasses': ['physical', 'digital', 'etf', 'sgb']
            },
            'real_estate': {
                'min': 0,
                'max': 40,
                'subclasses': ['residential', 'commercial', 'reits']
            },
            'cash': {
                'min': 5,
                'max': 20,
                'subclasses': ['savings', 'liquid_funds']
            },
            'alternative': {
                'min': 0,
                'max': 10,
                'subclasses': ['crypto', 'venture', 'private_equity']
            }
        }
        
        # Expected returns and risks
        self.asset_characteristics = {
            'equity': {'return': 0.12, 'risk': 0.20, 'liquidity': 0.8},
            'debt': {'return': 0.07, 'risk': 0.05, 'liquidity': 0.6},
            'gold': {'return': 0.08, 'risk': 0.15, 'liquidity': 0.7},
            'real_estate': {'return': 0.10, 'risk': 0.18, 'liquidity': 0.4},
            'cash': {'return': 0.04, 'risk': 0.01, 'liquidity': 1.0},
            'alternative': {'return': 0.15, 'risk': 0.30, 'liquidity': 0.5}
        }
    
    def create_portfolio_plan(self, user: UserProfile, 
                            investable_amount: float) -> Dict:
        """Create comprehensive portfolio plan"""
        
        # Calculate required rate of return
        required_return = self._calculate_required_return(
            user.goal_amount, investable_amount, user.goal_years
        )
        
        # Determine risk capacity based on age and goal years
        risk_capacity = self._calculate_risk_capacity(user.age, user.goal_years)
        
        # Get base allocation based on risk profile
        base_allocation = self._get_base_allocation(user.risk_profile)
        
        # Adjust for required return
        adjusted_allocation = self._adjust_for_return(
            base_allocation, required_return, risk_capacity
        )
        
        # Adjust for goal type
        goal_adjusted = self._adjust_for_goal(adjusted_allocation, user.investment_goal)
        
        # Create investment schedule
        investment_schedule = self._create_investment_schedule(
            investable_amount, user.goal_years, goal_adjusted
        )
        
        # Calculate expected outcomes
        expected_outcomes = self._calculate_expected_outcomes(
            investable_amount, goal_adjusted, user.goal_years
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            user, goal_adjusted, expected_outcomes
        )
        
        return {
            'user_profile': {
                'age': user.age,
                'risk_profile': user.risk_profile.value,
                'goal': user.investment_goal.value,
                'goal_amount': user.goal_amount,
                'goal_years': user.goal_years
            },
            'required_return': required_return * 100,
            'risk_capacity': risk_capacity,
            'portfolio_allocation': goal_adjusted,
            'investment_schedule': investment_schedule,
            'expected_outcomes': expected_outcomes,
            'recommendations': recommendations,
            'risk_assessment': self._assess_portfolio_risk(goal_adjusted),
            'created_at': datetime.utcnow()
        }
    
    def _calculate_required_return(self, goal_amount: float,
                                 current_amount: float,
                                 years: int) -> float:
        """Calculate required annual return to achieve goal"""
        if current_amount <= 0 or years <= 0:
            return 0.08  # Default 8%
        
        # FV = PV * (1 + r)^n
        # r = (FV/PV)^(1/n) - 1
        if current_amount >= goal_amount:
            return 0.04  # Conservative if already achieved
        
        required_return = (goal_amount / current_amount) ** (1 / years) - 1
        
        # Cap at reasonable levels
        return min(max(required_return, 0.06), 0.20)
    
    def _calculate_risk_capacity(self, age: int, goal_years: int) -> float:
        """Calculate risk capacity (0-1 scale)"""
        # Age-based risk capacity (younger = higher capacity)
        age_factor = max(0, min(1, (65 - age) / 40))
        
        # Goal horizon factor (longer horizon = higher capacity)
        horizon_factor = min(1, goal_years / 20)
        
        # Combined risk capacity
        risk_capacity = (age_factor * 0.6 + horizon_factor * 0.4)
        
        return risk_capacity
    
    def _get_base_allocation(self, risk_profile: RiskProfile) -> Dict[str, float]:
        """Get base asset allocation based on risk profile"""
        allocations = {
            RiskProfile.CONSERVATIVE: {
                'equity': 30,
                'debt': 50,
                'gold': 10,
                'real_estate': 5,
                'cash': 5,
                'alternative': 0
            },
            RiskProfile.MODERATE: {
                'equity': 50,
                'debt': 30,
                'gold': 10,
                'real_estate': 5,
                'cash': 3,
                'alternative': 2
            },
            RiskProfile.AGGRESSIVE: {
                'equity': 70,
                'debt': 15,
                'gold': 5,
                'real_estate': 5,
                'cash': 2,
                'alternative': 3
            }
        }
        
        return allocations.get(risk_profile, allocations[RiskProfile.MODERATE])
    
    def _adjust_for_return(self, allocation: Dict[str, float],
                          required_return: float,
                          risk_capacity: float) -> Dict[str, float]:
        """Adjust allocation to meet required return"""
        # Calculate current expected return
        current_return = sum(
            allocation[asset] * self.asset_characteristics[asset]['return'] / 100
            for asset in allocation
        )
        
        # Calculate gap
        return_gap = required_return - current_return
        
        if return_gap <= 0:
            return allocation  # Already meeting requirement
        
        # Adjust allocation to increase expected return
        adjusted = allocation.copy()
        
        # Sort assets by return potential
        assets_by_return = sorted(
            self.asset_characteristics.items(),
            key=lambda x: x[1]['return'],
            reverse=True
        )
        
        # Increase higher-return assets
        for asset, characteristics in assets_by_return:
            if return_gap <= 0:
                break
            
            # Calculate max increase based on risk capacity
            max_increase = min(
                self.asset_classes[asset]['max'] - allocation[asset],
                risk_capacity * 20  # Scale with risk capacity
            )
            
            # Calculate needed increase to close gap
            needed_increase = (return_gap / characteristics['return']) * 100
            
            increase = min(max_increase, needed_increase)
            
            if increase > 0:
                adjusted[asset] += increase
                
                # Reduce from lower-return assets
                for low_asset in ['cash', 'debt']:
                    if low_asset in adjusted and adjusted[low_asset] > 0:
                        reduction = min(adjusted[low_asset], increase)
                        adjusted[low_asset] -= reduction
                        increase -= reduction
                        
                        if increase <= 0:
                            break
                
                # Recalculate expected return
                current_return = sum(
                    adjusted[asset] * self.asset_characteristics[asset]['return'] / 100
                    for asset in adjusted
                )
                return_gap = required_return - current_return
        
        # Normalize to 100%
        total = sum(adjusted.values())
        if total != 100:
            adjusted = {k: v * 100 / total for k, v in adjusted.items()}
        
        return adjusted
    
    def _adjust_for_goal(self, allocation: Dict[str, float],
                        goal: InvestmentGoal) -> Dict[str, float]:
        """Adjust allocation for specific investment goal"""
        adjusted = allocation.copy()
        
        goal_adjustments = {
            InvestmentGoal.RETIREMENT: {
                'equity': 5,   # Increase equity for growth
                'debt': -5,    # Reduce debt
                'gold': 0,
                'real_estate': 0
            },
            InvestmentGoal.WEALTH_CREATION: {
                'equity': 10,
                'alternative': 5,
                'debt': -10,
                'cash': -5
            },
            InvestmentGoal.INCOME_GENERATION: {
                'debt': 10,
                'real_estate': 5,
                'equity': -10,
                'alternative': -5
            },
            InvestmentGoal.TAX_SAVING: {
                'equity': 15,  # ELSS
                'debt': -10,
                'gold': -5
            },
            InvestmentGoal.EDUCATION: {
                'debt': 10,    # Safety for short-term
                'equity': -5,
                'cash': -5
            },
            InvestmentGoal.MARRIAGE: {
                'gold': 10,    # Traditional
                'debt': 5,
                'equity': -10,
                'alternative': -5
            },
            InvestmentGoal.HOUSE: {
                'real_estate': 10,
                'debt': 5,
                'equity': -10,
                'alternative': -5
            }
        }
        
        adjustments = goal_adjustments.get(goal, {})
        
        for asset, adjustment in adjustments.items():
            if asset in adjusted:
                adjusted[asset] = max(0, adjusted[asset] + adjustment)
        
        # Normalize
        total = sum(adjusted.values())
        if total != 100:
            adjusted = {k: v * 100 / total for k, v in adjusted.items()}
        
        return adjusted
    
    def _create_investment_schedule(self, total_amount: float,
                                  years: int,
                                  allocation: Dict[str, float]) -> List[Dict]:
        """Create monthly investment schedule"""
        schedule = []
        
        # Calculate monthly investment
        monthly_investment = total_amount / (years * 12)
        
        current_date = datetime.utcnow()
        
        for month in range(years * 12):
            investments = {}
            
            for asset, percentage in allocation.items():
                amount = monthly_investment * percentage / 100
                investments[asset] = amount
            
            schedule.append({
                'month': month + 1,
                'date': current_date + timedelta(days=month*30),
                'total_investment': monthly_investment,
                'allocations': investments
            })
        
        return schedule
    
    def _calculate_expected_outcomes(self, initial_amount: float,
                                   allocation: Dict[str, float],
                                   years: int) -> Dict:
        """Calculate expected portfolio outcomes"""
        # Calculate portfolio expected return and risk
        portfolio_return = 0
        portfolio_risk = 0
        
        for asset, percentage in allocation.items():
            char = self.asset_characteristics.get(asset, {'return': 0, 'risk': 0})
            weight = percentage / 100
            portfolio_return += weight * char['return']
            portfolio_risk += (weight * char['risk']) ** 2
        
        portfolio_risk = np.sqrt(portfolio_risk)
        
        # Calculate expected value
        expected_value = initial_amount * (1 + portfolio_return) ** years
        
        # Calculate best and worst case (1 standard deviation)
        best_case = initial_amount * (1 + portfolio_return + portfolio_risk) ** years
        worst_case = initial_amount * (1 + portfolio_return - portfolio_risk) ** years
        
        # Calculate probability of achieving goals
        success_probability = self._calculate_success_probability(
            initial_amount, expected_value, portfolio_risk, years
        )
        
        return {
            'expected_return': portfolio_return * 100,
            'portfolio_risk': portfolio_risk * 100,
            'expected_value': expected_value,
            'best_case': best_case,
            'worst_case': worst_case,
            'success_probability': success_probability * 100,
            'sharpe_ratio': portfolio_return / portfolio_risk if portfolio_risk > 0 else 0
        }
    
    def _calculate_success_probability(self, initial: float,
                                     expected: float,
                                     risk: float,
                                     years: int) -> float:
        """Calculate probability of achieving expected value"""
        # Using lognormal distribution
        mean_log_return = np.log(1 + expected/initial) / years
        std_log_return = risk / np.sqrt(years)
        
        # Probability that return >= 0
        z_score = -mean_log_return / std_log_return
        probability = 1 - 0.5 * (1 + np.math.erf(z_score / np.sqrt(2)))
        
        return max(0, min(1, probability))
    
    def _generate_recommendations(self, user: UserProfile,
                                allocation: Dict[str, float],
                                outcomes: Dict) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Based on age
        if user.age < 30:
            recommendations.append("Consider increasing equity exposure for long-term growth")
        elif user.age > 50:
            recommendations.append("Consider increasing debt allocation for stability")
        
        # Based on risk profile
        if user.risk_profile == RiskProfile.CONSERVATIVE and allocation['equity'] > 40:
            recommendations.append("Your equity allocation is high for conservative profile")
        
        # Based on goal
        if user.investment_goal == InvestmentGoal.RETIREMENT:
            recommendations.append("Consider tax-efficient instruments like PPF/NPS")
        
        # Based on outcomes
        if outcomes['success_probability'] < 70:
            recommendations.append("Consider increasing monthly investment or extending timeline")
        
        # General recommendations
        recommendations.extend([
            "Rebalance portfolio every 6 months",
            "Maintain emergency fund of 6 months expenses",
            "Review insurance coverage regularly"
        ])
        
        return recommendations
    
    def _assess_portfolio_risk(self, allocation: Dict[str, float]) -> Dict:
        """Assess portfolio risk level"""
        total_risk_score = 0
        
        for asset, percentage in allocation.items():
            char = self.asset_characteristics.get(asset, {'risk': 0})
            total_risk_score += (percentage / 100) * char['risk'] * 100
        
        # Categorize risk
        if total_risk_score < 10:
            risk_level = "Very Low"
        elif total_risk_score < 15:
            risk_level = "Low"
        elif total_risk_score < 20:
            risk_level = "Moderate"
        elif total_risk_score < 25:
            risk_level = "High"
        else:
            risk_level = "Very High"
        
        return {
            'risk_score': total_risk_score,
            'risk_level': risk_level,
            'volatility_band': f"±{total_risk_score:.1f}% annual"
        }
