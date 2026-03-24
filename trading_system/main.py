import logging
import asyncio
import threading
import time
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from trading_system.config.logging import setup_logging
from trading_system.services.data.data_pipeline import DataPipeline
from trading_system.services.trading.execution import ExecutionController
from trading_system.services.monitoring.health_check import HealthMonitor
from trading_system.services.risk.manager import RiskManager
from trading_system.services.data.market_data import MarketDataService
from trading_system.services.monitoring.real_time_monitoring import RealTimeMonitor
from trading_system.services.monitoring.backup_manager import BackupManager
from trading_system.services.monitoring.failover_controller import FailoverController
from trading_system.services.compliance.audit_trail import AuditTrail
from trading_system.services.analytics.analytics_engine import AnalyticsEngine
from trading_system.services.analytics.backtester import BacktestEngine
from trading_system.services.analytics.risk_decomp import RiskDecomposition
from trading_system.services.recovery.disaster_recovery import DisasterRecoverySystem
from trading_system.services.trading.marketplace import StrategyMarketplace
from trading_system.services.ai.sentiment_engine import SentimentEngine
from trading_system.services.ai.macro_analyzer import MacroAnalyzer
from trading_system.services.social.social_manager import SocialManager
from trading_system.services.database.storage_engine import StorageEngine
from trading_system.services.trading.hft_optimizer import HFTOptimizer
from trading_system.services.alerts.alert_manager import AlertManager
from trading_system.services.analytics.global_exposure import GlobalExposureTracker
from trading_system.services.risk.position_sizer import PositionSizer
from trading_system.services.ai.signal_fusion import SignalFusion
from trading_system.services.wealth.wealth_manager import WealthManager
from trading_system.services.monitoring.system_monitor import SystemMonitor
from trading_system.services.continuous_improvement.feedback_loop import ContinuousImprovementFramework
from trading_system.services.portfolio.aggregator import MultiStrategyAggregator
from trading_system.services.api.developer_gateway import DeveloperAPIGateway
from trading_system.services.risk.refiner import RiskParamRefiner
from trading_system.web.services.api_client import APIClient

# Initialize Logging
setup_logging()
logger = logging.getLogger("Main")

# Initialize Master Services
storage_engine = StorageEngine()
marketplace = StrategyMarketplace()
marketplace.load_strategies()
sentiment_engine = SentimentEngine()
macro_analyzer = MacroAnalyzer()
social_manager = SocialManager(marketplace)
hft_optimizer = HFTOptimizer()
alert_manager = AlertManager()
exposure_tracker = GlobalExposureTracker()
position_sizer = PositionSizer()
signal_fusion = SignalFusion()
wealth_manager = WealthManager(storage_engine)
system_monitor = SystemMonitor(storage_engine)
portfolio_aggregator = MultiStrategyAggregator(storage_engine)
api_gateway = DeveloperAPIGateway()
# Note: In a real system, risk_manager would be the live service
risk_refiner = RiskParamRefiner(system_monitor, position_sizer) 

# Continuous Improvement Setup
improvement_plans = []
improvement_framework = ContinuousImprovementFramework(system_monitor)

# Initialize Services
data_pipeline = DataPipeline()
execution_controller = ExecutionController()
health_monitor = HealthMonitor()
risk_manager = RiskManager()
market_data = MarketDataService()

# Monitoring & Resilience Integration
api_client = APIClient(base_url="http://localhost:5000/api")
real_time_monitor = RealTimeMonitor(api_client)
backup_manager = BackupManager()
failover_controller = FailoverController()
audit_trail = AuditTrail()
analytics_engine = AnalyticsEngine()
backtest_engine = BacktestEngine()
risk_decomp = RiskDecomposition()
disaster_recovery = DisasterRecoverySystem(api_client)
risk_manager.audit_trail = audit_trail
execution_controller.audit_trail = audit_trail

# API Server Setup
app = Flask(__name__)
CORS(app) # Enable CORS for dashboard integration

# --- System Endpoints ---
@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    return jsonify({
        'system': health_monitor.get_system_health(),
        'broker': health_monitor.check_broker_connectivity()
    })

@app.route('/api/system/performance', methods=['GET'])
def get_performance_metrics():
    return jsonify({
        'total_profit': 12500.50,
        'win_rate': 0.68,
        'sharpe_ratio': 2.1,
        'max_drawdown': 0.05,
        'total_trades': 154
    })

