import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import minimize
import statsmodels.api as sm
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
try:
    import tensorflow as tf
    from tensorflow import keras
except ImportError:
    tf = None
    keras = None
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

class QuantitativeEngine:
    def __init__(self):
        self.risk_free_rate = 0.02
        
    def calculate_var(self, returns: pd.Series, 
                     confidence_level: float = 0.95,
                     method: str = 'historical') -> float:
        """Calculate Value at Risk"""
        if returns.empty:
            return 0.0
            
        if method == 'historical':
            return float(np.percentile(returns, (1 - confidence_level) * 100))
        elif method == 'parametric':
            mean = returns.mean()
            std = returns.std()
            z_score = stats.norm.ppf(confidence_level)
            return float(mean + z_score * std)
        elif method == 'monte_carlo':
            return self._monte_carlo_var(returns, confidence_level)
        return 0.0
            
    def _monte_carlo_var(self, returns: pd.Series, 
                        confidence_level: float,
                        n_simulations: int = 10000) -> float:
        """Monte Carlo VaR simulation"""
        mean = returns.mean()
        std = returns.std()
        
        simulated_returns = np.random.normal(mean, std, n_simulations)
        return float(np.percentile(simulated_returns, (1 - confidence_level) * 100))
        
    def calculate_cvar(self, returns: pd.Series, 
                      confidence_level: float = 0.95) -> float:
        """Calculate Conditional Value at Risk"""
        var = self.calculate_var(returns, confidence_level)
        tail_returns = returns[returns <= var]
        return float(tail_returns.mean()) if not tail_returns.empty else 0.0
        
    def calculate_sharpe_ratio(self, returns: pd.Series,
                              annualize: bool = True) -> float:
        """Calculate Sharpe ratio"""
        if returns.empty or returns.std() == 0:
            return 0.0
        excess_returns = returns - self.risk_free_rate / 252
        sharpe = excess_returns.mean() / excess_returns.std()
        
        if annualize:
            sharpe *= np.sqrt(252)
            
        return float(sharpe)
        
    def calculate_beta(self, stock_returns: pd.Series,
                      market_returns: pd.Series) -> float:
        """Calculate beta coefficient relative to market"""
        if stock_returns.empty or market_returns.empty:
            return 1.0
        # Sync indices
        common_idx = stock_returns.index.intersection(market_returns.index)
        s_ret = stock_returns.loc[common_idx]
        m_ret = market_returns.loc[common_idx]
        
        if len(s_ret) < 2:
            return 1.0
            
        covariance = np.cov(s_ret, m_ret)[0, 1]
        market_variance = np.var(m_ret)
        
        return float(covariance / market_variance) if market_variance != 0 else 1.0
        
    def portfolio_optimization(self, returns_df: pd.DataFrame,
                             method: str = 'markowitz') -> Dict:
        """Portfolio optimization wrapper"""
        if returns_df.empty:
            return {}
            
        if method == 'markowitz':
            return self._markowitz_optimization(returns_df)
        elif method == 'risk_parity':
            # Risk parity placeholder or simplified version
            return self._markowitz_optimization(returns_df) 
        return {}
            
    def _markowitz_optimization(self, returns_df: pd.DataFrame) -> Dict:
        """Mean-variance portfolio optimization using SLSQP"""
        n_assets = len(returns_df.columns)
        expected_returns = returns_df.mean()
        cov_matrix = returns_df.cov()
        
        # Objective function (minimize negative Sharpe)
        def objective(weights):
            portfolio_return = np.sum(weights * expected_returns)
            portfolio_volatility = np.sqrt(
                np.dot(weights.T, np.dot(cov_matrix, weights))
            )
            if portfolio_volatility == 0:
                return 0
            sharpe = portfolio_return / portfolio_volatility
            return -sharpe * np.sqrt(252)  # Annualized negative Sharpe
            
        # Constraints: Weights sum to 1
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
        # Bounds: Long only (0 to 1)
        bounds = tuple((0, 1) for _ in range(n_assets))
        
        # Initial guess (equal weights)
        init_weights = np.array([1/n_assets] * n_assets)
        
        # Optimization
        result = minimize(
            objective,
            init_weights,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        optimal_weights = result.x
        
        return {
            'weights': dict(zip(returns_df.columns, optimal_weights.tolist())),
            'expected_return': float(np.sum(optimal_weights * expected_returns)),
            'volatility': float(np.sqrt(np.dot(optimal_weights.T, 
                                       np.dot(cov_matrix, optimal_weights)))),
            'sharpe_ratio': float(-result.fun)
        }
        
    def black_scholes_price(self, S: float, K: float, T: float,
                           r: float, sigma: float, option_type: str = 'call') -> float:
        """Black-Scholes option pricing model"""
        from scipy.stats import norm
        
        if T <= 0 or sigma <= 0:
            return max(0.0, S - K if option_type == 'call' else K - S)
            
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        if option_type == 'call':
            price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        else:  # put
            price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
            
        return float(price)
        
    def build_lstm_model(self, sequence_length: int = 60,
                        n_features: int = 1) -> Optional[object]:
        """Build LSTM model for time series forecasting using Keras"""
        if keras is None:
            return None
            
        model = keras.Sequential([
            keras.layers.LSTM(50, return_sequences=True, 
                            input_shape=(sequence_length, n_features)),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(50, return_sequences=False),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(25),
            keras.layers.Dense(1)
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
        
    def garch_model(self, returns: pd.Series) -> Dict:
        """GARCH(1,1) volatility modeling using arch library"""
        try:
            from arch import arch_model
        except ImportError:
            return {"error": "arch library not installed"}
        
        if returns.empty:
            return {}
            
        # Fit GARCH(1,1) model (scale returns by 100 for stability)
        model = arch_model(returns * 100, vol='Garch', p=1, q=1)
        fitted_model = model.fit(disp='off')
        
        return {
            'omega': float(fitted_model.params['omega']),
            'alpha': float(fitted_model.params['alpha[1]']),
            'beta': float(fitted_model.params['beta[1]']),
            'persistence': float(fitted_model.params['alpha[1]'] + fitted_model.params['beta[1]']),
            'forecast': fitted_model.forecast(horizon=5).variance.values[-1, :].tolist()
        }
