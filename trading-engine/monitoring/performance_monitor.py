import asyncio
from typing import Dict, List, Any
import time

# Mocking Prometheus client components
class Gauge:
    def __init__(self, name, desc):
        self.name = name
        self.value = 0
    def set(self, val):
        self.value = val

class Counter:
    def __init__(self, name, desc):
        self.name = name
        self.count = 0
    def inc(self, amount=1):
        self.count += amount

class AlertManager:
    """Dispatches alerts via Webhooks, Slack, or PagerDuty"""
    async def send_alert(self, strategy_name: str, anomaly_type: str, severity: str, details: str):
        print(f"ALERT [{severity}]: Strategy={strategy_name} | Type={anomaly_type} | Details={details}")

class PerformanceMonitor:
    def __init__(self):
        # Tracking standard SLIs (Service Level Indicators)
        self.metrics = {
            'latency': Gauge('trading_latency_ms', 'Trading latency in milliseconds'),
            'throughput': Counter('trades_per_second', 'Trade throughput count'),
            'error_rate': Gauge('error_rate', 'Error percentage per strategy'),
            'profit_loss': Gauge('daily_pnl', 'Real-time Daily P&L tracking')
        }
        self.alert_manager = AlertManager()
    
    async def monitor_strategy(self, strategy_name: str, 
                             performance_data: Dict):
        """Continuously monitor strategy performance and trigger reactive alerts"""
        
        # 1. Track metrics (Push to Prometheus/Grafana)
        self.metrics['latency'].set(performance_data.get('latency_ms', 0))
        self.metrics['throughput'].inc(performance_data.get('trades_count', 0))
        self.metrics['profit_loss'].set(performance_data.get('daily_pnl', 0))
        
        # 2. Heuristic-based Anomaly Detection
        anomalies = await self.detect_anomalies(performance_data)
        
        # 3. Alert Dispatching
        for anomaly in anomalies:
            await self.alert_manager.send_alert(
                strategy_name=strategy_name,
                anomaly_type=anomaly['type'],
                severity=anomaly['severity'],
                details=anomaly['details']
            )

    async def detect_anomalies(self, data: Dict) -> List[Dict]:
        """Detect latency spikes, excessive drawdowns, or error bursts"""
        anomalies = []
        
        # Example check: Sudden latency jump
        if data.get('latency_ms', 0) > 100: # Threshold for HFT
            anomalies.append({
                'type': 'LATENCY_SPIKE',
                'severity': 'HIGH',
                'details': f"Execution latency reached {data['latency_ms']}ms"
            })
            
        # Example check: Daily loss threshold
        if data.get('daily_pnl', 0) < -5000:
            anomalies.append({
                'type': 'DRAWDOWN_ALERT',
                'severity': 'CRITICAL',
                'details': f"Daily P&L breached threshold: {data['daily_pnl']}"
            })
            
        return anomalies
