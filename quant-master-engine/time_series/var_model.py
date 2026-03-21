import numpy as np
import pandas as pd
from statsmodels.tsa.api import VAR
from statsmodels.tsa.stattools import grangercausalitytests
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class VectorAutoRegressionModel:
    def __init__(self, max_lags: int = 10):
        self.max_lags = max_lags
        self.model = None
        self.selected_lags = {}
        
    def select_optimal_lags(self, data: pd.DataFrame, max_lags: int = 10) -> Dict:
        """Select optimal lag length using information criteria"""
        results = {}
        
        for lag in range(1, max_lags + 1):
            try:
                model = VAR(data)
                fitted_model = model.fit(lag)
                results[lag] = {
                    'aic': fitted_model.aic,
                    'bic': fitted_model.bic,
                    'hqic': fitted_model.hqic
                }
            except:
                continue
        
        if not results:
            return {'optimal_lag': 1, 'all_criteria': {}, 'selected_criterion': 'aic'}
            
        # Find optimal lag based on AIC (minimize AIC)
        optimal_lag = min(results.items(), key=lambda x: x[1]['aic'])[0]
        
        return {
            'optimal_lag': optimal_lag,
            'all_criteria': results,
            'selected_criterion': 'aic'
        }
    
    def granger_causality_test(self, data: pd.DataFrame, max_lag: int = 5) -> Dict:
        """Test for Granger causality between variables"""
        causality_results = {}
        variables = data.columns
        
        for cause in variables:
            for effect in variables:
                if cause != effect:
                    try:
                        test_result = grangercausalitytests(
                            data[[effect, cause]], maxlag=max_lag, verbose=False
                        )
                        
                        # Get p-values for each lag
                        p_values = {lag: result[0]['ssr_chi2test'][1] 
                                  for lag, result in test_result.items()}
                        
                        causality_results[f"{cause}_to_{effect}"] = {
                            'p_values': p_values,
                            'min_p_value': min(p_values.values()),
                            'causal_relationship': min(p_values.values()) < 0.05
                        }
                    except:
                        continue
        
        return causality_results
    
    def fit_var_model(self, data: pd.DataFrame, lags: Optional[int] = None) -> Dict:
        """Fit VAR model to multi-asset data"""
        if lags is None:
            lag_selection = self.select_optimal_lags(data, self.max_lags)
            lags = lag_selection['optimal_lag']
        
        self.model = VAR(data)
        fitted_model = self.model.fit(lags)
        
        # Forecast
        forecast = fitted_model.forecast(data.values, steps=1)
        forecast_df = pd.DataFrame(forecast, columns=data.columns, index=[len(data)])
        
        # Impulse response analysis
        irf = fitted_model.irf(10)
        
        return {
            'model': fitted_model,
            'forecast': forecast_df,
            'lag_order': lags,
            'summary': fitted_model.summary(),
            'residuals': fitted_model.resid,
            'causality_tests': self.granger_causality_test(data),
            'impulse_response': irf,
            'forecast_error_variance_decomposition': fitted_model.fevd()
        }
    
    def generate_portfolio_signals(self, asset_data: Dict[str, pd.Series]) -> Dict:
        """Generate trading signals for portfolio using VAR"""
        # Create DataFrame from asset data
        df = pd.DataFrame(asset_data)
        
        # Fit VAR model
        var_results = self.fit_var_model(df)
        forecast = var_results['forecast']
        
        signals = {}
        current_prices = {asset: data.iloc[-1] for asset, data in asset_data.items()}
        
        for asset in asset_data.keys():
            current_price = current_prices[asset]
            predicted_price = forecast[asset].iloc[0]
            
            expected_return = (predicted_price - current_price) / current_price * 100
            
            # Generate signal based on predicted movement
            if expected_return > 1.0:
                signal = "BUY"
            elif expected_return < -1.0:
                signal = "SELL"
            else:
                signal = "HOLD"
            
            # Use forecast error variance for confidence
            confidence = max(0.1, min(0.9, 1 - abs(expected_return) / 5.0))
            
            signals[asset] = {
                'signal': signal,
                'expected_return_pct': expected_return,
                'confidence': confidence,
                'current_price': current_price,
                'predicted_price': predicted_price,
                'model_type': 'VAR'
            }
        
        return {
            'individual_signals': signals,
            'portfolio_recommendation': self._generate_portfolio_recommendation(signals),
            'var_model_summary': var_results['summary'],
            'causality_insights': var_results['causality_tests']
        }
    
    def _generate_portfolio_recommendation(self, signals: Dict) -> Dict:
        """Generate overall portfolio recommendation"""
        buy_signals = [s for s in signals.values() if s['signal'] == 'BUY']
        sell_signals = [s for s in signals.values() if s['signal'] == 'SELL']
        
        avg_buy_confidence = np.mean([s['confidence'] for s in buy_signals]) if buy_signals else 0
        avg_sell_confidence = np.mean([s['confidence'] for s in sell_signals]) if sell_signals else 0
        
        if avg_buy_confidence > avg_sell_confidence and len(buy_signals) > len(sell_signals):
            portfolio_signal = "BULLISH"
        elif avg_sell_confidence > avg_buy_confidence and len(sell_signals) > len(buy_signals):
            portfolio_signal = "BEARISH"
        else:
            portfolio_signal = "NEUTRAL"
        
        return {
            'portfolio_signal': portfolio_signal,
            'buy_assets_count': len(buy_signals),
            'sell_assets_count': len(sell_signals),
            'avg_buy_confidence': avg_buy_confidence,
            'avg_sell_confidence': avg_sell_confidence
        }
