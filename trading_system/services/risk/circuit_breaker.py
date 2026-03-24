import logging
from trading_system.config.settings import settings

class CircuitBreaker:
    """
    Critical safety system.
    Automatically halts trading upon detection of catastrophic conditions.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.halted = False

    def check_conditions(self, daily_loss: float, drawdown: float) -> bool:
        """
        Check if any circuit breaker thresholds have been hit.
        Returns True if trading should be HALTED.
        """
        if daily_loss >= settings.MAX_DAILY_LOSS:
            self.logger.error("CIRCUIT BREAKER: Daily loss limit hit.")
            self.halted = True
            
        if drawdown >= settings.MAX_DRAWDOWN:
            self.logger.error("CIRCUIT BREAKER: Max drawdown threshold hit.")
            self.halted = True
            
        return self.halted

    def emergency_halt(self):
        """Immediately halts all system activity."""
        self.halted = True
        self.logger.critical("EMERGENCY HALT TRIGGERED MANUALLY.")