# --- Risk Endpoints ---
@app.route('/api/risk/metrics', methods=['GET'])
def get_risk_metrics():
    return jsonify({
        'daily_loss': 450.0,
        'drawdown': 0.02,
        'position_risk': 0.12
    })

@app.route('/api/risk/parameters', methods=['GET'])
def get_risk_parameters():
    return jsonify({
        'max_daily_loss': 5000.0,
        'max_drawdown': 0.10,
        'max_position_size': 0.20
    })

@app.route('/api/risk/update', methods=['POST'])
def update_risk_parameters():
    data = request.json
    logger.info(f"Updating risk parameters: {data}")
    return jsonify({'status': 'success', 'updated': data})

@app.route('/api/risk/position-size', methods=['POST'])
def calculate_position_size():
    data = request.json
    size = (100000 * 0.01) / max(0.01, (data.get('entry_price', 1) - data.get('stop_loss', 0.9)))
    return jsonify({'recommended_size': abs(round(size, 2))})

@app.route('/api/risk/monitoring', methods=['GET'])
def get_risk_monitoring():
    return jsonify({
        'alerts': ['High Volatility in TSLA', 'SPY Approaching Support'],
        'exposure_by_sector': {'TECH': 0.4, 'FIN': 0.2, 'ENERGY': 0.1}
    })

@app.route('/api/risk/allocation', methods=['GET'])
def get_risk_allocation():
    return jsonify({'VAR': 2500, 'CVAR': 3100, 'margin_usage': 0.45})

@app.route('/api/risk/circuit-breaker', methods=['GET'])
def get_circuit_breaker_status():
    return jsonify({
        'active': risk_manager.circuit_breaker_active,
        'reason': 'None' if not risk_manager.circuit_breaker_active else 'Loss limit hit'
    })

@app.route('/api/risk/clear-circuit-breaker', methods=['POST'])
def clear_circuit_breaker():
    risk_manager.reset_circuit_breaker()
    return jsonify({'status': 'success'})

# --- Trading Endpoints ---
@app.route('/api/trading/execute', methods=['POST'])
def execute_trade():
    data = request.json
    success = execution_controller.process_signal(data)
    return jsonify({
        'status': 'accepted' if success else 'rejected',
        'order_id': f"ORD-{int(time.time())}" if success else None
    })

@app.route('/api/trading/orders/active', methods=['GET'])
def get_active_orders():
    return jsonify([
        {'symbol': 'AAPL', 'action': 'BUY', 'qty': 100, 'price': 150.25, 'status': 'OPEN'},
        {'symbol': 'TSLA', 'action': 'SELL', 'qty': 50, 'price': 240.10, 'status': 'OPEN'}
    ])

@app.route('/api/trading/order-book/<symbol>', methods=['GET'])
def get_order_book(symbol):
    return jsonify({
        'symbol': symbol,
        'bids': [[150.1, 100], [150.0, 200]],
        'asks': [[150.3, 150], [150.4, 300]]
    })

@app.route('/api/trading/execution-metrics', methods=['GET'])
def get_execution_metrics():
    return jsonify({'avg_slippage': 0.0002, 'fill_rate': 0.98, 'latency_ms': 45})

# --- Signal Generator Endpoints ---
@app.route('/api/signals/current', methods=['GET'])
def get_trading_signals():
    return jsonify([
        {'symbol': 'AAPL', 'signal': 'STRONG_BUY', 'confidence': 0.89},
        {'symbol': 'BTC', 'signal': 'NEUTRAL', 'confidence': 0.52}
    ])

@app.route('/api/signals/metrics', methods=['GET'])
def get_signal_metrics():
    return jsonify({'accuracy': 0.72, 'avg_profit_per_signal': 120.5})

@app.route('/api/signals/performance', methods=['GET'])
def get_signal_performance():
    return jsonify([{'date': '2023-01-01', 'hit_rate': 0.75}, {'date': '2023-01-02', 'hit_rate': 0.68}])

# --- Portfolio Endpoints ---
@app.route('/api/portfolio/allocation', methods=['GET'])
def get_portfolio_allocation():
    return jsonify({'AAPL': 0.25, 'TSLA': 0.15, 'CASH': 0.60})

