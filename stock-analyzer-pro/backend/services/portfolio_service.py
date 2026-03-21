import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from scipy import optimize

class PortfolioManager:
    def __init__(self):
        self.risk_free_rate = 0.02
        
    def calculate_portfolio_metrics(self, holdings: Dict,
                                  prices: Dict) -> Dict:
        """Calculate high-fidelity portfolio performance and risk metrics"""
        total_value = 0
        positions = {}
        
        if not holdings:
            return {
                'total_value': 0, 'positions': {}, 'overall_pnl': 0, 
                'overall_pnl_pct': 0, 'diversification_score': 0, 'risk_score': 0
            }
            
        # Calculate current values and PnL for each position
        for symbol, holding in holdings.items():
            current_price = prices.get(symbol, holding.get('avg_price', 0))
            position_value = holding['quantity'] * current_price
            total_value += position_value
            
            cost_basis = holding['quantity'] * holding['avg_price']
            unrealized_pnl = position_value - cost_basis
            unrealized_pnl_pct = (unrealized_pnl / cost_basis) if cost_basis > 0 else 0
            
            positions[symbol] = {
                'quantity': holding['quantity'],
                'avg_price': holding['avg_price'],
                'current_price': float(current_price),
                'value': float(position_value),
                'weight': 0.0,
                'unrealized_pnl': float(unrealized_pnl),
                'unrealized_pnl_pct': float(unrealized_pnl_pct)
            }
            
        # Finalize weights and aggregate metrics
        if total_value > 0:
            for symbol in positions:
                positions[symbol]['weight'] = float(positions[symbol]['value'] / total_value)
            
        overall_pnl = sum(p['unrealized_pnl'] for p in positions.values())
        overall_pnl_pct = (overall_pnl / (total_value - overall_pnl)) if (total_value - overall_pnl) > 0 else 0
        
        return {
            'total_value': float(total_value),
            'positions': positions,
            'overall_pnl': float(overall_pnl),
            'overall_pnl_pct': float(overall_pnl_pct),
            'diversification_score': float(self._calculate_diversification_score(positions)),
            'risk_score': float(self._calculate_portfolio_risk(positions, prices))
        }
        
    def _calculate_diversification_score(self, positions: Dict) -> float:
        """Evaluate diversification using the Herfindahl-Hirschman Index (HHI)"""
        if not positions: return 0.0
        weights = [p['weight'] for p in positions.values()]
        hhi = sum(w ** 2 for w in weights)
        
        # Max HHI = 1 (single asset), Min HHI = 1/N (equal weight)
        max_hhi = 1.0
        n = len(weights)
        min_hhi = 1.0 / n if n > 0 else 1.0
        
        if n <= 1: return 0.0
        diversification = (max_hhi - hhi) / (max_hhi - min_hhi)
        return max(0.0, min(1.0, diversification))
        
    def _calculate_portfolio_risk(self, positions: Dict,
                                prices: Dict) -> float:
        """Heuristic risk score based on concentration and asset counts"""
        if not positions: return 0.0
        if len(positions) < 3: return 8.5  # High risk for low asset count
            
        risk_factors = []
        max_weight = max(p['weight'] for p in positions.values())
        if max_weight > 0.4:
            risk_factors.append(7.0) # High concentration risk
        elif max_weight > 0.2:
            risk_factors.append(4.0)
            
        risk_factors.append(5.0) # Baseline market risk
        return float(np.mean(risk_factors))
        
    def calculate_drawdown(self, portfolio_values: pd.Series) -> Dict:
        """Calculate peak-to-trough drawdown and recovery speed"""
        if len(portfolio_values) < 2: return {}
            
        running_max = portfolio_values.expanding().max()
        drawdown = (portfolio_values - running_max) / running_max
        
        max_drawdown = drawdown.min()
        max_drawdown_date = drawdown.idxmin()
        recovery_info = self._calculate_recovery(portfolio_values, drawdown)
        
        return {
            'current_drawdown': float(drawdown.iloc[-1]),
            'max_drawdown': float(max_drawdown),
            'max_drawdown_date': str(max_drawdown_date),
            'recovery_days': recovery_info.get('days', 0),
            'recovery_status': recovery_info.get('status', 'unknown')
        }
        
    def _calculate_recovery(self, values: pd.Series,
                          drawdown: pd.Series) -> Dict:
        """Time elapsed since the last peak"""
        peak_idx = values.idxmax()
        current_idx = values.index[-1]
        
        if peak_idx == current_idx:
            return {'days': 0, 'status': 'at_peak'}
            
        days_since_peak = (current_idx - peak_idx).days
        if values.iloc[-1] >= values.loc[peak_idx]:
            return {'days': days_since_peak, 'status': 'recovered'}
        return {'days': days_since_peak, 'status': 'in_drawdown'}
            
    def suggest_rebalancing(self, current_weights: Dict,
                          target_weights: Dict,
                          threshold: float = 0.05) -> List[Dict]:
        """Generate actionable trade suggestions to align with target allocation"""
        suggestions = []
        all_symbols = set(current_weights.keys()) | set(target_weights.keys())
        
        for symbol in all_symbols:
            curr = current_weights.get(symbol, 0.0)
            targ = target_weights.get(symbol, 0.0)
            dev = curr - targ
            
            if abs(dev) > threshold:
                suggestions.append({
                    'symbol': symbol,
                    'action': 'SELL' if dev > 0 else 'BUY',
                    'current_weight': float(curr),
                    'target_weight': float(targ),
                    'deviation': float(dev),
                    'priority': 'high' if abs(dev) > 0.15 else 'medium'
                })
                
        return sorted(suggestions, key=lambda x: abs(x['deviation']), reverse=True)
        
    def optimize_allocation(self, assets: List[str],
                          expected_returns: Dict,
                          cov_matrix: pd.DataFrame,
                          risk_tolerance: float = 0.5) -> Dict:
        """Solve for optimal weights (Max Sharpe) using constrained optimization"""
        n = len(assets)
        ret_arr = np.array([expected_returns.get(a, 0) for a in assets])
        cov_arr = cov_matrix.values
        
        def objective(w):
            p_ret = np.sum(w * ret_arr)
            p_vol = np.sqrt(np.dot(w.T, np.dot(cov_arr, w)))
            if p_vol == 0: return 0
            return -(p_ret - self.risk_free_rate) / p_vol
            
        constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}]
        bounds = tuple((0, 1) for _ in range(n))
        init_w = np.array([1.0/n] * n)
        
        res = optimize.minimize(objective, init_w, method='SLSQP', bounds=bounds, constraints=constraints)
        
        if res.success:
            opt_w = res.x
            return {
                'weights': dict(zip(assets, opt_w.tolist())),
                'expected_return': float(np.sum(opt_w * ret_arr)),
                'expected_volatility': float(np.sqrt(np.dot(opt_w.T, np.dot(cov_arr, opt_w)))),
                'sharpe_ratio': float(-res.fun),
                'success': True
            }
        return {'success': False, 'message': res.message}
