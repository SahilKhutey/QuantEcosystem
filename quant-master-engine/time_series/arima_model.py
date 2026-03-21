import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller, acf, pacf
from typing import Tuple, Dict, Optional
import warnings
warnings.filterwarnings('ignore')

class AdvancedARIMA:
    def __init__(self):
        self.best_params = {}
        self.model_cache = {}
        
    def check_stationarity(self, series: pd.Series, significance_level: float = 0.05) -> Tuple[bool, float]:
        """Augmented Dickey-Fuller test for stationarity"""
        result = adfuller(series.dropna())
        p_value = result[1]
        is_stationary = p_value < significance_level
        return is_stationary, p_value
    
    def difference_series(self, series: pd.Series, periods: int = 1) -> pd.Series:
        """Difference series to achieve stationarity"""
        return series.diff(periods).dropna()
    
    def auto_select_arima_params(self, series: pd.Series, max_p: int = 5, max_q: int = 5) -> Tuple[int, int, int]:
        """Automatically select best ARIMA parameters using AIC"""
        best_aic = np.inf
        best_order = (0, 0, 0)
        
        # Test different parameter combinations
        for p in range(max_p + 1):
            for d in range(2):  # 0 or 1 differences
                for q in range(max_q + 1):
                    try:
                        model = ARIMA(series, order=(p, d, q))
                        fitted_model = model.fit()
                        current_aic = fitted_model.aic
                        
                        if current_aic < best_aic:
                            best_aic = current_aic
                            best_order = (p, d, q)
                    except:
                        continue
        
        return best_order
    
    def fit_arima(self, series: pd.Series, order: Optional[Tuple[int, int, int]] = None) -> Dict:
        """Fit ARIMA model with automatic parameter selection"""
        if order is None:
            order = self.auto_select_arima_params(series)
        
        # Ensure stationarity
        stationary_series = series.copy()
        d = order[1]
        
        for _ in range(d):
            stationary_series = self.difference_series(stationary_series)
        
        # Fit model
        model = ARIMA(series, order=order)
        fitted_model = model.fit()
        
        # Calculate confidence intervals
        forecast = fitted_model.get_forecast(steps=1)
        conf_int = forecast.conf_int()
        
        results = {
            'model': fitted_model,
            'order': order,
            'aic': fitted_model.aic,
            'bic': fitted_model.bic,
            'params': fitted_model.params,
            'forecast': forecast.predicted_mean.iloc[0],
            'confidence_interval': {
                'lower': conf_int.iloc[0, 0],
                'upper': conf_int.iloc[0, 1]
            },
            'stationarity_check': self.check_stationarity(series)
        }
        
        self.model_cache['arima'] = results
        return results
    
    def predict_future(self, series: pd.Series, steps: int = 5, confidence_level: float = 0.95) -> Dict:
        """Predict future values with confidence intervals"""
        model_results = self.fit_arima(series)
        model = model_results['model']
        
        forecast = model.get_forecast(steps=steps)
        predicted_values = forecast.predicted_mean
        conf_int = forecast.conf_int(alpha=1-confidence_level)
        
        return {
            'predictions': predicted_values,
            'confidence_intervals': conf_int,
            'model_summary': model.summary(),
            'residuals_analysis': self.analyze_residuals(model.resid)
        }
    
    def analyze_residuals(self, residuals: pd.Series) -> Dict:
        """Analyze model residuals for goodness of fit"""
        from scipy import stats
        
        # Normality test
        _, normality_pvalue = stats.normaltest(residuals.dropna())
        
        # Autocorrelation test
        autocorr = acf(residuals.dropna(), nlags=10)
        
        return {
            'mean_residual': residuals.mean(),
            'std_residual': residuals.std(),
            'normality_pvalue': normality_pvalue,
            'autocorrelation_lags': autocorr,
            'is_white_noise': all(abs(autocorr[1:]) < 0.1)  # Basic check
        }
    
    def calculate_trading_signal(self, series: pd.Series, current_price: float) -> Dict:
        """Generate trading signal based on ARIMA forecast"""
        try:
            forecast_results = self.predict_future(series, steps=1)
            predicted_price = forecast_results['predictions'].iloc[0]
            confidence_lower = forecast_results['confidence_intervals'].iloc[0, 0]
            confidence_upper = forecast_results['confidence_intervals'].iloc[0, 1]
            
            # Calculate signal strength
            price_diff = predicted_price - current_price
            price_diff_pct = (price_diff / current_price) * 100
            
            # Confidence-based signal
            confidence_width = confidence_upper - confidence_lower
            signal_strength = abs(price_diff) / confidence_width if confidence_width > 0 else 0
            
            # Generate signal
            if price_diff_pct > 1.0 and signal_strength > 0.5:
                signal = "STRONG_BUY"
            elif price_diff_pct > 0.5:
                signal = "BUY"
            elif price_diff_pct < -1.0 and signal_strength > 0.5:
                signal = "STRONG_SELL"
            elif price_diff_pct < -0.5:
                signal = "SELL"
            else:
                signal = "HOLD"
            
            return {
                'signal': signal,
                'predicted_price': predicted_price,
                'current_price': current_price,
                'expected_return_pct': price_diff_pct,
                'confidence_interval': (confidence_lower, confidence_upper),
                'signal_strength': min(signal_strength, 1.0),
                'model_confidence': 0.8 - (confidence_width / current_price)  # Narrower CI = more confidence
            }
            
        except Exception as e:
            return {
                'signal': 'HOLD',
                'error': str(e),
                'confidence': 0.0
            }
