from config.logging import logger
from datetime import datetime, timedelta

class CircuitBreaker:
    def __init__(self, daily_loss_limit_pct: float = 0.05):
        self.daily_loss_limit_pct = daily_loss_limit_pct
        self.starting_equity = None
        self.is_halted = False
        self.halt_reason = ""

    def check(self, current_equity: float):
        if self.starting_equity is None:
            self.starting_equity = current_equity
            return True

        drawdown = (self.starting_equity - current_equity) / self.starting_equity
        if drawdown >= self.daily_loss_limit_pct:
            self.is_halted = True
            self.halt_reason = f"Daily loss limit of {self.daily_loss_limit_pct*100}% reached."
            logger.critical(f"CIRCUIT BREAKER TRIGGERED: {self.halt_reason}")
            return False
            
        return True

    def reset(self, new_equity: float):
        self.starting_equity = new_equity
        self.is_halted = False
        logger.info("Circuit breaker reset for the new trading day.")
