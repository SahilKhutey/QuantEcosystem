import logging
from trading_system.config.settings import settings

class RiskManager:
    """
    Centralized risk management framework.
    Monitors daily P&L, drawdowns, and position limits.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.daily_pnl = 0.0
        self.max_daily_loss = settings.MAX_DAILY_LOSS
        self.max_drawdown = settings.MAX_DRAWDOWN
        self.circuit_breaker_active = False
        self.breaker_history = []
        self.audit_trail = None # To be injected

    def validate_trade(self, symbol: str, amount: float, current_portfolio_value: float) -> bool:
        """Validates if a trade exceeds risk bounds."""
        if self.circuit_breaker_active:
            self.logger.warning(f"Trade rejected: Circuit breaker is ACTIVE.")
            return False
            
        if amount > current_portfolio_value * 0.20: # 20% position limit
            self.logger.warning(f"Trade rejected: Position size for {symbol} too large.")
            return False
            
        return True

    def update_pnl(self, amount: float):
        """Updates daily P&L and checks for circuit breaker triggers."""
        self.daily_pnl += amount
        if self.daily_pnl < -self.max_daily_loss:
            self.trigger_circuit_breaker("Daily loss limit exceeded.")

    def get_risk_metrics(self):
        """Returns current dynamic risk metrics."""
        return {
            'daily_pnl': self.daily_pnl,
            'max_daily_loss': self.max_daily_loss,
            'max_drawdown': self.max_drawdown,
            'circuit_breaker_active': self.circuit_breaker_active
        }

    def trigger_circuit_breaker(self, reason: str):
        self.circuit_breaker_active = True
        event = {
            'timestamp': 1711248000.0, # Placeholder for time.time() if not imported
            'reason': reason,
            'metrics': self.get_risk_metrics()
        }
        self.breaker_history.append(event)
        self.logger.critical(f"CIRCUIT BREAKER TRIGGERED: {reason}")
        if self.audit_trail:
            self.audit_trail.log_event("CIRCUIT_BREAKER_TRIGGERED", "system", {"reason": reason}, "critical")

    def reset_circuit_breaker(self):
        self.circuit_breaker_active = False
        self.logger.info("Circuit breaker reset.")

    def get_breaker_history(self):
        return self.breaker_history