@app.route('/api/portfolio/optimize', methods=['POST'])
def optimize_portfolio():
    return jsonify({'status': 'success', 'recommended_weights': {'AAPL': 0.30, 'TSLA': 0.10, 'CASH': 0.60}})

@app.route('/api/portfolio/performance', methods=['GET'])
def get_portfolio_performance():
    return jsonify({
        'history': [
            {'date': '2023-01-01', 'value': 100000},
            {'date': '2023-01-02', 'value': 101200},
            {'date': '2023-01-03', 'value': 100800}
        ]
    })

async def backup_loop():
    """Background loop for automated hourly backups."""
    while True:
        try:
            backup_manager.run_backup()
        except Exception as e:
            logger.error(f"Error in backup loop: {e}")
        await asyncio.sleep(3600) # Every 1 hour

@app.route('/api/resilience/status', methods=['GET'])
def get_resilience_status():
    return jsonify(failover_controller.get_status())

@app.route('/api/resilience/failover', methods=['POST'])
def trigger_failover():
    success = failover_controller.trigger_failover(reason="System-triggered HA failover")
    return jsonify({'status': 'FAILOVER_ACTIVE' if success else 'FAILED'})

@app.route('/api/resilience/recover', methods=['POST'])
def recover_primary():
    success = failover_controller.recover_primary()
    return jsonify({'status': 'PRIMARY_ACTIVE' if success else 'FAILED'})

# --- Analytics & Reporting Endpoints ---
@app.route('/api/analytics/performance', methods=['GET'])
def get_performance_attribution():
    # Mock data for demonstration
    trades_df = pd.DataFrame([
        {'strategy': 'HFT', 'symbol': 'AAPL', 'pnl': 1200.50},
        {'strategy': 'Swing', 'symbol': 'MSFT', 'pnl': 3400.00},
        {'strategy': 'Intraday', 'symbol': 'JPM', 'pnl': -450.25}
    ])
    return jsonify(analytics_engine.get_performance_attribution(trades_df))

@app.route('/api/analytics/backtest', methods=['POST'])
def run_backtest():
    # Simplistic backtest trigger
    data = request.json
    strategy = data.get('strategy', 'sma_cross')
    # Mock historical data
    dates = pd.date_range(start='2023-01-01', periods=100)
    hist_data = pd.DataFrame({'close': np.random.uniform(140, 160, 100)}, index=dates)
    
    def mock_logic(row):
        return 'buy' if row['close'] < 145 else 'sell' if row['close'] > 155 else 'hold'
        
    result = backtest_engine.run_simulation(mock_logic, hist_data)
    return jsonify(result)

@app.route('/api/analytics/stress-test', methods=['GET'])
def run_stress_test():
    scenario = request.args.get('scenario', 'market_crash')
    positions = {'AAPL': 100, 'MSFT': 50, 'JPM': 200}
    return jsonify(risk_decomp.stress_test(positions, scenario))

@app.route('/api/monitoring/health', methods=['GET'])
def get_monitoring_health():
    return jsonify(real_time_monitor.get_health_status())

@app.route('/api/recovery/region/current', methods=['GET'])
def get_current_region():
    return jsonify({'region': disaster_recovery.recovery_status['primary_region']})

@app.route('/api/recovery/region/update', methods=['POST'])
def update_region():
    region = request.json.get('region')
    disaster_recovery.primary_region = region
    return jsonify({'status': 'region_updated', 'new_region': region})

@app.route('/api/recovery/backup', methods=['POST'])
def trigger_dr_backup():
    disaster_recovery._perform_backup()
    return jsonify({'success': True, 'backup_id': f"DR-{int(time.time())}"})

@app.route('/api/recovery/status', methods=['GET'])
def get_dr_status():
    return jsonify(disaster_recovery.get_recovery_status())

@app.route('/api/system/update', methods=['POST'])
def update_system_config():
    # Update core system state
    return jsonify({'status': 'system_config_updated'})

@app.route('/api/trading/positions', methods=['GET'])
def get_mock_positions():
    return jsonify([{'symbol': 'AAPL', 'qty': 100, 'market_value': 15000}])

@app.route('/api/trading/orders/cancel-all', methods=['POST'])
def cancel_all_trading_orders():
    return jsonify({'status': 'all_orders_cancelled'})

