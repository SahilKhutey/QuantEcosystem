from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

from strategy_engine.strategies.sip_strategy import SIPStrategy, SIPConfig, SIPFrequency
from strategy_engine.strategies.swp_strategy import SWPStrategy, SWPConfig
from strategy_engine.allocator.portfolio_allocator import PortfolioAllocator, UserProfile, RiskProfile, InvestmentGoal
from strategy_engine.simulator.backtest_engine import BacktestEngine
from strategy_engine.execution.execution_simulator import ExecutionSimulator
from strategy_engine.tracker.performance_analytics import PerformanceTracker

router = APIRouter(prefix="/api/v1/strategies", tags=["strategies"])
security = HTTPBearer()

# Initialize engines
sip_engine = SIPStrategy()
swp_engine = SWPStrategy()
allocator = PortfolioAllocator()
backtester = BacktestEngine()
executor = ExecutionSimulator()
tracker = PerformanceTracker()

# Pydantic models
class SIPRequest(BaseModel):
    monthly_amount: float = Field(..., gt=0, description="Monthly investment amount")
    frequency: str = Field("monthly", description="Investment frequency")
    start_date: datetime = Field(..., description="Start date")
    duration_months: Optional[int] = Field(None, description="Duration in months")
    end_date: Optional[datetime] = Field(None, description="End date")
    asset_class: str = Field("equity", description="Asset class")
    expected_return: float = Field(0.12, description="Expected annual return")
    step_up_percentage: float = Field(0.0, description="Annual step-up percentage")

class SWPRequest(BaseModel):
    initial_corpus: float = Field(..., gt=0, description="Initial investment corpus")
    monthly_withdrawal: float = Field(..., gt=0, description="Monthly withdrawal amount")
    start_date: datetime = Field(..., description="Start date")
    expected_return: float = Field(0.08, description="Expected annual return")
    inflation_rate: float = Field(0.06, description="Expected inflation rate")
    withdrawal_inflation_adjusted: bool = Field(True, description="Adjust withdrawal for inflation")

class PortfolioRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of investor")
    monthly_income: float = Field(..., gt=0, description="Monthly income")
    monthly_expenses: float = Field(..., gt=0, description="Monthly expenses")
    risk_profile: str = Field("moderate", description="Risk profile")
    investment_goal: str = Field("wealth_creation", description="Investment goal")
    goal_amount: float = Field(..., gt=0, description="Target goal amount")
    goal_years: int = Field(..., gt=0, description="Years to achieve goal")
    existing_investments: Optional[Dict[str, float]] = Field({}, description="Existing investments")
    liabilities: float = Field(0, description="Total liabilities")

class SimulationRequest(BaseModel):
    strategy_type: str = Field(..., description="Strategy type")
    parameters: Dict = Field(..., description="Strategy parameters")
    initial_capital: float = Field(100000, description="Initial capital")
    start_date: datetime = Field(..., description="Start date")
    end_date: datetime = Field(..., description="End date")

