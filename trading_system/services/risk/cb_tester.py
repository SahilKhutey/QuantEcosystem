import logging
import time
from datetime import datetime

class CircuitBreakerTester:
    """
    Verifies the integrity of system-wide circuit breakers by 
    simulating extreme market/risk events in a controlled manner.
    """
    def __init__(self, risk_manager, alert_manager):
        self.logger = logging.getLogger("Risk.CB_Tester")
        self.risk_manager = risk_manager
        self.alert_manager = alert_manager
        self.test_history = []

    def run_stress_test(self, scenario: str) -> dict:
        """Simulates a specific risk event to verify CB trigger"""
        self.logger.warning(f"Initiating Circuit Breaker Stress Test: {scenario}")
        
        test_id = f"TEST-CB-{int(time.time())}"
        start_time = datetime.utcnow()
        
        # Scenario Logic
        if scenario == "extreme_drawdown":
            mock_drawdown = 0.15 # 15% (Should trigger CB)
            triggered = self.risk_manager.check_circuit_breaker(mock_drawdown)
        elif scenario == "flash_crash":
            mock_price_drop = 0.08 # 8% in seconds
            triggered = self.risk_manager.check_circuit_breaker(mock_price_drop)
        else:
            triggered = False

        status = "PASSED" if triggered else "FAILED"
        
        result = {
            "test_id": test_id,
            "scenario": scenario,
            "triggered": triggered,
            "status": status,
            "timestamp": start_time.isoformat(),
            "duration_ms": (datetime.utcnow() - start_time).total_seconds() * 1000
        }
        
        self.test_history.append(result)
        self.alert_manager.send_alert(f"CB Test {status}: {scenario}")
        
        return result

    def verify_recovery(self) -> bool:
        """Verifies system can recover from HALTED to ACTIVE"""
        self.logger.info("Verifying Circuit Breaker Recovery Path...")
        # Simulate manual/auto reset
        success = self.risk_manager.reset_circuit_breaker()
        return success

    def get_test_history(self):
        return self.test_history