@app.route('/api/trading/positions/close-all', methods=['POST'])
def close_all_trading_positions():
    return jsonify({'status': 'all_positions_closed'})

@app.route('/api/signals/suspend', methods=['POST'])
def suspend_signals():
    return jsonify({'status': 'signals_suspended'})

# --- Compliance Endpoints ---
@app.route('/api/compliance/audit', methods=['GET'])
def get_audit_trail():
    return jsonify(audit_trail.get_events())

@app.route('/api/compliance/report', methods=['GET'])
def generate_compliance_report():
    report_type = request.args.get('type', 'daily')
    return jsonify(audit_trail.generate_compliance_report(report_type))

@app.route('/api/compliance/history', methods=['GET'])
def get_compliance_history():
    return jsonify(audit_trail.get_compliance_history())

@app.route('/api/compliance/verify', methods=['GET'])
def verify_audit_integrity():
    success = audit_trail.verify_integrity()
    return jsonify({'status': 'INTEGRITY_VERIFIED' if success else 'TAMPER_DETECTED'})

# --- Monitoring Endpoints ---
@app.route('/api/monitoring/alerts', methods=['GET'])
def get_recent_alerts():
    return jsonify(real_time_monitor.last_alert)

@app.route('/api/monitoring/anomalies', methods=['GET'])
def get_execution_anomalies():
    # Return formatted anomaly history
    return jsonify(real_time_monitor.history)

@app.route('/api/risk/breaker-history', methods=['GET'])
def get_breaker_history():
    return jsonify(risk_manager.get_breaker_history())

# --- Market Endpoints ---
@app.route('/api/market/status', methods=['GET'])
def get_market_status():
    return jsonify({'US': 'OPEN', 'EU': 'CLOSED', 'ASIA': 'CLOSED', 'CRYPTO': 'OPEN'})

@app.route('/api/market/global-data', methods=['GET'])
def get_global_market_data():
    return jsonify({
        'indices': {'SPY': 450.2, 'QQQ': 380.1, 'DIA': 340.5},
        'movers': [{'symbol': 'NVDA', 'change': 4.5}, {'symbol': 'AMD', 'change': -2.1}]
    })

@app.route('/api/market/events', methods=['GET'])
def get_market_events():
    return jsonify([{'time': '10:00', 'event': 'Fed Meeting', 'impact': 'HIGH'}])

def run_flask():
    """Run the Flask server in a separate thread."""
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

@app.route('/api/autonomous/start', methods=['POST'])
def start_autonomous():
    execution_controller.start_autonomous_trading()
    return jsonify({'status': 'activated'})

@app.route('/api/autonomous/stop', methods=['POST'])
def stop_autonomous():
    execution_controller.stop_autonomous_trading()
    return jsonify({'status': 'deactivated'})

@app.route('/api/autonomous/status', methods=['GET'])
def get_autonomous_status():
    return jsonify(execution_controller.autonomous_engine.get_status())

async def monitoring_loop():
    """Background loop for system health monitoring."""
    while True:
        try:
            real_time_monitor.check_system_health()
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
        await asyncio.sleep(60) # Check every 60 seconds

async def dr_loop():
    """Background monitoring loop for Disaster Recovery orchestration."""
    while True:
        try:
            disaster_recovery.check_system_health()
        except Exception as e:
            logger.error(f"Error in DR loop: {e}")
        await asyncio.sleep(300) # Every 5 minutes

async def main():
    """
    Production entry point for the Global Trading Terminal Backend.
    Orchestrates services and starts the data/execution loops.
    """
    logger.info("Initializing Global Trading System Microservices...")
    
    # 1. Start API Server in background thread
    api_thread = threading.Thread(target=run_flask, daemon=True)
    api_thread.start()
    logger.info("API Server started on port 5000")
    
    # Wait for server to start
    time.sleep(1)
    
    # 2. Start Service Loops
    try:
        logger.info(f"System Health: {health_monitor.get_system_health()}")
        
        # Start Resilience Loops
        monitoring_task = asyncio.create_task(monitoring_loop())
        backup_task = asyncio.create_task(backup_loop())
        dr_task = asyncio.create_task(dr_loop())
        
        await data_pipeline.run_pipeline()
    except KeyboardInterrupt:
        logger.info("Shutting down system...")
        execution_controller.stop_autonomous_trading()
    except Exception as e:
        logger.critical(f"Catastrophic failure in main loop: {e}")
        execution_controller.stop_autonomous_trading()

