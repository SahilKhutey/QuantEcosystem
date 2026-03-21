import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFE
from sklearn.metrics import r2_score, mean_squared_error
from typing import Dict, List, Tuple, Optional
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class AdvancedRegressionModels:
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_importance = {}
        
    def prepare_features(self, data: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features and target variable"""
        X = data.drop(columns=[target_column])
        y = data[target_column]
        
        # Handle missing values
        X = X.fillna(X.mean())
        y = y.fillna(y.mean())
        
        return X, y
    
    def calculate_correlation_matrix(self, data: pd.DataFrame) -> Dict:
        """Calculate correlation matrix with p-values"""
        correlation_matrix = data.corr()
        
        # Calculate p-values
        n = len(data)
        p_values = pd.DataFrame(index=data.columns, columns=data.columns)
        
        for col1 in data.columns:
            for col2 in data.columns:
                if col1 == col2:
                    p_values.loc[col1, col2] = 0
                else:
                    corr = correlation_matrix.loc[col1, col2]
                    # Check for perfect correlation to avoid division by zero
                    if abs(corr) >= 1.0:
                        p_values.loc[col1, col2] = 0
                    else:
                        t_stat = corr * np.sqrt((n - 2) / (1 - corr**2))
                        p_value = 2 * (1 - stats.t.cdf(abs(t_stat), n - 2))
                        p_values.loc[col1, col2] = p_value
        
        return {
            'correlation_matrix': correlation_matrix,
            'p_values': p_values,
            'significant_correlations': p_values < 0.05
        }
    
    def feature_selection_rfe(self, X: pd.DataFrame, y: pd.Series, n_features: int = 10) -> List[str]:
        """Recursive Feature Elimination for feature selection"""
        estimator = LinearRegression()
        selector = RFE(estimator, n_features_to_select=n_features)
        selector = selector.fit(X, y)
        
        selected_features = X.columns[selector.support_].tolist()
        feature_ranking = selector.ranking_
        
        self.feature_importance['rfe'] = {
            'selected_features': selected_features,
            'feature_ranking': dict(zip(X.columns, feature_ranking)),
            'support': selector.support_
        }
        
        return selected_features
    
    def fit_linear_regression(self, X: pd.DataFrame, y: pd.Series, 
                            regularization: Optional[str] = None) -> Dict:
        """Fit linear regression with optional regularization"""
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        if regularization == 'ridge':
            model = Ridge(alpha=1.0)
        elif regularization == 'lasso':
            model = Lasso(alpha=0.1)
        else:
            model = LinearRegression()
        
        model.fit(X_scaled, y)
        
        # Predictions
        y_pred = model.predict(X_scaled)
        
        # Calculate metrics
        r2 = r2_score(y, y_pred)
        mse = mean_squared_error(y, y_pred)
        rmse = np.sqrt(mse)
        
        # Feature importance
        if hasattr(model, 'coef_'):
            feature_importance = dict(zip(X.columns, model.coef_))
        else:
            feature_importance = {}
        
        # Statistical significance
        n = len(y)
        p = X.shape[1]
        if n > p + 1:
            adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)
        else:
            adj_r2 = r2
            
        results = {
            'model': model,
            'predictions': y_pred,
            'r2_score': r2,
            'adjusted_r2': adj_r2,
            'rmse': rmse,
            'feature_importance': feature_importance,
            'residuals': y - y_pred,
            'model_type': 'linear_regression'
        }
        
        if regularization:
            results['regularization'] = regularization
            results['alpha'] = model.alpha if hasattr(model, 'alpha') else None
        
        self.models['linear'] = results
        return results
    
    def predict_price(self, new_data: pd.DataFrame) -> Dict:
        """Predict price using trained regression model"""
        if 'linear' not in self.models:
            raise ValueError("Model must be trained before prediction")
        
        model = self.models['linear']['model']
        
        # Prepare new data (same features as training)
        new_data_scaled = self.scaler.transform(new_data)
        
        predictions = model.predict(new_data_scaled)
        
        # Confidence intervals (simplified)
        prediction_std = np.std(self.models['linear']['residuals'])
        confidence_interval = (
            predictions - 1.96 * prediction_std,
            predictions + 1.96 * prediction_std
        )
        
        return {
            'predictions': predictions,
            'confidence_intervals': confidence_interval,
            'prediction_std': prediction_std,
            'model_metrics': {
                'r2_score': self.models['linear']['r2_score'],
                'rmse': self.models['linear']['rmse']
            }
        }
    
    def calculate_trading_signal(self, current_price: float, predicted_price: float, 
                               confidence_interval: Tuple[float, float]) -> Dict:
        """Generate trading signal based on regression prediction"""
        price_diff = predicted_price - current_price
        price_diff_pct = (price_diff / current_price) * 100
        
        # Calculate signal strength based on confidence interval width
        ci_width = confidence_interval[1] - confidence_interval[0]
        signal_strength = abs(price_diff) / ci_width if ci_width > 0 else 0
        
        # Statistical significance test
        lower_bound, upper_bound = confidence_interval
        is_significant = not (lower_bound <= current_price <= upper_bound)
        
        if price_diff_pct > 2.0 and is_significant and signal_strength > 0.7:
            signal = "STRONG_BUY"
            confidence = min(0.9, signal_strength)
        elif price_diff_pct > 1.0 and is_significant:
            signal = "BUY"
            confidence = min(0.7, signal_strength)
        elif price_diff_pct < -2.0 and is_significant and signal_strength > 0.7:
            signal = "STRONG_SELL"
            confidence = min(0.9, signal_strength)
        elif price_diff_pct < -1.0 and is_significant:
            signal = "SELL"
            confidence = min(0.7, signal_strength)
        else:
            signal = "HOLD"
            confidence = 0.3
        
        return {
            'signal': signal,
            'confidence': confidence,
            'expected_return_pct': price_diff_pct,
            'statistical_significance': is_significant,
            'signal_strength': signal_strength,
            'current_price': current_price,
            'predicted_price': predicted_price
        }
