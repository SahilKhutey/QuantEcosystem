import pandas as pd
import numpy as np
from typing import Dict, List, Callable, Optional
from datetime import datetime, timedelta
import talib

class StrategyBuilder:
    def __init__(self):
        self.available_indicators = {
            'sma': self._calculate_sma,
            'ema': self._calculate_ema,
            'rsi': self._calculate_rsi,
            'macd': self._calculate_macd,
            'bollinger': self._calculate_bollinger
        }
        
    def build_strategy(self, strategy_def: Dict) -> Callable:
        """Construct a trading function from a JSON-based strategy definition"""
        conditions = strategy_def.get('conditions', [])
        
        def strategy_func(df: pd.DataFrame) -> pd.Series:
            signals = pd.Series(0, index=df.index)
            
            # Pre-calculate requisite indicators
            indicator_values = {}
            for indicator in strategy_def.get('indicators', []):
                name = indicator['name']
                if name in self.available_indicators:
                    indicator_values[name] = self.available_indicators[name](df, **indicator.get('params', {}))
                        
            # Apply logical conditions to the last bar
            for condition in conditions:
                if self._evaluate_condition(condition, df, indicator_values):
                    signals.iloc[-1] = condition.get('signal', 1) # 1=Buy, -1=Sell
                    
            return signals
            
        return strategy_func
        
    def _evaluate_condition(self, condition: Dict,
                          df: pd.DataFrame,
                          indicator_values: Dict) -> bool:
        """Evaluate atomic trading conditions like crossovers or thresholds"""
        ctype = condition.get('type')
        
        if ctype == 'price_cross':
            price = df['close'].iloc[-1]
            threshold = condition.get('threshold')
            return price > threshold if condition.get('direction') == 'above' else price < threshold
                
        elif ctype == 'indicator_cross':
            ind = condition.get('indicator')
            val = indicator_values.get(ind, pd.Series([0]))[-1]
            target = condition.get('value', 0)
            return val > target if condition.get('direction') == 'above' else val < target
            
        elif ctype == 'indicator_crossover':
            ind1, ind2 = condition.get('indicator1'), condition.get('indicator2')
            if ind1 in indicator_values and ind2 in indicator_values:
                v1, v2 = indicator_values[ind1], indicator_values[ind2]
                if len(v1) >= 2 and len(v2) >= 2:
                    direct = condition.get('direction') # bullish or bearish
                    if direct == 'bullish': # crossing ABOVE
                        return v1.iloc[-2] <= v2.iloc[-2] and v1.iloc[-1] > v2.iloc[-1]
                    else: # crossing BELOW
                        return v1.iloc[-2] >= v2.iloc[-2] and v1.iloc[-1] < v2.iloc[-1]
                        
        return False
        
    def backtest_strategy(self, strategy_func: Callable,
                         data: pd.DataFrame,
                         initial_capital: float = 10000.0,
                         commission: float = 0.001) -> Dict:
        """Simulate strategy performance over historical market data"""
        signals = strategy_func(data)
        
        portfolio = pd.DataFrame(index=data.index)
        portfolio['signal'] = signals
        portfolio['price'] = data['close']
        portfolio['position'] = portfolio['signal'].diff().fillna(0)
        
        # Performance calculation
        portfolio['returns'] = data['close'].pct_change()
        portfolio['strategy_returns'] = portfolio['signal'].shift(1) * portfolio['returns']
        
        # Cost adjustment
        portfolio['costs'] = abs(portfolio['signal'].diff()) * commission
        portfolio['net_returns'] = portfolio['strategy_returns'] - portfolio['costs']
        portfolio['equity'] = (1 + portfolio['net_returns']).cumprod() * initial_capital
        
        total_ret = (portfolio['equity'].iloc[-1] / initial_capital) - 1
        sharpe = (portfolio['net_returns'].mean() / portfolio['net_returns'].std() * np.sqrt(252)) if portfolio['net_returns'].std() != 0 else 0
        
        return {
            'total_return': float(total_ret),
            'sharpe_ratio': float(sharpe),
            'final_equity': float(portfolio['equity'].iloc[-1]),
            'num_trades': int(abs(portfolio['signal'].diff()).sum() / 2) # simplified
        }
        
    # Standard Indicator Wrappers
    def _calculate_sma(self, df, period=20): return talib.SMA(df['close'].values, timeperiod=period)
    def _calculate_ema(self, df, period=20): return talib.EMA(df['close'].values, timeperiod=period)
    def _calculate_rsi(self, df, period=14): return talib.RSI(df['close'].values, timeperiod=period)
    def _calculate_macd(self, df, fast=12, slow=26, sign=9): 
        m, s, h = talib.MACD(df['close'].values, fastperiod=fast, slowperiod=slow, signalperiod=sign)
        return m
    def _calculate_bollinger(self, df, period=20): 
        u, m, l = talib.BBANDS(df['close'].values, timeperiod=period)
        return m
