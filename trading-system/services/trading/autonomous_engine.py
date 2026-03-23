import time
import logging
import threading
import queue
from datetime import datetime
from services.broker.broker_interface import GlobalBrokerRouter
from services.risk.manager import RiskManager
from services.trading.hft_engine import HFTScalpingEngine
from services.trading.swing_engine import SwingTradingEngine
from services.trading.intraday_engine import IntradayTradingEngine

logger = logging.getLogger('AutonomousEngine')

class AutonomousTradingEngine:
    """
    Production-ready autonomous trading system that executes trades without human intervention
    with robust risk management.
    """
    
    def __init__(self, broker: GlobalBrokerRouter, risk_manager: RiskManager, 
                 hft_engine: HFTScalpingEngine, swing_engine: SwingTradingEngine,
                 intraday_engine: IntradayTradingEngine, 
                 market_data_interval: int = 1,  # seconds
                 monitor_interval: int = 1):    # seconds
        self.broker = broker
        self.risk = risk_manager
        self.hft = hft_engine
        self.swing = swing_engine
        self.intraday = intraday_engine
        self.logger = logger
        self.running = False
        self.threads = []
        self.market_data_queue = queue.Queue()
        self.signal_queue = queue.Queue()
        self.order_queue = queue.Queue()
        self.market_data_interval = market_data_interval
        self.monitor_interval = monitor_interval
        
        # Trading schedule configuration
        self.trading_hours = {
            'start': 9,     # 9:00 AM
            'end': 16,      # 4:00 PM
            'market_close_buffer': 15  # 15 minutes before close
        }
        
        # Performance tracking
        self.performance = {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'total_profit': 0.0,
            'avg_profit_per_trade': 0.0,
            'win_rate': 0.0,
            'profit_factor': 0.0,
            'last_updated': time.time()
        }
        
        # System status
        self.status = {
            'active': False,
            'mode': 'LIVE',
            'circuit_breaker': False,
            'market_open': False,
            'last_market_check': time.time(),
            'last_market_status': 'CLOSED'
        }
        
        # Create stop event for threads
        self.stop_event = threading.Event()
    
    def start(self):
        """Start the autonomous trading engine"""
        if self.running:
            self.logger.warning("Engine already running")
            return
        
        self.running = True
        self.stop_event.clear()
        
        # Initialize status
        self._update_trading_status()
        
        # Start background threads
        self.threads = [
            threading.Thread(target=self._market_data_thread, name="MarketData"),
            threading.Thread(target=self._signal_processing_thread, name="SignalProcessing"),
            threading.Thread(target=self._order_execution_thread, name="OrderExecution"),
            threading.Thread(target=self._monitoring_thread, name="Monitoring")
        ]
        
        # Start all threads
        for thread in self.threads:
            thread.daemon = True
            thread.start()
        
        self.logger.info("Autonomous trading engine started")
    
    def stop(self):
        """Stop the autonomous trading engine"""
        if not self.running:
            self.logger.warning("Engine not running")
            return
        
        self.running = False
        self.stop_event.set()
        
        # Join all threads
        for thread in self.threads:
            thread.join(timeout=5.0)
        
        # Clear queues
        while not self.market_data_queue.empty():
            self.market_data_queue.get()
        while not self.signal_queue.empty():
            self.signal_queue.get()
        while not self.order_queue.empty():
            self.order_queue.get()
        
        self.logger.info("Autonomous trading engine stopped")
    
    def _market_data_thread(self):
        """Background thread for market data collection"""
        self.logger.info("Market data thread started")
        
        while not self.stop_event.is_set():
            try:
                # Check if market is open
                self._update_trading_status()
                
                # Skip data collection if market is closed (Simulated logic)
                if not self.status['market_open']:
                    time.sleep(60)
                    continue
                
                # Get market data for all symbols
                symbols = self._get_trading_symbols()
                
                # Process each symbol
                for symbol in symbols:
                    try:
                        # Get real-time data
                        market_data = self.broker.get_real_time_quote(symbol)
                        
                        # Add to queue for processing
                        self.market_data_queue.put({
                            'symbol': symbol,
                            'data': market_data,
                            'timestamp': time.time()
                        })
                        
                        # Add to HFT engine
                        if market_data and 'bid' in market_data and 'ask' in market_data:
                            self.hft.process_market_data(
                                symbol,
                                market_data['bid'],
                                market_data['ask'],
                                market_data.get('volume', 0)
                            )
                        
                        # Add to intraday engine
                        if market_data and 'bid' in market_data and 'ask' in market_data:
                            self.intraday.process_market_data(
                                symbol,
                                market_data['bid'],
                                market_data['ask'],
                                market_data.get('volume', 0)
                            )
                        
                    except Exception as e:
                        self.logger.exception(f"Error processing market data for {symbol}")
                
                # Sleep for data collection interval
                time.sleep(self.market_data_interval)
                
            except Exception as e:
                self.logger.exception("Market data thread error")
                time.sleep(1)
    
    def _signal_processing_thread(self):
        """Background thread for signal processing"""
        self.logger.info("Signal processing thread started")
        
        while not self.stop_event.is_set():
            try:
                # Skip signal processing if market is closed
                if not self.status['market_open']:
                    time.sleep(10)
                    continue
                
                # Process market data from queue
                try:
                    market_data_pkg = self.market_data_queue.get(timeout=5.0)
                    symbol = market_data_pkg['symbol']
                    
                    # Generate signals from all engines (Bridging to their private generation methods)
                    hft_signal = self.hft._generate_scalping_signal(symbol)
                    intraday_signal = self.intraday._generate_intraday_signal(symbol)
                    
                    # Swing engine processed daily or on-demand
                    # For demonstration, we check it periodically
                    swing_signal = None
                    if random.random() < 0.05: # Simulated frequency
                        hist = self.broker.get_historical_data(symbol)
                        swing_signal = self.swing._generate_swing_signal(symbol, hist)
                    
                    # Add valid signals to queue
                    if hft_signal:
                        self.signal_queue.put({'engine': 'hft', 'signal': hft_signal})
                    if swing_signal:
                        self.signal_queue.put({'engine': 'swing', 'signal': swing_signal})
                    if intraday_signal:
                        self.signal_queue.put({'engine': 'intraday', 'signal': intraday_signal})
                    
                except queue.Empty:
                    continue
                
                time.sleep(0.1)
                
            except Exception as e:
                self.logger.exception("Signal processing thread error")
                time.sleep(1)
    
    def _order_execution_thread(self):
        """Background thread for order execution"""
        self.logger.info("Order execution thread started")
        
        while not self.stop_event.is_set():
            try:
                if not self.status['market_open']:
                    time.sleep(10)
                    continue
                
                # Process signals from queue
                try:
                    signal_data = self.signal_queue.get(timeout=5.0)
                    sig = signal_data['signal']
                    
                    # Execute trade based on engine type
                    if signal_data['engine'] == 'hft':
                        self.hft.execute_trade(sig)
                    elif signal_data['engine'] == 'swing':
                        self.swing.execute_trade(sig)
                    elif signal_data['engine'] == 'intraday':
                        self.intraday.execute_trade(sig)
                    
                except queue.Empty:
                    continue
                
                time.sleep(0.1)
                
            except Exception as e:
                self.logger.exception("Order execution thread error")
                time.sleep(1)
    
    def _monitoring_thread(self):
        """Background thread for system monitoring"""
        self.logger.info("Monitoring thread started")
        
        while not self.stop_event.is_set():
            try:
                # Update status
                self._update_trading_status()
                self.status['active'] = self.running
                self.status['circuit_breaker'] = not self.risk.check_circuit_breaker()
                
                # Monitor across engines
                self.hft.monitor_trades()
                self.swing.monitor_trades()
                self.intraday.monitor_trades()
                
                # Emergency close if closing soon
                if self._is_market_closing_soon():
                    self.intraday.force_close_all()
                
                # Check circuit breaker
                if self.status['circuit_breaker']:
                    self._trigger_circuit_breaker()
                
                self._update_performance_metrics()
                time.sleep(self.monitor_interval)
                
            except Exception as e:
                self.logger.exception("Monitoring thread error")
                time.sleep(1)
    
    def _get_trading_symbols(self) -> list:
        return ['AAPL', 'MSFT', 'SPY', 'TSLA', 'AMZN', 'GOOGL', 'NVDA']
    
    def _update_trading_status(self):
        """Update trading status based on market hours"""
        now = datetime.now()
        is_open = (now.weekday() < 5) and (now.hour >= 9 and (now.hour > 9 or now.minute >= 30)) and (now.hour < 16)
        
        if is_open and not self.status['market_open']:
            self.status['market_open'] = True
            self.status['last_market_status'] = 'OPEN'
        elif not is_open and self.status['market_open']:
            self.status['market_open'] = False
            self.status['last_market_status'] = 'CLOSED'
        
        self.status['last_market_check'] = time.time()
    
    def _is_market_closing_soon(self) -> bool:
        now = datetime.now()
        return now.hour == 15 and now.minute >= 45
    
    def _trigger_circuit_breaker(self):
        self.logger.critical("CIRCUIT BREAKER TRIGGERED - SUSPENDING TRADING")
        # Engines are managed; close positions via router if needed but risk manager handles broker logic
        self.broker.cancel_all_orders()
        # Close positions
        positions = self.broker.get_positions()
        for p in positions:
            side = "SELL" if p['side'] == 'long' else "BUY"
            self.broker.submit_order({
                'symbol': p['symbol'],
                'action': side,
                'quantity': int(p['qty']),
                'order_type': 'market',
                'time_in_force': 'day'
            })
    
    def _update_performance_metrics(self):
        hft_m = self.hft.get_performance_metrics()
        swing_m = self.swing.get_performance_metrics()
        intraday_m = self.intraday.get_performance_metrics()
        
        self.performance['total_trades'] = hft_m['total_trades'] + swing_m['total_trades'] + intraday_m['total_trades']
        win_count = int(hft_m['total_trades'] * hft_m['win_rate']) + \
                    int(swing_m['total_trades'] * swing_m['win_rate']) + \
                    int(intraday_m['total_trades'] * intraday_m['win_rate'])
        
        if self.performance['total_trades'] > 0:
            self.performance['win_rate'] = win_count / self.performance['total_trades']
        self.performance['last_updated'] = time.time()

    def get_status(self):
        return {
            'system': self.status,
            'performance': self.performance,
            'risk': self.risk.get_risk_metrics(),
            'engines': {
                'hft': self.hft.get_status(),
                'swing': self.swing.get_status(),
                'intraday': self.intraday.get_status()
            }
        }

import random # For signal dummy check