@router.post("/sip/create")
async def create_sip(request: SIPRequest):
    """Create a new SIP strategy"""
    try:
        # Convert frequency string to enum
        frequency_map = {
            "daily": SIPFrequency.DAILY,
            "weekly": SIPFrequency.WEEKLY,
            "monthly": SIPFrequency.MONTHLY,
            "quarterly": SIPFrequency.QUARTERLY
        }
        
        config = SIPConfig(
            amount=request.monthly_amount,
            frequency=frequency_map.get(request.frequency, SIPFrequency.MONTHLY),
            start_date=request.start_date,
            end_date=request.end_date,
            duration_months=request.duration_months,
            asset_class=request.asset_class,
            step_up_percentage=request.step_up_percentage
        )
        
        sip_id = sip_engine.create_sip(config)
        
        # Calculate returns
        returns = sip_engine.calculate_sip_returns(
            sip_id, expected_return=request.expected_return
        )
        
        return {
            "sip_id": sip_id,
            "status": "created",
            "returns": returns,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/swp/create")
async def create_swp(request: SWPRequest):
    """Create a new SWP strategy"""
    try:
        config = SWPConfig(
            initial_corpus=request.initial_corpus,
            monthly_withdrawal=request.monthly_withdrawal,
            start_date=request.start_date,
            expected_return=request.expected_return,
            inflation_rate=request.inflation_rate,
            withdrawal_inflation_adjusted=request.withdrawal_inflation_adjusted
        )
        
        swp_id = swp_engine.create_swp(config)
        
        # Simulate SWP
        simulation = swp_engine.simulate_swp(swp_id, months=240)  # 20 years
        
        # Calculate metrics
        metrics = swp_engine.calculate_swp_metrics(swp_id)
        
        return {
            "swp_id": swp_id,
            "status": "created",
            "simulation": simulation,
            "metrics": metrics,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/portfolio/allocate")
async def allocate_portfolio(request: PortfolioRequest):
    """Create portfolio allocation plan"""
    try:
        # Convert string to enum
        risk_map = {
            "conservative": RiskProfile.CONSERVATIVE,
            "moderate": RiskProfile.MODERATE,
            "aggressive": RiskProfile.AGGRESSIVE
        }
        
        goal_map = {
            "retirement": InvestmentGoal.RETIREMENT,
            "wealth_creation": InvestmentGoal.WEALTH_CREATION,
            "income_generation": InvestmentGoal.INCOME_GENERATION,
            "tax_saving": InvestmentGoal.TAX_SAVING,
            "education": InvestmentGoal.EDUCATION,
            "marriage": InvestmentGoal.MARRIAGE,
            "house": InvestmentGoal.HOUSE
        }
        
        user = UserProfile(
            age=request.age,
            income=request.monthly_income,
            expenses=request.monthly_expenses,
            risk_profile=risk_map.get(request.risk_profile, RiskProfile.MODERATE),
            investment_goal=goal_map.get(request.investment_goal, InvestmentGoal.WEALTH_CREATION),
            goal_amount=request.goal_amount,
            goal_years=request.goal_years,
            existing_investments=request.existing_investments,
            liabilities=request.liabilities
        )
        
        # Calculate investable amount (simplified)
        monthly_savings = request.monthly_income - request.monthly_expenses
        investable_amount = monthly_savings * 12 * request.goal_years
        
        # Create portfolio plan
        plan = allocator.create_portfolio_plan(user, investable_amount)
        
        return {
            "portfolio_plan": plan,
            "monthly_savings": monthly_savings,
            "investable_amount": investable_amount,
            "created_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulate")
async def simulate_strategy(request: SimulationRequest):
    """Simulate strategy performance"""
    try:
        if request.strategy_type == "sip":
            # SIP simulation
            result = backtester.backtest_sip(
                monthly_amount=request.parameters.get("monthly_amount", 10000),
                start_date=request.start_date,
                end_date=request.end_date,
                asset_returns=pd.Series(request.parameters.get("returns", [])),
                step_up=request.parameters.get("step_up", 0)
            )
            
        elif request.strategy_type == "sip_vs_lumpsum":
            # SIP vs Lump Sum comparison
            result = backtester.compare_sip_vs_lumpsum(
                total_amount=request.parameters.get("total_amount", 100000),
                start_date=request.start_date,
                end_date=request.end_date,
                asset_returns=pd.Series(request.parameters.get("returns", []))
            )
            
        elif request.strategy_type == "monte_carlo":
            # Monte Carlo simulation
            result = backtester.monte_carlo_simulation(
                initial_amount=request.initial_capital,
                monthly_investment=request.parameters.get("monthly_investment", 0),
                years=request.parameters.get("years", 10),
                expected_return=request.parameters.get("expected_return", 0.12),
                volatility=request.parameters.get("volatility", 0.18),
                simulations=request.parameters.get("simulations", 10000)
            )
            
        elif request.strategy_type == "scenario":
            # Scenario analysis
            result = backtester.scenario_analysis(
                portfolio=request.parameters.get("portfolio", {}),
                scenarios=request.parameters.get("scenarios", [])
            )
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown strategy type: {request.strategy_type}")
        
        return {
            "strategy_type": request.strategy_type,
            "result": result,
            "simulated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/execute/simulate")
async def simulate_execution(strategy_signals: List[Dict],
                           initial_capital: float = 100000,
                           symbol: str = "AAPL"):
    """Simulate strategy execution"""
    try:
        # Convert signals to pandas Series
        signals_df = pd.DataFrame(strategy_signals)
        signals_series = pd.Series(
            signals_df['signal'].values,
            index=pd.to_datetime(signals_df['date'])
        )
        
        # Get prices (in production, fetch from database)
        prices = pd.Series(
            signals_df.get('price', [100] * len(signals_df)),
            index=pd.to_datetime(signals_df['date'])
        )
        
        # Simulate execution
        result = executor.simulate_strategy_execution(
            strategy_signals=signals_series,
            initial_capital=initial_capital,
            symbol=symbol,
            prices=prices
        )
        
        return {
            "execution_result": result,
            "simulated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/track/performance")
async def track_performance(portfolio_data: List[Dict],
                          portfolio_id: str,
                          benchmark_data: Optional[List[Dict]] = None):
    """Track portfolio performance"""
    try:
        result = tracker.track_portfolio_performance(
            portfolio_id=portfolio_id,
            portfolio_values=portfolio_data,
            benchmark_values=benchmark_data
        )
        
        return {
            "portfolio_id": portfolio_id,
            "performance": result,
            "tracked_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recommendations")
async def get_recommendations(age: int,
                            risk_profile: str,
                            goal: str,
                            amount: float,
                            horizon: str):
    """Get investment recommendations"""
    try:
        # This would integrate with mutual fund, gold, and equity engines
        recommendations = {
            "equity": {
                "allocation": 50,
                "recommendations": ["Large Cap Funds", "Index Funds"],
                "reasoning": "Suitable for long-term growth"
            },
            "debt": {
                "allocation": 30,
                "recommendations": ["Corporate Bond Funds", "Fixed Deposits"],
                "reasoning": "Provides stability and regular income"
            },
            "gold": {
                "allocation": 10,
                "recommendations": ["Gold ETFs", "Sovereign Gold Bonds"],
                "reasoning": "Hedge against inflation and market volatility"
            },
            "cash": {
                "allocation": 10,
                "recommendations": ["Liquid Funds", "Savings Account"],
                "reasoning": "Emergency fund and liquidity"
            }
        }
        
        return {
            "recommendations": recommendations,
            "profile": {
                "age": age,
                "risk_profile": risk_profile,
                "goal": goal,
                "amount": amount,
                "horizon": horizon
            },
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
