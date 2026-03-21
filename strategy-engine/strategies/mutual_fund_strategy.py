import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import aiohttp
import asyncio
from dataclasses import dataclass
from enum import Enum

class FundCategory(Enum):
    EQUITY = "equity"
    DEBT = "debt"
    HYBRID = "hybrid"
    ELSS = "elss"
    INDEX = "index"
    SECTORAL = "sectoral"

class FundRisk(Enum):
    LOW = "low"
    LOW_TO_MODERATE = "low_to_moderate"
    MODERATE = "moderate"
    MODERATELY_HIGH = "moderately_high"
    HIGH = "high"

@dataclass
class MutualFund:
    scheme_code: str
    scheme_name: str
    category: FundCategory
    risk: FundRisk
    nav: float
    nav_date: datetime
    expense_ratio: float
    aum: float
    returns_1y: float
    returns_3y: float
    returns_5y: float
    fund_manager: str
    amc: str

class MutualFundStrategy:
    def __init__(self):
        self.funds = {}
        self.fund_sips = {}
        
    async def fetch_fund_data(self, scheme_code: str = None) -> List[MutualFund]:
        """Fetch mutual fund data from AMFI/other APIs"""
        # For India, use AMFI API
        if scheme_code:
            url = f"https://api.mfapi.in/mf/{scheme_code}"
        else:
            url = "https://api.mfapi.in/mf"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                data = await response.json()
        
        funds = []
        if isinstance(data, list):
            for fund in data[:100]:  # Limit for demo
                funds.append(MutualFund(
                    scheme_code=fund.get('schemeCode'),
                    scheme_name=fund.get('schemeName'),
                    category=self._categorize_fund(fund.get('schemeName')),
                    risk=self._assess_fund_risk(fund),
                    nav=float(fund.get('nav', 0)),
                    nav_date=datetime.strptime(fund.get('date', '2023-01-01'), '%Y-%m-%d'),
                    expense_ratio=float(fund.get('expenseRatio', 0.01)),
                    aum=float(fund.get('aum', 0)) * 1e7,  # Convert to rupees
                    returns_1y=float(fund.get('returns', {}).get('1Y', 0)),
                    returns_3y=float(fund.get('returns', {}).get('3Y', 0)),
                    returns_5y=float(fund.get('returns', {}).get('5Y', 0)),
                    fund_manager=fund.get('fundManager', 'Unknown'),
                    amc=fund.get('amc', 'Unknown')
                ))
        
        return funds
    
    def _categorize_fund(self, scheme_name: str) -> FundCategory:
        """Categorize fund based on name"""
        name_lower = scheme_name.lower()
        
        if 'equity' in name_lower:
            return FundCategory.EQUITY
        elif 'debt' in name_lower or 'income' in name_lower:
            return FundCategory.DEBT
        elif 'hybrid' in name_lower or 'balanced' in name_lower:
            return FundCategory.HYBRID
        elif 'tax' in name_lower or 'elss' in name_lower:
            return FundCategory.ELSS
        elif 'index' in name_lower:
            return FundCategory.INDEX
        else:
            return FundCategory.SECTORAL
    
    def _assess_fund_risk(self, fund_data: Dict) -> FundRisk:
        """Assess fund risk based on category and returns volatility"""
        category = self._categorize_fund(fund_data.get('schemeName', ''))
        
        if category == FundCategory.DEBT:
            return FundRisk.LOW
        elif category == FundCategory.HYBRID:
            return FundRisk.MODERATE
        elif category == FundCategory.ELSS:
            return FundRisk.MODERATELY_HIGH
        elif category == FundCategory.EQUITY:
            # Check volatility
            returns_1y = abs(float(fund_data.get('returns', {}).get('1Y', 0)))
            if returns_1y > 20:
                return FundRisk.HIGH
            else:
                return FundRisk.MODERATELY_HIGH
        else:
            return FundRisk.HIGH
    
    def create_fund_sip(self, scheme_code: str, 
                       monthly_amount: float,
                       start_date: datetime) -> str:
        """Create SIP in mutual fund"""
        sip_id = f"mf_sip_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        self.fund_sips[sip_id] = {
            'scheme_code': scheme_code,
            'monthly_amount': monthly_amount,
            'start_date': start_date,
            'units': 0,
            'invested_amount': 0,
            'current_value': 0,
            'transactions': []
        }
        
        return sip_id
    
    def calculate_fund_sip_returns(self, sip_id: str,
                                 historical_nav: pd.Series) -> Dict:
        """Calculate SIP returns for mutual fund"""
        sip = self.fund_sips.get(sip_id)
        if not sip:
            raise ValueError(f"SIP {sip_id} not found")
        
        # Generate investment dates
        current_date = sip['start_date']
        investment_dates = []
        
        while current_date <= datetime.utcnow():
            investment_dates.append(current_date)
            current_date += timedelta(days=30)  # Monthly
        
        total_units = 0
        total_invested = 0
        transactions = []
        
        for inv_date in investment_dates:
            # Find NAV for investment date
            if inv_date in historical_nav.index:
                nav = historical_nav[inv_date]
            else:
                # Find nearest NAV
                nearest_idx = historical_nav.index.get_indexer([inv_date], method='nearest')[0]
                nav = historical_nav.iloc[nearest_idx]
            
            # Calculate units purchased
            units = sip['monthly_amount'] / nav
            total_units += units
            total_invested += sip['monthly_amount']
            
            transactions.append({
                'date': inv_date,
                'nav': nav,
                'units': units,
                'amount': sip['monthly_amount']
            })
        
        # Current value
        current_nav = historical_nav.iloc[-1] if len(historical_nav) > 0 else nav
        current_value = total_units * current_nav
        
        # Calculate returns
        total_return = (current_value / total_invested - 1) * 100
        months = len(investment_dates)
        cagr = ((current_value / total_invested) ** (12 / months) - 1) * 100 if months > 0 else 0
        
        return {
            'total_invested': total_invested,
            'current_value': current_value,
            'total_units': total_units,
            'current_nav': current_nav,
            'total_return': total_return,
            'cagr': cagr,
            'transactions': transactions,
            'investment_count': len(investment_dates)
        }
    
    def compare_funds(self, funds: List[MutualFund],
                     criteria: List[str] = None) -> pd.DataFrame:
        """Compare mutual funds based on multiple criteria"""
        if criteria is None:
            criteria = ['returns_1y', 'returns_3y', 'returns_5y', 
                       'expense_ratio', 'aum', 'risk']
        
        comparison_data = []
        for fund in funds:
            fund_data = {
                'scheme_name': fund.scheme_name,
                'category': fund.category.value,
                'risk': fund.risk.value,
                'nav': fund.nav,
                'expense_ratio': fund.expense_ratio,
                'aum': fund.aum,
                'returns_1y': fund.returns_1y,
                'returns_3y': fund.returns_3y,
                'returns_5y': fund.returns_5y,
                'fund_manager': fund.fund_manager,
                'amc': fund.amc
            }
            comparison_data.append(fund_data)
        
        df = pd.DataFrame(comparison_data)
        
        # Calculate scores
        df['score'] = self._calculate_fund_score(df)
        
        return df.sort_values('score', ascending=False)
    
    def _calculate_fund_score(self, df: pd.DataFrame) -> pd.Series:
        """Calculate composite score for funds"""
        # Normalize metrics
        metrics = ['returns_1y', 'returns_3y', 'returns_5y']
        weights = [0.3, 0.4, 0.3]  # Weightage for 1Y, 3Y, 5Y returns
        
        scores = pd.Series(0, index=df.index)
        
        for metric, weight in zip(metrics, weights):
            if metric in df.columns:
                # Higher returns are better
                normalized = (df[metric] - df[metric].min()) / \
                           (df[metric].max() - df[metric].min() + 1e-10)
                scores += normalized * weight
        
        # Penalize high expense ratio
        if 'expense_ratio' in df.columns:
            expense_penalty = (df['expense_ratio'] - df['expense_ratio'].min()) / \
                            (df['expense_ratio'].max() - df['expense_ratio'].min() + 1e-10)
            scores -= expense_penalty * 0.2
        
        # Reward larger AUM (more established)
        if 'aum' in df.columns:
            aum_score = (df['aum'] - df['aum'].min()) / \
                       (df['aum'].max() - df['aum'].min() + 1e-10)
            scores += aum_score * 0.1
        
        return scores
    
    def recommend_funds(self, risk_profile: str,
                       investment_horizon: str,
                       amount: float) -> List[Dict]:
        """Recommend mutual funds based on user profile"""
        recommendations = []
        
        # Map risk profile to fund categories
        risk_mapping = {
            'conservative': [FundCategory.DEBT, FundCategory.HYBRID],
            'moderate': [FundCategory.HYBRID, FundCategory.ELSS],
            'aggressive': [FundCategory.EQUITY, FundCategory.SECTORAL]
        }
        
        # Map horizon to return focus
        horizon_mapping = {
            'short': 'returns_1y',
            'medium': 'returns_3y',
            'long': 'returns_5y'
        }
        
        target_categories = risk_mapping.get(risk_profile, [FundCategory.HYBRID])
        return_focus = horizon_mapping.get(investment_horizon, 'returns_3y')
        
        # Filter and rank funds
        for fund in self.funds.values():
            if fund.category in target_categories:
                score = getattr(fund, return_focus, 0)
                
                recommendations.append({
                    'scheme_name': fund.scheme_name,
                    'category': fund.category.value,
                    'risk': fund.risk.value,
                    'expected_return': score,
                    'expense_ratio': fund.expense_ratio,
                    'recommended_allocation': self._calculate_allocation(
                        amount, fund.risk, investment_horizon
                    ),
                    'suitability_score': self._calculate_suitability(
                        fund, risk_profile, investment_horizon
                    )
                })
        
        # Sort by suitability score
        recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _calculate_allocation(self, total_amount: float,
                            fund_risk: FundRisk,
                            horizon: str) -> float:
        """Calculate allocation percentage for a fund"""
        base_allocation = {
            'conservative': {'low': 0.4, 'low_to_moderate': 0.3, 'moderate': 0.2},
            'moderate': {'low': 0.2, 'low_to_moderate': 0.3, 'moderate': 0.3, 
                        'moderately_high': 0.2},
            'aggressive': {'moderate': 0.2, 'moderately_high': 0.4, 'high': 0.4}
        }
        
        risk_profile = 'moderate'  # Default
        allocation = base_allocation.get(risk_profile, {}).get(fund_risk.value, 0.2)
        
        # Adjust for horizon
        if horizon == 'long':
            allocation *= 1.2
        elif horizon == 'short':
            allocation *= 0.8
        
        return min(allocation, 0.5)  # Cap at 50%
    
    def _calculate_suitability(self, fund: MutualFund,
                             risk_profile: str,
                             horizon: str) -> float:
        """Calculate suitability score (0-100)"""
        score = 50  # Base score
        
        # Risk alignment
        risk_scores = {
            'conservative': {'low': 20, 'low_to_moderate': 10, 'moderate': 0},
            'moderate': {'low': 5, 'low_to_moderate': 10, 'moderate': 15, 
                        'moderately_high': 10},
            'aggressive': {'moderate': 5, 'moderately_high': 15, 'high': 20}
        }
        
        score += risk_scores.get(risk_profile, {}).get(fund.risk.value, 0)
        
        # Horizon alignment (long-term funds for long horizon)
        if horizon == 'long' and fund.category in [FundCategory.EQUITY, FundCategory.ELSS]:
            score += 15
        elif horizon == 'short' and fund.category == FundCategory.DEBT:
            score += 15
        
        # Performance bonus
        if fund.returns_3y > 12:
            score += 10
        if fund.returns_5y > 15:
            score += 15
        
        # Expense ratio penalty
        if fund.expense_ratio > 0.015:  # 1.5%
            score -= 10
        
        return min(max(score, 0), 100)
