import logging
from datetime import datetime

class RiskParamRefiner:
    """
    Analyzes live performance data to dynamically suggest or apply 
    refinements to risk parameters (Max Drawdown, Daily Loss, Position Limits).
    """
    def __init__(self, system_monitor, risk_manager):
        self.logger = logging.getLogger("Risk.Refiner")
        self.monitor = system_monitor
        self.risk_manager = risk_manager
        self.refinement_history = []

    def analyze_and_refine(self) -> dict:
        """Analyze recent performance and suggest refinements"""
        metrics = self.monitor.get_health_metrics()
        current_risk = self.risk_manager.get_risk_limits()
        
        suggestions = []
        
        # Rule 1: Tighten drawdown if win rate drops significantly
        if metrics['win_rate'] < 0.45:
            new_dd = current_risk['max_drawdown'] * 0.9 # Reduce by 10%
            suggestions.append({
                "parameter": "max_drawdown",
                "current": current_risk['max_drawdown'],
                "suggested": new_dd,
                "reason": f"Win rate ({metrics['win_rate']:.2%}) is below threshold (45%)."
            })
            
        # Rule 2: Increase daily loss limit if Sharpe is exceptional
        if metrics['sharpe_ratio'] > 2.5:
            new_loss = current_risk['daily_loss_limit'] * 1.1 # Increase by 10%
            suggestions.append({
                "parameter": "daily_loss_limit",
                "current": current_risk['daily_loss_limit'],
                "suggested": new_loss,
                "reason": f"Exceptional Sharpe ({metrics['sharpe_ratio']:.2f}) warrants higher risk budget."
            })

        # Rule 3: Tighten position risk if slippage is high
        if metrics['execution_quality'] < 0.85:
            new_pos_risk = current_risk['max_position_risk'] * 0.95
            suggestions.append({
                "parameter": "max_position_risk",
                "current": current_risk['max_position_risk'],
                "suggested": new_pos_risk,
                "reason": "Execution quality below par. Reducing max position size."
            })

        if suggestions:
            self.refinement_history.append({
                "timestamp": datetime.utcnow().isoformat(),
                "suggestions": suggestions
            })
            
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "suggestions": suggestions,
            "status": "ANALYSIS_COMPLETE"
        }

    def get_refinement_history(self):
        return self.refinement_history
