import time
import pandas as pd
import numpy as np

class LiveMonitoring:
    """
    Monitoring system for real-time performance tracking and risk alerts.
    """
    def __init__(self, risk_limit_drawdown=0.1):
        self.risk_limit_drawdown = risk_limit_drawdown
        self.equity_curve = []

    def update(self, current_equity):
        """
        Updates the monitor with the latest equity value.
        Checks for risk violations.
        """
        self.equity_curve.append(current_equity)
        
        if len(self.equity_curve) > 1:
            peak = max(self.equity_curve)
            drawdown = (peak - current_equity) / peak
            
            if drawdown > self.risk_limit_drawdown:
                print(f"ALERT: Risk Limit Violated! Drawdown: {drawdown:.2%}")
                return "RISK_ALERT"
                
        print(f"Update: Equity=${current_equity:.2f} | Time: {time.ctime()}")
        return "OK"

if __name__ == "__main__":
    monitor = LiveMonitoring(risk_limit_drawdown=0.05)
    for i in range(10):
        equity = 10000 - (i * 100) # simulating decline
        status = monitor.update(equity)
        if status == "RISK_ALERT":
            break
        time.sleep(0.1)
