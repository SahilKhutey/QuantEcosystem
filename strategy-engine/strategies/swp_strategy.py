import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class SWPConfig:
    initial_corpus: float
    monthly_withdrawal: float
    start_date: datetime
    expected_return: float = 0.08
    inflation_rate: float = 0.06
    withdrawal_frequency: str = "monthly"  # monthly, quarterly, yearly
    withdrawal_inflation_adjusted: bool = True

class SWPStrategy:
    def __init__(self):
        self.active_swps = {}
        
    def create_swp(self, config: SWPConfig) -> str:
        """Create a new SWP"""
        swp_id = f"swp_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Validate corpus sustainability
        sustainability = self._check_sustainability(config)
        if not sustainability['is_sustainable']:
            raise ValueError(f"SWP not sustainable: {sustainability['message']}")
        
        self.active_swps[swp_id] = {
            'config': config,
            'current_corpus': config.initial_corpus,
            'withdrawals': [],
            'total_withdrawn': 0,
            'created_at': datetime.utcnow()
        }
        
        return swp_id
    
    def simulate_swp(self, swp_id: str, months: int = 240) -> Dict:
        """Simulate SWP for given months (20 years default)"""
        swp = self.active_swps.get(swp_id)
        if not swp:
            raise ValueError(f"SWP {swp_id} not found")
            
        config = swp['config']
        
        monthly_return = config.expected_return / 12
        monthly_inflation = config.inflation_rate / 12
        
        corpus = config.initial_corpus
        current_withdrawal = config.monthly_withdrawal
        withdrawals = []
        
        for month in range(months):
            # Apply inflation adjustment
            if config.withdrawal_inflation_adjusted and month > 0:
                current_withdrawal *= (1 + monthly_inflation)
            
            # Check if corpus can sustain withdrawal
            if corpus < current_withdrawal:
                break
            
            # Withdraw
            corpus -= current_withdrawal
            
            # Apply returns
            corpus *= (1 + monthly_return)
            
            withdrawals.append({
                'month': month + 1,
                'withdrawal': current_withdrawal,
                'remaining_corpus': corpus,
                'date': config.start_date + timedelta(days=month*30)
            })
        
        sustainability_years = len(withdrawals) / 12
        
        return {
            'sustainability_years': sustainability_years,
            'final_corpus': corpus if withdrawals else config.initial_corpus,
            'total_withdrawn': sum(w['withdrawal'] for w in withdrawals),
            'max_withdrawal': max(w['withdrawal'] for w in withdrawals) if withdrawals else 0,
            'withdrawals': withdrawals,
            'is_sustainable': sustainability_years >= 20,  # 20-year benchmark
            'monthly_withdrawal_at_end': withdrawals[-1]['withdrawal'] if withdrawals else 0
        }
    
    def _check_sustainability(self, config: SWPConfig) -> Dict:
        """Check if SWP is sustainable using the 4% rule"""
        annual_withdrawal = config.monthly_withdrawal * 12
        safe_withdrawal_rate = 0.04  # 4% rule
        
        safe_annual_withdrawal = config.initial_corpus * safe_withdrawal_rate
        
        is_sustainable = annual_withdrawal <= safe_annual_withdrawal
        
        return {
            'is_sustainable': is_sustainable,
            'safe_annual_withdrawal': safe_annual_withdrawal,
            'proposed_annual_withdrawal': annual_withdrawal,
            'withdrawal_rate': (annual_withdrawal / config.initial_corpus) * 100,
            'message': f"Safe withdrawal: ₹{safe_annual_withdrawal:,.0f}/year, "
                      f"Your withdrawal: ₹{annual_withdrawal:,.0f}/year"
        }
    
    def calculate_swp_metrics(self, swp_id: str) -> Dict:
        """Calculate SWP performance metrics"""
        swp = self.active_swps.get(swp_id)
        if not swp:
            raise ValueError(f"SWP {swp_id} not found")
            
        config = swp['config']
        
        # Calculate withdrawal rate
        withdrawal_rate = (config.monthly_withdrawal * 12) / config.initial_corpus
        
        # Calculate expected corpus depletion
        if withdrawal_rate > config.expected_return:
            depletion_years = np.log(config.monthly_withdrawal / 
                                   (config.monthly_withdrawal - 
                                    config.initial_corpus * (config.expected_return/12))) / \
                            np.log(1 + config.expected_return/12) / 12
        else:
            depletion_years = float('inf')  # Never depletes
        
        return {
            'withdrawal_rate': withdrawal_rate * 100,
            'expected_return': config.expected_return * 100,
            'spread': (config.expected_return - withdrawal_rate) * 100,
            'depletion_years': depletion_years,
            'inflation_adjusted': config.withdrawal_inflation_adjusted,
            'safe_withdrawal_rate': 4.0,  # 4% rule
            'is_withdrawal_safe': withdrawal_rate <= 0.04
        }
    
    def optimize_swp(self, initial_corpus: float, 
                    desired_monthly_income: float,
                    target_years: int = 30) -> Dict:
        """Optimize SWP parameters for target duration"""
        # Use Monte Carlo simulation to find optimal withdrawal
        simulations = 1000
        sustainable_withdrawals = []
        
        for _ in range(simulations):
            # Simulate random returns (normal distribution)
            returns = np.random.normal(0.08, 0.15, target_years*12) / 12
            
            corpus = initial_corpus
            sustainable = True
            
            for month in range(target_years*12):
                # Withdraw
                if corpus < desired_monthly_income:
                    sustainable = False
                    break
                
                corpus -= desired_monthly_income
                corpus *= (1 + returns[month])
            
            if sustainable:
                sustainable_withdrawals.append(desired_monthly_income)
        
        success_rate = len(sustainable_withdrawals) / simulations * 100
        
        # Calculate safe withdrawal using 4% rule
        safe_monthly_withdrawal = initial_corpus * 0.04 / 12
        
        return {
            'success_rate': success_rate,
            'safe_monthly_withdrawal': safe_monthly_withdrawal,
            'desired_monthly_income': desired_monthly_income,
            'gap': desired_monthly_income - safe_monthly_withdrawal,
            'recommendation': 'REDUCE' if desired_monthly_income > safe_monthly_withdrawal else 'OK',
            'optimal_withdrawal': min(desired_monthly_income, safe_monthly_withdrawal)
        }
