import pandas as pd
from typing import Dict, List
from loguru import logger

class ReportGenerator:
    def __init__(self):
        pass

    def generate_daily_report(self, trade_history: List[Dict], metrics: Dict) -> str:
        """Generate a formatted summary report."""
        report = "=== AI TRADING AGENT DAILY REPORT ===\n"
        report += f"Total Trades: {metrics.get('trade_count', 0)}\n"
        report += f"Net PnL: ${metrics.get('pnl', 0.0):.2f}\n"
        report += f"Return: {metrics.get('return_pct', 0.0):.2f}%\n"
        report += "---------------------------------\n"
        report += "Recent Trades:\n"
        
        for trade in trade_history[-5:]:
            report += f"- {trade['timestamp']}: {trade['side']} {trade['symbol']} @ {trade['price']}\n"
            
        return report

if __name__ == "__main__":
    rg = ReportGenerator()
    dummy_trades = [{'timestamp': '2026-03-19', 'side': 'BUY', 'symbol': 'BTC', 'price': 65000}]
    print(rg.generate_daily_report(dummy_trades, {'pnl': 120, 'return_pct': 1.2, 'trade_count': 1}))