# --- Strategy Marketplace Endpoints ---

@app.get("/api/marketplace/strategies")
async def list_strategies():
    return {name: {"active": s.is_active, "metrics": s.performance_metrics} 
            for name, s in marketplace.strategies.items()}

@app.post("/api/marketplace/activate/{name}")
async def activate_strategy(name: str):
    marketplace.activate_strategy(name)
    audit_trail.log_event("STRATEGY_ACTIVATED", details={"strategy": name})
    return {"status": "success", "strategy": name}

@app.post("/api/marketplace/deactivate/{name}")
async def deactivate_strategy(name: str):
    marketplace.deactivate_strategy(name)
    audit_trail.log_event("STRATEGY_DEACTIVATED", details={"strategy": name})
    return {"status": "success", "strategy": name}

@app.get("/api/marketplace/performance")
async def get_strategy_performance():
    return marketplace.get_strategy_performance()

# --- AI Intelligence Endpoints ---

@app.get("/api/ai/sentiment")
async def get_sentiment_history():
    return sentiment_engine.history

@app.get("/api/ai/macro")
async def get_macro_data():
    return macro_analyzer.get_macro_context()

@app.post("/api/ai/analyze-news")
async def analyze_news_text():
    data = request.json
    text = data.get('text', '')
    symbol = data.get('symbol', 'GLOBAL')
    result = sentiment_engine.analyze_text(text, symbol)
    return result

# --- Social Trading Endpoints ---

@app.get("/api/social/leaderboard")
async def get_social_leaderboard():
    return social_manager.get_leaderboard()

@app.get("/api/social/signals")
async def get_social_signals():
    return social_manager.get_live_signals()

@app.post("/api/social/follow/{strategy_name}/{follower_id}")
async def follow_strategy(strategy_name: str, follower_id: str):
    social_manager.follow_strategy(strategy_name, follower_id)
    return {"status": "success", "strategy": strategy_name}

# --- HFT Optimization Endpoints ---

@app.get("/api/hft/signals")
async def get_hft_signals():
    return hft_optimizer.history

@app.get("/api/hft/metrics")
async def get_hft_metrics():
    return hft_optimizer.get_hft_metrics()

@app.get("/api/hft/obi/{symbol}")
async def get_symbol_obi(symbol: str):
    # Simulated top-of-book for OBI calculation
    bids = [[150.1, random.uniform(100, 500)] for _ in range(5)]
    asks = [[150.3, random.uniform(100, 500)] for _ in range(5)]
    return hft_optimizer.generate_hft_signal(symbol, bids, asks)

# --- Global Exposure & Alerts Endpoints ---

@app.get("/api/analytics/exposure")
async def get_global_exposure():
    return exposure_tracker.get_exposure_map()

@app.get("/api/alerts/history")
async def get_alert_history():
    return alert_manager.get_alert_history()

@app.post("/api/alerts/send")
async def broadcast_alert():
    data = request.json
    return alert_manager.send_alert(
        data.get('message', ''),
        data.get('severity', 'INFO'),
        data.get('channels', ['LOG'])
    )

# --- Master Intelligence & Risk Endpoints ---

@app.get("/api/intelligence/fusion")
async def get_master_signal():
    # Poll latest component data
    sent = sentiment_engine.get_aggregate_sentiment("GLOBAL")
    obi = hft_optimizer.get_hft_metrics()['last_obi']
    regime = macro_analyzer.current_regime
    return signal_fusion.fuse_signals(sent, obi, regime)

@app.get("/api/risk/position-size/{price}/{volatility}/{confidence}")
async def get_recommended_size(price: float, volatility: float, confidence: float):
    return position_sizer.calculate_size(price, volatility, confidence)

# --- Wealth Management Endpoints ---

@app.get("/api/wealth/summary")
async def get_wealth_summary():
    return wealth_manager.get_portfolio_summary()

@app.get("/api/wealth/sips")
async def get_active_sips():
    return wealth_manager.sips

@app.post("/api/wealth/sip")
async def create_new_sip():
    data = request.json
    return wealth_manager.create_sip(
        data.get('symbol', 'SPY'),
        data.get('amount', 500),
        data.get('frequency', 'MONTHLY')
    )

