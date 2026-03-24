import logging
from typing import Dict
from trading_system.services.broker.order_executor import OrderExecutor
from trading_system.services.risk.manager import RiskManager
from trading_system.services.compliance.audit_trail import AuditTrail

class ExecutionController:
    """
    Core execution controller.
    Validates signals against risk and routes them to the executor.
    """
    def __init__(self):
        self.executor = OrderExecutor()
        self.risk_manager = RiskManager()
        self.audit_trail = None # To be injected
        self.logger = logging.getLogger(__name__)

    def process_signal(self, signal: Dict):
        """
        Processes a trading signal: Risk check -> Execution -> Audit.
        """
        symbol = signal['symbol']
        qty = signal.get('qty', 1)
        side = signal['action']
        
        # Risk validation (mocked portfolio value)
        if self.risk_manager.validate_trade(symbol, 100.0, 100000.0):
            response = self.executor.execute_trade(symbol, qty, side)
            if response:
                if self.audit_trail:
                    self.audit_trail.log_event("TRADE_EXECUTION", "system", {
                        'symbol': symbol,
                        'qty': qty,
                        'side': side,
                        'status': 'SUCCESS'
                    }, "info")
                return True
        else:
            self.logger.warning(f"Trade for {symbol} blocked by Risk Manager.")
            
        return False
