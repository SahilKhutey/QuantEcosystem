import requests
import time
import logging
from trading_system.config.settings import settings

logger = logging.getLogger('APIClient')

class APIClient:
    """Client for interacting with the trading system API"""
    
    def __init__(self, base_url=None):
        self.base_url = base_url or settings.API_CONFIG.get('base_url', 'http://localhost:5000/api')
        self.last_request = 0
        self.rate_limit = settings.API_CONFIG.get('rate_limit', 1)
        self.logger = logger
    
    def _rate_limit(self):
        """Enforce API rate limits"""
        current_time = time.time()
        elapsed = current_time - self.last_request
        
        if elapsed < self.rate_limit:
            time.sleep(self.rate_limit - elapsed)
        
        self.last_request = time.time()
    
    def _get(self, endpoint):
        """Make a GET request to the API"""
        self._rate_limit()
        
        try:
            response = requests.get(f"{self.base_url}/{endpoint}")
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            self.logger.exception(f"API request failed: {str(e)}")
            return None
    
    def _post(self, endpoint, data=None):
        """Make a POST request to the API"""
        self._rate_limit()
        
        try:
            response = requests.post(
                f"{self.base_url}/{endpoint}",
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code in (200, 201):
                return response.json()
            else:
                self.logger.error(f"API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            self.logger.exception(f"API request failed: {str(e)}")
            return None
    
    # System status endpoints
    def get_system_status(self):
        """Get the current status of the trading system"""
        return self._get("system/status")
    
    def get_performance_metrics(self):
        """Get overall system performance metrics"""
        return self._get("system/performance")
    
    # Risk management endpoints
    def get_risk_metrics(self):
        """Get current risk management metrics"""
        return self._get("risk/metrics")
    
    def get_risk_parameters(self):
        """Get current risk management parameters"""
        return self._get("risk/parameters")
    
    def update_risk_parameters(self, **params):
        """Update risk management parameters"""
        return self._post("risk/update", params)
    
    def calculate_position_size(self, symbol, entry_price, stop_loss):
        """Calculate recommended position size"""
        return self._post("risk/position-size", {
            'symbol': symbol,
            'entry_price': entry_price,
            'stop_loss': stop_loss
        })
    
    def get_risk_monitoring(self):
        """Get risk monitoring data"""
        return self._get("risk/monitoring")
    
    def get_circuit_breaker_status(self):
        """Get circuit breaker status"""
        return self._get("risk/circuit-breaker")
    
    def clear_circuit_breaker(self):
        """Clear circuit breaker and resume trading"""
        return self._post("risk/clear-circuit-breaker")
    
    def get_risk_allocation(self):
        """Get portfolio risk allocation metrics"""
        return self._get("risk/allocation")
    
    # Trading execution endpoints
    def execute_trade(self, **params):
        """Execute a trade through the system"""
        return self._post("trading/execute", params)
    
    def get_active_orders(self):
        """Get currently active orders"""
        return self._get("trading/orders/active")
    
    def get_positions(self):
        """Get current trading positions"""
        return self._get("trading/positions")
    
    def update_system_status(self, **params):
        """Update core system status (e.g., market_open)"""
        return self._post("system/update", params)
    
    def cancel_all_orders(self):
        """Emergency cancellation of all active orders"""
        return self._post("trading/orders/cancel-all")
    
    def close_all_positions(self):
        """Emergency closure of all open positions"""
        return self._post("trading/positions/close-all")
    
    def suspend_signal_generation(self):
        """Suspend all signal generation engines"""
        return self._post("signals/suspend")
    
    def get_order_book(self, symbol):
        """Get order book data for a symbol"""
        return self._get(f"trading/order-book/{symbol}")
    
    def get_execution_metrics(self):
        """Get execution performance metrics"""
        return self._get("trading/execution-metrics")
    
    # Signal generator endpoints
    def get_trading_signals(self, **params):
        """Get current trading signals"""
        return self._get("signals/current")
    
    def get_signal_metrics(self):
        """Get signal generator metrics"""
        return self._get("signals/metrics")
    
    def get_signal_performance(self):
        """Get signal generator performance history"""
        return self._get("signals/performance")
    
    # Portfolio optimizer endpoints
    def get_portfolio_allocation(self):
        """Get current portfolio allocation"""
        return self._get("portfolio/allocation")
    
    def optimize_portfolio(self, **params):
        """Optimize portfolio allocation"""
        return self._post("portfolio/optimize", params)
    
    def get_portfolio_performance(self):
        """Get portfolio performance history"""
        return self._get("portfolio/performance")
    
    # Market data endpoints
    def get_market_status(self):
        """Get current market status across regions"""
        return self._get("market/status")
    
    def get_global_market_data(self):
        """Get global market data for visualization"""
        return self._get("market/global-data")
    
    def get_market_events(self):
        """Get current market events"""
        return self._get("market/events")

    def get_performance_attribution(self):
        """Get detailed performance attribution"""
        return self._get("analytics/performance")
    
    def run_backtest(self, strategy_params):
        """Run a historical simulation"""
        return self._post("analytics/backtest", strategy_params)
    
    def run_stress_test(self, scenario):
        """Run a portfolio stress test"""
        return self._get(f"analytics/stress-test?scenario={scenario}")

    def get_audit_trail(self):
        """Get the system audit trail"""
        return self._get("compliance/audit")
    
    def get_compliance_report(self, report_type="daily"):
        """Generate a compliance report"""
        return self._get(f"compliance/report?type={report_type}")
    
    def get_compliance_history(self):
        """Get history of generated compliance reports"""
        return self._get("compliance/history")
    
    def verify_compliance_integrity(self):
        """Verify the cryptographic integrity of audit logs"""
        return self._get("compliance/verify")

    def get_monitoring_alerts(self):
        """Get recent system alerts"""
        return self._get("monitoring/alerts")
    
    def get_execution_anomalies(self):
        """Get execution anomaly data"""
        return self._get("monitoring/anomalies")
    
    def get_breaker_history(self):
        """Get historical circuit breaker events"""
        return self._get("risk/breaker-history")

    def update_region(self, region):
        """Switch system operation to a different region"""
        return self._post("recovery/region/update", {'region': region})
    
    def get_current_region(self):
        """Get the current operating region"""
        res = self._get("recovery/region/current")
        return res.get('region') if res else None
    
    def update_backup_config(self, **params):
        """Update automated backup configuration"""
        return self._post("recovery/config/backup", params)
    
    def update_failover_config(self, **params):
        """Update automated failover configuration"""
        return self._post("recovery/config/failover", params)

    # Compatibility Aliases for existing Dashboard UI
    def get_active_trades(self):
        """Alias for get_active_orders to support existing UI"""
        return self.get_active_orders() or []

    def get_portfolio_history(self):
        """Alias for get_portfolio_performance to support existing UI"""
        perf = self.get_portfolio_performance()
        if isinstance(perf, dict) and 'history' in perf:
            return perf['history']
        return perf or []

    # --- Strategy Marketplace Methods ---
    def get_strategies(self):
        """Get list of all discovered strategies and their status"""
        return self._get("marketplace/strategies")

    def activate_strategy(self, name: str):
        """Enable a specific strategy"""
        return self._post(f"marketplace/activate/{name}")

    def deactivate_strategy(self, name: str):
        """Disable a specific strategy"""
        return self._post(f"marketplace/deactivate/{name}")

    def get_marketplace_performance(self):
        """Get aggregated performance metrics for all strategies"""
        return self._get("marketplace/performance")

    # --- AI Intelligence Methods ---
    def get_ai_sentiment(self):
        """Get latest sentiment history"""
        return self._get("ai/sentiment")

    def get_macro_context(self):
        """Get latest macro indicators and regime status"""
        return self._get("ai/macro")

    def analyze_custom_news(self, text: str, symbol: str = "GLOBAL"):
        """Run real-time sentiment analysis on custom text"""
        return self._post("ai/analyze-news", {'text': text, 'symbol': symbol})

    # --- Social Trading Methods ---
    def get_social_leaderboard(self):
        """Get ranked list of strategies and their follower counts"""
        return self._get("social/leaderboard")

    def get_social_signals(self):
        """Get live stream of signal broadcasts"""
        return self._get("social/signals")

    def follow_strategy(self, strategy_name: str, user_id: str = "USER_1"):
        """Follow a master strategy for broadcast notifications"""
        return self._post(f"social/follow/{strategy_name}/{user_id}")

    # --- HFT Optimization Methods ---
    def get_hft_signals(self):
        """Get latest high-frequency scalp signals"""
        return self._get("hft/signals")

    def get_hft_metrics(self):
        """Get aggregated order book pressure metrics"""
        return self._get("hft/metrics")

    def get_symbol_obi(self, symbol: str):
        """Get real-time OBI signal for a specific symbol"""
        return self._get(f"hft/obi/{symbol}")

    # --- Exposure & Alerts Methods ---
    def get_global_exposure(self):
        """Get multi-regional exposure map for 3D visualization"""
        return self._get("analytics/exposure")

    def get_alert_history(self):
        """Get latest system alerts"""
        return self._get("alerts/history")

    def send_system_alert(self, message: str, severity: str = "INFO", channels: list = ["LOG"]):
        """Broadcast a manual system alert"""
        return self._post("alerts/send", {'message': message, 'severity': severity, 'channels': channels})

    # --- Master Intelligence & Risk Methods ---
    def get_master_fused_signal(self):
        """Get the unified Master Alpha signal from all components"""
        return self._get("intelligence/fusion")

    def get_position_sizing(self, price: float, volatility: float, confidence: float):
        """Get institutional position sizing advice"""
        return self._get(f"risk/position-size/{price}/{volatility}/{confidence}")

    # --- Wealth Management Methods ---
    def get_wealth_summary(self):
        """Get summary of SIPs and long-term holdings"""
        return self._get("wealth/summary")

    def get_active_sips(self):
        """Get list of active systematic investment plans"""
        return self._get("wealth/sips")

    def create_sip(self, symbol: str, amount: float, frequency: str = "MONTHLY"):
        """Initialize a new Systematic Investment Plan"""
        return self._post("wealth/sip", {'symbol': symbol, 'amount': amount, 'frequency': frequency})

    def simulate_sip(self, amount: float, years: int, rate: float):
        """Simulate long-term wealth growth for a SIP"""
        return self._get(f"wealth/simulate-sip/{amount}/{years}/{rate}")

    def simulate_swp(self, corpus: float, amount: float, years: int, rate: float, inflation: float):
        """Simulate long-term wealth depletion for a SWP"""
        return self._get(f"wealth/simulate-swp/{corpus}/{amount}/{years}/{rate}/{inflation}")

    def get_active_swps(self):
        """Get list of active systematic withdrawal plans"""
        return self._get("wealth/swps")

    def create_swp(self, symbol: str, corpus: float, amount: float, frequency: str = "MONTHLY", inflation_adj: bool = True):
        """Initialize a new Systematic Withdrawal Plan"""
        return self._post("wealth/swp", {
            'symbol': symbol, 'corpus': corpus, 'amount': amount, 
            'frequency': frequency, 'inflation_adj': inflation_adj
        })

    # --- Continuous Improvement Methods ---
    def get_improvement_pipeline(self):
        """Get the active optimization pipeline"""
        return self._get("continuous-improvement/pipeline")

    # --- Strategy Operations Methods ---
    def get_portfolio_strategies(self):
        """Get detailed stats for each active trading algorithm"""
        return self._get("portfolio/strategies")

    def toggle_strategy(self, name: str):
        """Toggle a specific strategy (Active/Paused)"""
        return self._post("portfolio/strategy/toggle", {'name': name})

    def get_portfolio_allocation(self):
        """Get capital allocation breakdown across strategies"""
        return self._get("portfolio/allocation")

    def get_performance_attribution(self):
        """Get Brinson-Fachler attribution diagnostics"""
        return self._get("portfolio/attribution")

    # --- Developer API Gateway Methods ---
    def get_developer_status(self):
        """Get the operational status of the API Gateway"""
        return self._get("developer/status")

    def get_api_keys(self):
        """Get the list of active institutional API keys"""
        return self._get("developer/keys")

    def generate_api_key(self, owner: str):
        """Generate a new secure API key for an institutional partner"""
        return self._post("developer/keys/generate", {'owner': owner})

    # --- Risk Refinement Methods ---
    def analyze_risk_refinement(self):
        """Trigger an analysis of live performance for risk limit tuning"""
        return self._get("risk/refine/analyze")

    def get_risk_refinement_history(self):
        """Get the history of risk parameter adjustments"""
        return self._get("risk/refine/history")

    # --- Execution Optimization Methods ---
    def get_optimized_route(self, symbol: str, side: str, quantity: float):
        """Get the best order type and routing for a trade"""
        return self._get(f"execution/optimize/{symbol}/{side}/{quantity}")

    def get_top_execution_stats(self):
        """Get slippage and fill-rate metrics for top instruments"""
        return self._get("execution/top-stats")

    # --- Compliance Automation Methods ---
    def get_compliance_reports(self):
        """Get list of generated compliance reports"""
        return self._get("compliance/reports")

    def get_compliance_report(self, report_id: str):
        """Get detailed breakdown of a specific compliance report"""
        return self._get(f"compliance/reports/{report_id}")

    def generate_compliance_report(self):
        """Trigger the generation of a new weekly compliance report"""
        return self._post("compliance/reports/generate")

    # --- Circuit Breaker Test Methods ---
    def run_cb_test(self, scenario: str):
        """Run a simulated risk stress test to verify circuit breakers"""
        return self._post("risk/cb-test/run", {'scenario': scenario})

    def get_cb_test_history(self):
        """Get the history of system safety tests"""
        return self._get("risk/cb-test/history")

    def trigger_cb_recovery(self):
        """Verify the system recovery path after a simulated halt"""
        return self._post("risk/cb-test/recover")

    # --- Robust Optimization Methods ---
    def run_robust_optimization(self):
        """Run the Black-Litterman model to rebalance strategy weights"""
        return self._post("portfolio/robust-optimize")

    # --- Asset Class Expansion Methods ---
    def get_asset_universe(self):
        """Get the combined universe of Equities, Futures, and Forex"""
        return self._get("broker/universe")

    def get_asset_margin(self, symbol: str):
        """Get specialized margin/leverage requirements for an asset"""
        return self._get(f"broker/margin/{symbol}")

    def prepare_multi_asset_order(self, symbol: str, side: str, qty: float):
        """Format an order for the institutional brokering layer"""
        return self._post("broker/prepare-order", {'symbol': symbol, 'side': side, 'qty': qty})

    # --- AI & ML Signal Methods ---
    def get_ai_lstm_signal(self, symbol: str):
        """Get a deep-learning based price prediction for an instrument"""
        return self._get(f"ai/lstm/signal/{symbol}")

    def get_ai_model_health(self):
        """Get accuracy and latency metrics for the live ML models"""
        return self._get("ai/lstm/health")

    # --- Mobile Bridge Methods ---
    def get_mobile_summary(self):
        """Get condensed, push-ready system summary for mobile app"""
        return self._get("mobile/summary")

    def register_mobile_device(self, token: str):
        """Link a mobile device for real-time risk alerts and AI signals"""
        return self._post("mobile/register", {"token": token})
