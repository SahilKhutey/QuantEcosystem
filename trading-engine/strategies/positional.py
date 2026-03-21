import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import yfinance as yf
from scipy import stats

class PositionalSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    ACCUMULATE = "ACCUMULATE"
    HOLD = "HOLD"
    REDUCE = "REDUCE"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class PositionalConfig:
    symbol: str
    timeframe: str = "1mo"  # Monthly data for positional
    min_holding_period: int = 90  # Days
    max_holding_period: int = 365 * 3  # 3 years
    pe_threshold: float = 25
    pb_threshold: float = 3
    debt_to_equity_threshold: float = 0.5
    roe_threshold: float = 0.15
    revenue_growth_threshold: float = 0.10
    dividend_yield_threshold: float = 0.02

class PositionalStrategy:
    def __init__(self, config: PositionalConfig):
        self.config = config
        self.positions = {}
        self.trade_history = []
        self.fundamental_data = {}
        
    async def analyze(self, symbol: str) -> Dict:
        """Comprehensive analysis for positional trading"""
        # Get fundamental data
        fundamental = await self._get_fundamental_data(symbol)
        
        # Get technical data
        technical = await self._get_technical_data(symbol)
        
        # Get macroeconomic data
        macro = await self._get_macro_data()
        
        # Analyze fundamentals
        fundamental_score, fundamental_signal = self._analyze_fundamentals(fundamental)
        
        # Analyze technicals
        technical_score, technical_signal = self._analyze_technicals(technical)
        
        # Analyze macro environment
        macro_score, macro_signal = self._analyze_macro(macro, symbol)
        
        # Combine analysis
        combined_score = (fundamental_score * 0.5 + 
                         technical_score * 0.3 + 
                         macro_score * 0.2)
        
        # Generate final signal
        final_signal = self._generate_final_signal(
            combined_score, fundamental_signal, technical_signal, macro_signal
        )
        
        # Calculate fair value
        fair_value = self._calculate_fair_value(fundamental, technical)
        
        # Calculate margin of safety
        current_price = technical.get('current_price', 0)
        margin_of_safety = (fair_value - current_price) / fair_value * 100 if fair_value > 0 else 0
        
        return {
            'symbol': symbol,
            'signal': final_signal,
            'confidence': combined_score,
            'fundamental_score': fundamental_score,
            'technical_score': technical_score,
            'macro_score': macro_score,
            'fair_value': fair_value,
            'current_price': current_price,
            'margin_of_safety': margin_of_safety,
            'fundamental_data': fundamental,
            'technical_data': technical,
            'timestamp': datetime.utcnow()
        }
    
    async def _get_fundamental_data(self, symbol: str) -> Dict:
        """Get fundamental data for company"""
        try:
            stock = yf.Ticker(symbol)
            
            # Get financial statements
            balance_sheet = stock.balance_sheet
            income_stmt = stock.income_stmt
            cash_flow = stock.cash_flow
            
            # Calculate key ratios
            fundamentals = {}
            
            # P/E Ratio
            if 'trailingPE' in stock.info:
                fundamentals['pe_ratio'] = stock.info['trailingPE']
            
            # P/B Ratio
            if 'priceToBook' in stock.info:
                fundamentals['pb_ratio'] = stock.info['priceToBook']
            
            # Debt to Equity
            if balance_sheet is not None and len(balance_sheet) > 0:
                total_debt = balance_sheet.loc['Total Debt'].iloc[0] if 'Total Debt' in balance_sheet.index else 0
                total_equity = balance_sheet.loc['Total Equity Gross Minority Interest'].iloc[0] if 'Total Equity Gross Minority Interest' in balance_sheet.index else 0
                if total_equity > 0:
                    fundamentals['debt_to_equity'] = total_debt / total_equity
            
            # Return on Equity
            if income_stmt is not None and balance_sheet is not None:
                net_income = income_stmt.loc['Net Income'].iloc[0] if 'Net Income' in income_stmt.index else 0
                total_equity = balance_sheet.loc['Total Equity Gross Minority Interest'].iloc[0] if 'Total Equity Gross Minority Interest' in balance_sheet.index else 0
                if total_equity > 0:
                    fundamentals['roe'] = net_income / total_equity
            
            # Revenue Growth
            if income_stmt is not None and len(income_stmt.columns) >= 2:
                current_revenue = income_stmt.loc['Total Revenue'].iloc[0] if 'Total Revenue' in income_stmt.index else 0
                prev_revenue = income_stmt.loc['Total Revenue'].iloc[1] if len(income_stmt.columns) > 1 else current_revenue
                if prev_revenue > 0:
                    fundamentals['revenue_growth'] = (current_revenue - prev_revenue) / prev_revenue
            
            # Dividend Yield
            if 'dividendYield' in stock.info:
                fundamentals['dividend_yield'] = stock.info['dividendYield']
            
            # Free Cash Flow
            if cash_flow is not None:
                fcf = cash_flow.loc['Free Cash Flow'].iloc[0] if 'Free Cash Flow' in cash_flow.index else 0
                fundamentals['free_cash_flow'] = fcf
            
            return fundamentals
            
        except Exception as e:
            print(f"Error fetching fundamental data for {symbol}: {e}")
            return {}
    
    async def _get_technical_data(self, symbol: str) -> Dict:
        """Get technical data for positional analysis"""
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period="5y", interval="1mo")
            
            if hist.empty:
                return {}
            
            technicals = {}
            
            # Current price
            technicals['current_price'] = hist['Close'].iloc[-1]
            
            # Moving averages
            technicals['sma_200'] = hist['Close'].rolling(window=200).mean().iloc[-1]
            technicals['sma_50'] = hist['Close'].rolling(window=50).mean().iloc[-1]
            
            # Price relative to moving averages
            technicals['price_vs_sma200'] = (technicals['current_price'] / technicals['sma_200'] - 1) * 100
            technicals['price_vs_sma50'] = (technicals['current_price'] / technicals['sma_50'] - 1) * 100
            
            # Volatility
            returns = hist['Close'].pct_change().dropna()
            technicals['volatility'] = returns.std() * np.sqrt(12)  # Annualized
            
            # Drawdown analysis
            cumulative = (1 + returns).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            technicals['max_drawdown'] = drawdown.min() * 100
            
            # Trend analysis
            if len(hist) >= 20:
                x = np.arange(len(hist))
                y = hist['Close'].values
                slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
                technicals['trend_slope'] = slope
                technicals['trend_r_squared'] = r_value ** 2
            
            return technicals
            
        except Exception as e:
            print(f"Error fetching technical data for {symbol}: {e}")
            return {}
    
    async def _get_macro_data(self) -> Dict:
        """Get macroeconomic data"""
        # Simplified - in production, fetch from APIs
        return {
            'interest_rate': 0.04,  # 4%
            'inflation_rate': 0.06,  # 6%
            'gdp_growth': 0.07,  # 7%
            'market_valuation': 'fair',  # fair, overvalued, undervalued
            'sector_outlook': 'neutral'
        }
    
    def _analyze_fundamentals(self, fundamentals: Dict) -> Tuple[float, PositionalSignal]:
        """Analyze fundamental data"""
        score = 50  # Base score
        signal = PositionalSignal.HOLD
        
        # P/E Ratio analysis
        if 'pe_ratio' in fundamentals:
            pe = fundamentals['pe_ratio']
            if pe < 15:
                score += 20
                signal = PositionalSignal.STRONG_BUY
            elif pe < self.config.pe_threshold:
                score += 10
                signal = PositionalSignal.BUY if signal == PositionalSignal.HOLD else signal
            elif pe > 30:
                score -= 15
                signal = PositionalSignal.SELL
        
        # P/B Ratio analysis
        if 'pb_ratio' in fundamentals:
            pb = fundamentals['pb_ratio']
            if pb < 1.5:
                score += 15
            elif pb > self.config.pb_threshold:
                score -= 10
        
        # Debt to Equity analysis
        if 'debt_to_equity' in fundamentals:
            dte = fundamentals['debt_to_equity']
            if dte < 0.3:
                score += 10
            elif dte > self.config.debt_to_equity_threshold:
                score -= 10
        
        # ROE analysis
        if 'roe' in fundamentals:
            roe = fundamentals['roe']
            if roe > self.config.roe_threshold:
                score += 15
            elif roe > 0.10:
                score += 5
            elif roe < 0:
                score -= 15
        
        # Revenue Growth analysis
        if 'revenue_growth' in fundamentals:
            growth = fundamentals['revenue_growth']
            if growth > self.config.revenue_growth_threshold:
                score += 10
            elif growth > 0.05:
                score += 5
            elif growth < 0:
                score -= 10
        
        # Dividend Yield analysis
        if 'dividend_yield' in fundamentals:
            dy = fundamentals['dividend_yield']
            if dy > self.config.dividend_yield_threshold:
                score += 5
        
        # Normalize score
        score = max(0, min(100, score))
        
        return score / 100, signal
    
    def _analyze_technicals(self, technicals: Dict) -> Tuple[float, PositionalSignal]:
        """Analyze technical data for positional trading"""
        score = 50  # Base score
        signal = PositionalSignal.HOLD
        
        if not technicals:
            return 0.5, signal
        
        # Price relative to SMA200 (long-term trend)
        if 'price_vs_sma200' in technicals:
            price_vs_sma200 = technicals['price_vs_sma200']
            if price_vs_sma200 > 20:  # 20% above SMA200
                score -= 10  # Might be overextended
                signal = PositionalSignal.REDUCE
            elif price_vs_sma200 < -20:  # 20% below SMA200
                score += 15  # Might be oversold
                signal = PositionalSignal.ACCUMULATE
        
        # Price relative to SMA50 (medium-term trend)
        if 'price_vs_sma50' in technicals:
            price_vs_sma50 = technicals['price_vs_sma50']
            if price_vs_sma50 > 10 and signal == PositionalSignal.ACCUMULATE:
                score += 5  # Confirming uptrend
                signal = PositionalSignal.BUY
        
        # Trend strength
        if 'trend_r_squared' in technicals:
            r_squared = technicals['trend_r_squared']
            if r_squared > 0.7:  # Strong trend
                score += 10
            elif r_squared < 0.3:  # Weak/no trend
                score -= 5
        
        # Volatility
        if 'volatility' in technicals:
            volatility = technicals['volatility']
            if volatility < 0.2:  # Low volatility
                score += 5
            elif volatility > 0.4:  # High volatility
                score -= 10
        
        # Normalize score
        score = max(0, min(100, score))
        
        return score / 100, signal
    
    def _analyze_macro(self, macro: Dict, symbol: str) -> Tuple[float, PositionalSignal]:
        """Analyze macroeconomic environment"""
        score = 50  # Base score
        signal = PositionalSignal.HOLD
        
        # Interest rate impact
        interest_rate = macro.get('interest_rate', 0.04)
        if interest_rate < 0.03:  # Low interest rates are good for stocks
            score += 10
        elif interest_rate > 0.06:  # High interest rates are bad for stocks
            score -= 10
        
        # Inflation impact
        inflation = macro.get('inflation_rate', 0.06)
        if inflation < 0.04:  # Low inflation is good
            score += 5
        elif inflation > 0.08:  # High inflation is bad
            score -= 10
        
        # GDP growth
        gdp_growth = macro.get('gdp_growth', 0.07)
        if gdp_growth > 0.06:  # Strong growth
            score += 10
        elif gdp_growth < 0.04:  # Weak growth
            score -= 10
        
        # Market valuation
        market_valuation = macro.get('market_valuation', 'fair')
        if market_valuation == 'undervalued':
            score += 15
            signal = PositionalSignal.ACCUMULATE
        elif market_valuation == 'overvalued':
            score -= 15
            signal = PositionalSignal.REDUCE
        
        # Normalize score
        score = max(0, min(100, score))
        
        return score / 100, signal
    
    def _generate_final_signal(self, combined_score: float,
                             fundamental_signal: PositionalSignal,
                             technical_signal: PositionalSignal,
                             macro_signal: PositionalSignal) -> PositionalSignal:
        """Generate final trading signal"""
        # Signal hierarchy
        signal_priority = {
            PositionalSignal.STRONG_SELL: 1,
            PositionalSignal.SELL: 2,
            PositionalSignal.REDUCE: 3,
            PositionalSignal.HOLD: 4,
            PositionalSignal.ACCUMULATE: 5,
            PositionalSignal.BUY: 6,
            PositionalSignal.STRONG_BUY: 7
        }
        
        # Collect signals
        signals = [fundamental_signal, technical_signal, macro_signal]
        
        # Count occurrences
        signal_counts = {}
        for signal in signals:
            signal_counts[signal] = signal_counts.get(signal, 0) + 1
        
        # Find most common signal
        most_common = max(signal_counts.items(), key=lambda x: x[1])
        
        # Adjust based on confidence
        if combined_score > 0.7:
            # Upgrade signal
            if most_common[0] == PositionalSignal.BUY:
                return PositionalSignal.STRONG_BUY
            elif most_common[0] == PositionalSignal.SELL:
                return PositionalSignal.STRONG_SELL
        elif combined_score < 0.3:
            # Downgrade to HOLD if low confidence
            return PositionalSignal.HOLD
        
        return most_common[0]
    
    def _calculate_fair_value(self, fundamental: Dict, technical: Dict) -> float:
        """Calculate fair value using multiple methods"""
        methods = []
        weights = []
        
        # 1. P/E based valuation
        if 'pe_ratio' in fundamental and 'current_price' in technical:
            pe = fundamental['pe_ratio']
            current_price = technical['current_price']
            
            # Assume fair P/E of 20
            fair_pe = 20
            pe_value = current_price * (fair_pe / pe) if pe > 0 else 0
            methods.append(pe_value)
            weights.append(0.3)
        
        # 2. P/B based valuation
        if 'pb_ratio' in fundamental and 'current_price' in technical:
            pb = fundamental['pb_ratio']
            current_price = technical['current_price']
            
            # Assume fair P/B of 2.5
            fair_pb = 2.5
            pb_value = current_price * (fair_pb / pb) if pb > 0 else 0
            methods.append(pb_value)
            weights.append(0.2)
        
        # 3. DCF simplified (using free cash flow)
        if 'free_cash_flow' in fundamental:
            fcf = fundamental['free_cash_flow']
            # Assume 10% growth for 5 years, then 3% terminal
            # Simplified: 15x FCF
            dcf_value = fcf * 15
            methods.append(dcf_value)
            weights.append(0.3)
        
        # 4. Dividend discount model
        if 'dividend_yield' in fundamental and 'current_price' in technical:
            dy = fundamental['dividend_yield']
            current_price = technical['current_price']
            
            # Assume 8% required return
            required_return = 0.08
            dividend = current_price * dy
            ddm_value = dividend / required_return if required_return > 0 else 0
            methods.append(ddm_value)
            weights.append(0.2)
        
        # Calculate weighted average
        if methods and weights:
            total_weight = sum(weights)
            weighted_values = [m * w for m, w in zip(methods, weights)]
            fair_value = sum(weighted_values) / total_weight if total_weight > 0 else 0
        else:
            fair_value = technical.get('current_price', 0)
        
        return fair_value
    
    def create_positional_trade(self, analysis: Dict, capital: float) -> Optional[Dict]:
        """Create a positional trading plan"""
        if analysis['signal'] == PositionalSignal.HOLD:
            return None
        
        current_price = analysis['current_price']
        fair_value = analysis['fair_value']
        margin_of_safety = analysis['margin_of_safety']
        
        # Determine allocation based on signal and margin of safety
        if analysis['signal'] == PositionalSignal.STRONG_BUY:
            allocation_pct = min(0.10, 0.05 + (margin_of_safety / 100) * 0.1)
        elif analysis['signal'] == PositionalSignal.BUY:
            allocation_pct = 0.05
        elif analysis['signal'] == PositionalSignal.ACCUMULATE:
            allocation_pct = 0.03
        elif analysis['signal'] == PositionalSignal.REDUCE:
            allocation_pct = -0.05  # Negative for reduction
        elif analysis['signal'] == PositionalSignal.SELL:
            allocation_pct = -0.10
        elif analysis['signal'] == PositionalSignal.STRONG_SELL:
            allocation_pct = -0.15
        else:
            return None
        
        # Calculate position size
        position_value = capital * allocation_pct
        position_size = position_value / current_price if current_price > 0 else 0
        
        # Calculate stop loss (wider for positional)
        stop_loss_pct = 0.20  # 20% stop loss for positional
        stop_loss = current_price * (1 - stop_loss_pct) if allocation_pct > 0 else None
        
        # Calculate target (based on fair value)
        target = fair_value
        
        trade = {
            'trade_id': f"positional_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'symbol': analysis['symbol'],
            'signal': analysis['signal'].value,
            'confidence': analysis['confidence'],
            'allocation_pct': allocation_pct * 100,
            'entry_price': current_price,
            'position_size': position_size,
            'position_value': position_value,
            'fair_value': fair_value,
            'margin_of_safety': margin_of_safety,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward_ratio': abs(target - current_price) / abs(current_price - stop_loss) 
                               if stop_loss and target else None,
            'holding_period_min': self.config.min_holding_period,
            'holding_period_max': self.config.max_holding_period,
            'timestamp': datetime.utcnow(),
            'fundamental_score': analysis['fundamental_score'],
            'technical_score': analysis['technical_score'],
            'macro_score': analysis['macro_score']
        }
        
        self.trade_history.append(trade)
        return trade
