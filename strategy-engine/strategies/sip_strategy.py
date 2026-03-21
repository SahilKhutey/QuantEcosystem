import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class SIPFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

@dataclass
class SIPConfig:
    amount: float
    frequency: SIPFrequency
    start_date: datetime
    end_date: Optional[datetime] = None
    duration_months: Optional[int] = None
    asset_class: str = "equity"
    auto_rebalance: bool = True
    step_up_percentage: float = 0.0  # Annual step-up

class SIPStrategy:
    def __init__(self):
        self.active_sips = {}
        
    def create_sip(self, config: SIPConfig) -> str:
        """Create a new SIP"""
        sip_id = f"sip_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        if config.end_date is None and config.duration_months:
            config.end_date = config.start_date + timedelta(days=config.duration_months*30)
            
        self.active_sips[sip_id] = {
            'config': config,
            'investments': [],
            'current_value': 0,
            'total_invested': 0,
            'created_at': datetime.utcnow()
        }
        
        return sip_id
    
    def calculate_sip_returns(self, sip_id: str, 
                            historical_returns: pd.Series = None,
                            expected_return: float = 0.12) -> Dict:
        """Calculate SIP returns with or without historical data"""
        sip = self.active_sips.get(sip_id)
        if not sip:
            raise ValueError(f"SIP {sip_id} not found")
            
        config = sip['config']
        
        if historical_returns is not None:
            return self._calculate_with_historical(config, historical_returns)
        else:
            return self._calculate_with_expected(config, expected_return)
    
    def _calculate_with_historical(self, config: SIPConfig, 
                                 historical_returns: pd.Series) -> Dict:
        """Calculate SIP returns using historical data"""
        # Generate investment dates
        investment_dates = self._generate_investment_dates(config)
        
        portfolio_value = 0
        investments = []
        total_invested = 0
        
        for inv_date in investment_dates:
            # Find closest historical data point
            if inv_date in historical_returns.index:
                period_return = historical_returns[inv_date]
            else:
                # Find nearest date
                nearest_idx = historical_returns.index.get_indexer([inv_date], method='nearest')[0]
                period_return = historical_returns.iloc[nearest_idx]
            
            # Calculate value after this investment
            portfolio_value = (portfolio_value + config.amount) * (1 + period_return)
            total_invested += config.amount
            
            investments.append({
                'date': inv_date,
                'amount': config.amount,
                'return': period_return,
                'portfolio_value': portfolio_value
            })
        
        # Calculate metrics
        cagr = self._calculate_cagr(config.amount * len(investments), 
                                   portfolio_value, len(investments)/12)
        
        return {
            'final_value': portfolio_value,
            'total_invested': total_invested,
            'absolute_return': portfolio_value - total_invested,
            'return_percentage': (portfolio_value / total_invested - 1) * 100,
            'cagr': cagr * 100,
            'investments': investments,
            'investment_count': len(investments)
        }
    
    def _calculate_with_expected(self, config: SIPConfig, 
                               expected_return: float) -> Dict:
        """Calculate SIP returns using expected return"""
        if config.end_date is None:
            raise ValueError("End date required for expected return calculation")
            
        months = (config.end_date.year - config.start_date.year) * 12 + \
                (config.end_date.month - config.start_date.month)
        
        # SIP formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
        monthly_return = expected_return / 12
        future_value = config.amount * \
                      (((1 + monthly_return) ** months - 1) / monthly_return) * \
                      (1 + monthly_return)
        
        total_invested = config.amount * months
        
        return {
            'final_value': future_value,
            'total_invested': total_invested,
            'absolute_return': future_value - total_invested,
            'return_percentage': (future_value / total_invested - 1) * 100,
            'cagr': expected_return * 100,
            'investment_count': months
        }
    
    def _generate_investment_dates(self, config: SIPConfig) -> List[datetime]:
        """Generate investment dates based on frequency"""
        dates = []
        current_date = config.start_date
        
        if config.end_date is None and config.duration_months:
            config.end_date = config.start_date + timedelta(days=config.duration_months*30)
        
        while current_date <= config.end_date:
            dates.append(current_date)
            
            if config.frequency == SIPFrequency.DAILY:
                current_date += timedelta(days=1)
            elif config.frequency == SIPFrequency.WEEKLY:
                current_date += timedelta(days=7)
            elif config.frequency == SIPFrequency.MONTHLY:
                # Add month, handling month-end
                next_month = current_date.month % 12 + 1
                next_year = current_date.year + (current_date.month // 12)
                try:
                    current_date = current_date.replace(year=next_year, month=next_month)
                except ValueError:
                    # Handle invalid date (e.g., Jan 31 -> Feb 28/29)
                    current_date = current_date + timedelta(days=31)
                    current_date = current_date.replace(day=1)
            elif config.frequency == SIPFrequency.QUARTERLY:
                current_date += timedelta(days=90)
        
        return dates
    
    def _calculate_cagr(self, principal: float, future_value: float, 
                       years: float) -> float:
        """Calculate Compound Annual Growth Rate"""
        if principal <= 0 or years <= 0:
            return 0
        return (future_value / principal) ** (1 / years) - 1
    
    def simulate_step_up_sip(self, config: SIPConfig, 
                           step_up_percentage: float,
                           step_up_frequency: str = 'yearly') -> Dict:
        """Simulate SIP with annual step-up"""
        if config.end_date is None and config.duration_months:
            config.end_date = config.start_date + timedelta(days=config.duration_months*30)
        
        investment_dates = self._generate_investment_dates(config)
        
        portfolio_value = 0
        investments = []
        total_invested = 0
        current_amount = config.amount
        
        for i, inv_date in enumerate(investment_dates):
            # Apply step-up
            if step_up_frequency == 'yearly' and i > 0 and i % 12 == 0:
                current_amount *= (1 + step_up_percentage)
            
            portfolio_value += current_amount
            total_invested += current_amount
            
            # Apply monthly return (simplified)
            monthly_return = 0.01  # 12% annual
            portfolio_value *= (1 + monthly_return)
            
            investments.append({
                'date': inv_date,
                'amount': current_amount,
                'portfolio_value': portfolio_value
            })
        
        cagr = self._calculate_cagr(config.amount * len(investments), 
                                   portfolio_value, len(investments)/12)
        
        return {
            'final_value': portfolio_value,
            'total_invested': total_invested,
            'absolute_return': portfolio_value - total_invested,
            'return_percentage': (portfolio_value / total_invested - 1) * 100,
            'cagr': cagr * 100,
            'max_investment': current_amount,
            'investments': investments
        }
