import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class GoldType(Enum):
    PHYSICAL = "physical"
    DIGITAL = "digital"
    ETF = "etf"
    SOVEREIGN = "sovereign"  # Sovereign Gold Bonds
    FUND = "fund"  # Gold mutual funds

@dataclass
class GoldHolding:
    type: GoldType
    quantity: float  # in grams
    purchase_price: float  # per gram
    purchase_date: datetime
    purity: float = 0.999  # 24 karat
    storage_cost: float = 0.0  # annual storage cost percentage
    making_charges: float = 0.0  # for physical gold

class GoldStrategy:
    def __init__(self):
        self.gold_prices = {}  # Historical gold prices
        self.holdings = {}
        
    def calculate_gold_returns(self, holding: GoldHolding,
                             current_price: float) -> Dict:
        """Calculate returns on gold holding"""
        current_value = holding.quantity * current_price
        
        # Adjust for purity
        if holding.type == GoldType.PHYSICAL:
            current_value *= holding.purity
        
        # Calculate purchase value
        purchase_value = holding.quantity * holding.purchase_price
        
        # Adjust for making charges (physical gold)
        if holding.type == GoldType.PHYSICAL:
            purchase_value *= (1 + holding.making_charges)
        
        # Calculate holding period in years
        holding_years = (datetime.utcnow() - holding.purchase_date).days / 365
        
        # Calculate storage costs
        storage_cost_total = purchase_value * holding.storage_cost * holding_years
        
        # Calculate net returns
        net_value = current_value - storage_cost_total
        absolute_return = net_value - purchase_value
        return_percentage = (net_value / purchase_value - 1) * 100
        
        # Calculate CAGR
        cagr = (net_value / purchase_value) ** (1 / holding_years) - 1 if holding_years > 0 else 0
        
        # Calculate inflation-adjusted returns
        inflation_rate = 0.06  # Assume 6% inflation
        real_return = ((1 + cagr) / (1 + inflation_rate) - 1) * 100
        
        return {
            'current_value': current_value,
            'purchase_value': purchase_value,
            'net_value': net_value,
            'absolute_return': absolute_return,
            'return_percentage': return_percentage,
            'cagr': cagr * 100,
            'real_return': real_return,
            'holding_years': holding_years,
            'storage_costs': storage_cost_total,
            'making_charges': purchase_value * holding.making_charges if holding.type == GoldType.PHYSICAL else 0
        }
    
    def hedge_ratio_calculation(self, portfolio_value: float,
                              equity_value: float,
                              risk_level: str = 'moderate') -> float:
        """Calculate optimal gold hedge ratio for portfolio"""
        # Modern Portfolio Theory: Gold as hedge against equity risk
        
        base_ratios = {
            'conservative': 0.20,  # 20% gold
            'moderate': 0.15,      # 15% gold
            'aggressive': 0.10     # 10% gold
        }
        
        base_ratio = base_ratios.get(risk_level, 0.15)
        
        # Adjust based on equity exposure
        equity_ratio = equity_value / portfolio_value
        if equity_ratio > 0.7:  # High equity exposure
            base_ratio *= 1.2  # Increase gold hedge
        elif equity_ratio < 0.3:  # Low equity exposure
            base_ratio *= 0.8  # Reduce gold hedge
        
        # Adjust based on market volatility (simplified)
        # In production, use VIX or other volatility indicators
        current_volatility = self._get_market_volatility()
        if current_volatility > 0.2:  # High volatility
            base_ratio *= 1.3
        elif current_volatility < 0.1:  # Low volatility
            base_ratio *= 0.9
        
        return min(base_ratio, 0.3)  # Cap at 30%
    
    def _get_market_volatility(self) -> float:
        """Get current market volatility"""
        # Simplified - in production, fetch from VIX or calculate
        return 0.15  # 15% volatility
    
    def gold_sip_strategy(self, monthly_amount: float,
                         start_date: datetime,
                         gold_type: GoldType = GoldType.DIGITAL) -> Dict:
        """Gold SIP strategy (accumulate gold monthly)"""
        current_date = start_date
        total_grams = 0
        total_invested = 0
        transactions = []
        
        while current_date <= datetime.utcnow():
            # Get gold price for the month
            gold_price = self._get_gold_price(current_date, gold_type)
            
            if gold_price > 0:
                grams_purchased = monthly_amount / gold_price
                total_grams += grams_purchased
                total_invested += monthly_amount
                
                transactions.append({
                    'date': current_date,
                    'price_per_gram': gold_price,
                    'grams': grams_purchased,
                    'amount': monthly_amount
                })
            
            # Move to next month
            current_date += timedelta(days=30)
        
        # Current value
        current_price = self._get_current_gold_price(gold_type)
        current_value = total_grams * current_price
        
        # Calculate returns
        total_return = (current_value / total_invested - 1) * 100
        months = len(transactions)
        cagr = ((current_value / total_invested) ** (12 / months) - 1) * 100 if months > 0 else 0
        
        return {
            'total_grams': total_grams,
            'total_invested': total_invested,
            'current_value': current_value,
            'average_price': total_invested / total_grams if total_grams > 0 else 0,
            'current_price': current_price,
            'total_return': total_return,
            'cagr': cagr,
            'transactions': transactions,
            'investment_count': len(transactions)
        }
    
    def _get_gold_price(self, date: datetime, gold_type: GoldType) -> float:
        """Get historical gold price"""
        # In production, fetch from API
        # For demo, return simulated prices
        base_price = 5000  # ₹5000 per gram
        
        # Add premium based on type
        premiums = {
            GoldType.PHYSICAL: 1.10,  # 10% premium for physical
            GoldType.DIGITAL: 1.02,   # 2% premium for digital
            GoldType.ETF: 1.01,       # 1% premium for ETF
            GoldType.SOVEREIGN: 1.00, # No premium for SGB
            GoldType.FUND: 1.03       # 3% premium for funds
        }
        
        price = base_price * premiums.get(gold_type, 1.0)
        
        # Add some random variation
        variation = np.random.normal(0, 0.05)  # 5% std dev
        price *= (1 + variation)
        
        return price
    
    def _get_current_gold_price(self, gold_type: GoldType) -> float:
        """Get current gold price"""
        return self._get_gold_price(datetime.utcnow(), gold_type)
    
    def compare_gold_types(self, investment_amount: float = 100000) -> pd.DataFrame:
        """Compare different gold investment types"""
        comparison_data = []
        
        for gold_type in GoldType:
            # Simulate 1-year investment
            start_date = datetime.utcnow() - timedelta(days=365)
            
            # Calculate returns
            initial_price = self._get_gold_price(start_date, gold_type)
            current_price = self._get_current_gold_price(gold_type)
            
            grams = investment_amount / initial_price
            current_value = grams * current_price
            return_pct = (current_value / investment_amount - 1) * 100
            
            # Calculate costs
            costs = self._calculate_gold_costs(gold_type, investment_amount)
            
            # Calculate liquidity score (0-100)
            liquidity_score = self._calculate_liquidity_score(gold_type)
            
            # Calculate safety score
            safety_score = self._calculate_safety_score(gold_type)
            
            comparison_data.append({
                'type': gold_type.value,
                'return_1y': return_pct,
                'costs_percentage': (costs / investment_amount) * 100,
                'liquidity_score': liquidity_score,
                'safety_score': safety_score,
                'minimum_investment': self._get_minimum_investment(gold_type),
                'tax_implications': self._get_tax_implications(gold_type),
                'suitability': self._get_suitability(gold_type)
            })
        
        return pd.DataFrame(comparison_data)
    
    def _calculate_gold_costs(self, gold_type: GoldType, 
                            investment_amount: float) -> float:
        """Calculate total costs for gold investment"""
        costs = 0
        
        if gold_type == GoldType.PHYSICAL:
            # Making charges: 10-15%
            costs += investment_amount * 0.12
            # Storage: 0.5-1% annually
            costs += investment_amount * 0.0075
            # Insurance: 0.1-0.2%
            costs += investment_amount * 0.0015
            
        elif gold_type == GoldType.DIGITAL:
            # Platform fees: 0.5-1%
            costs += investment_amount * 0.0075
            # Storage: included
            
        elif gold_type == GoldType.ETF:
            # Expense ratio: 0.5-1%
            costs += investment_amount * 0.0075
            # Brokerage: 0.1%
            costs += investment_amount * 0.001
            
        elif gold_type == GoldType.SOVEREIGN:
            # No charges for SGB
            costs = 0
            
        elif gold_type == GoldType.FUND:
            # Expense ratio: 1-2%
            costs += investment_amount * 0.015
        
        return costs
    
    def _calculate_liquidity_score(self, gold_type: GoldType) -> int:
        """Calculate liquidity score (0-100)"""
        scores = {
            GoldType.ETF: 90,
            GoldType.DIGITAL: 85,
            GoldType.FUND: 80,
            GoldType.SOVEREIGN: 70,
            GoldType.PHYSICAL: 50
        }
        return scores.get(gold_type, 50)
    
    def _calculate_safety_score(self, gold_type: GoldType) -> int:
        """Calculate safety/security score (0-100)"""
        scores = {
            GoldType.SOVEREIGN: 95,  # Government backed
            GoldType.ETF: 85,        # Demat account
            GoldType.FUND: 80,       # Mutual fund structure
            GoldType.DIGITAL: 75,    # Digital platform
            GoldType.PHYSICAL: 60    # Risk of theft/loss
        }
        return scores.get(gold_type, 50)
    
    def _get_minimum_investment(self, gold_type: GoldType) -> float:
        """Get minimum investment amount"""
        minimums = {
            GoldType.PHYSICAL: 1000,     # ₹1000
            GoldType.DIGITAL: 100,       # ₹100
            GoldType.ETF: 1000,          # 1 unit ~ ₹1000
            GoldType.SOVEREIGN: 1000,    # ₹1000
            GoldType.FUND: 500           # ₹500 for SIP
        }
        return minimums.get(gold_type, 1000)
    
    def _get_tax_implications(self, gold_type: GoldType) -> str:
        """Get tax implications"""
        taxes = {
            GoldType.PHYSICAL: "LTCG: 20% with indexation after 3 years",
            GoldType.DIGITAL: "LTCG: 20% with indexation after 3 years",
            GoldType.ETF: "LTCG: 20% with indexation after 1 year",
            GoldType.SOVEREIGN: "Interest: Taxable, LTCG: Tax-free after 8 years",
            GoldType.FUND: "LTCG: 20% with indexation after 3 years"
        }
        return taxes.get(gold_type, "Consult tax advisor")
    
    def _get_suitability(self, gold_type: GoldType) -> str:
        """Get suitability description"""
        suitability = {
            GoldType.PHYSICAL: "Long-term holding, wedding/gifts",
            GoldType.DIGITAL: "Regular investors, easy liquidity",
            GoldType.ETF: "Traders, short-term investors",
            GoldType.SOVEREIGN: "Risk-averse, tax-saving",
            GoldType.FUND: "SIP investors, diversification"
        }
        return suitability.get(gold_type, "General investment")