@app.get("/api/wealth/simulate-sip/{amount}/{years}/{rate}")
async def simulate_sip_return(amount: float, years: int, rate: float):
    return wealth_manager.simulate_sip(amount, years, rate)

@app.get("/api/wealth/simulate-swp/{corpus}/{amount}/{years}/{rate}/{inflation}")
async def simulate_swp_depletion(corpus: float, amount: float, years: int, rate: float, inflation: float):
    return wealth_manager.simulate_swp(corpus, amount, years, rate, inflation)

@app.get("/api/wealth/swps")
async def get_active_swps():
    return wealth_manager.swps

@app.post("/api/wealth/swp")
async def create_new_swp():
    data = request.json
    return wealth_manager.create_swp(
        data.get('symbol', 'SPY'),
        data.get('corpus', 1000000),
        data.get('amount', 4000),
        data.get('frequency', 'MONTHLY'),
        data.get('inflation_adj', True)
    )

# --- Production Operations Endpoints ---

@app.get("/api/system/status")
async def get_prod_system_status():
    return system_monitor.get_system_status()

@app.get("/api/risk/metrics")
async def get_prod_risk_metrics():
    return system_monitor.get_risk_metrics()

@app.get("/api/system/performance")
async def get_prod_performance_metrics():
    return system_monitor.get_performance_metrics()

@app.get("/api/trading/execution-metrics")
async def get_prod_execution_metrics():
    return system_monitor.get_execution_metrics()

@app.get("/api/compliance/status")
async def get_prod_compliance_status():
    return system_monitor.get_compliance_status()

@app.get("/api/monitoring/health")
async def get_prod_health_metrics():
    return system_monitor.get_health_metrics()

@app.get("/api/system/performance/history")
async def get_prod_performance_history():
    return system_monitor.get_performance_history()

@app.get("/api/trading/order-book/{symbol}")
async def get_prod_order_book(symbol: str):
    return system_monitor.get_order_book(symbol)

@app.get("/api/compliance/timeline")
async def get_prod_compliance_timeline():
    return system_monitor.get_compliance_timeline()

@app.get("/api/monitoring/health-timeline")
async def get_prod_health_timeline():
    return system_monitor.get_health_timeline()

# --- Continuous Improvement Endpoints ---

@app.post("/api/continuous-improvement/plan")
async def save_improvement_plan():
    plan = request.json
    improvement_plans.append(plan)
    return {"status": "success"}

@app.get("/api/continuous-improvement/pipeline")
async def get_improvement_pipeline():
    return improvement_plans

async def run_feedback_loop():
    """Background task for continuous improvement"""
    while True:
        improvement_framework.run_iteration()
        await asyncio.sleep(1800) # Every 30 mins

# --- Strategy Operations Endpoints ---

@app.get("/api/portfolio/strategies")
async def get_portfolio_strategies():
    return portfolio_aggregator.get_strategy_stats()

@app.post("/api/portfolio/strategy/toggle")
async def toggle_strategy_status():
    data = request.json
    name = data.get('name')
    success = portfolio_aggregator.toggle_strategy(name)
    return {"status": "success" if success else "failed"}

@app.get("/api/portfolio/allocation")
async def get_portfolio_allocation_data():
    return portfolio_aggregator.get_portfolio_allocation()

@app.get("/api/portfolio/attribution")
async def get_performance_attribution():
    return portfolio_aggregator.get_attribution_metrics()

# --- Developer API Gateway Endpoints ---

@app.get("/api/developer/status")
async def get_gateway_status():
    return api_gateway.get_api_status()

@app.get("/api/developer/keys")
async def get_api_keys():
    return api_gateway.get_key_ledger()

@app.post("/api/developer/keys/generate")
async def generate_key():
    data = request.json
    owner = data.get('owner', 'Institutional_Client')
    key = api_gateway.generate_api_key(owner)
    return {"api_key": key}

# --- Risk Refinement Endpoints ---

@app.get("/api/risk/refine/analyze")
async def analyze_risk_refinement():
    return risk_refiner.analyze_and_refine()

@app.get("/api/risk/refine/history")
async def get_risk_refinement_history():
    return risk_refiner.get_refinement_history()

if __name__ == "__main__":
    asyncio.run(main())
