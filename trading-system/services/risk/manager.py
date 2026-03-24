import time
import logging
import json
import numpy as np
from datetime import datetime, timedelta
from services.broker.broker_interface import BrokerAPI, OrderRequest
from services.risk.bayesian_position_sizing import BayesianPositionSizer

logger = logging.getLogger('RiskManager')

class RiskManager:
    """
    Professional risk management system with:
    - Position sizing
    - Circuit breakers
    - Daily loss limits
    - Drawdown controls
    - Real-time monitoring
    """
    
    def __init__(self, broker: BrokerAPI, max_drawdown: float = 0.15, 
                 position_size: float = 0.02, max_daily_loss: float = 0.05,
                 max_leverage: float = 1.0, max_position_allocation: float = 0.1):
        self.alpaca = broker
        self.max_drawdown = max_drawdown
        self.position_size = position_size
        self.max_daily_loss = max_daily_loss
        self.max_leverage = max_leverage
        self.max_position_allocation = max_position_allocation
        self.daily_loss = 0.0
        self.starting_capital = 0.0
        self.current_capital = 0.0
        self.daily_start_capital = 0.0
        self.last_market_close = time.time()
        self.logger = logger
        self.account = None
        self.last_position_check = time.time()
        self.position_check_interval = 300  # 5 minutes
        
        # Initialize Bayesian Position Sizer
        self.bayesian_sizer = BayesianPositionSizer(risk_per_trade=position_size)
        
        # Initialize account values
        self._init_account()
    
    def _init_account(self):
        """Initialize account values from broker API"""
        try:
            self.account = self.alpaca.get_account()
            
            if 'error' in self.account:
                self.logger.error(f"Account initialization failed: {self.account['error']}")
                return
            
            self.starting_capital = float(self.account['portfolio_value'])
            self.current_capital = self.starting_capital
            self.daily_start_capital = self.starting_capital
            self.logger.info(f"Risk manager initialized - Starting capital: ${self.starting_capital:,.2f}")
        
        except Exception as e:
            self.logger.exception("Account initialization error")
            self.starting_capital = 100000.0  # Default to $100k
            self.current_capital = self.starting_capital
            self.daily_start_capital = self.starting_capital
    
    def update_capital(self):
        """Update current capital from broker API"""
        try:
            account = self.alpaca.get_account()
            
            if 'error' in account:
                self.logger.error(f"Capital update failed: {account['error']}")
                return
            
            self.current_capital = float(account['portfolio_value'])
            
            # Reset daily loss at market close
            if self._is_market_close():
                self.daily_start_capital = self.current_capital
                self.daily_loss = 0.0
            
            return self.current_capital
        
        except Exception as e:
            self.logger.exception("Capital update error")
            return self.current_capital
    
    def _is_market_close(self) -> bool:
        """Check if it's market close time (for US markets)"""
        now = datetime.now()
        # US market closes at 4:00 PM ET (16:00)
        return now.hour >= 16
    
    def check_trade(self, symbol: str, quantity: int, entry_price: float, 
                  stop_loss: float, risk_adjusted: bool = True) -> tuple:
        """
        Validate trade against risk parameters
        
        Returns:
        - (False, error_message) if trade is invalid
        - (True, position_size) if trade is valid
        """
        # Update current capital
        self.update_capital()
        
        # Basic validation
        if quantity <= 0:
            return False, "Invalid quantity"
        
        if entry_price <= 0:
            return False, "Invalid entry price"
        
        # Calculate risk per share
        risk_per_share = abs(entry_price - stop_loss)
        if risk_per_share <= 0:
            return False, "Invalid stop loss"
        
        # Calculate maximum position size based on risk
        max_position = min(
            self.current_capital * self.position_size,
            (self.current_capital * 0.02) / risk_per_share if risk_per_share > 0 else 0
        )
        
        # Apply position size limit (max 10% of account)
        max_position = min(max_position, self.current_capital * 0.1)
        
        # Round to whole shares
        position_size = min(quantity, int(max_position))
        
        # Check if position size is sufficient
        if position_size < 1:
            return False, f"Position size too small (min 1 share): {position_size}"
        
        # Daily loss limit check
        if self.daily_loss >= self.current_capital * self.max_daily_loss:
            return False, f"Daily loss limit reached: ${self.daily_loss:,.2f}"
        
        # Max drawdown check
        drawdown = (self.starting_capital - self.current_capital) / self.starting_capital if self.starting_capital > 0 else 0
        if drawdown >= self.max_drawdown:
            return False, f"Max drawdown reached: {drawdown:.2%} (max: {self.max_drawdown:.2%})"
        
        # Check leverage
        account_summary = self.alpaca.get_account_summary()
        if 'leverage' in account_summary and account_summary['leverage'] > self.max_leverage:
            return False, f"Max leverage reached: {account_summary['leverage']:.2f} (max: {self.max_leverage:.2f})"
        
        # Position allocation check
        positions = self.alpaca.get_positions()
        total_position_value = sum(float(p['market_value']) for p in positions)
        position_allocation = total_position_value / self.current_capital if self.current_capital > 0 else 0
        if position_allocation > self.max_position_allocation:
            return False, f"Max position allocation reached: {position_allocation:.2%} (max: {self.max_position_allocation:.2%})"
        
        return True, position_size
    
    def update_position(self, profit_loss: float):
        """Update risk metrics after trade execution"""
        # Update capital
        self.current_capital += profit_loss
        self.daily_loss -= profit_loss  # profit is negative loss
        
        # Log update
        self.logger.info(f"Capital updated: ${self.current_capital:,.2f} | Daily loss: ${self.daily_loss:,.2f}")

    def check_circuit_breaker(self) -> bool:
        """Check for circuit breaker conditions"""
        # Update capital
        self.update_capital()
        
        # Check drawdown
        drawdown = (self.starting_capital - self.current_capital) / self.starting_capital if self.starting_capital > 0 else 0
        if drawdown >= self.max_drawdown:
            self.logger.critical(f"MAX DRAWDOWN REACHED: {drawdown:.2%} (max: {self.max_drawdown:.2%})")
            return False
        
        # Check daily loss
        if self.daily_loss >= self.current_capital * self.max_daily_loss:
            self.logger.critical(f"DAILY LOSS LIMIT REACHED: ${self.daily_loss:,.2f} (max: {self.max_daily_loss:.2%})")
            return False
        
        # Check leverage
        account_summary = self.alpaca.get_account_summary()
        if 'leverage' in account_summary and account_summary['leverage'] > self.max_leverage:
            self.logger.critical(f"MAX LEVERAGE REACHED: {account_summary['leverage']:.2f} (max: {self.max_leverage})")
            return False
        
        # Check position allocation
        positions = self.alpaca.get_positions()
        total_position_value = sum(float(p['market_value']) for p in positions)
        position_allocation = total_position_value / self.current_capital if self.current_capital > 0 else 0
        if position_allocation > self.max_position_allocation:
            self.logger.critical(f"MAX POSITION ALLOCATION REACHED: {position_allocation:.2%} (max: {self.max_position_allocation:.2%})")
            return False
        
        # Check if market is open (for trading)
        if not self._is_market_open():
            self.logger.warning("Market is closed - no new trades allowed")
            return False
        
        return True
    
    def _is_market_open(self) -> bool:
        """Check if US markets are open"""
        now = datetime.now()
        weekday = now.weekday()
        
        # US markets are closed on weekends
        if weekday >= 5:  # Saturday=5, Sunday=6
            return False
        
        # US market hours: 9:30 AM - 4:00 PM ET
        if now.hour < 9 or (now.hour == 9 and now.minute < 30):
            return False
        if now.hour > 16 or (now.hour == 16 and now.minute > 0):
            return False
        
        return True
    
    def get_risk_metrics(self) -> dict:
        """Get current risk metrics for monitoring"""
        self.update_capital()
        
        drawdown = (self.starting_capital - self.current_capital) / self.starting_capital if self.starting_capital > 0 else 0
        daily_drawdown = (self.daily_start_capital - self.current_capital) / self.daily_start_capital if self.daily_start_capital > 0 else 0
        
        # Get account summary
        account_summary = self.alpaca.get_account_summary()
        
        return {
            'current_capital': self.current_capital,
            'starting_capital': self.starting_capital,
            'daily_start_capital': self.daily_start_capital,
            'drawdown': drawdown,
            'daily_drawdown': daily_drawdown,
            'daily_loss': self.daily_loss,
            'max_drawdown': self.max_drawdown,
            'max_daily_loss': self.max_daily_loss,
            'position_size': self.position_size,
            'is_circuit_breaker_active': not self.check_circuit_breaker(),
            'leverage': account_summary.get('leverage', 0),
            'position_allocation': account_summary.get('position_value', 0) / self.current_capital if self.current_capital > 0 else 0,
            'cash_balance': account_summary.get('cash_balance', 0),
            'margin_ratio': account_summary.get('margin_ratio', 1.0)
        }
    
    def reset_daily(self):
        """Reset daily metrics (called at market open)"""
        self.daily_start_capital = self.current_capital
        self.daily_loss = 0.0
        self.logger.info(f"Daily metrics reset - Starting capital: ${self.daily_start_capital:,.2f}")
    
    def get_position_size(self, symbol: str, entry_price: float, stop_loss: float, use_bayesian: bool = False) -> int:
        """Get recommended position size based on risk parameters"""
        if use_bayesian:
            return self.bayesian_sizer.calculate_position_size(entry_price, stop_loss, self.current_capital)
            
        # Calculate risk per share
        risk_per_share = abs(entry_price - stop_loss)
        
        # Calculate maximum position size based on risk
        max_position = min(
            int((self.current_capital * self.position_size) / risk_per_share) if risk_per_share > 0 else 0,
            int(self.current_capital * self.max_position_allocation)
        )
        
        # Minimum position size is 1 share
        return max(1, max_position)

    def update_market_regime(self, returns: list):
        """Update the Bayesian market regime based on recent returns"""
        self.bayesian_sizer.update_market_regime(returns)

    def record_trade_result(self, profit_loss: float, confidence: float):
        """Record trade result for Bayesian learning and update risk metrics"""
        self.update_position(profit_loss)
        self.bayesian_sizer.add_trade(profit_loss, confidence)
        self.bayesian_sizer.update_regime_from_trades()
    
    def check_position_limits(self, symbol: str) -> tuple:
        """Check position limits for a symbol"""
        try:
            positions = self.alpaca.get_positions()
            
            # Find position for this symbol
            position = next((p for p in positions if p['symbol'] == symbol), None)
            
            if not position:
                return True, "No existing position"
            
            # Check position size against account
            position_value = float(position['market_value'])
            position_allocation = position_value / self.current_capital if self.current_capital > 0 else 0
            
            if position_allocation > self.max_position_allocation:
                return False, f"Position allocation too high: {position_allocation:.2%} (max: {self.max_position_allocation:.2%})"
            
            return True, "Position within limits"
        
        except Exception as e:
            self.logger.exception("Position limit check error")
            return False, str(e)
    
    def monitor_risk(self):
        """Monitor risk metrics and take action if necessary"""
        # Check circuit breaker
        if not self.check_circuit_breaker():
            self.logger.critical("CIRCUIT BREAKER ACTIVE - TRADING SUSPENDED")
            
            # Stop all trading activity
            self._trigger_circuit_breaker()
            return False
        
        # Check position limits
        positions = self.alpaca.get_positions()
        for position in positions:
            is_valid, message = self.check_position_limits(position['symbol'])
            if not is_valid:
                self.logger.warning(f"Position limit issue: {message}")
                # In production, this would trigger position reduction
        
        return True
    
    def _trigger_circuit_breaker(self):
        """Trigger circuit breaker and stop all trading activity"""
        self.logger.critical("TRADING HALTED - CIRCUIT BREAKER ACTIVE")
        
        # Cancel all active orders
        orders = self.alpaca.get_orders('open')
        for order in orders:
            self.alpaca.cancel_order(order['id'])
        
        # Close all positions
        positions = self.alpaca.get_positions()
        for position in positions:
            action = "SELL" if position["side"] == "long" else "BUY"
            self.alpaca.submit_order(OrderRequest(
                symbol=position["symbol"],
                action=action,
                quantity=int(position["qty"]),
                order_type="market",
                time_in_force="day"
            ))
        
        # Reset risk manager
        self.current_capital = self.daily_start_capital
        self.daily_loss = 0.0
        self.logger.info("Risk manager reset after circuit breaker")
    
    def get_trading_status(self) -> dict:
        """Get current trading status with risk metrics"""
        risk_metrics = self.get_risk_metrics()
        account_summary = self.alpaca.get_account_summary()
        
        return {
            'trading_active': risk_metrics['is_circuit_breaker_active'],
            'risk_metrics': risk_metrics,
            'account_summary': account_summary,
            'timestamp': datetime.now().isoformat()
        }
    
    def check_and_rebalance(self):
        """Check position allocations and rebalance if necessary"""
        try:
            positions = self.alpaca.get_positions()
            total_value = sum(float(p['market_value']) for p in positions)
            
            # Check each position against allocation limits
            for position in positions:
                position_value = float(position['market_value'])
                allocation = position_value / total_value if total_value > 0 else 0
                
                if allocation > self.max_position_allocation:
                    # Calculate new position size
                    new_size = int((self.current_capital * self.max_position_allocation) / float(position['current_price']))
                    
                    # Determine action (reduce position)
                    if int(position['qty']) > new_size:
                        self.alpaca.submit_order(OrderRequest(
                            symbol=position['symbol'],
                            action="SELL",
                            quantity=int(position['qty']) - new_size,
                            order_type="market",
                            time_in_force="day"
                        ))
                        self.logger.info(f"Rebalanced position: {position['symbol']} - Reduced by {int(position['qty']) - new_size} shares")
        
        except Exception as e:
            self.logger.exception("Position rebalancing error")
    
    def get_position_risk(self, symbol: str) -> dict:
        """Get detailed risk metrics for a position"""
        try:
            positions = self.alpaca.get_positions()
            position = next((p for p in positions if p['symbol'] == symbol), None)
            
            if not position:
                return {'error': 'Position not found', 'symbol': symbol}
            
            position_value = float(position['market_value'])
            position_risk = position_value / self.current_capital if self.current_capital > 0 else 0
            
            # Calculate unrealized profit/loss percentage
            if 'unrealized_pl' in position and 'unrealized_plpc' in position:
                unrealized_pl = float(position['unrealized_pl'])
                unrealized_plpc = float(position['unrealized_plpc'])
            else:
                unrealized_pl = 0
                unrealized_plpc = 0
            
            # Calculate position volatility (simplified for demonstration)
            historical_data = self.alpaca.get_historical_data(symbol, timeframe='1D', start=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
            if historical_data and 'bars' in historical_data:
                prices = [bar['c'] for bar in historical_data['bars']]
                volatility = np.std(prices) / np.mean(prices) if np.mean(prices) > 0 else 0
            else:
                volatility = 0.0
            
            return {
                'symbol': symbol,
                'position_size': float(position['qty']),
                'current_price': float(position['current_price']),
                'market_value': position_value,
                'position_risk': position_risk,
                'unrealized_pl': unrealized_pl,
                'unrealized_plpc': unrealized_plpc,
                'volatility': volatility,
                'risk_score': self._calculate_position_risk_score(
                    position_risk,
                    unrealized_plpc,
                    volatility
                )
            }
        
        except Exception as e:
            self.logger.exception("Position risk calculation error")
            return {'error': str(e), 'symbol': symbol}
    
    def _calculate_position_risk_score(self, position_risk, unrealized_plpc, volatility) -> float:
        """Calculate risk score for a position (0-100, higher = riskier)"""
        # Base score from position allocation (max 40 points)
        allocation_score = min(40, position_risk * 100)
        
        # Add score based on unrealized P&L (max 30 points)
        pl_score = 0
        if unrealized_plpc < -0.05:  # 5% loss
            pl_score = 30
        elif unrealized_plpc < -0.02:  # 2% loss
            pl_score = 20
        elif unrealized_plpc < 0:  # Small loss
            pl_score = 10
        
        # Add score based on volatility (max 30 points)
        volatility_score = min(30, volatility * 100)
        
        # Total risk score (0-100)
        return min(100, allocation_score + pl_score + volatility_score)
    
    def get_portfolio_risk(self) -> dict:
        """Get comprehensive portfolio risk metrics"""
        try:
            positions = self.alpaca.get_positions()
            total_value = sum(float(p['market_value']) for p in positions)
            
            # Calculate position risks
            position_risks = {}
            total_risk_score = 0
            max_position_risk = 0
            
            for position in positions:
                risk = self.get_position_risk(position['symbol'])
                if 'error' not in risk:
                    position_risks[position['symbol']] = risk
                    total_risk_score += risk['risk_score']
                    max_position_risk = max(max_position_risk, risk['position_risk'])
            
            # Calculate portfolio volatility
            portfolio_volatility = self._calculate_portfolio_volatility(positions)
            
            # Calculate drawdown
            drawdown = (self.starting_capital - self.current_capital) / self.starting_capital if self.starting_capital > 0 else 0
            
            return {
                'total_positions': len(positions),
                'total_value': total_value,
                'portfolio_volatility': portfolio_volatility,
                'drawdown': drawdown,
                'max_position_risk': max_position_risk,
                'portfolio_risk_score': min(100, total_risk_score / len(positions)) if positions else 0,
                'position_risks': position_risks,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.exception("Portfolio risk calculation error")
            return {'error': str(e)}
    
    def _calculate_portfolio_volatility(self, positions) -> float:
        """Calculate portfolio volatility (simplified for demonstration)"""
        total_volatility = 0
        count = 0
        
        for position in positions:
            risk = self.get_position_risk(position['symbol'])
            if 'error' not in risk:
                total_volatility += risk['volatility']
                count += 1
        
        return total_volatility / count if count > 0 else 0
