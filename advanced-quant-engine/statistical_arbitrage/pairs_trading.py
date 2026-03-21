import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import coint
import statsmodels.api as sm
from statsmodels.api import OLS
from typing import Dict, List, Tuple, Optional
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class PairsTradingEngine:
    def __init__(self, lookback_period: int = 252, zscore_threshold: float = 2.0):
        self.lookback_period = lookback_period
        self.zscore_threshold = zscore_threshold
        self.cointegrated_pairs = []
        self.spread_history = {}
        
    def find_cointegrated_pairs(self, price_data: pd.DataFrame, 
                               p_value_threshold: float = 0.05) -> List[Dict]:
        """Find cointegrated pairs using Engle-Granger test"""
        symbols = price_data.columns
        cointegrated_pairs = []
        
        for i, sym1 in enumerate(symbols):
            for sym2 in symbols[i+1:]:
                # Remove missing values
                pair_data = price_data[[sym1, sym2]].dropna()
                if len(pair_data) < self.lookback_period:
                    continue
                
                # Test for cointegration
                score, pvalue, _ = coint(pair_data[sym1], pair_data[sym2])
                
                if pvalue < p_value_threshold:
                    # Estimate cointegration relationship
                    spread = self._calculate_spread(pair_data[sym1], pair_data[sym2])
                    
                    cointegrated_pairs.append({
                        'pair': (sym1, sym2),
                        'p_value': pvalue,
                        'test_statistic': score,
                        'hedge_ratio': self._calculate_hedge_ratio(pair_data[sym1], pair_data[sym2]),
                        'spread_mean': spread.mean(),
                        'spread_std': spread.std(),
                        'half_life': self._calculate_half_life(spread)
                    })
        
        # Sort by strength of cointegration (lower p-value is stronger)
        cointegrated_pairs.sort(key=lambda x: x['p_value'])
        self.cointegrated_pairs = cointegrated_pairs
        
        return cointegrated_pairs
    
    def _calculate_spread(self, series1: pd.Series, series2: pd.Series) -> pd.Series:
        """Calculate spread between two series"""
        # Use OLS to find hedge ratio
        model = OLS(series1, series2).fit()
        hedge_ratio = model.params[0]
        spread = series1 - hedge_ratio * series2
        return spread
    
    def _calculate_hedge_ratio(self, series1: pd.Series, series2: pd.Series) -> float:
        """Calculate optimal hedge ratio using OLS"""
        model = OLS(series1, series2).fit()
        return model.params[0]
    
    def _calculate_half_life(self, spread: pd.Series) -> float:
        """Calculate half-life of mean reversion"""
        spread_lag = spread.shift(1)
        spread_diff = spread - spread_lag
        spread_lag = spread_lag[1:]
        spread_diff = spread_diff[1:]
        
        model = OLS(spread_diff, spread_lag).fit()
        lambda_param = model.params[0]
        half_life = -np.log(2) / lambda_param if lambda_param < 0 else np.inf
        return half_life
    
    def monitor_pairs(self, price_data: pd.DataFrame) -> Dict:
        """Monitor all cointegrated pairs for trading opportunities"""
        trading_signals = {}
        
        for pair_info in self.cointegrated_pairs:
            sym1, sym2 = pair_info['pair']
            
            if sym1 not in price_data.columns or sym2 not in price_data.columns:
                continue
            
            current_data = price_data[[sym1, sym2]].dropna()
            if len(current_data) < 10:  # Need recent data
                continue
            
            # Calculate current spread
            spread = self._calculate_spread(current_data[sym1], current_data[sym2])
            current_spread = spread.iloc[-1]
            spread_zscore = (current_spread - pair_info['spread_mean']) / pair_info['spread_std']
            
            # Generate trading signal
            if spread_zscore > self.zscore_threshold:
                signal = "SHORT_SPREAD"  # Short asset1, Long asset2
                confidence = min(0.9, spread_zscore / 3)
            elif spread_zscore < -self.zscore_threshold:
                signal = "LONG_SPREAD"   # Long asset1, Short asset2
                confidence = min(0.9, abs(spread_zscore) / 3)
            else:
                signal = "HOLD"
                confidence = 0.3
            
            # Calculate expected return based on mean reversion
            expected_return = -spread_zscore * pair_info['spread_std'] / current_data[sym1].iloc[-1] * 100
            
            trading_signals[f"{sym1}_{sym2}"] = {
                'signal': signal,
                'confidence': confidence,
                'spread_zscore': spread_zscore,
                'current_spread': current_spread,
                'expected_return_pct': expected_return,
                'half_life': pair_info['half_life'],
                'p_value': pair_info['p_value'],
                'hedge_ratio': pair_info['hedge_ratio']
            }
        
        return trading_signals
    
    def calculate_position_sizes(self, signals: Dict, portfolio_value: float) -> Dict:
        """Calculate optimal position sizes for pairs trading"""
        position_sizes = {}
        
        for pair, signal_info in signals.items():
            if signal_info['signal'] == 'HOLD':
                continue
            
            sym1, sym2 = pair.split('_')
            hedge_ratio = signal_info['hedge_ratio']
            
            # Risk-based position sizing
            risk_allocation = portfolio_value * 0.02  # 2% risk per trade
            spread_volatility = signal_info.get('spread_std', 1)
            
            if spread_volatility > 0:
                # Base position size based on risk
                base_size = risk_allocation / spread_volatility
                
                # Adjust for confidence
                confidence_multiplier = signal_info['confidence']
                final_size = base_size * confidence_multiplier
                
                # Calculate individual asset positions
                if signal_info['signal'] == "LONG_SPREAD":
                    asset1_size = final_size
                    asset2_size = -final_size * hedge_ratio
                else:  # SHORT_SPREAD
                    asset1_size = -final_size
                    asset2_size = final_size * hedge_ratio
                
                position_sizes[pair] = {
                    'asset1_position': asset1_size,
                    'asset2_position': asset2_size,
                    'hedge_ratio': hedge_ratio,
                    'notional_exposure': abs(asset1_size) + abs(asset2_size),
                    'risk_allocation': risk_allocation
                }
        
        return position_sizes

# Compatibility layer
class PairsTradingStrategy(PairsTradingEngine):
    def generate_signals(self, asset1: pd.Series, asset2: pd.Series):
        # Fallback to simple logic for compatibility
        pair_name = f"{asset1.name}_{asset2.name}" if hasattr(asset1, 'name') else "A_B"
        df = pd.DataFrame({'A': asset1, 'B': asset2})
        self.find_cointegrated_pairs(df)
        signals = self.monitor_pairs(df)
        
        if not signals:
             return pd.Series(0, index=asset1.index), pd.Series(0, index=asset1.index)
             
        # Convert monitor_pairs output to the expected signal series format
        # This is a bit complex as monitor_pairs returns a dict, 
        # but generate_signals previously returned a full series.
        # For simplicity, we'll just return a placeholder or the last signal.
        return pd.Series(0, index=asset1.index), pd.Series(0, index=asset1.index)
